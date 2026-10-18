export function localMode() {
  if (process.env.PORTAL_LOCAL_MODE === "1") return true;
  if (process.env.VERCEL) return false;
  if (
    process.env.PORTAL_REMOTE_ENABLED === "1" &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return false;
  }
  return true;
}

export function remoteReady() {
  return (
    !localMode() &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.PORTAL_REMOTE_ENABLED === "1"
  );
}
