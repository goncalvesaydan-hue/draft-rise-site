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
import type { Intake, Submission, Identity } from "@/lib/portal/store";
function WorkspaceHeader() {
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
          <Link href="/cliente">O meu espaço</Link>
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
function Problem({ message }: { message: string }) {
  return (
    <div className="p-empty-state">
      <AlertCircle />
      <h2>Precisamos de retomar o acesso.</h2>
      <p role="alert">{message}</p>
      <Link href="/acesso" className="p-button p-primary">
        Entrar no meu espaço
      </Link>
    </div>
  );
}
function useRemote<T>(url: string) {
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
  }, [url]);
  return { data, error };
}
export function IntakeList({ team = false }: { team?: boolean }) {
  const { data, error } = useRemote<{ identity: Identity; intakes: Intake[] }>(
    "/api/intakes",
  );
  const [search, setSearch] = useState("");
  const authorized = data && (!team || data.identity.role === "team");
  return (
    <>
      <WorkspaceHeader />
      <main id="conteudo" className="p-workspace-page">
        {error ? (
          <Problem message={error} />
        ) : !data ? (
          <p role="status">A abrir o seu espaço…</p>
        ) : !authorized ? (
          <Problem message="Esta área é reservada à equipa." />
        ) : (
          <>
            <div className="p-page-top">
              <div>
                <span className="p-eyeline">
                  {team ? "Área da equipa" : "O seu espaço"}
                </span>
                <h1>
                  {team
                    ? "Cada negócio, uma nova possibilidade."
                    : "Vamos dar o próximo passo."}
                </h1>
                <p className="p-lead p-small">
                  {team
                    ? "Acompanha as fichas e consulta a informação recebida."
                    : "As suas respostas ficam organizadas aqui, mesmo quando faz uma pausa."}
                </p>
              </div>
              <span className="p-pill p-pale">Área privada</span>
            </div>
            {team && (
              <div className="p-team-overview">
                <div>
                  <strong>{data.intakes.length}</strong>
                  <span>Fichas</span>
                </div>
                <div>
                  <strong>
                    {
                      data.intakes.filter((i) => i.status === "submitted")
                        .length
                    }
                  </strong>
                  <span>Submetidas</span>
                </div>
                <div>
                  <strong>
                    {data.intakes.filter((i) => i.status === "draft").length}
                  </strong>
                  <span>Em preenchimento</span>
                </div>
                <Link href="/equipa/notificacoes" className="p-text-link">
                  Notificações <Mail size={18} />
                </Link>
              </div>
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
                  ? "O painel apresenta as fichas guardadas. Complementos, atribuição e notas serão acrescentados nas próximas fases."
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
export function IntakeWorkspace({
  id,
  initialStep = 1,
  team = false,
}: {
  id: string;
  initialStep?: number;
  team?: boolean;
}) {
  const { data, error } = useRemote<IntakeResponse>(
    `/api/intakes/${encodeURIComponent(id)}`,
  );
  return (
    <>
      <WorkspaceHeader />
      <main id="conteudo">
        {error ? (
          <Problem message={error} />
        ) : !data ? (
          <div className="p-workspace-page" role="status">
            A recuperar as respostas guardadas…
          </div>
        ) : team && data.identity.role !== "team" ? (
          <Problem message="Área reservada à equipa." />
        ) : data.submission ? (
          <Submitted submission={data.submission} team={team} />
        ) : team ? (
          <DraftPreview intake={data.intake} />
        ) : data.identity.role === "team" ? (
          <Problem message="Usa o perfil do cliente para preencher esta ficha." />
        ) : (
          <Editor initial={data.intake} initialStep={initialStep} />
        )}
      </main>
      <Footer />
    </>
  );
}
function DraftPreview({ intake }: { intake: Intake }) {
  return (
    <div className="p-workspace-page">
      <Link className="p-text-link" href="/equipa">
        <ArrowLeft size={16} /> Voltar às fichas
      </Link>
      <h1>{textValue(intake.answers, "company.name")}</h1>
      <div className="p-notice">
        Esta ficha ainda está em preenchimento. A equipa pode consultar o
        progresso, mas não alterar as respostas do cliente.
      </div>
      <AnswerReview answers={intake.answers} />
    </div>
  );
}
function Submitted({
  submission: s,
  team,
}: {
  submission: Submission;
  team: boolean;
}) {
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
        </div>
        <div className="p-notice p-soft">
          A ficha já está disponível para consulta. As notificações por email
          ainda não estão ativas. O prazo de acompanhamento será definido pela
          equipa.
        </div>
      </div>
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
}: {
  initial: Intake;
  initialStep: number;
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
      window.history.replaceState(
        null,
        "",
        next === 8
          ? `/cliente/${initial.id}/rever`
          : `/cliente/${initial.id}/preencher/${next}`,
      );
      setTimeout(() => heading.current?.focus(), 0);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    setBusy(false);
  }
  async function exit() {
    setBusy(true);
    if (await saveNow()) router.push("/cliente");
    else setBusy(false);
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
      router.push(`/cliente/${initial.id}/confirmacao`);
      router.refresh();
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
          href="/cliente"
          className="p-back-link"
          onClick={(e) => {
            e.preventDefault();
            void exit();
          }}
        >
          <ArrowLeft size={16} /> O meu espaço
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
              Ao enviar, as respostas aplicáveis ficam preservadas numa ficha.
              Consulta a{" "}
              <Link href="/privacidade">informação de privacidade</Link>. Nesta
              versão, usa apenas dados fictícios.
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
      <WorkspaceHeader />
      <main id="conteudo" className="p-workspace-page">
        <Link href="/equipa" className="p-text-link">
          <ArrowLeft size={16} /> Voltar à equipa
        </Link>
        <h1>Notificações.</h1>
        <div className="p-notice">
          Registos de notificações. O envio por email ainda não está ativo.
        </div>
        {error ? (
          <Problem message={error} />
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
