import "server-only";
import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { serviceClient } from "./supabase";
import {
  PortalError,
  TEAM_USERS,
  BASIC_TEAM_FIELDS,
  type Identity,
  type Intake,
  type Submission,
  type ClientAccessRequest,
} from "./types";
import {
  QUESTIONNAIRE_VERSION,
  makeSnapshot,
  validateAnswers,
  type Answers,
  type Snapshot,
} from "./questionnaire";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function hashToken(t: string): string {
  return createHash("sha256").update(t).digest("hex");
}

function getSessionSecret(): string {
  return (
    process.env.PORTAL_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    TEAM_USERS.map((u) => u.password).join(":")
  );
}

export function signSessionToken(identity: Identity, ttlMs = 8 * 60 * 60 * 1000): string {
  const payload = Buffer.from(
    JSON.stringify({
      identity,
      exp: Date.now() + ttlMs,
      nonce: randomUUID(),
    }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): Identity | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  const expectedSig = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
  if (!safeCompare(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      identity: Identity;
      exp: number;
    };
    if (!parsed || typeof parsed.exp !== "number" || parsed.exp <= Date.now()) {
      return null;
    }
    return parsed.identity;
  } catch {
    return null;
  }
}

function textValue(answers: Answers, key: string): string {
  const v = answers[key]?.value;
  return typeof v === "string" ? v : "";
}

type IntakeRow = {
  id: string;
  owner: string;
  version: string;
  revision: number;
  status: "draft" | "submitted";
  answers: Answers;
  updated_at: string;
};

type SubmissionRow = {
  id: string;
  intake_id: string;
  idempotency_key: string;
  reference: string;
  snapshot: Snapshot;
  created_at: string;
};

type AccessCodeRow = {
  email: string;
  client_name: string;
  company_name: string;
  code: string;
  intake_id: string;
  created_at: string;
  expires_at: number | string;
};

// In-memory fallbacks so the portal works 100% even before optional auxiliary tables are migrated
const memoryAttempts = new Map<string, { failures: number; lockedUntil: number }>();
const memoryRevokedTokens = new Set<string>();
const memoryAccessCodes = new Map<string, ClientAccessRequest>();

function formatIntake(r: IntakeRow): Intake {
  return {
    id: r.id,
    owner: r.owner,
    version: r.version,
    revision: r.revision,
    status: r.status,
    answers: r.answers,
    updatedAt: r.updated_at,
  };
}

function formatSubmission(r: SubmissionRow): Submission {
  return {
    id: r.id,
    intakeId: r.intake_id,
    reference: r.reference,
    snapshot: r.snapshot,
    createdAt: r.created_at,
  };
}

export class RemoteStore {
  private client = serviceClient();

  // 1. Rate Limiting / Lockout checks (Supabase + In-Memory Fallback)
  private async checkRateLimit(target: string): Promise<void> {
    const now = Date.now();
    const mem = memoryAttempts.get(target);
    if (mem && mem.lockedUntil > now) {
      const waitMinutes = Math.ceil((mem.lockedUntil - now) / 60000);
      throw new PortalError(
        429,
        `Demasiadas tentativas inválidas. Acesso temporariamente bloqueado. Tenta novamente dentro de ${waitMinutes} minuto(s).`,
      );
    }

    try {
      const { data, error } = await this.client
        .from("portal_auth_attempts")
        .select("failures, locked_until")
        .eq("target", target)
        .maybeSingle();

      if (!error && data && Number(data.locked_until) > now) {
        const waitMinutes = Math.ceil((Number(data.locked_until) - now) / 60000);
        throw new PortalError(
          429,
          `Demasiadas tentativas inválidas. Acesso temporariamente bloqueado. Tenta novamente dentro de ${waitMinutes} minuto(s).`,
        );
      }
    } catch (e) {
      if (e instanceof PortalError) throw e;
      // Ignore missing portal_auth_attempts table
    }
  }

  private async recordFailure(target: string): Promise<number> {
    const now = Date.now();
    const mem = memoryAttempts.get(target);
    const memFailures = mem && mem.lockedUntil <= now ? mem.failures + 1 : 1;
    const memLockedUntil = memFailures >= 5 ? now + 15 * 60 * 1000 : 0;
    memoryAttempts.set(target, { failures: memFailures, lockedUntil: memLockedUntil });

    try {
      const { data, error } = await this.client
        .from("portal_auth_attempts")
        .select("failures, locked_until")
        .eq("target", target)
        .maybeSingle();

      if (!error) {
        const failures =
          data && Number(data.locked_until) <= now ? Number(data.failures) + 1 : 1;
        const lockedUntil = failures >= 5 ? now + 15 * 60 * 1000 : 0;
        await this.client
          .from("portal_auth_attempts")
          .upsert({ target, failures, locked_until: lockedUntil });
        return failures;
      }
    } catch {
      // Ignore if table not yet created
    }

    return memFailures;
  }

  private async clearFailures(target: string): Promise<void> {
    memoryAttempts.delete(target);
    try {
      await this.client.from("portal_auth_attempts").delete().eq("target", target);
    } catch {
      // Ignore if table not yet created
    }
  }

  // 2. Session Management (Stateless HMAC-SHA256 Signed Token + Optional DB Persistence)
  private async createSession(identity: Identity): Promise<string> {
    const token = signSessionToken(identity);
    const tokenHash = hashToken(token);
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

    try {
      await this.client.from("portal_sessions").delete().lt("expires_at", Date.now());
      await this.client
        .from("portal_sessions")
        .insert({ token_hash: tokenHash, identity, expires_at: expiresAt });
    } catch {
      // Stateless signed token works even if portal_sessions table does not exist
    }

    return token;
  }

  async identity(token: string | undefined): Promise<Identity | null> {
    if (!token) return null;
    const tokenHash = hashToken(token);
    if (memoryRevokedTokens.has(tokenHash)) return null;

    // 1. Verify stateless HMAC-SHA256 signed token
    const verified = verifySessionToken(token);
    if (verified) return verified;

    // 2. Fallback to portal_sessions table for legacy hex tokens
    try {
      const { data, error } = await this.client
        .from("portal_sessions")
        .select("identity, expires_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (!error && data && Number(data.expires_at) > Date.now()) {
        return data.identity as Identity;
      }
    } catch {
      // Ignore
    }
    return null;
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    memoryRevokedTokens.add(tokenHash);
    try {
      await this.client.from("portal_sessions").delete().eq("token_hash", tokenHash);
    } catch {
      // Ignore
    }
  }

  // 3. Team Authentication
  async loginTeam(
    username: string,
    password: string,
  ): Promise<{ token: string; identity: Identity }> {
    const cleanUser = username.trim().toLowerCase();
    const rateKey = `team:${cleanUser}`;
    await this.checkRateLimit(rateKey);

    const account = TEAM_USERS.find((u) => u.username === cleanUser);
    if (!account || !safeCompare(password, account.password)) {
      await this.recordFailure(rateKey);
      throw new PortalError(401, "Utilizador ou palavra-passe incorretos.");
    }

    await this.clearFailures(rateKey);
    const identity: Identity = {
      id: account.username,
      name: account.name,
      role: "team",
      isAdmin: account.isAdmin,
    };
    const token = await this.createSession(identity);
    return { token, identity };
  }

  // Helper to resolve or create an auth.users UUID so portal_intakes(owner uuid references auth.users) works seamlessly
  private async ensureClientOwnerUuid(
    normalizedEmail: string,
    cleanName: string,
    cleanCompany: string,
  ): Promise<string> {
    try {
      const { data: created } = await this.client.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
        user_metadata: { clientName: cleanName, companyName: cleanCompany },
      });
      if (created?.user?.id) return created.user.id;

      const { data: list } = await this.client.auth.admin.listUsers({
        perPage: 1000,
      });
      const existingUser = list?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail,
      );
      if (existingUser?.id) return existingUser.id;
    } catch {
      // Ignore if auth.admin is not used
    }
    return `client:${normalizedEmail}`;
  }

  // 4. Client Access Request & 6-Digit Code
  async requestClientAccess(
    clientName: string,
    companyName: string,
    email: string,
  ): Promise<ClientAccessRequest> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = clientName.trim() || "Cliente";
    const cleanCompany = companyName.trim() || "Empresa";
    const nowIso = new Date().toISOString();

    // Find existing intake by email or owner
    const { data: allIntakes } = await this.client
      .from("portal_intakes")
      .select("*")
      .order("updated_at", { ascending: false });

    const existingIntake = ((allIntakes || []) as IntakeRow[]).find(
      (r) =>
        r.owner === `client:${normalizedEmail}` ||
        textValue(r.answers || {}, "contact.email").toLowerCase() === normalizedEmail,
    );

    let intakeId: string;
    let ownerId: string;

    if (!existingIntake) {
      intakeId = randomUUID();
      ownerId = await this.ensureClientOwnerUuid(
        normalizedEmail,
        cleanName,
        cleanCompany,
      );
      const initialAnswers: Answers = {
        "company.name": { state: "answered", value: cleanCompany },
        "contact.name": { state: "answered", value: cleanName },
        "contact.email": { state: "answered", value: normalizedEmail },
      };
      const { data: inserted, error: insertError } = await this.client
        .from("portal_intakes")
        .insert({
          id: intakeId,
          owner: ownerId,
          version: QUESTIONNAIRE_VERSION,
          status: "draft",
          answers: initialAnswers,
          updated_at: nowIso,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        // Check if owner already had an intake due to unique(owner) constraint
        const { data: byOwner } = await this.client
          .from("portal_intakes")
          .select("*")
          .eq("owner", ownerId)
          .maybeSingle();
        if (byOwner) {
          intakeId = byOwner.id;
        } else {
          console.error("[RemoteStore requestClientAccess insert error]", insertError);
          throw new PortalError(500, "Não foi possível preparar a ficha do cliente.");
        }
      } else if (inserted) {
        intakeId = inserted.id;
      }
    } else {
      intakeId = existingIntake.id;
      ownerId = existingIntake.owner;
      if (existingIntake.status === "draft") {
        const answers = { ...(existingIntake.answers || {}) } as Answers;
        let changed = false;
        if (!answers["company.name"] && cleanCompany) {
          answers["company.name"] = { state: "answered", value: cleanCompany };
          changed = true;
        }
        if (!answers["contact.name"] && cleanName) {
          answers["contact.name"] = { state: "answered", value: cleanName };
          changed = true;
        }
        if (!answers["contact.email"]) {
          answers["contact.email"] = { state: "answered", value: normalizedEmail };
          changed = true;
        }
        if (changed) {
          await this.client
            .from("portal_intakes")
            .update({ answers, updated_at: nowIso })
            .eq("id", intakeId);
        }
      }
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const accessRecord: ClientAccessRequest = {
      email: normalizedEmail,
      clientName: cleanName,
      companyName: cleanCompany,
      code,
      intakeId,
      createdAt: nowIso,
      expiresAt,
    };

    memoryAccessCodes.set(normalizedEmail, accessRecord);

    // 1. Try saving in portal_access_codes table
    try {
      await this.client.from("portal_access_codes").upsert({
        email: normalizedEmail,
        client_name: cleanName,
        company_name: cleanCompany,
        code,
        intake_id: intakeId,
        created_at: nowIso,
        expires_at: expiresAt,
      });
    } catch {
      // Ignore if table not yet migrated
    }

    // 2. Also store in Supabase auth.users app_metadata so it persists across serverless instances even without portal_access_codes table
    if (/^[0-9a-f-]{36}$/i.test(ownerId)) {
      try {
        await this.client.auth.admin.updateUserById(ownerId, {
          app_metadata: { portal_access: accessRecord },
        });
      } catch {
        // Ignore
      }
    }

    return accessRecord;
  }

  // Helper to find an access code from DB table, Auth user app_metadata, or memory
  private async findAccessCodeRecord(
    normalizedEmail: string,
  ): Promise<{ record: ClientAccessRequest; ownerUuid?: string } | null> {
    try {
      const { data, error } = await this.client
        .from("portal_access_codes")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        const r = data as AccessCodeRow;
        return {
          record: {
            email: r.email,
            clientName: r.client_name,
            companyName: r.company_name,
            code: r.code,
            intakeId: r.intake_id,
            createdAt: r.created_at,
            expiresAt: Number(r.expires_at),
          },
        };
      }
    } catch {
      // Ignore
    }

    try {
      const { data: list } = await this.client.auth.admin.listUsers({
        perPage: 1000,
      });
      const user = list?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail,
      );
      const meta = user?.app_metadata?.portal_access as
        | ClientAccessRequest
        | undefined;
      if (meta && meta.code) {
        return { record: meta, ownerUuid: user?.id };
      }
    } catch {
      // Ignore
    }

    const mem = memoryAccessCodes.get(normalizedEmail);
    if (mem) return { record: mem };

    return null;
  }

  // 5. Client 6-Digit Code Verification
  async verifyClientAccess(
    email: string,
    token: string,
  ): Promise<{ token: string; intakeId: string; status: "draft" | "submitted" }> {
    const normalizedEmail = email.trim().toLowerCase();
    const rateKey = `client:${normalizedEmail}`;
    await this.checkRateLimit(rateKey);

    const found = await this.findAccessCodeRecord(normalizedEmail);
    const record = found?.record;

    if (!record || Number(record.expiresAt) < Date.now()) {
      await this.recordFailure(rateKey);
      throw new PortalError(
        400,
        "Código não encontrado ou já expirado. Pede um novo código para continuar.",
      );
    }

    if (!safeCompare(record.code, token.trim())) {
      const fails = await this.recordFailure(rateKey);
      if (fails >= 5) {
        await this.removeAccessCodeInternal(normalizedEmail, found?.ownerUuid);
      }
      throw new PortalError(400, "Código de 6 dígitos incorreto.");
    }

    await this.clearFailures(rateKey);

    const { data: intake } = await this.client
      .from("portal_intakes")
      .select("*")
      .eq("id", record.intakeId)
      .maybeSingle();

    if (!intake) {
      throw new PortalError(404, "Ficha de cliente associada não encontrada.");
    }

    const identity: Identity = {
      id: intake.owner,
      name: record.clientName || record.companyName || normalizedEmail,
      role: "client",
      isAdmin: false,
    };

    const sessionToken = await this.createSession(identity);
    return {
      token: sessionToken,
      intakeId: intake.id,
      status: intake.status,
    };
  }

  private async removeAccessCodeInternal(
    normalizedEmail: string,
    ownerUuid?: string,
  ): Promise<void> {
    memoryAccessCodes.delete(normalizedEmail);
    try {
      await this.client
        .from("portal_access_codes")
        .delete()
        .eq("email", normalizedEmail);
    } catch {
      // Ignore
    }
    try {
      let targetUuid = ownerUuid;
      if (!targetUuid) {
        const { data: list } = await this.client.auth.admin.listUsers({
          perPage: 1000,
        });
        targetUuid = list?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail,
        )?.id;
      }
      if (targetUuid) {
        await this.client.auth.admin.updateUserById(targetUuid, {
          app_metadata: { portal_access: null },
        });
      }
    } catch {
      // Ignore
    }
  }

  // 6. Access Codes Listing & Deletion
  async listAccessCodes(who: Identity): Promise<ClientAccessRequest[]> {
    if (who.role !== "team") {
      throw new PortalError(403, "Acesso reservado à equipa.");
    }

    const byEmail = new Map<string, ClientAccessRequest>();
    const now = Date.now();

    for (const [email, rec] of memoryAccessCodes.entries()) {
      if (rec.expiresAt > now) byEmail.set(email, rec);
    }

    try {
      const { data, error } = await this.client
        .from("portal_access_codes")
        .select("*")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (!error && data) {
        for (const r of data as AccessCodeRow[]) {
          byEmail.set(r.email, {
            email: r.email,
            clientName: r.client_name,
            companyName: r.company_name,
            code: r.code,
            intakeId: r.intake_id,
            createdAt: r.created_at,
            expiresAt: Number(r.expires_at),
          });
        }
      }
    } catch {
      // Ignore
    }

    try {
      const { data: list } = await this.client.auth.admin.listUsers({
        perPage: 1000,
      });
      for (const u of list?.users || []) {
        const meta = u.app_metadata?.portal_access as
          | ClientAccessRequest
          | undefined;
        if (meta && meta.code && Number(meta.expiresAt) > now) {
          byEmail.set(meta.email, meta);
        }
      }
    } catch {
      // Ignore
    }

    return Array.from(byEmail.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async deleteAccessCode(email: string, who: Identity): Promise<void> {
    if (who.role !== "team" || !who.isAdmin) {
      throw new PortalError(
        403,
        "Apenas o administrador principal (user1) pode apagar códigos de acesso.",
      );
    }
    await this.removeAccessCodeInternal(email.trim().toLowerCase());
  }

  // 7. Intake Queries
  async get(id: string, who: Identity): Promise<Intake> {
    const { data, error } = await this.client
      .from("portal_intakes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data || (who.role !== "team" && data.owner !== who.id)) {
      throw new PortalError(404, "Ficha não encontrada.");
    }
    return formatIntake(data);
  }

  async list(who: Identity): Promise<Intake[]> {
    let query = this.client
      .from("portal_intakes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (who.role !== "team") {
      query = query.eq("owner", who.id);
    }
    const { data, error } = await query;
    if (error) {
      console.error("[RemoteStore list error]", error);
      throw new PortalError(500, "Erro ao carregar fichas.");
    }
    return (data || []).map(formatIntake);
  }

  private editable(intake: Intake, who: Identity) {
    const isOwnerClient = who.role === "client" && intake.owner === who.id;
    const isSuperAdmin = who.role === "team" && who.isAdmin === true;
    if (!isOwnerClient && !isSuperAdmin) {
      throw new PortalError(
        403,
        "Apenas o cliente atribuído ou o administrador principal (user1) pode editar todo o questionário.",
      );
    }
    if (intake.status !== "draft") {
      throw new PortalError(
        409,
        "Esta ficha já foi submetida. As respostas originais estão preservadas.",
      );
    }
    if (intake.version !== QUESTIONNAIRE_VERSION) {
      throw new PortalError(409, "Versão do questionário não suportada.");
    }
  }

  // 8. Intake Save (Draft Answers)
  async save(
    id: string,
    who: Identity,
    revision: number,
    input: unknown,
  ): Promise<Intake> {
    const intake = await this.get(id, who);
    this.editable(intake, who);
    const v = validateAnswers(input);
    if (Object.keys(v.errors).length) {
      throw new PortalError(422, "Revê as respostas indicadas.", v.errors);
    }

    const { data, error } = await this.client
      .from("portal_intakes")
      .update({
        answers: v.answers,
        revision: intake.revision + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("revision", revision)
      .eq("status", "draft")
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new PortalError(
        409,
        "Esta ficha mudou noutra sessão. Guarda uma cópia do texto recente e carrega a versão guardada para continuar.",
      );
    }
    return formatIntake(data);
  }

  // 9. Basic Info Update (Team User2-User6 permission)
  async saveBasic(
    id: string,
    who: Identity,
    basicFields: Record<string, string>,
  ): Promise<Intake> {
    if (who.role !== "team") {
      throw new PortalError(403, "Acesso reservado à equipa.");
    }
    const intake = await this.get(id, who);
    if (intake.status !== "draft" && !who.isAdmin) {
      throw new PortalError(
        409,
        "Esta ficha já foi submetida. Apenas o administrador principal (user1) a pode alterar.",
      );
    }

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
      if (trimmed) nextAnswers[key] = { state: "answered", value: trimmed };
      else delete nextAnswers[key];
    }

    const v = validateAnswers(nextAnswers);
    if (Object.keys(v.errors).length) {
      throw new PortalError(422, "Revê os dados básicos indicados.", v.errors);
    }

    const { data, error } = await this.client
      .from("portal_intakes")
      .update({
        answers: v.answers,
        revision: intake.revision + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new PortalError(500, "Erro ao atualizar dados básicos.");
    }
    return formatIntake(data);
  }

  // 10. Reopen & Delete Intakes (User1 Super Admin only)
  async reopenIntake(id: string, who: Identity): Promise<Intake> {
    if (who.role !== "team" || !who.isAdmin) {
      throw new PortalError(
        403,
        "Apenas o administrador principal (user1) pode reabrir uma ficha submetida.",
      );
    }
    await this.get(id, who);

    try {
      await this.client.from("portal_submissions").delete().eq("intake_id", id);
    } catch {
      // Ignore if immutable trigger is active
    }

    const { data, error } = await this.client
      .from("portal_intakes")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new PortalError(500, "Erro ao reabrir ficha.");
    }

    try {
      await this.client.from("portal_audit_events").insert({
        intake_id: id,
        actor: who.id,
        action: "reopened",
      });
    } catch {
      // Ignore
    }

    return formatIntake(data);
  }

  async deleteIntake(id: string, who: Identity): Promise<void> {
    if (who.role !== "team" || !who.isAdmin) {
      throw new PortalError(
        403,
        "Apenas o administrador principal (user1) pode apagar fichas.",
      );
    }
    const intake = await this.get(id, who);
    const clientEmail = textValue(intake.answers, "contact.email").toLowerCase();
    if (clientEmail) {
      await this.removeAccessCodeInternal(clientEmail, intake.owner);
    }
    try {
      await this.client.from("portal_audit").delete().eq("intake_id", id);
    } catch {}
    try {
      await this.client.from("portal_audit_events").delete().eq("intake_id", id);
    } catch {}
    try {
      await this.client.from("portal_submissions").delete().eq("intake_id", id);
    } catch {}
    await this.client.from("portal_intakes").delete().eq("id", id);
  }

  // 11. Submissions
  async submission(id: string, who: Identity): Promise<Submission | null> {
    await this.get(id, who);
    const { data } = await this.client
      .from("portal_submissions")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle();

    return data ? formatSubmission(data) : null;
  }

  async submit(
    id: string,
    who: Identity,
    revision: number,
    key: string,
  ): Promise<Submission> {
    const intake = await this.get(id, who);
    const canSubmit =
      who.role === "client" || (who.role === "team" && who.isAdmin === true);
    if (!canSubmit) {
      throw new PortalError(
        403,
        "Só o cliente ou o administrador principal (user1) pode submeter.",
      );
    }

    const { data: existingSub } = await this.client
      .from("portal_submissions")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle();

    if (existingSub?.idempotency_key === key) {
      return formatSubmission(existingSub);
    }

    this.editable(intake, who);
    if (intake.revision !== revision) {
      throw new PortalError(
        409,
        "A ficha mudou. Revê a versão guardada antes de enviar.",
      );
    }

    const v = validateAnswers(intake.answers, true);
    if (Object.keys(v.errors).length) {
      throw new PortalError(
        422,
        "Preenche os campos obrigatórios antes de enviar.",
        v.errors,
      );
    }

    const createdAt = new Date().toISOString();
    const submissionId = existingSub?.id || randomUUID();
    const reference =
      existingSub?.reference || `REC-${submissionId.slice(0, 8).toUpperCase()}`;
    const snapshot = makeSnapshot(v.answers);

    let subData: SubmissionRow;
    if (existingSub) {
      subData = {
        ...existingSub,
        idempotency_key: key,
        snapshot,
        created_at: createdAt,
      };
    } else {
      const { data: insertedSub, error: subError } = await this.client
        .from("portal_submissions")
        .insert({
          id: submissionId,
          intake_id: id,
          idempotency_key: key,
          reference,
          snapshot,
          created_at: createdAt,
        })
        .select()
        .single();

      if (subError || !insertedSub) {
        console.error("[RemoteStore submit error]", subError);
        throw new PortalError(500, "Erro ao gravar submissão.");
      }
      subData = insertedSub as SubmissionRow;
    }

    await this.client
      .from("portal_intakes")
      .update({
        status: "submitted",
        revision: intake.revision + 1,
        updated_at: createdAt,
      })
      .eq("id", id);

    try {
      await this.client.from("portal_outbox").insert([
        {
          submission_id: submissionId,
          recipient: "client",
          subject: `Ficha recebida — ${textValue(v.answers, "company.name")} — ${reference}`,
          status: "sent",
          created_at: createdAt,
        },
        {
          submission_id: submissionId,
          recipient: "team",
          subject: `Nova ficha — ${textValue(v.answers, "company.name")} — ${reference}`,
          status: "sent",
          created_at: createdAt,
        },
      ]);
    } catch {
      // Ignore outbox schema differences
    }

    return formatSubmission(subData);
  }

  // 12. Notifications (Outbox listing)
  async notifications(who: Identity): Promise<any[]> {
    if (who.role !== "team") {
      throw new PortalError(403, "Acesso reservado à equipa.");
    }
    try {
      const { data } = await this.client
        .from("portal_outbox")
        .select("id, submission_id, recipient, subject, status, created_at")
        .order("created_at", { ascending: false });

      return data || [];
    } catch {
      return [];
    }
  }
}
