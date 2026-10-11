import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  type Answers,
  QUESTIONNAIRE_VERSION,
  makeSnapshot,
  textValue,
  validateAnswers,
} from "./questionnaire";
import {
  PortalError,
  identities,
  type Identity,
  type Intake,
  type Submission,
} from "./types";
export {
  PortalError,
  identities,
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
  `);
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
  identity(token: string | undefined): Identity | null {
    if (!token) return null;
    const row = this.db
      .prepare(
        "SELECT identity FROM sessions WHERE token_hash=? AND expires_at>?",
      )
      .get(this.hash(token), Date.now()) as { identity: string } | undefined;
    return identities.find((x) => x.id === row?.identity) ?? null;
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
    if (who.role !== "client" || intake.owner !== who.id)
      throw new PortalError(
        403,
        "Só o cliente atribuído pode preencher esta ficha.",
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
    if (who.role !== "client")
      throw new PortalError(403, "Só o cliente pode submeter.");
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
      // Captura local: endereços fictícios; não existe transporte de email.
      for (const recipient of ["equipa@example.test", "cliente@example.test"])
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
  if (process.env.PORTAL_LOCAL_MODE !== "1" || !!process.env.VERCEL)
    throw new PortalError(
      503,
      "O adaptador local está desativado. A ligação ao serviço de produção ainda não foi configurada.",
    );
  if (!singleton) {
    singleton = new PortalStore(
      process.env.PORTAL_DB_PATH || resolve(".data/portal.sqlite"),
    );
    singleton.seed();
  }
  return singleton;
}
