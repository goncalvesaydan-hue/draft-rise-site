export function localMode() {
  return process.env.PORTAL_LOCAL_MODE === "1" && !process.env.VERCEL;
}
export function remoteReady() {
  return (
    !localMode() &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_PUBLISHABLE_KEY &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.PORTAL_APP_URL &&
    process.env.PORTAL_REMOTE_ENABLED === "1"
  );
}
