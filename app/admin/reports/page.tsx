import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { rupees } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("donations.reports"); const { data } = await db().from("donations").select("amount,refund_amount,status,fund,reconciled,source,created_at,case_id").limit(50000); const rows = (data || []) as any[];
  const net = (r: any) => Number(r.amount) - Number(r.refund_amount || 0); const paid = rows.filter((r) => r.status === "paid" || r.status === "refunded"); const sum = (xs: any[]) => xs.reduce((t, r) => t + net(r), 0);
  const by = (k: string) => { const m = new Map<string, { n: number; t: number }>(); for (const r of paid) { const key = String(r[k]); const v = m.get(key) || { n: 0, t: 0 }; v.n++; v.t += net(r); m.set(key, v); } return Array.from(m.entries()); };
  const months = new Map<string, number>(); for (const r of paid) { const k = String(r.created_at).slice(0, 7); months.set(k, (months.get(k) || 0) + net(r)); }
  const Tile = ({ n, l }: { n: string | number; l: string }) => <div className="card p-4"><p className="text-2xl font-bold text-navy">{n}</p><p className="text-sm text-muted">{l}</p></div>;
  return (<div><h1 className="text-3xl">Financial report</h1><p className="text-sm text-muted">Computed from recorded transactions only. Intents (support expressed without a payment) are not money and are not counted.</p>
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><Tile n={rupees(sum(paid))} l="Net received (paid less refunds)" /><Tile n={paid.filter((r) => r.status === "paid").length} l="Paid transactions" /><Tile n={rupees(sum(paid.filter((r) => r.reconciled)))} l="Reconciled" /><Tile n={rupees(sum(paid.filter((r) => !r.reconciled)))} l="Awaiting reconciliation" /><Tile n={rows.filter((r) => r.status === "intent").length} l="Support intents (no payment)" /><Tile n={rows.filter((r) => r.status === "pending").length} l="Pending payments" /><Tile n={rows.filter((r) => r.status === "failed").length} l="Failed" /><Tile n={rupees(rows.filter((r) => r.status === "refunded").reduce((t, r) => t + Number(r.refund_amount || 0), 0))} l="Refunded" /></div>
    <div className="mt-6 grid gap-4 md:grid-cols-3">{[["By fund", by("fund")], ["By source", by("source")], ["By month", Array.from(months.entries()).sort().map(([k, t]) => [k, { n: 0, t }] as [string, { n: number; t: number }])]].map(([title, list]: any) => <div key={title} className="card p-4"><h2 className="text-lg">{title}</h2><ul className="mt-2 space-y-1 text-sm">{list.map(([k, v]: any) => <li key={k} className="flex justify-between"><span>{k}</span><span>{rupees(v.t)}</span></li>)}{!list.length && <li className="text-muted">No data.</li>}</ul></div>)}</div>
    <p className="mt-6"><a className="btn btn-dark" href="/admin/export/donations">Download all donations (CSV)</a></p></div>);
}
