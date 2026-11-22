"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";
import { SETTINGS } from "@/lib/settingsConfig";
import { slugify } from "@/lib/format";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export async function markNotifications(fd: FormData) {
  await requirePerm("notifications.read"); const id = s(fd, "id");
  if (id) await db().from("notifications").update({ is_read: true }).eq("id", id); else await db().from("notifications").update({ is_read: true }).eq("is_read", false);
  redirect("/admin/notifications");
}
export async function saveSettings(fd: FormData) {
  const a = await requirePerm("settings.write"); const rows: { key: string; value: any; updated_at: string }[] = [];
  for (const f of SETTINGS) {
    const k = "s_" + f.key; let v: any;
    switch (f.type) {
      case "bool": v = fd.get(k) === "on"; break;
      case "number": v = Number(s(fd, k)) || 0; break;
      case "csv": v = s(fd, k).split(",").map((x) => x.trim()).filter(Boolean); break;
      case "image": v = (await uploadImage(fd.get(k + "__file"), "brand")) || s(fd, k); break;
      default: v = s(fd, k);
    }
    rows.push({ key: f.key, value: v, updated_at: new Date().toISOString() });
  }
  const { error } = await db().from("site_settings").upsert(rows); await audit(a, "settings", "site_settings");
  revalidatePath("/", "layout"); redirect("/admin/settings?ok=" + (error ? "err" : "1"));
}
async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data: p } = await db().from("profiles").select("id").ilike("email", email).maybeSingle(); if (p) return p.id;
  for (let page = 1; page <= 10; page++) { const { data, error } = await db().auth.admin.listUsers({ page, perPage: 200 }); if (error || !data?.users?.length) return null; const u = data.users.find((x: any) => (x.email || "").toLowerCase() === email.toLowerCase()); if (u) return u.id; if (data.users.length < 200) return null; }
  return null;
}
export async function assignRole(fd: FormData) {
  const a = await requirePerm("users.manage"); const email = s(fd, "email").toLowerCase(), role = s(fd, "role");
  const uid = await findUserIdByEmail(email); if (!uid) redirect("/admin/users?e=" + encodeURIComponent("No account with that email. Ask the person to sign up on the website first."));
  const { error } = await db().from("user_roles").upsert({ user_id: uid, role }); await audit(a, "assign_role", "user_roles", uid, { role });
  redirect("/admin/users?" + (error ? "e=" + encodeURIComponent(error.message) : "ok=1"));
}
export async function removeRole(fd: FormData) {
  const a = await requirePerm("users.manage"); const uid = s(fd, "user_id"), role = s(fd, "role");
  if (role === "super_admin") { const { data } = await db().from("user_roles").select("user_id").eq("role", "super_admin"); if ((data || []).length <= 1) redirect("/admin/users?e=" + encodeURIComponent("You cannot remove the last Super Admin.")); if (uid === a.id) redirect("/admin/users?e=" + encodeURIComponent("You cannot remove your own Super Admin role. Ask another Super Admin.")); }
  await db().from("user_roles").delete().eq("user_id", uid).eq("role", role); await audit(a, "remove_role", "user_roles", uid, { role }); redirect("/admin/users?ok=1");
}
export async function createRole(fd: FormData) {
  const a = await requirePerm("users.manage"); const role = slugify(s(fd, "name")).replace(/-/g, "_"); if (!role) redirect("/admin/users?e=Name%20required");
  const { error } = await db().from("roles").insert({ role, name: s(fd, "name"), description: s(fd, "description") || null, is_system: false }); await audit(a, "create_role", "roles", role);
  redirect("/admin/users?" + (error ? "e=" + encodeURIComponent(error.message) : "ok=1"));
}
export async function saveRolePermissions(fd: FormData) {
  const a = await requirePerm("users.manage"); const role = s(fd, "role"); if (role === "super_admin") redirect("/admin/users?e=" + encodeURIComponent("Super Admin always has every permission."));
  const perms = fd.getAll("perm").map(String); await db().from("role_permissions").delete().eq("role", role); if (perms.length) await db().from("role_permissions").insert(perms.map((permission) => ({ role, permission })));
  await audit(a, "role_permissions", "roles", role, { perms }); redirect("/admin/users?ok=1");
}
export async function deleteRole(fd: FormData) {
  const a = await requirePerm("users.manage"); const role = s(fd, "role"); const { data: r } = await db().from("roles").select("is_system").eq("role", role).maybeSingle(); if (!r || r.is_system) redirect("/admin/users?e=" + encodeURIComponent("Built-in roles cannot be deleted."));
  await db().from("roles").delete().eq("role", role); await audit(a, "delete_role", "roles", role); redirect("/admin/users?ok=1");
}
