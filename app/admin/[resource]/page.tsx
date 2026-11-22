import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { RESOURCES } from "@/lib/adminConfig";
import { moveRow, toggleVisible } from "../actions";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  const { resource } = await params; const r = RESOURCES[resource]; if (!r) notFound(); await requirePerm(r.perm); const sp = await searchParams; const pk = r.pk || "id";
  const { data, error } = await db().from(r.table).select("*").order(r.order || "created_at", { ascending: !r.desc }).limit(500); const rows: any[] = data || [];
  const show = (v: any) => (v === true ? "Yes" : v === false ? "No" : v && typeof v === "object" ? JSON.stringify(v).slice(0, 60) : /^\d{4}-\d\d-\d\dT/.test(String(v)) ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : String(v ?? "").slice(0, 60));
  return (<div><div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl">{r.title}</h1><div className="flex gap-2">{r.csv && <a href={`/admin/export/${r.key}`} className="btn btn-line">Download CSV</a>}{!r.noCreate && <Link href={`/admin/${r.key}/new`} className="btn btn-dark">+ Add new</Link>}</div></div>
    {sp.ok && <p className="mt-3 bg-green-50 p-2 text-green-800">Saved.</p>}{(sp.e || error) && <p className="mt-3 bg-red-50 p-2 text-red-800">{sp.e || error?.message}</p>}
    <div className="card mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr>{r.cols.map((c) => <th key={c} className="p-3 capitalize">{c.replace(/_/g, " ")}</th>)}<th className="p-3" /></tr></thead>
      <tbody>{rows.map((row, i) => (<tr key={row[pk]} className="border-t border-line">{r.cols.map((c) => <td key={c} className="p-3">{show(row[c])}{row.is_sample && c === r.cols[0] && <span className="badge ml-2">SAMPLE</span>}</td>)}
        <td className="flex flex-wrap items-center justify-end gap-2 p-3">{r.sortable && <><form action={moveRow}><input type="hidden" name="resource" value={r.key} /><input type="hidden" name="id" value={row[pk]} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} className="px-2 disabled:opacity-30" aria-label="Move up">▲</button></form><form action={moveRow}><input type="hidden" name="resource" value={r.key} /><input type="hidden" name="id" value={row[pk]} /><input type="hidden" name="dir" value="down" /><button disabled={i === rows.length - 1} className="px-2 disabled:opacity-30" aria-label="Move down">▼</button></form></>}
          {r.visibleField && <form action={toggleVisible}><input type="hidden" name="resource" value={r.key} /><input type="hidden" name="id" value={row[pk]} /><button className="underline">{row[r.visibleField] ? "Hide" : "Show"}</button></form>}<Link href={`/admin/${r.key}/${row[pk]}`} className="underline">Edit</Link></td></tr>))}
        {!rows.length && <tr><td colSpan={r.cols.length + 1} className="p-6 text-center text-muted">Nothing here yet.</td></tr>}</tbody></table></div></div>);
}
