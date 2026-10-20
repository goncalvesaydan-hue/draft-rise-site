import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PortalStore,
  identities,
  PortalError,
} from "../src/lib/portal/local-store";
import {
  activeQuestions,
  makeSnapshot,
  validateAnswers,
  questions,
  type Answers,
} from "../src/lib/portal/questionnaire";
const a = identities[0],
  b = identities[1],
  team = identities[2];
function fixture() {
  const s = new PortalStore(":memory:");
  s.seed();
  return s;
}
function ready(s: PortalStore) {
  const i = s.get("mare", a);
  return s.save("mare", a, i.revision, {
    ...i.answers,
    "contact.name": { state: "answered", value: "Inês Teste" },
    "project.objectives": { state: "answered", value: ["reservas"] },
  });
}
function expectError(action: () => unknown, status: number) {
  assert.throws(
    action,
    (e: unknown) => e instanceof PortalError && e.status === status,
  );
}
test("client A cannot read, save, submit or export B; client cannot see outbox", () => {
  const s = fixture();
  try {
    expectError(() => s.get("forma", a), 404);
    expectError(() => s.save("forma", a, 0, {}), 404);
    expectError(() => s.submit("forma", a, 0, randomUUID()), 404);
    expectError(() => s.submission("forma", a), 404);
    expectError(() => s.notifications(a), 403);
    assert.equal(s.list(a).length, 1);
    assert.equal(s.list(team).length, 2);
  } finally {
    s.close();
  }
});
test("stale revision cannot overwrite saved answers", () => {
  const s = fixture();
  try {
    const original = s.get("mare", a);
    const updated = s.save("mare", a, 0, {
      ...original.answers,
      "q2.1.02": { state: "answered", value: "Uma resposta nova" },
    });
    assert.equal(updated.revision, 1);
    expectError(() => s.save("mare", a, 0, original.answers), 409);
    assert.equal(
      s.get("mare", a).answers["q2.1.02"].value,
      "Uma resposta nova",
    );
  } finally {
    s.close();
  }
});
test("draft persists after reopening database; sessions expire and logout", () => {
  const dir = mkdtempSync(join(tmpdir(), "portal-test-"));
  try {
    const path = join(dir, "test.sqlite");
    let s = new PortalStore(path);
    s.seed();
    const i = ready(s),
      token = s.session(a.id);
    assert.equal(s.identity(token)?.id, a.id);
    s.close();
    s = new PortalStore(path);
    assert.deepEqual(s.get("mare", a).answers, i.answers);
    assert.equal(s.identity(token)?.id, a.id);
    s.logout(token);
    assert.equal(s.identity(token), null);
    const expired = s.session(b.id);
    s.db.exec("UPDATE sessions SET expires_at=0");
    assert.equal(s.identity(expired), null);
    s.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("submission is idempotent and immutable; different retry key cannot duplicate", () => {
  const s = fixture();
  try {
    const i = ready(s),
      key = randomUUID(),
      first = s.submit("mare", a, i.revision, key),
      second = s.submit("mare", a, i.revision, key);
    assert.equal(first.reference, second.reference);
    assert.equal(s.notifications(team).length, 2);
    assert.equal(
      s.db.prepare("SELECT COUNT(*) AS n FROM submissions").get()?.n,
      1,
    );
    expectError(() => s.submit("mare", a, i.revision, randomUUID()), 409);
    expectError(() => s.save("mare", a, i.revision, {}), 409);
    assert.throws(
      () =>
        s.db
          .prepare("UPDATE submissions SET snapshot=? WHERE id=?")
          .run("{}", first.id),
      /immutable/,
    );
  } finally {
    s.close();
  }
});
test("outbox failure rolls back submission, status and audit", () => {
  const s = fixture();
  try {
    const i = ready(s);
    s.db.exec(
      "CREATE TRIGGER fail_outbox BEFORE INSERT ON outbox BEGIN SELECT RAISE(ABORT,'simulated failure'); END",
    );
    assert.throws(
      () => s.submit("mare", a, i.revision, randomUUID()),
      /simulated failure/,
    );
    assert.equal(s.get("mare", a).status, "draft");
    assert.equal(s.submission("mare", a), null);
    assert.equal(
      s.db.prepare("SELECT COUNT(*) AS n FROM audit_events").get()?.n,
      0,
    );
  } finally {
    s.close();
  }
});
test("invalid required data blocks submission without creating notifications", () => {
  const s = fixture();
  try {
    expectError(() => s.submit("mare", a, 0, randomUUID()), 422);
    assert.equal(s.notifications(team).length, 0);
    assert.equal(s.get("mare", a).status, "draft");
  } finally {
    s.close();
  }
});
test("conditional answers survive draft changes but are excluded from snapshot", () => {
  const answers: Answers = {
    "company.sector": { state: "answered", value: "restaurant" },
    "project.objectives": {
      state: "answered",
      value: ["encomendas", "atendimento"],
    },
    "q3.1.01": { state: "answered", value: "Mesa secreta" },
    "q3.1.11": { state: "answered", value: "Takeaway" },
  };
  const active = activeQuestions(answers);
  assert.ok(!active.some((q) => q.id === "q3.1.01"));
  assert.ok(active.some((q) => q.id === "q3.1.11"));
  const snap = makeSnapshot(answers);
  assert.equal(snap.answers["q3.1.01"], undefined);
  assert.equal(answers["q3.1.01"].value, "Mesa secreta");
  assert.equal(new Set(active.map((q) => q.id)).size, active.length);
});
test("validate shapes, unknown states, choices and row identities", () => {
  const same = randomUUID();
  for (const input of [
    { "company.name": { state: "unknown", value: "" } },
    { "company.sector": { state: "answered", value: "invalid" } },
    {
      actions: {
        state: "answered",
        value: [
          { id: same, values: { name: "A" } },
          { id: same, values: { name: "B" } },
        ],
      },
    },
    { "q2.1.02": { state: "unknown", value: "hidden" } },
    { untrusted: { state: "answered", value: "x" } },
  ])
    assert.ok(Object.keys(validateAnswers(input).errors).length > 0);
  assert.ok(
    Object.keys(
      validateAnswers({
        actions: {
          state: "answered",
          value: [{ id: randomUUID(), values: { name: "Marcar" } }],
        },
      }).errors,
    ).length === 0,
  );
});
test("catalog has unique IDs, ten sectors and complete sections", () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  assert.equal(
    questions.find((q) => q.id === "company.sector")?.options?.length,
    11,
  );
  for (let n = 1; n <= 15; n++)
    assert.ok(questions.some((q) => q.source === `2.${n}`));
  for (let n = 1; n <= 10; n++)
    assert.ok(questions.some((q) => q.source === `3.${n}`));
  for (const source of ["4", "5", "6"])
    assert.ok(questions.some((q) => q.source === source));
});

test("local adapter fails closed when explicitly disabled", async () => {
  const { getStore } = await import("../src/lib/portal/local-store");
  const previous = process.env.PORTAL_LOCAL_MODE;
  try {
    delete process.env.PORTAL_LOCAL_MODE;
    expectError(() => getStore(), 503);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_LOCAL_MODE;
    else process.env.PORTAL_LOCAL_MODE = previous;
  }
});

test("6 team accounts (user1..user6) and client 6-digit access code onboarding work end-to-end", () => {
  const s = new PortalStore(":memory:");
  try {
    for (const [u, p] of [
      ["user1", "DR-User1-8492"],
      ["user2", "DR-User2-3917"],
      ["user3", "DR-User3-6520"],
      ["user4", "DR-User4-9148"],
      ["user5", "DR-User5-2763"],
      ["user6", "DR-User6-5084"],
    ] as const) {
      const { token, identity } = s.loginTeam(u, p);
      assert.equal(identity.role, "team");
      assert.equal(s.identity(token)?.id, u);
    }
    expectError(() => s.loginTeam("user1", "wrong-pass"), 401);

    const req = s.requestClientAccess(
      "Carlos Mendes",
      "Clínica Dental Sorriso",
      "carlos@clinicasorriso.pt",
    );
    assert.match(req.code, /^\d{6}$/);

    const teamIdentity = s.loginTeam("user1", "DR-User1-8492").identity;
    const codes = s.listAccessCodes(teamIdentity);
    assert.equal(codes.length, 1);
    assert.equal(codes[0].code, req.code);
    assert.equal(codes[0].companyName, "Clínica Dental Sorriso");

    const verified = s.verifyClientAccess("carlos@clinicasorriso.pt", req.code);
    assert.equal(verified.identity.role, "client");
    const intake = s.get(verified.intakeId, verified.identity);
    assert.equal(intake.answers["company.name"]?.value, "Clínica Dental Sorriso");
    assert.equal(intake.answers["contact.name"]?.value, "Carlos Mendes");
    assert.equal(intake.answers["contact.email"]?.value, "carlos@clinicasorriso.pt");

    const user1 = s.loginTeam("user1", "DR-User1-8492").identity;
    const user2 = s.loginTeam("user2", "DR-User2-3917").identity;
    const user3 = s.loginTeam("user3", "DR-User3-6520").identity;
    const user4 = s.loginTeam("user4", "DR-User4-9148").identity;
    assert.equal(user1.isAdmin, true);
    assert.equal(user2.isAdmin, true);
    assert.equal(user3.isAdmin, true);
    assert.equal(user4.isAdmin, false);

    // user4 can update basic fields, but cannot edit full questionnaire or delete
    const afterBasic = s.saveBasic(verified.intakeId, user4, {
      "contact.phone": "+351 912 345 678",
    });
    assert.equal(afterBasic.answers["contact.phone"]?.value, "+351 912 345 678");
    expectError(
      () =>
        s.saveBasic(verified.intakeId, user4, {
          "q2.1.02": "Tentativa de alterar resposta profunda",
        }),
      403,
    );
    expectError(
      () => s.save(verified.intakeId, user4, afterBasic.revision, afterBasic.answers),
      403,
    );
    expectError(() => s.deleteIntake(verified.intakeId, user4), 403);
    expectError(
      () => s.deleteAccessCode("carlos@clinicasorriso.pt", user4),
      403,
    );

    // user2 (Admin Total) can edit full questionnaire, and submit just like user1
    const afterAdminFull = s.save(verified.intakeId, user2, afterBasic.revision, {
      ...afterBasic.answers,
      "company.sector": { state: "answered", value: "clinic" },
      "project.objectives": { state: "answered", value: ["marcacoes"] },
    });
    assert.equal(afterAdminFull.answers["company.sector"]?.value, "clinic");
    const sub = s.submit(
      verified.intakeId,
      user2,
      afterAdminFull.revision,
      randomUUID(),
    );
    assert.ok(sub.reference.startsWith("REC-"));
    expectError(() => s.reopenIntake(verified.intakeId, user4), 403);
    // user3 (Admin Total) can reopen intake just like user1
    const reopened = s.reopenIntake(verified.intakeId, user3);
    assert.equal(reopened.status, "draft");
    s.deleteAccessCode("carlos@clinicasorriso.pt", user1);
    assert.equal(s.listAccessCodes(user1).length, 0);

    // Brute-force protection: 5 failed attempts lock out team login and invalidate client code
    for (let i = 0; i < 5; i++) {
      expectError(() => s.loginTeam("user5", "wrong"), 401);
    }
    expectError(() => s.loginTeam("user5", "DR-User5-2763"), 429);

    const req2 = s.requestClientAccess(
      "Ana",
      "Loja Ana",
      "ana@loja.pt",
    );
    for (let i = 0; i < 5; i++) {
      expectError(() => s.verifyClientAccess("ana@loja.pt", "000000"), 400);
    }
    expectError(() => s.verifyClientAccess("ana@loja.pt", req2.code), 429);
  } finally {
    s.close();
  }
});



