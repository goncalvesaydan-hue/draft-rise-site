import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  sameOrigin,
  readBody,
  fail,
  json,
  authenticate,
} from "@/lib/portal/http";
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
      .object({
        email: z.string().trim().email().max(254),
        token: z.string().regex(/^\d{6,10}$/),
      })
      .strict()
      .safeParse(await readBody(req));
    if (!parsed.success)
      throw new PortalError(400, "Indique o email e o código recebido.");
    const { error } = await (
      await userClient()
    ).auth.verifyOtp({ ...parsed.data, type: "email" });
    if (error)
      throw new PortalError(
        400,
        "Código inválido ou expirado. Verifique o código ou peça um novo.",
      );
    const identity = await authenticate(req);
    return json({
      destination: identity.role === "team" ? "/equipa" : "/cliente",
    });
  } catch (e) {
    return fail(e);
  }
}
