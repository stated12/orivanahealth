import type { Metadata } from "next";
import { cache } from "react";
import { db } from "./db";
import { SITE_URL } from "./env";
import { getSettings } from "./settings";

export const getNav = cache(async (loc: "header" | "footer") => { const { data } = await db().from("navigation_items").select("*").eq("location", loc).eq("is_visible", true).order("sort_order"); return (data || []) as any[]; });
export async function getPage(slug: string) { const { data } = await db().from("pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); return data as any; }
export async function meta(path: string, title: string, description?: string, image?: string | null): Promise<Metadata> {
  const s = await getSettings(); const d = description || s.seo_default_description || "";
  return { title, description: d, alternates: { canonical: SITE_URL + path }, openGraph: { title, description: d, url: SITE_URL + path, siteName: s.brand_name || "ORIVANA Health", type: "website", ...(image ? { images: [image] } : {}) } };
}
export const rupees = (n: any) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
/** Money raised and remaining for a case, computed only from recorded paid donations and the admin-verified goal. */
export async function funding(caseId: string): Promise<{ raised: number; paid: number; goal: number | null; remaining: number | null }> {
  const { data: c } = await db().from("cases").select("verified_goal").eq("id", caseId).maybeSingle();
  const { data: f } = await db().from("case_funding").select("raised,paid_count").eq("case_id", caseId).maybeSingle();
  const raised = Number(f?.raised || 0), goal = c?.verified_goal != null ? Number(c.verified_goal) : null;
  return { raised, paid: Number(f?.paid_count || 0), goal, remaining: goal != null ? Math.max(goal - raised, 0) : null };
}
export const randomCode = (n = 8) => { const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let o = ""; const b = new Uint32Array(n); crypto.getRandomValues(b); for (const x of b) o += a[x % a.length]; return o; };
/** Payments run only when BOTH admin switches are on AND the provider keys exist on the server. */
export async function paymentsLive(): Promise<boolean> {
  const s = await getSettings(); const t = (v: any) => v === true || v === "true";
  return t(s.payments_enabled) && t(s.legal_eligibility_verified) && !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
}

export const PARTNER_TYPES: Record<string, string> = { hospital: "Hospitals", clinic: "Clinics", doctor: "Doctors & specialists", diagnostic_centre: "Diagnostic centres", laboratory: "Laboratories", rehabilitation: "Rehabilitation providers", educator: "Healthcare educators", equipment_supplier: "Medical equipment suppliers", medical_tourism_provider: "Medical tourism service providers", ngo: "NGOs", community_organisation: "Community health organisations", sponsor: "Sponsors & supporting institutions", volunteer_professional: "Volunteers & healthcare professionals" };
