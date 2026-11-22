import { db } from "@/lib/db";
import { getAdmin, can, audit } from "@/lib/auth";
export const dynamic = "force-dynamic";
const cell = (v: any) => { let s = v === null || v === undefined ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
export async function GET() {
  const a = await getAdmin(); if (!a || !can(a, "donations.reports")) return new Response("Forbidden", { status: 403 });
  const { data } = await db().from("donations").select("donation_ref,created_at,fund,amount,currency,status,source,refund_amount,donor_name,donor_email,is_anonymous,provider,provider_order_id,provider_payment_id,reconciled,reconciled_at,acknowledged_at,case_id").order("created_at").limit(50000); const rows: any[] = data || []; const cols = rows.length ? Object.keys(rows[0]) : ["donation_ref"];
  await audit(a, "export", "donations"); return new Response("﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="donations.csv"' } });
}
