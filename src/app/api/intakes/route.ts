import { type NextRequest } from "next/server";
import { authenticate, fail, json } from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const who = await authenticate(req);
    const store = await getStore();
    const intakes = await store.list(who);
    const accessCodes =
      who.role === "team" ? await store.listAccessCodes(who) : undefined;
    return json({ identity: who, intakes, accessCodes });
  } catch (e) {
    return fail(e);
  }
}

