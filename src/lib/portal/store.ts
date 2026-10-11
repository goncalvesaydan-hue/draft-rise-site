import { localMode } from "./config";
export {
  PortalError,
  identities,
  type Identity,
  type Intake,
  type Submission,
} from "./types";
export async function getStore() {
  if (localMode()) return (await import("./local-store")).getStore();
  const { userClient } = await import("./supabase");
  const { RemoteStore } = await import("./remote-store");
  return new RemoteStore(await userClient());
}
