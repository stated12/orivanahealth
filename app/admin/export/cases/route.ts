import { db } from "@/lib/db";
import { getAdmin, can, audit } from "@/lib/auth";
export const dynamic = "force-dynamic";
const cell = (v: any) => { let s = v === null || v === undefined ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
export async function GET(req: Request) {
  const a = await getAdmin(); if (!a || !can(a, "cases.read")) return new Response("Forbidden", { status: 403 }); const kind = new URL(req.url).searchParams.get("kind") === "tourism" ? "tourism" : "assistance";
  const { data } = await db().from("cases").select("case_ref,kind,created_at,status,applicant_name,patient_name,country,state,city,specialty,verified,public_state,coordinator_name,estimated_cost,amount_requested,consent_public").eq("kind", kind).order("created_at").limit(50000); const rows: any[] = data || []; const cols = rows.length ? Object.keys(rows[0]) : ["case_ref"];
  await audit(a, "export", "cases"); return new Response("﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${kind}-cases.csv"` } });
}
