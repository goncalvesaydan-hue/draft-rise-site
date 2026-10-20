import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  randomBytes,
  randomInt,
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  type Answers,
  QUESTIONNAIRE_VERSION,
  makeSnapshot,
  textValue,
  validateAnswers,
} from "./questionnaire";
import {
  PortalError,
  TEAM_USERS,
  BASIC_TEAM_FIELDS,
  identities,
  type ClientAccessRequest,
  type Identity,
  type Intake,
  type Submission,
} from "./types";
export {
  PortalError,
  TEAM_USERS,
  BASIC_TEAM_FIELDS,
  identities,
  type ClientAccessRequest,
  type Identity,
  type Intake,
  type Submission,
} from "./types";
type IntakeRow = {
  id: string;
  owner: string;
  version: string;
  revision: number;
  status: "draft" | "submitted";
  answers: string;
  updated_at: string;
};
type SubmissionRow = {
  id: string;
  intake_id: string;
  reference: string;
  snapshot: string;
  created_at: string;
};
type AccessCodeRow = {
  email: string;
  client_name: string;
  company_name: string;
  code: string;
  intake_id: string;
  created_at: string;
  expires_at: number;
};
function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
function getLocalSecret() {
  return (
    process.env.PORTAL_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    TEAM_USERS.map((u) => u.password).join(":")
  );
}
function signLocalSessionToken(identity: Identity) {
  const payload = Buffer.from(
    JSON.stringify({
      identity,
      exp: Date.now() + 8 * 60 * 60 * 1000,
      nonce: randomUUID(),
    }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getLocalSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}
function verifyLocalSessionToken(token: string | undefined): Identity | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  const expectedSig = createHmac("sha256", getLocalSecret())
    .update(payload)
    .digest("base64url");
  if (!safeCompare(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { identity: Identity; exp: number };
    if (!parsed || typeof parsed.exp !== "number" || parsed.exp <= Date.now()) {
      return null;
    }
    return parsed.identity;
  } catch {
    return null;
  }
}
export class PortalStore {
  readonly db: DatabaseSync;
  constructor(path: string) {
    if (path !== ":memory:")
      mkdirSync(dirname(resolve(path)), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    this.db
      .exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS intakes (id TEXT PRIMARY KEY,owner TEXT NOT NULL,version TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL CHECK(status IN ('draft','submitted')),answers TEXT NOT NULL,updated_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS intakes_owner ON intakes(owner);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,identity TEXT NOT NULL,expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY,intake_id TEXT NOT NULL UNIQUE REFERENCES intakes(id),idempotency_key TEXT NOT NULL,reference TEXT NOT NULL UNIQUE,snapshot TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(intake_id,idempotency_key));
  CREATE TRIGGER IF NOT EXISTS immutable_submission BEFORE UPDATE ON submissions BEGIN SELECT RAISE(ABORT,'immutable submission'); END;
  CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY,submission_id TEXT NOT NULL REFERENCES submissions(id),recipient TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'captured_locally',created_at TEXT NOT NULL,UNIQUE(submission_id,recipient));
  CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY,intake_id TEXT NOT NULL REFERENCES intakes(id),actor TEXT NOT NULL,action TEXT NOT NULL,created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS client_access_codes (email TEXT PRIMARY KEY,client_name TEXT NOT NULL,company_name TEXT NOT NULL,code TEXT NOT NULL,intake_id TEXT NOT NULL,created_at TEXT NOT NULL,expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS auth_attempts (target TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0,locked_until INTEGER NOT NULL DEFAULT 0);
  `);
  }
  private checkRateLimit(target: string) {
    const row = this.db
      .prepare("SELECT failures, locked_until FROM auth_attempts WHERE target=?")
      .get(target) as { failures: number; locked_until: number } | undefined;
    if (row && row.locked_until > Date.now()) {
      throw new PortalError(
        429,
        "Demasiadas tentativas falhadas. Por segurança, aguarde 15 minutos antes de tentar novamente.",
      );
    }
  }
  private recordFailure(target: string): number {
    const now = Date.now();
    const row = this.db
      .prepare("SELECT failures, locked_until FROM auth_attempts WHERE target=?")
      .get(target) as { failures: number; locked_until: number } | undefined;
    const failures = row && row.locked_until <= now ? row.failures + 1 : 1;
    const lockedUntil = failures >= 5 ? now + 15 * 60 * 1000 : 0;
    this.db
      .prepare(
        `INSERT INTO auth_attempts(target,failures,locked_until) VALUES(?,?,?)
         ON CONFLICT(target) DO UPDATE SET failures=excluded.failures, locked_until=excluded.locked_until`,
      )
      .run(target, failures, lockedUntil);
    return failures;
  }
  private clearFailures(target: string) {
    this.db.prepare("DELETE FROM auth_attempts WHERE target=?").run(target);
  }
  seed() {
    for (const [id, owner, name, email, sector] of [
      [
        "mare",
        "client-a",
        "Restaurante Maré",
        "ines@example.test",
        "restaurant",
      ],
      ["forma", "client-b", "Estúdio Forma", "miguel@example.test", "gym"],
    ]) {
      const answers: Answers = {
        "company.name": { state: "answered", value: name },
        "contact.email": { state: "answered", value: email },
        "company.sector": { state: "answered", value: sector },
      };
      this.db
        .prepare(
          "INSERT OR IGNORE INTO intakes(id,owner,version,status,answers,updated_at) VALUES(?,?,?,'draft',?,?)",
        )
        .run(
          id,
          owner,
          QUESTIONNAIRE_VERSION,
          JSON.stringify(answers),
          new Date().toISOString(),
        );
    }
  }
  close() {
    this.db.close();
  }
  private createSessionForIdentity(who: Identity) {
    const token = signLocalSessionToken(who);
    this.db
      .prepare("DELETE FROM sessions WHERE expires_at < ?")
      .run(Date.now());
    // Remove existing sessions for this identity to prevent session fixation
    this.db
      .prepare("DELETE FROM sessions WHERE identity = ?")
      .run(JSON.stringify(who));
    this.db
      .prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(this.hash(token), JSON.stringify(who), Date.now() + 8 * 60 * 60 * 1000);
    return token;
  }
  session(identity: string) {
    if (!identities.some((x) => x.id === identity))
      throw new PortalError(400, "Escolhe uma identidade de teste válida.");
    const token = randomBytes(32).toString("hex");
    this.db
      .prepare("DELETE FROM sessions WHERE expires_at < ?")
      .run(Date.now());
    this.db
      .prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(this.hash(token), identity, Date.now() + 8 * 60 * 60 * 1000);
    return token;
  }
  loginTeam(username: string, password: string): { token: string; identity: Identity } {
    const cleanUser = username.trim().toLowerCase();
    const rateKey = `team:${cleanUser}`;
    this.checkRateLimit(rateKey);
    const account = TEAM_USERS.find((u) => u.username === cleanUser);
    if (!account || !safeCompare(password, account.password)) {
      this.recordFailure(rateKey);
      throw new PortalError(401, "Utilizador ou palavra-passe incorretos.");
    }
    this.clearFailures(rateKey);
    const identity: Identity = {
      id: account.username,
      name: account.name,
      role: "team",
      isAdmin: account.isAdmin,
    };
    const token = this.createSessionForIdentity(identity);
    return { token, identity };
  }
  requestClientAccess(
    clientName: string,
    companyName: string,
    email: string,
  ): ClientAccessRequest {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = clientName.trim();
    const cleanCompany = companyName.trim();
    const owner = `client:${normalizedEmail}`;
    const nowIso = new Date().toISOString();

    let existingIntake = this.db
      .prepare("SELECT * FROM intakes WHERE owner=? ORDER BY updated_at DESC LIMIT 1")
      .get(owner) as IntakeRow | undefined;

    if (!existingIntake) {
      const intakeId = randomUUID();
      const initialAnswers: Answers = {
        "company.name": { state: "answered", value: cleanCompany },
        "contact.name": { state: "answered", value: cleanName },
        "contact.email": { state: "answered", value: normalizedEmail },
      };
      this.db
        .prepare(
          "INSERT INTO intakes(id,owner,version,status,answers,updated_at) VALUES(?,?,?,'draft',?,?)",
        )
        .run(
          intakeId,
          owner,
          QUESTIONNAIRE_VERSION,
          JSON.stringify(initialAnswers),
          nowIso,
        );
      existingIntake = this.db
        .prepare("SELECT * FROM intakes WHERE id=?")
        .get(intakeId) as IntakeRow;
    } else if (existingIntake.status === "draft") {
      const parsedAnswers = JSON.parse(existingIntake.answers) as Answers;
      let changed = false;
      if (!parsedAnswers["company.name"] && cleanCompany) {
        parsedAnswers["company.name"] = { state: "answered", value: cleanCompany };
        changed = true;
      }
      if (!parsedAnswers["contact.name"] && cleanName) {
        parsedAnswers["contact.name"] = { state: "answered", value: cleanName };
        changed = true;
      }
      if (!parsedAnswers["contact.email"]) {
        parsedAnswers["contact.email"] = { state: "answered", value: normalizedEmail };
        changed = true;
      }
      if (changed) {
        this.db
          .prepare("UPDATE intakes SET answers=?,updated_at=? WHERE id=?")
          .run(JSON.stringify(parsedAnswers), nowIso, existingIntake.id);
      }
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    this.db
      .prepare(
        `INSERT INTO client_access_codes(email,client_name,company_name,code,intake_id,created_at,expires_at)
         VALUES(?,?,?,?,?,?,?)
         ON CONFLICT(email) DO UPDATE SET
           client_name=excluded.client_name,
           company_name=excluded.company_name,
           code=excluded.code,
           intake_id=excluded.intake_id,
           created_at=excluded.created_at,
           expires_at=excluded.expires_at`,
      )
      .run(
        normalizedEmail,
        cleanName || "Cliente",
        cleanCompany || "Empresa",
        code,
        existingIntake.id,
        nowIso,
        expiresAt,
      );
    this.clearFailures(`client:${normalizedEmail}`);

    return {
      email: normalizedEmail,
      clientName: cleanName || "Cliente",
      companyName: cleanCompany || "Empresa",
      code,
      intakeId: existingIntake.id,
      createdAt: nowIso,
      expiresAt,
    };
  }
  verifyClientAccess(
    email: string,
    code: string,
  ): { token: string; identity: Identity; intakeId: string; status: "draft" | "submitted" } {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const rateKey = `client:${normalizedEmail}`;
    this.checkRateLimit(rateKey);

    const row = this.db
      .prepare("SELECT * FROM client_access_codes WHERE email=?")
      .get(normalizedEmail) as AccessCodeRow | undefined;

    if (!row || row.expires_at < Date.now() || !safeCompare(cleanCode, row.code)) {
      const fails = this.recordFailure(rateKey);
      if (fails >= 5) {
        this.db
          .prepare("DELETE FROM client_access_codes WHERE email=?")
          .run(normalizedEmail);
      }
      throw new PortalError(
        400,
        "Código inválido ou expirado. Peça o código atualizado à equipa Draft & Rise.",
      );
    }

    this.clearFailures(rateKey);
    const identity: Identity = {
      id: `client:${normalizedEmail}`,
      name: `${row.client_name} · ${row.company_name}`,
      role: "client",
    };
    const token = this.createSessionForIdentity(identity);
    const intake = this.get(row.intake_id, identity);
    return { token, identity, intakeId: row.intake_id, status: intake.status };
  }
  listAccessCodes(who: Identity): ClientAccessRequest[] {
    if (who.role !== "team")
      throw new PortalError(403, "Acesso reservado à equipa.");
    const rows = this.db
      .prepare("SELECT * FROM client_access_codes ORDER BY created_at DESC")
      .all() as AccessCodeRow[];
    return rows.map((r) => ({
      email: r.email,
      clientName: r.client_name,
      companyName: r.company_name,
      code: r.code,
      intakeId: r.intake_id,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
    }));
  }
  deleteAccessCode(email: string, who: Identity) {
    if (who.role !== "team" || !who.isAdmin)
      throw new PortalError(
        403,
        "Apenas administradores podem apagar códigos de acesso.",
      );
    this.db
      .prepare("DELETE FROM client_access_codes WHERE email=?")
      .run(email.trim().toLowerCase());
  }
  identity(token: string | undefined): Identity | null {
    if (!token) return null;
    const row = this.db
      .prepare(
        "SELECT identity FROM sessions WHERE token_hash=? AND expires_at>?",
      )
      .get(this.hash(token), Date.now()) as { identity: string } | undefined;
    if (!row) {
      if (process.env.VERCEL) {
        return verifyLocalSessionToken(token);
      }
      return null;
    }
    if (row.identity.startsWith("{")) {
      try {
        return JSON.parse(row.identity) as Identity;
      } catch {
        return null;
      }
    }
    return identities.find((x) => x.id === row.identity) ?? null;
  }
  logout(token: string) {
    this.db
      .prepare("DELETE FROM sessions WHERE token_hash=?")
      .run(this.hash(token));
  }
  private hash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
  private decode(row: IntakeRow): Intake {
    return {
      id: row.id,
      owner: row.owner,
      version: row.version,
      revision: row.revision,
      status: row.status,
      answers: JSON.parse(row.answers),
      updatedAt: row.updated_at,
    };
  }
  get(id: string, who: Identity): Intake {
    const row = this.db.prepare("SELECT * FROM intakes WHERE id=?").get(id) as
      IntakeRow | undefined;
    if (!row || (who.role !== "team" && row.owner !== who.id))
      throw new PortalError(404, "Ficha não encontrada.");
    return this.decode(row);
  }
  list(who: Identity): Intake[] {
    const rows = (
      who.role === "team"
        ? this.db
            .prepare("SELECT * FROM intakes ORDER BY updated_at DESC")
            .all()
        : this.db
            .prepare(
              "SELECT * FROM intakes WHERE owner=? ORDER BY updated_at DESC",
            )
            .all(who.id)
    ) as IntakeRow[];
    return rows.map((r) => this.decode(r));
  }
  private editable(intake: Intake, who: Identity) {
    const isOwnerClient = who.role === "client" && intake.owner === who.id;
    const isSuperAdmin = who.role === "team" && who.isAdmin === true;
    if (!isOwnerClient && !isSuperAdmin)
      throw new PortalError(
        403,
        "Apenas o cliente atribuído ou um administrador pode editar todo o questionário.",
      );
    if (intake.status !== "draft")
      throw new PortalError(
        409,
        "Esta ficha já foi submetida. As respostas originais estão preservadas.",
      );
    if (intake.version !== QUESTIONNAIRE_VERSION)
      throw new PortalError(409, "Versão do questionário não suportada.");
  }
  save(id: string, who: Identity, revision: number, input: unknown): Intake {
    const intake = this.get(id, who);
    this.editable(intake, who);
    const v = validateAnswers(input);
    if (Object.keys(v.errors).length)
      throw new PortalError(422, "Revê as respostas indicadas.", v.errors);
    const result = this.db
      .prepare(
        "UPDATE intakes SET answers=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND status='draft'",
      )
      .run(JSON.stringify(v.answers), new Date().toISOString(), id, revision);
    if (result.changes !== 1)
      throw new PortalError(
        409,
        "Esta ficha mudou noutra sessão. Guarda uma cópia do texto recente e carrega a versão guardada para continuar.",
      );
    return this.get(id, who);
  }
  saveBasic(
    id: string,
    who: Identity,
    basicFields: Record<string, string>,
  ): Intake {
    if (who.role !== "team")
      throw new PortalError(403, "Acesso reservado à equipa.");
    const intake = this.get(id, who);
    if (intake.status !== "draft" && !who.isAdmin)
      throw new PortalError(
        409,
        "Esta ficha já foi submetida. Apenas um administrador a pode alterar.",
      );
    const nextAnswers: Answers = { ...intake.answers };
    const allowedSet = new Set<string>(BASIC_TEAM_FIELDS);
    for (const [key, val] of Object.entries(basicFields)) {
      if (!allowedSet.has(key)) {
        throw new PortalError(
          403,
          "Esta conta de equipa só pode alterar dados básicos de identificação.",
        );
      }
      const trimmed = val.trim();
      if (trimmed) {
        nextAnswers[key] = { state: "answered", value: trimmed };
      } else {
        delete nextAnswers[key];
      }
    }
    const v = validateAnswers(nextAnswers);
    if (Object.keys(v.errors).length)
      throw new PortalError(422, "Revê os dados básicos indicados.", v.errors);
    const nowIso = new Date().toISOString();
    this.db
      .prepare(
        "UPDATE intakes SET answers=?,revision=revision+1,updated_at=? WHERE id=?",
      )
      .run(JSON.stringify(v.answers), nowIso, id);
    return this.get(id, who);
  }
  reopenIntake(id: string, who: Identity): Intake {
    if (who.role !== "team" || !who.isAdmin)
      throw new PortalError(
        403,
        "Apenas administradores podem reabrir uma ficha submetida.",
      );
    this.get(id, who);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const sub = this.db
        .prepare("SELECT id FROM submissions WHERE intake_id=?")
        .get(id) as { id: string } | undefined;
      if (sub) {
        this.db
          .prepare("DELETE FROM outbox WHERE submission_id=?")
          .run(sub.id);
        this.db.prepare("DELETE FROM submissions WHERE id=?").run(sub.id);
      }
      this.db
        .prepare(
          "UPDATE intakes SET status='draft',revision=revision+1,updated_at=? WHERE id=?",
        )
        .run(new Date().toISOString(), id);
      this.db.exec("COMMIT");
      return this.get(id, who);
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  deleteIntake(id: string, who: Identity) {
    if (who.role !== "team" || !who.isAdmin)
      throw new PortalError(
        403,
        "Apenas administradores podem apagar fichas.",
      );
    this.get(id, who);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const sub = this.db
        .prepare("SELECT id FROM submissions WHERE intake_id=?")
        .get(id) as { id: string } | undefined;
      if (sub) {
        this.db
          .prepare("DELETE FROM outbox WHERE submission_id=?")
          .run(sub.id);
        this.db.prepare("DELETE FROM submissions WHERE id=?").run(sub.id);
      }
      this.db.prepare("DELETE FROM audit_events WHERE intake_id=?").run(id);
      this.db
        .prepare("DELETE FROM client_access_codes WHERE intake_id=?")
        .run(id);
      this.db.prepare("DELETE FROM intakes WHERE id=?").run(id);
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  submission(id: string, who: Identity): Submission | null {
    this.get(id, who);
    const row = this.db
      .prepare("SELECT * FROM submissions WHERE intake_id=?")
      .get(id) as SubmissionRow | undefined;
    return row
      ? {
          id: row.id,
          intakeId: row.intake_id,
          reference: row.reference,
          snapshot: JSON.parse(row.snapshot),
          createdAt: row.created_at,
        }
      : null;
  }
  submit(id: string, who: Identity, revision: number, key: string): Submission {
    this.get(id, who);
    const canSubmit =
      who.role === "client" || (who.role === "team" && who.isAdmin === true);
    if (!canSubmit)
      throw new PortalError(
        403,
        "Só o cliente ou um administrador pode submeter.",
      );
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db
        .prepare("SELECT idempotency_key FROM submissions WHERE intake_id=?")
        .get(id) as { idempotency_key: string } | undefined;
      if (existing?.idempotency_key === key) {
        const s = this.submission(id, who)!;
        this.db.exec("COMMIT");
        return s;
      }
      const intake = this.get(id, who);
      this.editable(intake, who);
      if (intake.revision !== revision)
        throw new PortalError(
          409,
          "A ficha mudou. Revê a versão guardada antes de enviar.",
        );
      const v = validateAnswers(intake.answers, true);
      if (Object.keys(v.errors).length)
        throw new PortalError(
          422,
          "Preenche os campos obrigatórios antes de enviar.",
          v.errors,
        );
      const createdAt = new Date().toISOString(),
        submissionId = randomUUID(),
        reference = `REC-${submissionId.slice(0, 8).toUpperCase()}`,
        snapshot = makeSnapshot(v.answers);
      this.db
        .prepare("INSERT INTO submissions VALUES(?,?,?,?,?,?)")
        .run(
          submissionId,
          id,
          key,
          reference,
          JSON.stringify(snapshot),
          createdAt,
        );
      this.db
        .prepare(
          "UPDATE intakes SET status='submitted',revision=revision+1,updated_at=? WHERE id=?",
        )
        .run(createdAt, id);
      this.db
        .prepare("INSERT INTO audit_events VALUES(?,?,?,?,?)")
        .run(randomUUID(), id, who.id, "submitted", createdAt);
      const clientEmail =
        textValue(v.answers, "contact.email") || "cliente@draftandrise.com";
      const recipients = Array.from(
        new Set(["geral@draftandrise.com", clientEmail]),
      );
      for (const recipient of recipients)
        this.db
          .prepare(
            "INSERT INTO outbox(id,submission_id,recipient,subject,body,created_at) VALUES(?,?,?,?,?,?)",
          )
          .run(
            randomUUID(),
            submissionId,
            recipient,
            `Ficha recebida — ${textValue(v.answers, "company.name")} — ${reference}`,
            JSON.stringify({ reference, snapshot }),
            createdAt,
          );
      this.db.exec("COMMIT");
      return { id: submissionId, intakeId: id, reference, snapshot, createdAt };
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  notifications(who: Identity) {
    if (who.role !== "team")
      throw new PortalError(403, "Acesso reservado à equipa.");
    return this.db
      .prepare(
        "SELECT id,submission_id,recipient,subject,status,created_at FROM outbox ORDER BY created_at DESC",
      )
      .all();
  }
}
let singleton: PortalStore | undefined;
export function getStore() {
  if (process.env.PORTAL_LOCAL_MODE !== "1")
    throw new PortalError(
      503,
      "O adaptador local está desativado. A ligação ao serviço de produção ainda não foi configurada.",
    );
  if (!singleton) {
    const defaultDbPath = process.env.VERCEL
      ? "/tmp/portal.sqlite"
      : resolve(".data/portal.sqlite");
    singleton = new PortalStore(
      process.env.PORTAL_DB_PATH || defaultDbPath,
    );
    if (process.env.PORTAL_SEED_DEMO === "1") {
      singleton.seed();
    } else {
      // Remove legacy demo fixtures ("mare" / "forma") if they have no submissions
      singleton.db.exec(
        "DELETE FROM intakes WHERE id IN ('mare','forma') AND id NOT IN (SELECT intake_id FROM submissions)",
      );
    }
  }
  return singleton;
}

