import { type NextRequest } from "next/server";
import { authenticate, fail, json } from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params,
      store = await getStore();
    return json({
      identity: who,
      intake: await store.get(id, who),
      submission: await store.submission(id, who),
    });
  } catch (e) {
    return fail(e);
  }
}
