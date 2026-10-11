import { type NextRequest } from "next/server";
import { authenticate, fail, json } from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const who = await authenticate(req);
    return json({ notifications: await (await getStore()).notifications(who) });
  } catch (e) {
    return fail(e);
  }
}
