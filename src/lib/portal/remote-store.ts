import "server-only";
import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
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

  // 1. Rate Limiting / Lockout checks via portal_auth_attempts
  private async checkRateLimit(target: string): Promise<void> {
    const { data } = await this.client
      .from("portal_auth_attempts")
      .select("failures, locked_until")
      .eq("target", target)
      .maybeSingle();

    if (data && Number(data.locked_until) > Date.now()) {
      const waitMinutes = Math.ceil((Number(data.locked_until) - Date.now()) / 60000);
      throw new PortalError(
        429,
        `Demasiadas tentativas inválidas. Acesso temporariamente bloqueado. Tenta novamente dentro de ${waitMinutes} minuto(s).`,
      );
    }
  }

  private async recordFailure(target: string): Promise<number> {
    const now = Date.now();
    const { data } = await this.client
      .from("portal_auth_attempts")
      .select("failures, locked_until")
      .eq("target", target)
      .maybeSingle();

    const failures = data && Number(data.locked_until) <= now ? Number(data.failures) + 1 : 1;
    const lockedUntil = failures >= 5 ? now + 15 * 60 * 1000 : 0;

    await this.client
      .from("portal_auth_attempts")
      .upsert({ target, failures, locked_until: lockedUntil });

    return failures;
  }

  private async clearFailures(target: string): Promise<void> {
    await this.client.from("portal_auth_attempts").delete().eq("target", target);
  }

  // 2. Session Management via portal_sessions
  private async createSession(identity: Identity): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

    // Prune expired sessions occasionally
    await this.client.from("portal_sessions").delete().lt("expires_at", Date.now());

    const { error } = await this.client
      .from("portal_sessions")
      .insert({ token_hash: tokenHash, identity, expires_at: expiresAt });

    if (error) {
      console.error("[RemoteStore createSession error]", error);
      throw new PortalError(500, "Erro ao iniciar sessão.");
    }
    return token;
  }

  async identity(token: string | undefined): Promise<Identity | null> {
    if (!token) return null;
    const tokenHash = hashToken(token);
    const { data, error } = await this.client
      .from("portal_sessions")
      .select("identity, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !data || Number(data.expires_at) <= Date.now()) {
      return null;
    }
    return data.identity as Identity;
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await this.client.from("portal_sessions").delete().eq("token_hash", tokenHash);
  }

  // 3. Team Authentication
  async loginTeam(username: string, password: string): Promise<{ token: string; identity: Identity }> {
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

  // 4. Client Access Request & 6-Digit Code
  async requestClientAccess(
    clientName: string,
    companyName: string,
    email: string,
  ): Promise<ClientAccessRequest> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = clientName.trim();
    const cleanCompany = companyName.trim();
    const owner = `client:${normalizedEmail}`;
    const nowIso = new Date().toISOString();

    // Check existing intake for this client
    const { data: existingIntake } = await this.client
      .from("portal_intakes")
      .select("*")
      .eq("owner", owner)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let intakeId: string;

    if (!existingIntake) {
      intakeId = randomUUID();
      const initialAnswers: Answers = {
        "company.name": { state: "answered", value: cleanCompany },
        "contact.name": { state: "answered", value: cleanName },
        "contact.email": { state: "answered", value: normalizedEmail },
      };
      await this.client.from("portal_intakes").insert({
        id: intakeId,
        owner,
        version: QUESTIONNAIRE_VERSION,
        status: "draft",
        answers: initialAnswers,
        updated_at: nowIso,
      });
    } else {
      intakeId = existingIntake.id;
      if (existingIntake.status === "draft") {
        const answers = (existingIntake.answers || {}) as Answers;
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

    await this.client.from("portal_access_codes").upsert({
      email: normalizedEmail,
      client_name: cleanName || "Cliente",
      company_name: cleanCompany || "Empresa",
      code,
      intake_id: intakeId,
      created_at: nowIso,
      expires_at: expiresAt,
    });

    return {
      email: normalizedEmail,
      clientName: cleanName || "Cliente",
      companyName: cleanCompany || "Empresa",
      code,
      intakeId,
      createdAt: nowIso,
      expiresAt,
    };
  }

  // 5. Client 6-Digit Code Verification
  async verifyClientAccess(
    email: string,
    token: string,
  ): Promise<{ token: string; intakeId: string; status: "draft" | "submitted" }> {
    const normalizedEmail = email.trim().toLowerCase();
    const rateKey = `client:${normalizedEmail}`;
    await this.checkRateLimit(rateKey);

    const { data: record } = await this.client
      .from("portal_access_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!record || Number(record.expires_at) < Date.now()) {
      await this.recordFailure(rateKey);
      throw new PortalError(
        400,
        "Código não encontrado ou já expirado. Pede um novo código para continuar.",
      );
    }

    if (!safeCompare(record.code, token.trim())) {
      const fails = await this.recordFailure(rateKey);
      if (fails >= 5) {
        await this.client.from("portal_access_codes").delete().eq("email", normalizedEmail);
      }
      throw new PortalError(400, "Código de 6 dígitos incorreto.");
    }

    await this.clearFailures(rateKey);

    const { data: intake } = await this.client
      .from("portal_intakes")
      .select("*")
      .eq("id", record.intake_id)
      .single();

    if (!intake) {
      throw new PortalError(404, "Ficha de cliente associada não encontrada.");
    }

    const identity: Identity = {
      id: intake.owner,
      name: record.client_name || record.company_name || normalizedEmail,
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

  // 6. Access Codes Listing & Deletion
  async listAccessCodes(who: Identity): Promise<ClientAccessRequest[]> {
    if (who.role !== "team") {
      throw new PortalError(403, "Acesso reservado à equipa.");
    }
    const { data } = await this.client
      .from("portal_access_codes")
      .select("*")
      .gt("expires_at", Date.now())
      .order("created_at", { ascending: false });

    return ((data || []) as AccessCodeRow[]).map((r) => ({
      email: r.email,
      clientName: r.client_name,
      companyName: r.company_name,
      code: r.code,
      intakeId: r.intake_id,
      createdAt: r.created_at,
      expiresAt: Number(r.expires_at),
    }));
  }

  async deleteAccessCode(email: string, who: Identity): Promise<void> {
    if (who.role !== "team" || !who.isAdmin) {
      throw new PortalError(
        403,
        "Apenas o administrador principal (user1) pode apagar códigos de acesso.",
      );
    }
    await this.client.from("portal_access_codes").delete().eq("email", email.trim().toLowerCase());
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
  async save(id: string, who: Identity, revision: number, input: unknown): Promise<Intake> {
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

    await this.client.from("portal_submissions").delete().eq("intake_id", id);
    const { data, error } = await this.client
      .from("portal_intakes")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new PortalError(500, "Erro ao reabrir ficha.");
    }

    await this.client.from("portal_audit_events").insert({
      intake_id: id,
      actor: who.id,
      action: "reopened",
    });

    return formatIntake(data);
  }

  async deleteIntake(id: string, who: Identity): Promise<void> {
    if (who.role !== "team" || !who.isAdmin) {
      throw new PortalError(
        403,
        "Apenas o administrador principal (user1) pode apagar fichas.",
      );
    }
    await this.get(id, who);
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
    const submissionId = randomUUID();
    const reference = `REC-${submissionId.slice(0, 8).toUpperCase()}`;
    const snapshot = makeSnapshot(v.answers);

    const { data: subData, error: subError } = await this.client
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

    if (subError || !subData) {
      console.error("[RemoteStore submit error]", subError);
      throw new PortalError(500, "Erro ao gravar submissão.");
    }

    await this.client
      .from("portal_intakes")
      .update({
        status: "submitted",
        revision: intake.revision + 1,
        updated_at: createdAt,
      })
      .eq("id", id);

    await this.client.from("portal_audit_events").insert({
      intake_id: id,
      actor: who.id,
      action: "submitted",
      created_at: createdAt,
    });

    const clientEmail =
      textValue(v.answers, "contact.email") || "cliente@draftandrise.com";
    const recipients = Array.from(
      new Set(["geral@draftandrise.com", clientEmail]),
    );

    for (const recipient of recipients) {
      await this.client.from("portal_outbox").insert({
        submission_id: submissionId,
        recipient,
        subject: `Ficha recebida — ${textValue(v.answers, "company.name")} — ${reference}`,
        body: { reference, snapshot },
        created_at: createdAt,
      });
    }

    return formatSubmission(subData);
  }

  // 12. Notifications (Outbox listing)
  async notifications(who: Identity): Promise<any[]> {
    if (who.role !== "team") {
      throw new PortalError(403, "Acesso reservado à equipa.");
    }
    const { data } = await this.client
      .from("portal_outbox")
      .select("id, submission_id, recipient, subject, status, created_at")
      .order("created_at", { ascending: false });

    return data || [];
  }
}
