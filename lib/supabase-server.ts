import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnon, supabaseUrl } from "./env";

/** Auth-aware client bound to the visitor's cookies (anon key). */
export async function authClient(): Promise<any> {
  const store = await cookies();
  return createServerClient(supabaseUrl(), supabaseAnon(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch (e: any) {
          // Expected (and harmless) when called while rendering a Server Component: cookies are read-only there and proxy.ts refreshes the session instead.
          // Anywhere else (Server Action / Route Handler) a failure here means the session was NOT saved, so say so in the server log.
          if (!/read-only|Server Component|only be modified/i.test(String(e?.message || e))) console.error("[auth] could not write session cookies:", e?.message || e);
        }
      },
    },
  });
}
/** The signed-in user, verified with Supabase Auth (not just decoded from the cookie). Null for visitors. Real failures are logged, never secrets. */
export async function currentUser(): Promise<{ id: string; email?: string } | null> {
  try {
    const { data, error } = await (await authClient()).auth.getUser();
    if (error) { if (!/session missing|not authenticated/i.test(error.message || "")) console.error("[auth] getUser failed:", error.status || "", error.message); return null; }
    return data?.user ? { id: data.user.id, email: data.user.email } : null;
  } catch (e: any) { console.error("[auth] currentUser threw:", e?.message || e); return null; }
}
