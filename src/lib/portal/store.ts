import { localMode } from "./config";
import type {
  Identity,
  Intake,
  Submission,
  ClientAccessRequest,
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

export interface PortalStore {
  get(id: string, who: Identity): Promise<Intake> | Intake;
  list(who: Identity): Promise<Intake[]> | Intake[];
  save(id: string, who: Identity, revision: number, input: unknown): Promise<Intake> | Intake;
  saveBasic(id: string, who: Identity, basicFields: Record<string, string>): Promise<Intake> | Intake;
  reopenIntake(id: string, who: Identity): Promise<Intake> | Intake;
  deleteIntake(id: string, who: Identity): Promise<void> | void;
  submission(id: string, who: Identity): Promise<Submission | null> | Submission | null;
  submit(id: string, who: Identity, revision: number, key: string): Promise<Submission> | Submission;
  listAccessCodes(who: Identity): Promise<ClientAccessRequest[]> | ClientAccessRequest[];
  deleteAccessCode(email: string, who: Identity): Promise<void> | void;
  requestClientAccess(name: string, company: string, email: string): Promise<ClientAccessRequest> | ClientAccessRequest;
  verifyClientAccess(email: string, token: string): Promise<{ token: string; intakeId: string; status: "draft" | "submitted" }> | { token: string; intakeId: string; status: "draft" | "submitted" };
  loginTeam(username: string, password: string): Promise<{ token: string; identity: Identity }> | { token: string; identity: Identity };
  identity(token: string | undefined): Promise<Identity | null> | Identity | null;
  logout(token: string): Promise<void> | void;
  notifications(who: Identity): Promise<any[]> | any[];
}

export async function getStore(): Promise<PortalStore> {
  const { remoteReady } = await import("./config");
  if (remoteReady()) {
    const { RemoteStore } = await import("./remote-store");
    return new RemoteStore();
  }
  process.env.PORTAL_LOCAL_MODE = "1";
  return (await import("./local-store")).getStore();
}
