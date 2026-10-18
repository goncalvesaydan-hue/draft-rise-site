import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  sameOrigin,
  readBody,
  fail,
  json,
  SESSION_COOKIE,
} from "@/lib/portal/http";
import { getStore } from "@/lib/portal/store";
import { PortalError } from "@/lib/portal/types";

export const runtime = "nodejs";

const teamLoginSchema = z
  .object({
    mode: z.literal("team"),
    username: z.string().trim().min(1).max(60),
    password: z.string().min(1).max(120),
  })
  .strict();

const clientVerifySchema = z
  .object({
    mode: z.literal("client").optional(),
    email: z.string().trim().email().max(254),
    token: z.string().trim().regex(/^\d{6,10}$/),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    const body = await readBody(req);
    const store = await getStore();

    // 1. Team login (user1 .. user6 + password)
    const teamParsed = teamLoginSchema.safeParse(body);
    if (teamParsed.success) {
      const oldToken = req.cookies.get(SESSION_COOKIE)?.value;
      if (oldToken) await store.logout(oldToken);

      const { token } = await store.loginTeam(
        teamParsed.data.username,
        teamParsed.data.password,
      );
      const res = json({ destination: "/equipa" });
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 8 * 60 * 60,
      });
      return res;
    }

    // 2. Client 6-digit code verification
    const parsed = clientVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw new PortalError(400, "Indique o email e o código de 6 dígitos recebido.");
    }

    const oldToken = req.cookies.get(SESSION_COOKIE)?.value;
    if (oldToken) await store.logout(oldToken);

    const { token, intakeId, status } = await store.verifyClientAccess(
      parsed.data.email,
      parsed.data.token,
    );

    const destination = `/cliente/${intakeId}/${
      status === "submitted" ? "confirmacao" : "preencher/1"
    }`;

    const res = json({ destination });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return res;
  } catch (e) {
    return fail(e);
  }
}
