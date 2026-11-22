import Link from "next/link";
import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
export const dynamic = "force-dynamic";
const PER = 25;
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string; status?: string; q?: string; page?: string; ok?: string }> }) {
  await requirePerm("cases.read"); const sp = await searchParams; const kind = sp.kind === "tourism" ? "tourism" : "assistance"; const page = Math.max(1, Number(sp.page) || 1);
  let q = db().from("cases").select("id,case_ref,applicant_name,patient_name,country,status,verified,public_state,coordinator_name,created_at,specialty", { count: "exact" }).eq("kind", kind).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  if (sp.status) q = q.eq("status", sp.status); if (sp.q) { const t = sp.q.replace(/[%,()]/g, " ").trim(); if (t) q = q.or(`case_ref.ilike.%${t}%,applicant_name.ilike.%${t}%,patient_name.ilike.%${t}%,email.ilike.%${t}%`); }
  const [{ data, count }, st] = await Promise.all([q, db().from("case_statuses").select("key,label").order("sort_order")]); const lab = new Map(((st.data || []) as any[]).map((x) => [x.key, x.label])); const pages = Math.max(1, Math.ceil((count || 0) / PER));
  const qs = (p: number) => `?kind=${kind}${sp.status ? "&status=" + sp.status : ""}${sp.q ? "&q=" + encodeURIComponent(sp.q) : ""}&page=${p}`;
  return (<div><h1 className="text-3xl">{kind === "tourism" ? "Medical tourism enquiries" : "Medical assistance cases"}</h1>
    <form className="mt-4 flex flex-wrap gap-2"><input type="hidden" name="kind" value={kind} /><input name="q" defaultValue={sp.q || ""} className="input max-w-xs" aria-label="Search" /><select name="status" defaultValue={sp.status || ""} className="input max-w-xs" aria-label="Status"><option value="">All statuses</option>{((st.data || []) as any[]).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select><button className="btn btn-dark">Filter</button></form>
    <div className="card mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Case ID</th><th>Applicant</th><th>{kind === "tourism" ? "Country / specialty" : "Patient"}</th><th>Status</th><th>Verified</th><th>Public</th><th>Coordinator</th><th>Received</th></tr></thead><tbody>
      {((data || []) as any[]).map((c) => (<tr key={c.id} className="border-t border-line"><td className="p-3"><Link className="font-semibold underline" href={`/admin/cases/${c.id}`}>{c.case_ref}</Link></td><td>{c.applicant_name}</td><td>{kind === "tourism" ? [c.country, c.specialty].filter(Boolean).join(" · ") : c.patient_name}</td><td>{lab.get(c.status) || c.status}</td><td>{c.verified ? "Yes" : "No"}</td><td>{c.public_state}</td><td>{c.coordinator_name || "—"}</td><td>{new Date(c.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td></tr>))}
      {!(data || []).length && <tr><td colSpan={8} className="p-6 text-center text-muted">Nothing here yet.</td></tr>}</tbody></table></div>
    <div className="mt-4 flex items-center gap-3 text-sm"><span className="text-muted">{count || 0} records · page {page} of {pages}</span>{page > 1 && <Link className="underline" href={qs(page - 1)}>Previous</Link>}{page < pages && <Link className="underline" href={qs(page + 1)}>Next</Link>}<a className="ml-auto underline" href={`/admin/export/cases?kind=${kind}`}>Download CSV</a></div></div>);
}
