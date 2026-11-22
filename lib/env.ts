// Central environment access with validation. Secrets are read only on the server.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const supabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseService = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const smtpConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/** Returns the list of missing required variables (shown in Admin > Settings > System). */
export function envProblems(): string[] {
  const out: string[] = [];
  if (!supabaseUrl()) out.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnon()) out.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!supabaseService()) out.push("SUPABASE_SERVICE_ROLE_KEY");
  return out;
}
export function requireEnv() {
  const p = envProblems();
  if (p.length) throw new Error("Missing environment variables: " + p.join(", "));
}
