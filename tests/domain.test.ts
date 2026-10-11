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
