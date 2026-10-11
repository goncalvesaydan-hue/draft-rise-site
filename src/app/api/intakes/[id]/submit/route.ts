import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticate, readBody, fail, json } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params;
    const p = z
      .object({
        revision: z.number().int().nonnegative(),
        idempotencyKey: z.string().uuid(),
      })
      .strict()
      .safeParse(await readBody(req));
    if (!p.success) throw new PortalError(400, "Pedido de submissão inválido.");
    return json({
      submission: await (
        await getStore()
      ).submit(id, who, p.data.revision, p.data.idempotencyKey),
    });
  } catch (e) {
    return fail(e);
  }
}
