import type { Answers, Snapshot } from "./questionnaire";
export class PortalError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export type Identity = { id: string; name: string; role: "client" | "team" };
export const identities: Identity[] = [
  { id: "client-a", name: "Inês · Restaurante Maré", role: "client" },
  { id: "client-b", name: "Miguel · Estúdio Forma", role: "client" },
  { id: "team", name: "Equipa de projeto", role: "team" },
];
export type Intake = {
  id: string;
  owner: string;
  version: string;
  revision: number;
  status: "draft" | "submitted";
  answers: Answers;
  updatedAt: string;
};
export type Submission = {
  id: string;
  intakeId: string;
  reference: string;
  snapshot: Snapshot;
  createdAt: string;
};
