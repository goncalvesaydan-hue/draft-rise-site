import { type NextRequest } from "next/server";
import { z } from "zod";
import { authenticate, readBody, fail, json } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
import { sendSubmissionNotification } from "@/lib/portal/email";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req);
    const { id } = await ctx.params;
    const p = z
      .object({
        revision: z.number().int().nonnegative(),
        idempotencyKey: z.string().uuid(),
      })
      .strict()
      .safeParse(await readBody(req));

    if (!p.success) {
      throw new PortalError(400, "Pedido de submissão inválido.");
    }

    const store = await getStore();
    const submission = await store.submit(
      id,
      who,
      p.data.revision,
      p.data.idempotencyKey,
    );
    const intake = await store.get(id, who);

    // Enviar notificação de questionário concluído para geral@draftandrise.com
    await sendSubmissionNotification({
      intakeId: id,
      reference: submission.reference,
      clientName: String(intake.answers["contact.name"]?.value || ""),
      companyName: String(intake.answers["company.name"]?.value || ""),
      clientEmail: String(intake.answers["contact.email"]?.value || who.name),
      answers: intake.answers,
    });

    return json({ submission });
  } catch (e) {
    return fail(e);
  }
}
