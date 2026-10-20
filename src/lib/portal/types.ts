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
export type Identity = {
  id: string;
  name: string;
  role: "client" | "team";
  isAdmin?: boolean;
};
export const identities: Identity[] = [
  { id: "client-a", name: "Inês · Restaurante Maré", role: "client" },
  { id: "client-b", name: "Miguel · Estúdio Forma", role: "client" },
  { id: "team", name: "Equipa de projeto", role: "team", isAdmin: false },
];
export type TeamAccount = {
  username: string;
  name: string;
  password: string;
  isAdmin: boolean;
};
export const TEAM_USERS: TeamAccount[] = [
  {
    username: "user1",
    name: "Admin Total · user1",
    password:
      process.env.PORTAL_TEAM_USER1_PASS ||
      process.env.PORTAL_USER1_PASSWORD ||
      "DR-User1-8492",
    isAdmin: true,
  },
  {
    username: "user2",
    name: "Admin Total · user2",
    password:
      process.env.PORTAL_TEAM_USER2_PASS ||
      process.env.PORTAL_USER2_PASSWORD ||
      "DR-User2-3917",
    isAdmin: true,
  },
  {
    username: "user3",
    name: "Admin Total · user3",
    password:
      process.env.PORTAL_TEAM_USER3_PASS ||
      process.env.PORTAL_USER3_PASSWORD ||
      "DR-User3-6520",
    isAdmin: true,
  },
  {
    username: "user4",
    name: "Equipa · user4 (Básico)",
    password:
      process.env.PORTAL_TEAM_USER4_PASS ||
      process.env.PORTAL_USER4_PASSWORD ||
      "DR-User4-9148",
    isAdmin: false,
  },
  {
    username: "user5",
    name: "Equipa · user5 (Básico)",
    password:
      process.env.PORTAL_TEAM_USER5_PASS ||
      process.env.PORTAL_USER5_PASSWORD ||
      "DR-User5-2763",
    isAdmin: false,
  },
  {
    username: "user6",
    name: "Equipa · user6 (Básico)",
    password:
      process.env.PORTAL_TEAM_USER6_PASS ||
      process.env.PORTAL_USER6_PASSWORD ||
      "DR-User6-5084",
    isAdmin: false,
  },
];
export const BASIC_TEAM_FIELDS = [
  "company.name",
  "contact.name",
  "contact.role",
  "contact.email",
  "contact.phone",
  "company.location",
] as const;
export type ClientAccessRequest = {
  email: string;
  clientName: string;
  companyName: string;
  code: string;
  intakeId: string;
  createdAt: string;
  expiresAt: number;
};
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

