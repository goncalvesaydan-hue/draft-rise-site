"use client";
import { portalClass } from "./classes";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  LogOut,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  Building2,
  Mail,
  Search,
} from "lucide-react";
import { Brand, Footer } from "./brand";
import { api, ApiError } from "@/lib/portal/client";
import {
  steps,
  questions,
  activeQuestions,
  answered,
  displayAnswer,
  progress,
  textValue,
  validateAnswers,
  type Question,
  type Answer,
  type Answers,
  type RepeatRow,
} from "@/lib/portal/questionnaire";
import type {
  Intake,
  Submission,
  Identity,
  ClientAccessRequest,
} from "@/lib/portal/store";
function WorkspaceHeader({ team = false }: { team?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function leave() {
    try {
      await api("/api/session", { method: "DELETE" });
      router.push("/acesso");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <header className="p-site-header p-workspace-header">
        <Brand />
        <nav>
          {team ? (
            <>
              <Link href="/equipa">Questionários Bot</Link>
              <Link href="/equipa/dashboard">draftandrise dashboard</Link>
            </>
          ) : (
            <Link href="/cliente">O meu espaço</Link>
          )}
          <Link href="/ajuda">Ajuda</Link>
          <button className="p-icon-link" onClick={leave}>
            <LogOut size={16} /> Sair
          </button>
        </nav>
      </header>
      {error && (
        <p role="alert" className="p-error">
          {error}
        </p>
      )}
    </>
  );
}
function Problem({ message, team = false }: { message: string; team?: boolean }) {
  return (
    <div className="p-empty-state">
      <AlertCircle />
      <h2>Precisamos de retomar o acesso.</h2>
      <p role="alert">{message}</p>
      <Link
        href={team ? "/acesso?tab=team" : "/acesso"}
        className="p-button p-primary"
      >
        {team ? "Entrar na área da equipa" : "Entrar no meu espaço"}
      </Link>
    </div>
  );
}
function useRemote<T>(url: string, refreshKey = 0) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    api<T>(url)
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [url, refreshKey]);
  return { data, error };
}

function TeamAccessCodesPanel({
  codes,
  isAdmin,
  onCreated,
}: {
  codes: ClientAccessRequest[];
  isAdmin: boolean;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function generateCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/request", {
        method: "POST",
        body: JSON.stringify({ name, company, email }),
      });
      setName("");
      setCompany("");
      setEmail("");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function revokeCode(targetEmail: string) {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/request", {
        method: "DELETE",
        body: JSON.stringify({ email: targetEmail }),
      });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copyText(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <section className="p-access-codes-panel">
      <div className="p-access-codes-header">
        <div>
          <span className="p-eyeline">Gestão de Clientes</span>
          <h2>Códigos de Acesso de Clientes (6 dígitos)</h2>
          <p className="p-field-help">
            Quando um cliente pede acesso em <code>/acesso</code> (ou quando geras
            um código abaixo), o código de 6 dígitos fica imediatamente ativo aqui
            para copiares e enviares ao cliente via WhatsApp.
          </p>
        </div>
      </div>

      <form className="p-access-codes-form" onSubmit={generateCode}>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do cliente (ex.: João Silva)"
        />
        <input
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Empresa (ex.: Clínica Sorriso)"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail do cliente"
        />
        <button className="p-button p-primary" type="submit" disabled={busy}>
          <Plus size={16} /> {busy ? "A gerar…" : "Gerar código"}
        </button>
      </form>
      {error && (
        <p role="alert" className="p-error">
          {error}
        </p>
      )}

      {codes.length === 0 ? (
        <p className="p-quiet">
          Ainda não existem códigos de clientes gerados. Podes gerar um acima ou
          enviar o link <code>/questionario</code> ao cliente.
        </p>
      ) : (
        <div className="p-access-codes-list">
          {codes.map((c) => {
            const origin =
              typeof window !== "undefined"
                ? window.location.origin
                : "https://draftandrise.com";
            const directLink = `${origin}/acesso?email=${encodeURIComponent(c.email)}&mode=code`;
            const whatsappMsg = `Olá ${c.clientName}! Aqui está o teu código de acesso ao Questionário WhatsApp Business da Draft & Rise (${c.companyName}): *${c.code}*\n\nEntra diretamente aqui: ${directLink}`;
            return (
              <div key={c.email} className="p-access-code-row">
                <div className="p-access-code-meta">
                  <strong>{c.companyName}</strong>
                  <span>
                    {c.clientName} · {c.email}
                  </span>
                  <small>
                    Gerado em {new Date(c.createdAt).toLocaleString("pt-PT")}
                  </small>
                </div>
                <div className="p-access-code-actions">
                  <code className="p-access-code-badge">{c.code}</code>
                  <span className="p-pill p-green">Ativo</span>
                  <button
                    type="button"
                    className="p-button p-secondary p-small-btn"
                    onClick={() => copyText(`code-${c.email}`, c.code)}
                  >
                    {copiedId === `code-${c.email}`
                      ? "Copiado!"
                      : "Copiar código"}
                  </button>
                  <button
                    type="button"
                    className="p-button p-secondary p-small-btn"
                    onClick={() => copyText(`msg-${c.email}`, whatsappMsg)}
                  >
                    {copiedId === `msg-${c.email}`
                      ? "Mensagem copiada!"
                      : "Copiar p/ WhatsApp"}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="p-button p-secondary p-small-btn p-danger-btn"
                      disabled={busy}
                      onClick={() => revokeCode(c.email)}
                    >
                      <Trash2 size={14} /> Apagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function IntakeList({ team = false }: { team?: boolean }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error } = useRemote<{
    identity: Identity;
    intakes: Intake[];
    accessCodes?: ClientAccessRequest[];
  }>("/api/intakes", refreshKey);
  const [search, setSearch] = useState("");
  const authorized = data && (!team || data.identity.role === "team");
  const isAdmin = Boolean(data?.identity.isAdmin);
  return (
    <>
      <WorkspaceHeader team={team} />
      <main id="conteudo" className="p-workspace-page">
        {error ? (
          <Problem message={error} team={team} />
        ) : !data ? (
          <p role="status">A abrir o seu espaço…</p>
        ) : !authorized ? (
          <Problem message="Esta área é reservada à equipa." team={true} />
        ) : (
          <>
            <div className="p-page-top">
              <div>
                <span className="p-eyeline">
                  {team
                    ? isAdmin
                      ? `Administrador Total · ${data.identity.name}`
                      : `Equipa (Acesso Básico) · ${data.identity.name}`
                    : "O seu espaço"}
                </span>
                <h1>
                  {team
                    ? "Controlo de Questionários & Agentes WhatsApp."
                    : "Vamos dar o próximo passo."}
                </h1>
                <p className="p-lead p-small">
                  {team
                    ? isAdmin
                      ? "Tens acesso total (user1): podes gerir e apagar códigos, editar todas as respostas de qualquer questionário, reabrir fichas submetidas e exportar o ficheiro .md."
                      : "Conta de equipa com acesso básico: podes gerar e copiar códigos de clientes, acompanhar as respostas e atualizar dados básicos de contacto."
                    : "As suas respostas ficam organizadas aqui, mesmo quando faz uma pausa."}
                </p>
              </div>
              <span
                className={portalClass(`pill ${isAdmin ? "green" : "pale"}`)}
              >
                {team
                  ? isAdmin
                    ? "user1 · Acesso Total"
                    : `${data.identity.id} · Acesso Básico`
                  : "Área privada"}
              </span>
            </div>
            {team && (
              <div className="p-team-overview">
                <div>
                  <strong>{data.intakes.length}</strong>
                  <span>Fichas de Clientes</span>
                </div>
                <div>
                  <strong>
                    {
                      data.intakes.filter((i) => i.status === "submitted")
                        .length
                    }
                  </strong>
                  <span>Submetidas (Prontas p/ IA)</span>
                </div>
                <div>
                  <strong>
                    {data.intakes.filter((i) => i.status === "draft").length}
                  </strong>
                  <span>Em preenchimento</span>
                </div>
                <div>
                  <strong>{data.accessCodes?.length ?? 0}</strong>
                  <span>Códigos gerados</span>
                </div>
                <Link href="/equipa/notificacoes" className="p-text-link">
                  Notificações <Mail size={18} />
                </Link>
                <Link href="/equipa/dashboard" className="p-text-link">
                  draftandrise dashboard <ChevronRight size={18} />
                </Link>
              </div>
            )}
            {team && (
              <TeamAccessCodesPanel
                codes={data.accessCodes ?? []}
                isAdmin={isAdmin}
                onCreated={() => setRefreshKey((k) => k + 1)}
              />
            )}
            {team && (
              <label className="p-search-field">
                <Search size={18} />
                <span className="p-sr-only">Pesquisar empresa</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar empresa"
                />
              </label>
            )}
            <div className="p-intake-list">
              {data.intakes
                .filter((i) =>
                  textValue(i.answers, "company.name")
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((i) => {
                  const p = progress(i.answers);
                  return (
                    <Link
                      className="p-intake-card"
                      key={i.id}
                      href={
                        team
                          ? `/equipa/fichas/${i.id}`
                          : `/cliente/${i.id}/${i.status === "submitted" ? "confirmacao" : "preencher/1"}`
                      }
                    >
                      <span className="p-company-icon">
                        <Building2 size={26} />
                      </span>
                      <div className="p-intake-card-body">
                        <div className="p-card-title">
                          <h2>
                            {textValue(i.answers, "company.name") ||
                              "Nova empresa"}
                          </h2>
                          <span
                            className={portalClass(
                              `pill ${i.status === "submitted" ? "green" : ""}`,
                            )}
                          >
                            {i.status === "submitted"
                              ? "Submetido"
                              : "Em preenchimento"}
                          </span>
                        </div>
                        <p>
                          {i.status === "submitted"
                            ? "Informação recebida e disponível para consulta."
                            : `${p.done} de ${p.total} perguntas aplicáveis respondidas`}
                        </p>
                        <div className="p-thin-progress">
                          <span
                            style={{ width: `${(p.done / p.total) * 100}%` }}
                          />
                        </div>
                        <small>
                          Atualizado em{" "}
                          {new Date(i.updatedAt).toLocaleDateString("pt-PT")}
                        </small>
                      </div>
                      <ChevronRight />
                    </Link>
                  );
                })}
            </div>
            {data.intakes.filter((i) =>
              textValue(i.answers, "company.name")
                .toLowerCase()
                .includes(search.toLowerCase()),
            ).length === 0 && (
              <div className="p-empty-state">
                <h2>Nenhuma ficha encontrada.</h2>
                <p>Tente pesquisar por outro nome.</p>
              </div>
            )}
            <div className="p-notice p-soft">
              <FileText size={20} />
              <span>
                {team
                  ? isAdmin
                    ? "Como user1 (Admin Total), podes entrar em qualquer ficha para editar todas as respostas das 8 etapas, reabrir fichas submetidas ou eliminar registos."
                    : "Como membro da equipa (Acesso Básico), podes entrar em qualquer ficha para consultar as respostas do cliente, exportar o Markdown e atualizar os dados básicos de contacto."
                  : "Não precisa de responder tudo de uma vez. Quando o indicador disser “Guardado”, pode sair e voltar com o mesmo perfil."}
              </span>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
type IntakeResponse = {
  identity: Identity;
  intake: Intake;
  submission: Submission | null;
};

function BasicFieldsCard({
  intake,
  canEdit,
  onSaved,
}: {
  intake: Intake;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState(
    textValue(intake.answers, "company.name"),
  );
  const [contactName, setContactName] = useState(
    textValue(intake.answers, "contact.name"),
  );
  const [contactRole, setContactRole] = useState(
    textValue(intake.answers, "contact.role"),
  );
  const [contactEmail, setContactEmail] = useState(
    textValue(intake.answers, "contact.email"),
  );
  const [contactPhone, setContactPhone] = useState(
    textValue(intake.answers, "contact.phone"),
  );
  const [location, setLocation] = useState(
    textValue(intake.answers, "company.location"),
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function saveBasic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      await api(`/api/intakes/${encodeURIComponent(intake.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "basic",
          fields: {
            "company.name": companyName,
            "contact.name": contactName,
            "contact.role": contactRole,
            "contact.email": contactEmail,
            "contact.phone": contactPhone,
            "company.location": location,
          },
        }),
      });
      setMsg("Dados básicos guardados com sucesso.");
      onSaved();
    } catch (error) {
      setErr((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="p-access-codes-panel">
      <div className="p-access-codes-header">
        <div>
          <span className="p-eyeline">Edição Rápida da Equipa</span>
          <h2>Dados Básicos da Empresa & Contacto</h2>
          <p className="p-field-help">
            Qualquer membro da equipa (<code>user1</code> a <code>user6</code>)
            pode corrigir ou atualizar estes dados básicos de identificação do
            cliente.
          </p>
        </div>
      </div>
      <form className="p-basic-fields-grid" onSubmit={saveBasic}>
        <label>
          <span>Nome da empresa</span>
          <input
            disabled={!canEdit || busy}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nome da empresa"
          />
        </label>
        <label>
          <span>Nome do responsável</span>
          <input
            disabled={!canEdit || busy}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nome do contacto"
          />
        </label>
        <label>
          <span>Cargo / função</span>
          <input
            disabled={!canEdit || busy}
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
            placeholder="Ex.: Gerente, Diretor"
          />
        </label>
        <label>
          <span>E-mail</span>
          <input
            disabled={!canEdit || busy}
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="email@empresa.pt"
          />
        </label>
        <label>
          <span>Telefone / WhatsApp</span>
          <input
            disabled={!canEdit || busy}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+351 9xx xxx xxx"
          />
        </label>
        <label>
          <span>Localização (Cidade / País)</span>
          <input
            disabled={!canEdit || busy}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex.: Lisboa, Portugal"
          />
        </label>
        {canEdit && (
          <div className="p-basic-fields-actions">
            <button
              className="p-button p-primary"
              type="submit"
              disabled={busy}
            >
              <Save size={16} />{" "}
              {busy ? "A guardar…" : "Guardar dados básicos"}
            </button>
            {msg && <span className="p-saved-inline">{msg}</span>}
          </div>
        )}
      </form>
      {err && (
        <p role="alert" className="p-error">
          {err}
        </p>
      )}
    </section>
  );
}

export function IntakeWorkspace({
  id,
  initialStep = 1,
  team = false,
}: {
  id: string;
  initialStep?: number;
  team?: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [adminFullEdit, setAdminFullEdit] = useState(false);
  const { data, error } = useRemote<IntakeResponse>(
    `/api/intakes/${encodeURIComponent(id)}`,
    refreshKey,
  );
  const isAdmin = Boolean(data?.identity.isAdmin);
  return (
    <>
      <WorkspaceHeader team={team} />
      <main id="conteudo">
        {error ? (
          <Problem message={error} />
        ) : !data ? (
          <div className="p-workspace-page" role="status">
            A recuperar as respostas guardadas…
          </div>
        ) : team && data.identity.role !== "team" ? (
          <Problem message="Área reservada à equipa." />
        ) : team && isAdmin && adminFullEdit && data.intake.status === "draft" ? (
          <Editor
            initial={data.intake}
            initialStep={initialStep}
            adminMode={true}
            onExitAdmin={() => {
              setAdminFullEdit(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        ) : data.submission ? (
          <Submitted
            submission={data.submission}
            intake={data.intake}
            team={team}
            isAdmin={isAdmin}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        ) : team ? (
          <DraftPreview
            intake={data.intake}
            isAdmin={isAdmin}
            onEditFull={() => setAdminFullEdit(true)}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        ) : data.identity.role === "team" ? (
          <Problem message="Usa o painel da equipa (/equipa) para gerir esta ficha." />
        ) : (
          <Editor initial={data.intake} initialStep={initialStep} />
        )}
      </main>
      <Footer />
    </>
  );
}
function DraftPreview({
  intake,
  isAdmin,
  onEditFull,
  onRefresh,
}: {
  intake: Intake;
  isAdmin: boolean;
  onEditFull: () => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function removeIntake() {
    setBusy(true);
    setErr("");
    try {
      await api(`/api/intakes/${encodeURIComponent(intake.id)}`, {
        method: "DELETE",
      });
      router.push("/equipa");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="p-workspace-page">
      <div className="p-admin-top-bar">
        <Link className="p-text-link" href="/equipa">
          <ArrowLeft size={16} /> Voltar às fichas
        </Link>
        <span className={portalClass(`pill ${isAdmin ? "green" : "pale"}`)}>
          {isAdmin
            ? "user1 · Acesso Total (Admin)"
            : "Equipa · Acesso Básico (Consulta & Dados Básicos)"}
        </span>
      </div>
      <h1>{textValue(intake.answers, "company.name") || "Nova empresa"}</h1>

      {isAdmin ? (
        <div className="p-admin-actions-bar">
          <div>
            <strong>Controlo Total (user1)</strong>
            <p className="p-field-help">
              Como administrador principal, podes editar todas as 8 etapas do
              questionário deste cliente, exportar o rascunho em Markdown ou
              apagar a ficha.
            </p>
          </div>
          <div className="p-button-row">
            <button
              type="button"
              className="p-button p-primary"
              onClick={onEditFull}
            >
              Editar questionário completo (8 etapas)
            </button>
            <a
              href={`/api/intakes/${intake.id}/export`}
              className="p-button p-secondary"
            >
              <Download size={16} /> Exportar Markdown (.md)
            </a>
            <button
              type="button"
              className="p-button p-secondary p-danger-btn"
              disabled={busy}
              onClick={removeIntake}
            >
              <Trash2 size={16} /> Apagar ficha
            </button>
          </div>
        </div>
      ) : (
        <div className="p-notice">
          <strong>Modo de Consulta & Edição Básica:</strong> Podes atualizar os
          dados básicos da empresa/contacto abaixo e consultar todas as
          respostas do cliente. A edição profunda das 8 etapas e a eliminação de
          fichas estão reservadas ao <code>user1</code>.
        </div>
      )}
      {err && (
        <p role="alert" className="p-error">
          {err}
        </p>
      )}

      <BasicFieldsCard intake={intake} canEdit={true} onSaved={onRefresh} />

      <h2>Respostas completas do questionário</h2>
      <AnswerReview answers={intake.answers} />
    </div>
  );
}
function Submitted({
  submission: s,
  intake,
  team,
  isAdmin = false,
  onRefresh,
}: {
  submission: Submission;
  intake?: Intake;
  team: boolean;
  isAdmin?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function reopenForEdit() {
    setBusy(true);
    setErr("");
    try {
      await api(`/api/intakes/${encodeURIComponent(s.intakeId)}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "reopen" }),
      });
      onRefresh?.();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeIntake() {
    setBusy(true);
    setErr("");
    try {
      await api(`/api/intakes/${encodeURIComponent(s.intakeId)}`, {
        method: "DELETE",
      });
      router.push("/equipa");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="p-workspace-page p-submitted-page">
      <div className="p-confirmation">
        <span className="p-confirmation-icon">
          <CheckCircle2 size={36} />
        </span>
        <span className="p-eyeline">{s.reference}</span>
        <h1>
          {team
            ? "Informação pronta para analisar."
            : "O seu próximo passo já começou."}
        </h1>
        <p className="p-lead p-small">
          A ficha foi guardada. As respostas originais ficam disponíveis aqui.
        </p>
        <p className="p-quiet">
          Recebida em {new Date(s.createdAt).toLocaleString("pt-PT")}
        </p>
        <div className="p-button-row">
          <a
            href={`/api/intakes/${s.intakeId}/export`}
            className="p-button p-primary"
          >
            <Download size={18} /> Descarregar ficha Markdown
          </a>
          <Link
            href={team ? "/equipa" : "/cliente"}
            className="p-button p-secondary"
          >
            Voltar ao meu espaço
          </Link>
          {team && isAdmin && (
            <>
              <button
                type="button"
                className="p-button p-secondary"
                disabled={busy}
                onClick={reopenForEdit}
              >
                Reabrir ficha p/ editar tudo (user1)
              </button>
              <button
                type="button"
                className="p-button p-secondary p-danger-btn"
                disabled={busy}
                onClick={removeIntake}
              >
                <Trash2 size={16} /> Apagar ficha
              </button>
            </>
          )}
        </div>
        {err && (
          <p role="alert" className="p-error">
            {err}
          </p>
        )}
        <div className="p-notice p-soft">
          {team && isAdmin
            ? "Como user1 (Admin Total), podes descarregar o ficheiro Markdown ou reabrir esta ficha caso queiras alterar respostas em qualquer etapa."
            : "A ficha já está disponível para consulta e exportação em Markdown (.md)."}
        </div>
      </div>
      {team && intake && isAdmin && (
        <BasicFieldsCard
          intake={intake}
          canEdit={true}
          onSaved={() => onRefresh?.()}
        />
      )}
      <h2>As respostas que enviou</h2>
      <AnswerReview
        answers={s.snapshot.answers}
        snapshotQuestions={s.snapshot.questions}
      />
    </div>
  );
}
function AnswerReview({
  answers,
  snapshotQuestions,
  onEdit,
}: {
  answers: Answers;
  snapshotQuestions?: Question[];
  onEdit?: (step: number) => void;
}) {
  const qs = snapshotQuestions ?? activeQuestions(answers);
  return (
    <div className="p-answer-review">
      {steps.slice(0, 7).map((name, index) => (
        <details key={name} open={index === 0}>
          <summary>
            <span>{name}</span>
            <span>
              {
                qs.filter(
                  (q) => q.step === index + 1 && answered(answers[q.id]),
                ).length
              }{" "}
              respostas
            </span>
          </summary>
          <div className="p-review-section">
            {onEdit && (
              <button className="p-text-link" onClick={() => onEdit(index + 1)}>
                Editar esta etapa
              </button>
            )}
            {qs
              .filter((q) => q.step === index + 1)
              .map((q) => (
                <div className="p-review-answer" key={q.id}>
                  <h3>{q.label}</h3>
                  <p
                    className={portalClass(
                      answers[q.id]?.state === "unknown"
                        ? "pending-answer"
                        : "",
                    )}
                  >
                    {displayAnswer(q, answers[q.id])}
                  </p>
                </div>
              ))}
          </div>
        </details>
      ))}
    </div>
  );
}
function QuestionField({
  question: q,
  answer: a,
  onChange,
  error,
}: {
  question: Question;
  answer?: Answer;
  onChange: (a: Answer) => void;
  error?: string;
}) {
  const state = a?.state ?? "answered",
    value = a?.value ?? "",
    id = `field-${q.id}`,
    errorId = `error-${q.id}`;
  const common = {
    "aria-describedby": error ? errorId : undefined,
    "aria-invalid": !!error,
  };
  const set = (value: Answer["value"]) =>
    onChange({ state: "answered", value });
  return (
    <div
      className={portalClass(`question ${error ? "has-error" : ""}`)}
      id={`question-${q.id}`}
    >
      <label
        className="p-question-label"
        htmlFor={
          q.type === "repeatable" || q.type === "multiselect" ? undefined : id
        }
      >
        {q.label}
        {q.required && <span className="p-required-label">Obrigatório</span>}
      </label>
      {q.help && <p className="p-field-help">{q.help}</p>}
      {state === "answered" && (
        <>
          {q.type === "textarea" ? (
            <textarea
              id={id}
              {...common}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => set(e.target.value)}
              rows={3}
              maxLength={8000}
              placeholder="Conta-nos os detalhes…"
            />
          ) : q.type === "select" ? (
            <select
              id={id}
              {...common}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => set(e.target.value)}
            >
              <option value="">Seleciona uma opção</option>
              {q.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : q.type === "multiselect" ? (
            <fieldset className="p-choice-grid" {...common}>
              <legend className="p-sr-only">{q.label}</legend>
              {q.options?.map((o) => (
                <label
                  className={portalClass(
                    `choice ${Array.isArray(value) && value.includes(o.value as never) ? "selected" : ""}`,
                  )}
                  key={o.value}
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value) && value.includes(o.value as never)
                    }
                    onChange={(e) => {
                      const current = Array.isArray(value)
                        ? (value as string[])
                        : [];
                      set(
                        e.target.checked
                          ? [...current, o.value]
                          : current.filter((v) => v !== o.value),
                      );
                    }}
                  />
                  {o.label}
                </label>
              ))}
            </fieldset>
          ) : q.type === "repeatable" ? (
            <Repeatable
              q={q}
              rows={Array.isArray(value) ? (value as RepeatRow[]) : []}
              onChange={set}
            />
          ) : (
            <input
              id={id}
              {...common}
              type={q.type === "email" ? "email" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => set(e.target.value)}
              maxLength={8000}
              autoComplete={
                q.id === "contact.email"
                  ? "email"
                  : q.id === "company.name"
                    ? "organization"
                    : "off"
              }
            />
          )}
        </>
      )}
      {state !== "answered" && (
        <div className="p-answer-state">
          {state === "unknown" ? "Ainda não sei" : "Não se aplica"}
          <button type="button" className="p-text-link" onClick={() => set("")}>
            Escrever uma resposta
          </button>
        </div>
      )}
      {(q.allowUnknown || q.allowNotApplicable) && (
        <div className="p-answer-options">
          {q.allowUnknown && (
            <button
              type="button"
              aria-pressed={state === "unknown"}
              onClick={() => onChange({ state: "unknown", value: "" })}
            >
              Ainda não sei
            </button>
          )}
          {q.allowNotApplicable && (
            <button
              type="button"
              aria-pressed={state === "not_applicable"}
              onClick={() => onChange({ state: "not_applicable", value: "" })}
            >
              Não se aplica
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="p-field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
function Repeatable({
  q,
  rows,
  onChange,
}: {
  q: Question;
  rows: RepeatRow[];
  onChange: (rows: RepeatRow[]) => void;
}) {
  return (
    <div className="p-repeatable">
      {rows.map((row, index) => (
        <fieldset className="p-repeat-row" key={row.id}>
          <legend>
            {q.section} · {index + 1}
          </legend>
          <button
            type="button"
            className="p-remove-row"
            aria-label={`Remover linha ${index + 1} de ${q.label}`}
            onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
          >
            <Trash2 size={16} />
          </button>
          {q.fields?.map((f) => (
            <label key={f.id}>
              {f.label}
              <textarea
                rows={2}
                maxLength={8000}
                value={row.values[f.id] ?? ""}
                onChange={(e) =>
                  onChange(
                    rows.map((r) =>
                      r.id === row.id
                        ? {
                            ...r,
                            values: { ...r.values, [f.id]: e.target.value },
                          }
                        : r,
                    ),
                  )
                }
              />
            </label>
          ))}
        </fieldset>
      ))}
      <button
        className="p-button p-secondary p-small"
        type="button"
        disabled={rows.length >= 30}
        onClick={() =>
          onChange([...rows, { id: crypto.randomUUID(), values: {} }])
        }
      >
        <Plus size={16} /> Adicionar linha
      </button>
      <span className="p-field-help"> {rows.length}/30</span>
    </div>
  );
}
function Editor({
  initial,
  initialStep,
  adminMode = false,
  onExitAdmin,
}: {
  initial: Intake;
  initialStep: number;
  adminMode?: boolean;
  onExitAdmin?: () => void;
}) {
  const router = useRouter(),
    [answers, setAnswers] = useState(initial.answers),
    [step, setStep] = useState(initialStep),
    [saveStatus, setSaveStatus] = useState("Guardado"),
    [error, setError] = useState(""),
    [fields, setFields] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [conflict, setConflict] = useState(false);
  const live = useRef({
      answers: initial.answers,
      revision: initial.revision,
      sequence: 0,
      saved: 0,
      blocked: false,
    }),
    inflight = useRef<Promise<boolean> | null>(null),
    key = useRef<string | null>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const saveNow = useCallback((): Promise<boolean> => {
    if (inflight.current) return inflight.current;
    if (live.current.blocked) return Promise.resolve(false);
    if (live.current.sequence === live.current.saved)
      return Promise.resolve(true);
    const run = async () => {
      setSaveStatus("A guardar…");
      setError("");
      try {
        while (live.current.sequence !== live.current.saved) {
          const sent = live.current.sequence;
          const result = await api<{ intake: Intake }>(
            `/api/intakes/${initial.id}/draft`,
            {
              method: "PUT",
              body: JSON.stringify({
                revision: live.current.revision,
                answers: live.current.answers,
              }),
            },
          );
          live.current.revision = result.intake.revision;
          live.current.saved = sent;
        }
        setSaveStatus("Guardado");
        return true;
      } catch (e) {
        setSaveStatus("Não foi possível guardar");
        setError((e as Error).message);
        if (e instanceof ApiError) {
          setFields(e.fields);
          if (e.status === 409) {
            live.current.blocked = true;
            setConflict(true);
          }
        }
        return false;
      } finally {
        inflight.current = null;
      }
    };
    inflight.current = run();
    return inflight.current;
  }, [initial.id]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      void saveNow();
    }, 700);
    return () => clearTimeout(timeout);
  }, [answers, saveNow]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (live.current.sequence !== live.current.saved) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    const guard = (event: MouseEvent) => {
      const target = event.target as Element;
      const link = target.closest("a");
      const logout = target.closest("header button");
      if ((link || logout) && live.current.sequence !== live.current.saved) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setError(
          "Há alterações por guardar. Usa “Guardar e sair” antes de abandonar a ficha.",
        );
      }
    };
    document.addEventListener("click", guard, true);
    return () => document.removeEventListener("click", guard, true);
  }, []);
  function change(id: string, a: Answer) {
    const next = { ...live.current.answers, [id]: a };
    live.current.answers = next;
    live.current.sequence++;
    setAnswers(next);
    setSaveStatus("Alterações por guardar");
    setFields((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }
  async function go(next: number) {
    setBusy(true);
    if (await saveNow()) {
      setStep(next);
      if (!adminMode) {
        window.history.replaceState(
          null,
          "",
          next === 8
            ? `/cliente/${initial.id}/rever`
            : `/cliente/${initial.id}/preencher/${next}`,
        );
      }
      setTimeout(() => heading.current?.focus(), 0);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    setBusy(false);
  }
  async function exit() {
    setBusy(true);
    if (await saveNow()) {
      if (adminMode && onExitAdmin) {
        onExitAdmin();
      } else {
        router.push("/cliente");
      }
    } else setBusy(false);
  }
  async function submit() {
    const validation = validateAnswers(live.current.answers, true);
    setFields(validation.errors);
    if (Object.keys(validation.errors).length) {
      setError(
        "Há campos obrigatórios ou respostas inválidas. Reveja os campos indicados abaixo.",
      );
      return;
    }
    setBusy(true);
    if (!(await saveNow())) {
      setBusy(false);
      return;
    }
    try {
      key.current ??= crypto.randomUUID();
      await api(`/api/intakes/${initial.id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          revision: live.current.revision,
          idempotencyKey: key.current,
        }),
      });
      if (adminMode && onExitAdmin) {
        onExitAdmin();
      } else {
        router.push(`/cliente/${initial.id}/confirmacao`);
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
      if (e instanceof ApiError) setFields(e.fields);
      setBusy(false);
    }
  }
  function backup() {
    const blob = new Blob([JSON.stringify(live.current.answers, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rascunho-local.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  const p = progress(answers),
    active = activeQuestions(answers),
    current = active.filter((q) => q.step === step),
    groups = [...new Set(current.map((q) => q.section))],
    unknown = active.filter((q) => answers[q.id]?.state === "unknown").length;
  return (
    <div className="p-editor-layout">
      <aside className="p-step-sidebar">
        <Link
          href={adminMode ? "/equipa" : "/cliente"}
          className="p-back-link"
          onClick={(e) => {
            e.preventDefault();
            void exit();
          }}
        >
          <ArrowLeft size={16} />{" "}
          {adminMode ? "Concluir edição Admin (user1)" : "O meu espaço"}
        </Link>
        <div className="p-sidebar-company">
          <span className="p-company-icon p-small">
            <Building2 size={20} />
          </span>
          <strong>
            {textValue(answers, "company.name") || "A sua empresa"}
          </strong>
        </div>
        <nav aria-label="Etapas do questionário">
          <ol>
            {steps.map((name, index) => {
              const items = active.filter((q) => q.step === index + 1),
                complete =
                  items.length > 0 &&
                  items.every((q) => answered(answers[q.id]));
              return (
                <li key={name}>
                  <button
                    disabled={busy}
                    aria-current={step === index + 1 ? "step" : undefined}
                    onClick={() => go(index + 1)}
                  >
                    <span
                      className={portalClass(
                        `step-index ${complete ? "complete" : ""}`,
                      )}
                    >
                      {complete ? <Check size={15} /> : index + 1}
                    </span>
                    <span>{name}</span>
                    {step === index + 1 && <ChevronRight size={16} />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="p-sidebar-progress">
          <div>
            <strong>{Math.round((p.done / p.total) * 100)}%</strong>
            <span>do questionário respondido</span>
          </div>
          <progress
            value={p.done}
            max={p.total}
            aria-label="Progresso do questionário"
          />
          <small>
            {p.done} de {p.total} perguntas aplicáveis
          </small>
        </div>
      </aside>
      <div className="p-editor-main">
        <div className="p-editor-toolbar">
          <span>Etapa {step} de 8</span>
          <span
            className={portalClass(
              `save-status ${saveStatus === "Guardado" ? "saved" : ""}`,
            )}
            role="status"
          >
            {saveStatus === "Guardado" ? (
              <CheckCircle2 size={15} />
            ) : (
              <Save size={15} />
            )}{" "}
            {saveStatus}
          </span>
        </div>
        <div className="p-mobile-progress">
          <progress value={step} max={8} aria-label="Etapa atual" />
        </div>
        <div className="p-form-heading">
          <h1 ref={heading} tabIndex={-1}>
            {
              [
                "Primeiro, a sua empresa.",
                "O que vamos melhorar?",
                "Como funciona o dia a dia?",
                "Uma boa conversa começa aqui.",
                "As ferramentas e as regras.",
                "Os detalhes fazem a diferença.",
                "O que completa a sua história.",
                "Tudo pronto para o próximo passo?",
              ][step - 1]
            }
          </h1>
          <p>
            {
              [
                "Conta-nos quem está deste lado e onde o negócio acontece.",
                "Escolha as prioridades. O formulário adapta-se ao que precisas.",
                "Os serviços, horários e processos que a automação precisa de conhecer.",
                "Define a informação, o tom e o momento de chamar a equipa.",
                "Ajuda-nos a perceber onde estão os dados e quem pode fazer o quê.",
                "Perguntas próprias do seu setor e dos objetivos que escolheu.",
                "Reúne exemplos e identifica os materiais que ajudam a conhecer o negócio.",
                "Confere as respostas e indica o que ainda está por definir.",
              ][step - 1]
            }
          </p>
        </div>
        {error && (
          <div
            className="p-error-summary"
            role="alert"
            aria-label="Problemas no questionário"
          >
            <strong>{error}</strong>
            {Object.keys(fields).length > 0 && (
              <ul>
                {Object.entries(fields).map(([id, message]) => (
                  <li key={id}>
                    <button
                      className="p-text-link"
                      onClick={() => {
                        const q = questions.find((q) => q.id === id);
                        if (q) {
                          setStep(q.step);
                          setTimeout(() => {
                            const item = document.getElementById(
                              `question-${id}`,
                            );
                            const group = item?.closest("details");
                            if (group) group.open = true;
                            const input = item?.querySelector<HTMLElement>(
                              "input,textarea,select,button",
                            );
                            input?.focus();
                          }, 0);
                        }
                      }}
                    >
                      {questions.find((q) => q.id === id)?.label ?? id}:{" "}
                      {message}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {conflict ? (
              <div className="p-button-row">
                <button
                  className="p-button p-secondary p-small"
                  onClick={backup}
                >
                  Descarregar alterações locais
                </button>
                <button
                  className="p-button p-secondary p-small"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Carregar a versão guardada substitui o texto ainda não guardado neste ecrã. Continuar?",
                      )
                    )
                      window.location.reload();
                  }}
                >
                  Carregar versão guardada
                </button>
              </div>
            ) : (
              <button className="p-text-link" onClick={() => saveNow()}>
                Tentar guardar novamente
              </button>
            )}
          </div>
        )}
        {step === 7 && (
          <div className="p-notice">
            O upload privado de documentos chega na próxima fase. Por agora,
            escreve os exemplos anonimizados e a lista de materiais a preparar.
          </div>
        )}
        {step === 6 && (
          <div className="p-notice p-soft">
            Ao mudar de setor ou objetivos, as respostas anteriores ficam no
            rascunho. Apenas as perguntas atualmente aplicáveis entram na
            submissão.
          </div>
        )}
        {step < 8 ? (
          <div className="p-question-groups">
            {groups.map((group, index) => (
              <details
                className="p-question-group"
                open={index === 0 || groups.length === 1}
                key={`${step}-${group}`}
              >
                <summary>
                  <span>{group}</span>
                  <small>
                    {
                      current.filter(
                        (q) => q.section === group && answered(answers[q.id]),
                      ).length
                    }
                    /{current.filter((q) => q.section === group).length}
                  </small>
                </summary>
                <div className="p-group-content">
                  {current
                    .filter((q) => q.section === group)
                    .map((q) => (
                      <QuestionField
                        key={q.id}
                        question={q}
                        answer={answers[q.id]}
                        error={fields[q.id]}
                        onChange={(a) => change(q.id, a)}
                      />
                    ))}
                </div>
              </details>
            ))}
            {current.length === 0 && (
              <div className="p-notice">
                Seleciona primeiro o setor e os objetivos na etapa 2 para veres
                as perguntas específicas.
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-review-overview">
              <span>
                <strong>{p.done}</strong> respostas registadas
              </span>
              <span>
                <strong>{unknown}</strong> por definir
              </span>
              <span>
                <strong>{p.total - p.done}</strong> sem resposta
              </span>
            </div>
            <AnswerReview
              answers={answers}
              onEdit={(n) => {
                void go(n);
              }}
            />
            <p className="p-field-help p-review-note">
              Ao enviar, as respostas ficam guardadas na ficha técnica da sua
              empresa para a equipa Draft &amp; Rise configurar e treinar o seu
              Agente de WhatsApp Business. Consulta a{" "}
              <Link href="/privacidade">Política de Privacidade</Link>.
            </p>
          </>
        )}
        <div className="p-form-actions">
          <button
            className="p-button p-secondary"
            disabled={step === 1 || busy}
            onClick={() => go(step - 1)}
          >
            <ArrowLeft size={17} /> Voltar
          </button>
          <button className="p-save-exit" disabled={busy} onClick={exit}>
            Guardar e sair
          </button>
          {step < 8 ? (
            <button
              className="p-button p-primary"
              disabled={busy || conflict}
              onClick={() => go(step + 1)}
            >
              Continuar <ArrowRight size={17} />
            </button>
          ) : (
            <button
              className="p-button p-primary"
              disabled={busy || conflict}
              onClick={submit}
            >
              {busy ? "A enviar…" : "Enviar informações"}{" "}
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
      <aside className="p-form-guidance">
        <span className="p-guidance-symbol">✳</span>
        <h2>Não tem de estar tudo decidido.</h2>
        <p>
          Usa “Ainda não sei” quando precisares de pensar melhor. Identificamos
          juntos o que falta.
        </p>
        <hr />
        <p className="p-small-text">
          Evita palavras-passe, chaves de acesso e dados pessoais de clientes.
        </p>
        <Link className="p-text-link" href="/ajuda">
          Ajuda com o questionário
        </Link>
      </aside>
    </div>
  );
}
export function Notifications() {
  const { data, error } = useRemote<{
    notifications: {
      id: string;
      subject: string;
      recipient: string;
      created_at: string;
      status: string;
    }[];
  }>("/api/notifications");
  return (
    <>
      <WorkspaceHeader team={true} />
      <main id="conteudo" className="p-workspace-page">
        <Link href="/equipa" className="p-text-link">
          <ArrowLeft size={16} /> Voltar à equipa
        </Link>
        <h1>Notificações.</h1>
        <div className="p-notice">
          Registo de fichas submetidas pelos clientes e notificações associadas
          a <strong>geral@draftandrise.com</strong>.
        </div>
        {error ? (
          <Problem message={error} team={true} />
        ) : !data ? (
          <p role="status">A carregar…</p>
        ) : data.notifications.length === 0 ? (
          <div className="p-empty-state">
            <Mail />
            <h2>Ainda não há notificações.</h2>
            <p>
              As notificações ficam registadas depois de uma ficha ser submetida.
            </p>
          </div>
        ) : (
          <div className="p-notification-list">
            {data.notifications.map((n) => (
              <article key={n.id}>
                <Mail size={20} />
                <div>
                  <h2>{n.subject}</h2>
                  <p>
                    {n.recipient} ·{" "}
                    {new Date(n.created_at).toLocaleString("pt-PT")}
                  </p>
                </div>
                <span className="p-pill">
                  {n.status === "captured_locally"
                    ? "Capturada localmente"
                    : n.status === "active_code"
                      ? "Código ativo no painel"
                      : n.status === "sent"
                        ? "Registada no sistema"
                        : "Aguarda configuração"}
                </span>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
