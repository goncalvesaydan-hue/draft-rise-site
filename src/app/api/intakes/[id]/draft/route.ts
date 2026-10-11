import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticate, readBody, fail, json } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
export const runtime = "nodejs";
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params;
    const data = z
      .object({
        revision: z.number().int().nonnegative(),
        answers: z.unknown(),
      })
      .strict()
      .safeParse(await readBody(req));
    if (!data.success)
      throw new PortalError(400, "Pedido de gravação inválido.");
    return json({
      intake: await (
        await getStore()
      ).save(id, who, data.data.revision, data.data.answers),
    });
  } catch (e) {
    return fail(e);
  }
}
