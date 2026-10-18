import { type NextRequest, NextResponse } from "next/server";
import { PortalError, type Identity } from "./types";
import { localMode } from "./config";
export const SESSION_COOKIE = "portal_local_session";
export function isAllowedOrigin(request: NextRequest): boolean {
  if (["GET", "HEAD"].includes(request.method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host")?.toLowerCase();

  let sourceUrl: URL | null = null;
  try {
    if (origin) {
      sourceUrl = new URL(origin);
    } else if (referer) {
      sourceUrl = new URL(referer);
    }
  } catch {
    return false;
  }

  // If no origin or referer header provided on a same-origin fetch, allow if host exists
  if (!sourceUrl) {
    return true;
  }

  const sourceHost = sourceUrl.host.toLowerCase();

  // 1. Same-host match (the fundamental definition of same-origin)
  if (host && sourceHost === host) {
    return true;
  }

  // 2. Local development match (localhost or 127.0.0.1 on any port)
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(sourceHost)) {
    return true;
  }

  // 3. Match against PORTAL_APP_URL
  const expected = process.env.PORTAL_APP_URL;
  if (expected) {
    try {
      const expectedUrl = new URL(expected);
      if (sourceUrl.origin.toLowerCase() === expectedUrl.origin.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore malformed PORTAL_APP_URL
    }
  }

  // 4. Match against Vercel deployment URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && sourceHost === vercelUrl.toLowerCase()) {
    return true;
  }

  return false;
}

export function localOnly(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    throw new PortalError(403, "Origem do pedido inválida.");
  }
}

export function sameOrigin(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    throw new PortalError(403, "Origem do pedido inválida.");
  }
}
export async function authenticate(request: NextRequest): Promise<Identity> {
  sameOrigin(request);
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { getStore } = await import("./store");
  const store = await getStore();
  const who = await store.identity(token);
  if (!who) {
    throw new PortalError(
      401,
      "A sessão terminou. Volta a entrar para continuar.",
    );
  }
  return who;
}
export async function readBody(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new PortalError(415, "Usa um pedido JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError(400, "Pedido vazio.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 1_500_000) {
      await reader.cancel();
      throw new PortalError(413, "O pedido excede o limite de conteúdo.");
    }
    chunks.push(part.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new PortalError(400, "Pedido inválido.");
  }
}
export function fail(e: unknown) {
  if (e instanceof PortalError)
    return NextResponse.json(
      { error: e.message, fields: e.fields },
      { status: e.status, headers: { "Cache-Control": "no-store" } },
    );
  return NextResponse.json(
    { error: "Não foi possível concluir. Tenta novamente." },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}
export function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
