import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { remoteReady } from "./config";
import { PortalError } from "./types";
export async function userClient() {
  if (!remoteReady())
    throw new PortalError(
      503,
      "O questionário está em preparação. Contacte a Draft & Rise para iniciar o seu projeto.",
    );
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: new URL(process.env.PORTAL_APP_URL!).protocol === "https:",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        },
      },
    },
  );
}
export function serviceClient() {
  if (!remoteReady())
    throw new PortalError(503, "Serviço ainda não configurado.");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
