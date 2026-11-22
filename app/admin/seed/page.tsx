import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
export const dynamic = "force-dynamic"; export const maxDuration = 60;
const chunk = <T,>(a: T[], n: number) => { const o: T[][] = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };
const ORDER: [string, string | null][] = [["roles", "role"], ["role_permissions", "role,permission"], ["site_settings", "key"], ["case_statuses", "key"], ["specialty_groups", null], ["specialties", null], ["journey_steps", null], ["tourism_services", null], ["course_categories", null], ["equipment_categories", null], ["equipment_services", null], ["navigator_options", null], ["navigation_items", null], ["leaders", null], ["forms", "key"], ["pages", "slug"], ["faqs", null]];
/** Loads the starting structure from data/seed.json: roles, statuses, the 28 specialties, journey steps, categories, forms, navigation, policy pages, FAQs and the two leadership cards (no photos, no invented content).
 *  A table that already has rows is skipped, so running it again never overwrites your work. */
async function load(fd: FormData) {
  "use server";
  const a = await requirePerm("users.manage"); if (fd.get("confirm") !== "on") redirect("/admin/seed?e=" + encodeURIComponent("Tick the confirmation box first."));
  const seed: any = (await import("@/data/seed.json")).default; const log: string[] = [];
  const fail = (step: string, msg: string): never => redirect("/admin/seed?e=" + encodeURIComponent(`${step}: ${msg}`.slice(0, 300)));
  for (const [t, conflict] of ORDER) {
    let rows: any[] = seed[t] || []; if (!rows.length) continue; const { count } = await db().from(t).select("*", { count: "exact", head: true }); if ((count || 0) > 0 && t !== "site_settings" && t !== "roles" && t !== "role_permissions") { log.push(`${t}: skipped`); continue; }
    if (t === "specialties") { const { data: g } = await db().from("specialty_groups").select("id,slug"); const m = new Map((g || []).map((x: any) => [x.slug, x.id])); rows = rows.map(({ _group, ...r }: any) => ({ ...r, group_id: m.get(_group) || null })); }
    for (const c of chunk(rows, 40)) { const r = conflict ? await db().from(t).upsert(c, { onConflict: conflict, ignoreDuplicates: true }) : await db().from(t).insert(c); if (r.error) fail(t, r.error.message); }
    log.push(`${t}: ${rows.length}`);
  }
  await audit(a, "load_starter_content", "seed", undefined, { log }); redirect("/admin/seed?ok=1");
}
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  await requirePerm("users.manage"); const sp = await searchParams; const { count } = await db().from("specialties").select("*", { count: "exact", head: true });
  return (<div className="max-w-2xl"><h1 className="text-3xl">Load starter content</h1><p className="mt-2 text-muted">Loads roles, the configurable case statuses, 28 specialties in groups, the medical tourism journey and services, course and equipment categories, Health Navigator options, forms, navigation, policy pages, FAQs and the two leadership cards. It adds structure only: no hospitals, doctors, courses, products, prices, cases or figures are created. Tables that already contain data are skipped.</p>
    {sp.ok && <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-green-900">Starter content loaded. Open the website to check it.</p>}{sp.e && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-red-800">{sp.e}</p>}<p className="card mt-4 p-4">Specialties currently on the site: <b>{count || 0}</b></p>
    <form action={load} className="card mt-4 space-y-3 p-5"><label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" className="mt-1" /><span>I understand this loads the starting structure.</span></label><button className="btn btn-dark">Load starter content</button></form></div>);
}
