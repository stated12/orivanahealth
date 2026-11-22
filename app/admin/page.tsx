import Link from "next/link";
import { db } from "@/lib/db";
import { requirePerm, can } from "@/lib/auth";
import { rupees } from "@/lib/content";
export const dynamic = "force-dynamic";
const cnt = async (t: string, f?: (q: any) => any) => { let q = db().from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); const { count } = await q; return count || 0; };
export default async function Page({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const a = await requirePerm("dashboard.read"); const sp = await searchParams; const C = can(a, "cases.read"), D = can(a, "donations.read"), F = can(a, "forms.read"), T = can(a, "training.write");
  const open = (q: any) => q.not("status", "in", "(completed,declined,closed)");
  const [ac, ao, tc, to, pend, pub, subs, don, intents, learners, courses, partners, pendP, listings, events, regs] = await Promise.all([
    C ? cnt("cases", (q) => q.eq("kind", "assistance")) : 0, C ? cnt("cases", (q) => open(q.eq("kind", "assistance"))) : 0, C ? cnt("cases", (q) => q.eq("kind", "tourism")) : 0, C ? cnt("cases", (q) => open(q.eq("kind", "tourism"))) : 0,
    C ? cnt("cases", (q) => q.eq("public_state", "pending_review")) : 0, C ? cnt("cases", (q) => q.eq("public_state", "approved")) : 0, F ? cnt("form_submissions", (q) => q.eq("status", "new")) : 0,
    D ? db().from("donations").select("amount,refund_amount,status,reconciled").in("status", ["paid", "refunded"]).limit(50000) : { data: [] }, D ? cnt("donations", (q) => q.eq("status", "intent")) : 0,
    T ? cnt("enrollments") : 0, T ? cnt("courses", (q) => q.eq("is_published", true)) : 0, can(a, "partners.write") ? cnt("partners", (q) => q.eq("verification_status", "verified")) : 0, can(a, "partners.write") ? cnt("partners", (q) => q.eq("verification_status", "pending")) : 0, can(a, "equipment.write") ? cnt("equipment_listings", (q) => q.eq("is_published", true)) : 0, can(a, "events.write") ? cnt("events", (q) => q.eq("is_published", true)) : 0, can(a, "events.write") ? cnt("event_registrations") : 0]);
  const rows = ((don as any).data || []) as any[]; const net = rows.reduce((t, r) => t + Number(r.amount) - Number(r.refund_amount || 0), 0); const unrec = rows.filter((r) => !r.reconciled).length;
  const Tile = ({ n, l, href }: { n: any; l: string; href?: string }) => { const c = (<div className="card p-4"><p className="text-3xl font-bold text-navy">{n}</p><p className="text-sm text-muted">{l}</p></div>); return href ? <Link href={href}>{c}</Link> : c; };
  return (<div><h1 className="text-3xl">Dashboard</h1><p className="text-sm text-muted">All figures are counted from the database.</p>{sp.denied && <p className="mt-3 rounded-lg bg-yellow-50 p-3">You do not have permission for that area ({sp.denied}).</p>}
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {C && <><Tile n={ao} l="Open assistance cases" href="/admin/cases?kind=assistance" /><Tile n={ac} l="Assistance applications (all)" href="/admin/cases?kind=assistance" /><Tile n={to} l="Open tourism enquiries" href="/admin/cases?kind=tourism" /><Tile n={tc} l="Tourism enquiries (all)" href="/admin/cases?kind=tourism" /><Tile n={pend} l="Cases pending public review" href="/admin/cases?kind=assistance" /><Tile n={pub} l="Cases public on the board" href="/care/cases" /></>}
      {F && <Tile n={subs} l="New enquiries & applications" href="/admin/submissions" />}
      {D && <><Tile n={rupees(net)} l="Net contributions received" href="/admin/reports" /><Tile n={unrec} l="Paid, awaiting reconciliation" href="/admin/donations" /><Tile n={intents} l="Support intents (no payment)" href="/admin/donations" /></>}
      {T && <><Tile n={courses} l="Published courses" href="/admin/courses" /><Tile n={learners} l="Enrolments" href="/admin/enrollments" /></>}
      {can(a, "partners.write") && <><Tile n={partners} l="Verified partners" href="/admin/partners" /><Tile n={pendP} l="Partners pending verification" href="/admin/partners" /></>}
      {can(a, "equipment.write") && <Tile n={listings} l="Published equipment listings" href="/admin/equipment-listings" />}{can(a, "events.write") && <><Tile n={events} l="Published events" href="/admin/events" /><Tile n={regs} l="Event & volunteer registrations" href="/admin/event-registrations" /></>}</div></div>);
}
