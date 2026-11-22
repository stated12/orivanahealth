import { redirect } from "next/navigation";
import { db } from "./db";
import { currentUser } from "./supabase-server";

export type Admin = { id: string; email: string; roles: string[]; perms: string[] };
export type StaffReason = "role_query_failed" | "no_role" | "perm_query_failed" | "no_permissions" | "no_admin_access";
/** Roles + permissions for a known user id. DB errors are logged (no secrets) and returned as a reason instead of being swallowed. */
export async function loadStaff(userId: string, email = ""): Promise<{ admin: Admin | null; reason?: StaffReason }> {
  const r = await db().from("user_roles").select("role").eq("user_id", userId);
  if (r.error) { console.error("[auth] oh_user_roles query failed:", r.error.code || "", r.error.message); return { admin: null, reason: "role_query_failed" }; }
  const rs: string[] = (r.data || []).map((x: any) => x.role);
  if (!rs.length) return { admin: null, reason: "no_role" };
  const p = await db().from("role_permissions").select("permission").in("role", rs);
  if (p.error) { console.error("[auth] oh_role_permissions query failed:", p.error.code || "", p.error.message); return { admin: null, reason: "perm_query_failed" }; }
  const perms: string[] = (p.data || []).map((x: any) => x.permission);
  const admin = { id: userId, email, roles: rs, perms };
  if (!perms.length) return { admin, reason: "no_permissions" };
  if (!can(admin, "dashboard.read")) return { admin, reason: "no_admin_access" };
  return { admin };
}
/** Signed-in staff member with permissions (any staff role, even without admin entry). */
export async function getStaff(): Promise<Admin | null> { const u = await currentUser(); if (!u) return null; return (await loadStaff(u.id, u.email || "")).admin; }
export const can = (a: Admin | null, perm: string) => !!a && (a.perms.includes("*") || a.perms.includes(perm));
export const canAny = (a: Admin | null, perms: string[]) => perms.some((p) => can(a, p));
export async function getAdmin(): Promise<Admin | null> { const a = await getStaff(); return a && can(a, "dashboard.read") ? a : null; }
export async function requirePerm(perm: string): Promise<Admin> {
  const a = await getAdmin(); if (!a) redirect("/admin/login");
  if (!can(a, perm)) redirect("/admin?denied=" + encodeURIComponent(perm));
  return a;
}
export async function requireAny(perms: string[]): Promise<Admin> {
  const a = await getAdmin(); if (!a) redirect("/admin/login");
  if (!canAny(a, perms)) redirect("/admin?denied=" + encodeURIComponent(perms[0]));
  return a;
}
export async function audit(a: Admin | null, action: string, resource: string, resourceId?: string, details?: any) {
  try { await db().from("audit_logs").insert({ user_id: a?.id || null, user_email: a?.email || null, action, resource, resource_id: resourceId || null, details: details || null }); } catch { /* never block */ }
}
