import { type NextRequest } from "next/server";
import { z } from "zod";
import { sameOrigin, readBody, fail, json } from "@/lib/portal/http";
import { userClient } from "@/lib/portal/supabase";
import { PortalError } from "@/lib/portal/types";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    if (process.env.PORTAL_AUTH_EMAILS_ENABLED !== "1")
      throw new PortalError(
        503,
        "O acesso por email ainda está em preparação.",
      );
    const parsed = z
      .object({ email: z.string().trim().email().max(254) })
      .strict()
      .safeParse(await readBody(req));
    if (!parsed.success)
      throw new PortalError(400, "Indique um endereço de email válido.");
    const { error } = await (
      await userClient()
    ).auth.signInWithOtp({
      email: parsed.data.email,
      options: { shouldCreateUser: true },
    });
    if (error?.status === 429)
      throw new PortalError(
        429,
        "Aguarde alguns minutos antes de pedir outro código.",
      );
    if (error)
      throw new PortalError(
        503,
        "Não foi possível pedir o código. Tente novamente mais tarde.",
      );
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
