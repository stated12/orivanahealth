"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authClient } from "@/lib/supabase-server";
import { getAdmin, loadStaff, requirePerm, audit } from "@/lib/auth";
import { allow } from "@/lib/ratelimit";
import { RESOURCES, type Field } from "@/lib/adminConfig";
import { slugify } from "@/lib/format";
import { uploadImage, uploadPdf } from "@/lib/upload";
import { sanitizeHtml } from "@/lib/sanitize";

export async function adminLogin(fd: FormData) {
  if (!(await allow("admin-login", 8, 600))) redirect("/admin/login?e=rate");
  const sb = await authClient();
  const { data, error } = await sb.auth.signInWithPassword({ email: String(fd.get("email") || "").trim().toLowerCase(), password: String(fd.get("password") || "") });
  if (error || !data?.user) redirect("/admin/login?e=bad");
  const { admin, reason } = await loadStaff(data.user.id, data.user.email || "");
  if (!admin || reason) { await sb.auth.signOut(); redirect("/admin/login?e=noadmin&c=" + (reason || "no_role")); }
  await audit(admin, "login", "auth"); redirect("/admin");
}
export async function adminLogout() { await (await authClient()).auth.signOut(); redirect("/admin/login"); }
export async function adminChangePassword(fd: FormData) {
  const a = await getAdmin(); if (!a) redirect("/admin/login");
  const pw = String(fd.get("password") || ""); if (pw.length < 10) redirect("/admin/settings?pw=short");
  const { error } = await (await authClient()).auth.updateUser({ password: pw }); await audit(a, "change_password", "auth"); redirect("/admin/settings?pw=" + (error ? "err" : "ok"));
}
async function readField(f: Field, fd: FormData, folder: string): Promise<any> {
  const k = "f_" + f.name;
  switch (f.type) {
    case "bool": return fd.get(k) === "on";
    case "number": { const v = String(fd.get(k) ?? "").trim(); return v === "" ? null : Number(v); }
    case "datetime": { const v = String(fd.get(k) || "").trim(); return v ? new Date(v).toISOString() : null; }
    case "date": { const v = String(fd.get(k) || "").trim(); return v || null; }
    case "image": { const up = await uploadImage(fd.get(k + "__file"), folder); return up || String(fd.get(k) || "").trim() || null; }
    case "file": { const up = await uploadPdf(fd.get(k + "__file"), folder); return up || String(fd.get(k) || "").trim() || null; }
    case "csv": return String(fd.get(k) || "").split(",").map((x) => x.trim()).filter(Boolean);
    case "json": { const t = String(fd.get(k) || "").trim(); if (!t) return null; try { return JSON.parse(t); } catch { throw new Error(f.label + " is not valid JSON"); } }
    case "html": return String(fd.get(k) || "").trim() ? sanitizeHtml(String(fd.get(k))) : null;
    case "slug": return slugify(String(fd.get(k) || ""));
    case "select": { const v = String(fd.get(k) || ""); return v === "" ? null : v; }
    default: { let v = String(fd.get(k) ?? "").trim(); if (f.upper) v = v.toUpperCase(); return v === "" ? null : v; }
  }
}
const empty = (v: any) => v === null || v === "" || (Array.isArray(v) && !v.length) || (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
export async function saveResource(fd: FormData) {
  const key = String(fd.get("resource")); const id = String(fd.get("id") || "new"); const r = RESOURCES[key]; if (!r) redirect("/admin");
  const a = await requirePerm(r.perm); const base = `/admin/${key}`; const row: Record<string, any> = {};
  try { for (const f of r.fields.filter((x) => x.type !== "readonly")) row[f.name] = await readField(f, fd, key); } catch (e: any) { redirect(`${base}/${id}?e=${encodeURIComponent(e.message)}`); }
  for (const f of r.fields) if (f.type !== "readonly" && f.required && empty(row[f.name]) && f.type !== "bool") redirect(`${base}/${id}?e=${encodeURIComponent(f.label + " is required")}`);
  if (r.slugFrom && !row.slug) row.slug = slugify(String(row[r.slugFrom] || "")) || "item-" + Date.now().toString(36);
  for (const f of r.fields) if (f.type === "number" && row[f.name] === null && f.name === "sort_order") row[f.name] = 0;
  const pk = r.pk || "id"; const q = id === "new" ? db().from(r.table).insert(row).select(pk).single() : db().from(r.table).update(row).eq(pk, id).select(pk).single();
  const { data, error } = await q;
  if (error) redirect(`${base}/${id}?e=${encodeURIComponent(error.message.includes("duplicate") ? "That value already exists (duplicate)." : error.message.slice(0, 160))}`);
  await audit(a, id === "new" ? "create" : "update", r.table, data?.[pk]); revalidatePath("/", "layout"); redirect(`${base}?ok=1`);
}
export async function deleteResource(fd: FormData) {
  const key = String(fd.get("resource")); const id = String(fd.get("id")); const r = RESOURCES[key]; if (!r) redirect("/admin");
  const a = await requirePerm(r.perm); const { error } = await db().from(r.table).delete().eq(r.pk || "id", id); await audit(a, "delete", r.table, id); revalidatePath("/", "layout");
  redirect(`/admin/${key}?${error ? "e=" + encodeURIComponent(error.message.slice(0, 120)) : "ok=1"}`);
}
export async function moveRow(fd: FormData) {
  const key = String(fd.get("resource")); const id = String(fd.get("id")); const dir = String(fd.get("dir")); const r = RESOURCES[key]; if (!r) redirect("/admin");
  const a = await requirePerm(r.perm); const { data } = await db().from(r.table).select("id,sort_order").order("sort_order").order("id");
  const list: any[] = data || []; const i = list.findIndex((x) => x.id === id); const j = dir === "up" ? i - 1 : i + 1;
  if (i >= 0 && j >= 0 && j < list.length) { const arr = list.map((x, n) => ({ id: x.id, o: n + 1 })); const t = arr[i].o; arr[i].o = arr[j].o; arr[j].o = t; await Promise.all(arr.map((x) => db().from(r.table).update({ sort_order: x.o }).eq("id", x.id))); await audit(a, "reorder", r.table, id); }
  revalidatePath("/", "layout"); redirect(`/admin/${key}`);
}
export async function toggleVisible(fd: FormData) {
  const key = String(fd.get("resource")); const id = String(fd.get("id")); const r = RESOURCES[key]; if (!r || !r.visibleField) redirect("/admin");
  const a = await requirePerm(r.perm); const { data } = await db().from(r.table).select(r.visibleField).eq("id", id).single();
  await db().from(r.table).update({ [r.visibleField]: !data?.[r.visibleField] }).eq("id", id); await audit(a, "toggle", r.table, id); revalidatePath("/", "layout"); redirect(`/admin/${key}`);
}
