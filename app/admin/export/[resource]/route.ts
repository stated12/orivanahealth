import { db } from "@/lib/db";
import { getAdmin, can, audit } from "@/lib/auth";
import { RESOURCES } from "@/lib/adminConfig";
export const dynamic = "force-dynamic";
const cell = (v: any) => { let s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
export async function GET(_: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params; const r = RESOURCES[resource]; const a = await getAdmin(); if (!r || !r.csv || !a || !can(a, r.perm)) return new Response("Forbidden", { status: 403 });
  const { data } = await db().from(r.table).select("*").limit(20000); const rows: any[] = data || []; const cols = rows.length ? Object.keys(rows[0]).filter((c) => c !== "token" && c !== "access_token") : r.cols;
  await audit(a, "export", r.table);
  return new Response("﻿" + [cols.join(","), ...rows.map((x) => cols.map((c) => cell(x[c])).join(","))].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${r.key}.csv"` } });
}
