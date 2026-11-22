import { cookies } from "next/headers";
import { db } from "./db";
import { currentUser } from "./supabase-server";
/** The case with this reference, but only if the visitor proves ownership (signed in as the owner, or holds the access code in their cookie). */
export async function ownedCase(ref: string): Promise<any | null> {
  const { data: c } = await db().from("cases").select("*").eq("case_ref", ref).maybeSingle(); if (!c) return null;
  const u = await currentUser(); if (u && c.user_id && c.user_id === u.id) return c;
  const ck = (await cookies()).get("oh_case")?.value || ""; return ck === `${c.case_ref}:${c.access_code}` ? c : null;
}
