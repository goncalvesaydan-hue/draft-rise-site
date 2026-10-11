import { localMode } from "@/lib/portal/config";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { getStore, PortalError } from "@/lib/portal/local-store";
import {
  authenticate,
  sameOrigin,
  localOnly,
  readBody,
  fail,
  json,
  SESSION_COOKIE,
} from "@/lib/portal/http";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    if (!localMode()) return json({ identity: await authenticate(req) });
    localOnly(req);
    return json({
      identity: getStore().identity(req.cookies.get(SESSION_COOKIE)?.value),
    });
  } catch (e) {
    return fail(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    localOnly(req);
    const p = z
      .object({ identity: z.enum(["client-a", "client-b", "team"]) })
      .strict()
      .safeParse(await readBody(req));
    if (!p.success) throw new PortalError(400, "Identidade de teste inválida.");
    const store = getStore(),
      old = req.cookies.get(SESSION_COOKIE)?.value;
    if (old) store.logout(old);
    const token = store.session(p.data.identity);
    const res = json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return res;
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(req: NextRequest) {
  try {
    if (!localMode()) {
      sameOrigin(req);
      const { userClient } = await import("@/lib/portal/supabase");
      const { error } = await (
        await userClient()
      ).auth.signOut({ scope: "local" });
      if (error)
        throw new PortalError(503, "Não foi possível terminar a sessão.");
      return json({ ok: true });
    }
    localOnly(req);
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token) getStore().logout(token);
    const res = json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  } catch (e) {
    return fail(e);
  }
}
