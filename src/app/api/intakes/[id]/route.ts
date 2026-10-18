import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticate, readBody, fail, json } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
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

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("basic"),
    fields: z.record(z.string(), z.string()),
  }),
  z.object({
    action: z.literal("reopen"),
  }),
]);

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params,
      store = await getStore(),
      parsed = patchSchema.safeParse(await readBody(req));
    if (!parsed.success)
      throw new PortalError(400, "Pedido de atualização inválido.");
    if (parsed.data.action === "reopen") {
      return json({
        intake: await store.reopenIntake(id, who),
      });
    }
    return json({
      intake: await store.saveBasic(id, who, parsed.data.fields),
    });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params,
      store = await getStore();
    await store.deleteIntake(id, who);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

