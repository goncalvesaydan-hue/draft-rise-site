import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  authenticate,
  sameOrigin,
  readBody,
  fail,
  json,
  SESSION_COOKIE,
} from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
import { PortalError } from "@/lib/portal/types";
import { sendAccessCodeNotification } from "@/lib/portal/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120).optional(),
        company: z.string().trim().min(1).max(160).optional(),
        email: z.string().trim().email().max(254),
      })
      .strict()
      .safeParse(await readBody(req));

    if (!parsed.success) {
      throw new PortalError(
        400,
        "Indique o nome, o nome da empresa e um endereço de email válido.",
      );
    }

    const store = await getStore();
    const access = await store.requestClientAccess(
      parsed.data.name || "Cliente",
      parsed.data.company || "Empresa",
      parsed.data.email,
    );

    // Enviar notificação por e-mail para geral@draftandrise.com
    await sendAccessCodeNotification({
      email: access.email,
      clientName: access.clientName,
      companyName: access.companyName,
      code: access.code,
      intakeId: access.intakeId,
    });

    const caller = await store.identity(req.cookies.get(SESSION_COOKIE)?.value);
    if (caller?.role === "team") {
      return json({ ok: true, access });
    }
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const who = await authenticate(req);
    const parsed = z
      .object({ email: z.string().trim().email().max(254) })
      .strict()
      .safeParse(await readBody(req));
    if (!parsed.success) {
      throw new PortalError(400, "E-mail inválido.");
    }
    const store = await getStore();
    await store.deleteAccessCode(parsed.data.email, who);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
