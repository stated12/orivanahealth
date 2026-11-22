import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/about", "/healthcare", "/care", "/care/cases", "/donate", "/medical-tourism", "/training", "/equipment", "/partners", "/community", "/navigator", "/contact", "/faqs"].map((p) => ({ url: SITE_URL + p }));
  const sets: [string, string, string, string][] = [["specialties", "slug", "/healthcare/", "is_published"], ["partners", "slug", "/partners/", "is_published"], ["courses", "slug", "/training/", "is_published"], ["equipment_listings", "slug", "/equipment/", "is_published"], ["events", "slug", "/community/", "is_published"]];
  const out = [...fixed];
  for (const [t, c, p, f] of sets) { try { const { data } = await db().from(t).select(c).eq(f, true); for (const r of data || []) out.push({ url: SITE_URL + p + r[c] }); } catch { /* ignore */ } }
  try { const { data } = await db().from("cases").select("public_slug").in("public_state", ["approved", "closed"]); for (const r of data || []) out.push({ url: SITE_URL + "/care/cases/" + r.public_slug }); } catch { /* ignore */ }
  return out;
}
