import { type NextRequest } from "next/server";
import { authenticate, fail, json } from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const who = await authenticate(req);
    return json({ identity: who, intakes: await (await getStore()).list(who) });
  } catch (e) {
    return fail(e);
  }
}
