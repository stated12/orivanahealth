import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keeps the Supabase login fresh. Server Components cannot write cookies, so without this an expired access token is refreshed server-side
 *  but the browser never receives the new cookies, which logs the admin out within about an hour. Runs only when an auth cookie exists. */
export async function proxy(request: NextRequest) {
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))) return NextResponse.next();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "", anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anon) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  try { await supabase.auth.getUser(); } catch { /* never block a page because of a refresh problem */ }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)"] };
