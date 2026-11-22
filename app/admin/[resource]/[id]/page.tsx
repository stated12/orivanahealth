import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { RESOURCES } from "@/lib/adminConfig";
import AdminField from "@/components/AdminField";
import { saveResource, deleteResource } from "../../actions";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ e?: string; ok?: string }> }) {
  const { resource, id } = await params; const r = RESOURCES[resource]; if (!r) notFound(); await requirePerm(r.perm); const sp = await searchParams; const pk = r.pk || "id";
  let row: any = {};
  if (id !== "new") { const { data } = await db().from(r.table).select("*").eq(pk, id).maybeSingle(); if (!data) notFound(); row = data; } else for (const f of r.fields) if (f.type === "bool" && ["is_active","is_visible","registration_open","is_sample_never"].includes(f.name)) row[f.name] = true;
  const refs: Record<string, { value: string; label: string }[]> = {};
  for (const f of r.fields) if (f.refTable) { const lab = f.refLabel || "name"; const { data } = await db().from(f.refTable).select(`id,${lab}`).order(lab); refs[f.name] = (data || []).filter((x: any) => x.id !== id).map((x: any) => ({ value: x.id, label: x[lab] })); }
  return (<div className="max-w-3xl"><Link href={`/admin/${r.key}`} className="text-sm underline">← {r.title}</Link><h1 className="mt-2 text-3xl">{id === "new" ? "Add" : "Edit"}: {r.title}</h1>
    {sp.e && <p className="mt-3 bg-red-50 p-3 text-red-800">{sp.e}</p>}
    <form action={saveResource} className="card mt-4 space-y-4 p-5"><input type="hidden" name="resource" value={r.key} /><input type="hidden" name="id" value={id} />{r.fields.map((f) => <AdminField key={f.name} f={f} value={row[f.name]} refs={refs[f.name]} />)}<button className="btn btn-dark">Save</button></form>
    {id !== "new" && <form action={deleteResource} className="mt-4"><input type="hidden" name="resource" value={r.key} /><input type="hidden" name="id" value={id} /><button className="text-sm text-red-700 underline">Delete this item</button></form>}</div>);
}
