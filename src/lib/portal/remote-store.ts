import "server-only";
import { type SupabaseClient } from "@supabase/supabase-js";
import { serviceClient } from "./supabase";
import {
  PortalError,
  type Identity,
  type Intake,
  type Submission,
} from "./types";
import {
  QUESTIONNAIRE_VERSION,
  makeSnapshot,
  validateAnswers,
  type Answers,
  type Snapshot,
} from "./questionnaire";
type Row = {
  id: string;
  owner: string;
  version: string;
  revision: number;
  status: "draft" | "submitted";
  answers: Answers;
  updated_at: string;
};
type Sent = {
  id: string;
  intake_id: string;
  reference: string;
  snapshot: Snapshot;
  created_at: string;
};
function intake(r: Row): Intake {
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
function submission(r: Sent): Submission {
  return {
    id: r.id,
    intakeId: r.intake_id,
    reference: r.reference,
    snapshot: r.snapshot,
    createdAt: r.created_at,
  };
}
function check(error: { message: string } | null) {
  if (!error) return;
  if (error.message.includes("portal_not_found"))
    throw new PortalError(404, "Ficha não encontrada.");
  if (error.message.includes("portal_forbidden"))
    throw new PortalError(403, "Acesso não permitido.");
  if (error.message.includes("portal_conflict"))
    throw new PortalError(
      409,
      "A ficha mudou. Carregue a versão guardada antes de continuar.",
    );
  throw new PortalError(
    503,
    "Não foi possível aceder às respostas. Tente novamente.",
  );
}
export class RemoteStore {
  constructor(private client: SupabaseClient) {}
  async get(id: string, who: Identity): Promise<Intake> {
    if (!/^[0-9a-f-]{36}$/i.test(id))
      throw new PortalError(404, "Ficha não encontrada.");
    const { data, error } = await this.client
      .from("portal_intakes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    check(error);
    if (!data || (who.role !== "team" && data.owner !== who.id))
      throw new PortalError(404, "Ficha não encontrada.");
    return intake(data);
  }
  async list(who: Identity): Promise<Intake[]> {
    let query = this.client
      .from("portal_intakes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (who.role !== "team") query = query.eq("owner", who.id);
    const { data, error } = await query;
    check(error);
    return (data || []).map(intake);
  }
  private editable(i: Intake, who: Identity) {
    if (who.role !== "client" || i.owner !== who.id)
      throw new PortalError(403, "Só o cliente pode preencher esta ficha.");
    if (i.version !== QUESTIONNAIRE_VERSION)
      throw new PortalError(409, "Versão do questionário não suportada.");
  }
  async save(id: string, who: Identity, revision: number, input: unknown) {
    const i = await this.get(id, who);
    this.editable(i, who);
    const v = validateAnswers(input);
    if (Object.keys(v.errors).length)
      throw new PortalError(422, "Revê as respostas indicadas.", v.errors);
    const { data, error } = await serviceClient().rpc("portal_save", {
      p_actor: who.id,
      p_id: id,
      p_revision: revision,
      p_answers: v.answers,
    });
    check(error);
    return intake(data);
  }
  async submission(id: string, who: Identity): Promise<Submission | null> {
    await this.get(id, who);
    const { data, error } = await this.client
      .from("portal_submissions")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle();
    check(error);
    return data ? submission(data) : null;
  }
  async submit(id: string, who: Identity, revision: number, key: string) {
    const i = await this.get(id, who);
    this.editable(i, who);
    const v = validateAnswers(i.answers, true);
    if (Object.keys(v.errors).length)
      throw new PortalError(
        422,
        "Preenche os campos obrigatórios antes de enviar.",
        v.errors,
      );
    // The RPC locks the row and compares this exact revision before accepting the snapshot.
    if (i.status === "draft" && i.revision !== revision)
      throw new PortalError(
        409,
        "A ficha mudou. Revê a versão guardada antes de enviar.",
      );
    const { data, error } = await serviceClient().rpc("portal_submit", {
      p_actor: who.id,
      p_id: id,
      p_revision: revision,
      p_key: key,
      p_snapshot: makeSnapshot(v.answers),
    });
    check(error);
    return submission(data);
  }
  async notifications(who: Identity) {
    if (who.role !== "team")
      throw new PortalError(403, "Acesso reservado à equipa.");
    const { data, error } = await this.client
      .from("portal_outbox")
      .select("id,submission_id,recipient,subject,status,created_at")
      .order("created_at", { ascending: false });
    check(error);
    return data || [];
  }
}
