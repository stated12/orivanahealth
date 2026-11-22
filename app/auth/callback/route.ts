import { NextResponse } from "next/server";
import { authClient } from "@/lib/supabase-server";
export async function GET(req: Request) {
  const url = new URL(req.url); const code = url.searchParams.get("code"); const next = url.searchParams.get("next") || "/account";
  if (code) { try { await (await authClient()).auth.exchangeCodeForSession(code); } catch { /* fall through */ } }
  return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/account", url.origin));
}
