import catalog from "@/questionnaires/v1.json";
import { z } from "zod";
export const QUESTIONNAIRE_VERSION = "1.0.0";
export type Question = {
  id: string;
  label: string;
  step: number;
  section: string;
  source: string;
  type: "text" | "email" | "textarea" | "select" | "multiselect" | "repeatable";
  required: boolean;
  allowUnknown: boolean;
  allowNotApplicable: boolean;
  sector?: string;
  objectives?: string[];
  options?: { value: string; label: string }[];
  fields?: { id: string; label: string }[];
  help?: string;
};
export const questions = catalog as Question[];
export const steps = [
  "Empresa",
  "Objetivos",
  "Operação",
  "Dados e atendimento",
  "Sistemas e controlo",
  "O seu setor",
  "Documentos",
  "Revisão",
];
export type RepeatRow = { id: string; values: Record<string, string> };
export type Answer = {
  state: "answered" | "unknown" | "not_applicable";
  value: string | string[] | RepeatRow[];
};
export type Answers = Record<string, Answer>;
export type Snapshot = {
  version: string;
  questions: Question[];
  answers: Answers;
};
const answerSchema = z
  .object({
    state: z.enum(["answered", "unknown", "not_applicable"]),
    value: z.union([
      z.string().max(8000),
      z.array(z.string().max(100)).max(20),
      z
        .array(
          z
            .object({
              id: z.string().uuid(),
              values: z.record(z.string().max(80), z.string().max(8000)),
            })
            .strict(),
        )
        .max(30),
    ]),
  })
  .strict();
const answersSchema = z.record(z.string().max(100), answerSchema);
export function textValue(answers: Answers, id: string) {
  const a = answers[id];
  return a?.state === "answered" && typeof a.value === "string" ? a.value : "";
}
export function selectedObjectives(answers: Answers): string[] {
  const a = answers["project.objectives"];
  return a?.state === "answered" && Array.isArray(a.value)
    ? a.value.filter((x): x is string => typeof x === "string")
    : [];
}
export function applicable(q: Question, answers: Answers) {
  return (
    (!q.sector || q.sector === textValue(answers, "company.sector")) &&
    (!q.objectives ||
      q.objectives.some((o) => selectedObjectives(answers).includes(o)))
  );
}
export function answered(a?: Answer): boolean {
  if (!a) return false;
  if (a.state !== "answered") return true;
  if (typeof a.value === "string") return Boolean(a.value.trim());
  return a.value.some((v) =>
    typeof v === "string"
      ? Boolean(v)
      : Object.values(v.values).some((x) => x.trim()),
  );
}
export function activeQuestions(answers: Answers) {
  return questions.filter((q) => applicable(q, answers));
}
export function progress(answers: Answers) {
  const active = activeQuestions(answers);
  return {
    done: active.filter((q) => answered(answers[q.id])).length,
    total: active.length,
  };
}
export function validateAnswers(
  input: unknown,
  submit = false,
): { answers: Answers; errors: Record<string, string> } {
  const parsed = answersSchema.safeParse(input);
  if (!parsed.success)
    return {
      answers: {},
      errors: {
        _form:
          "Formato de respostas inválido ou limite de conteúdo ultrapassado.",
      },
    };
  const answers = parsed.data as Answers;
  const errors: Record<string, string> = {};
  for (const [id, a] of Object.entries(answers)) {
    const q = questions.find((q) => q.id === id);
    if (!q) {
      errors[id] = "Pergunta desconhecida.";
      continue;
    }
    if (a.state !== "answered") {
      if (
        (a.state === "unknown" && !q.allowUnknown) ||
        (a.state === "not_applicable" && !q.allowNotApplicable)
      )
        errors[id] = "Esta pergunta precisa de uma resposta.";
      if (a.value !== "")
        errors[id] =
          "Uma resposta por definir não pode conter um valor oculto.";
      continue;
    }
    if (q.type === "repeatable") {
      if (
        !Array.isArray(a.value) ||
        a.value.some((x) => typeof x === "string")
      ) {
        errors[id] = "Indica os detalhes em linhas.";
        continue;
      }
      const rows = a.value as RepeatRow[];
      if (new Set(rows.map((r) => r.id)).size !== rows.length)
        errors[id] = "Existem linhas repetidas.";
      if (
        rows.some((r) =>
          Object.keys(r.values).some((k) => !q.fields?.some((f) => f.id === k)),
        )
      )
        errors[id] = "Campo de detalhe desconhecido.";
    } else if (q.type === "multiselect") {
      if (
        !Array.isArray(a.value) ||
        a.value.some(
          (x) =>
            typeof x !== "string" || !q.options?.some((o) => o.value === x),
        ) ||
        new Set<string | RepeatRow>(a.value).size !== a.value.length
      )
        errors[id] = "Escolha opções válidas.";
    } else {
      if (typeof a.value !== "string") {
        errors[id] = "Indica uma resposta em texto.";
        continue;
      }
      if (
        q.type === "select" &&
        a.value &&
        !q.options?.some((o) => o.value === a.value)
      )
        errors[id] = "Escolha uma opção válida.";
      if (
        submit &&
        applicable(q, answers) &&
        q.type === "email" &&
        a.value &&
        !z.email().safeParse(a.value).success
      )
        errors[id] = "Indica um email válido.";
    }
  }
  if (submit)
    for (const q of activeQuestions(answers))
      if (q.required && !answered(answers[q.id]))
        errors[q.id] = "Preencha este campo antes de enviar.";
  return { answers, errors };
}
export function makeSnapshot(answers: Answers): Snapshot {
  const active = activeQuestions(answers);
  return {
    version: QUESTIONNAIRE_VERSION,
    questions: active,
    answers: Object.fromEntries(
      active.filter((q) => answers[q.id]).map((q) => [q.id, answers[q.id]]),
    ),
  };
}
export function displayAnswer(q: Question, a?: Answer): string {
  if (!a || !answered(a)) return "Sem resposta";
  if (a.state === "unknown") return "Ainda não sei";
  if (a.state === "not_applicable") return "Não se aplica";
  if (typeof a.value === "string")
    return q.options?.find((o) => o.value === a.value)?.label ?? a.value;
  return a.value
    .map((v, i) =>
      typeof v === "string"
        ? (q.options?.find((o) => o.value === v)?.label ?? v)
        : `${i + 1}. ${(q.fields ?? []).map((f) => `${f.label}: ${v.values[f.id] || "—"}`).join("\n")}`,
    )
    .join("\n\n");
}
export function exportMarkdown(snapshot: Snapshot, reference: string) {
  return (
    `# Ficha ${reference}\n\nQuestionário ${snapshot.version}\n\n` +
    snapshot.questions
      .map(
        (q) => `## ${q.label}\n\n${displayAnswer(q, snapshot.answers[q.id])}\n`,
      )
      .join("\n")
  );
}
