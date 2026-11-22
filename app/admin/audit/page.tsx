import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("audit.read"); const { data } = await db().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300);
  return (<div><h1 className="text-3xl">Activity log</h1><p className="text-sm text-muted">Latest 300 admin actions.</p><div className="card mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">When</th><th>Who</th><th>Action</th><th>Resource</th></tr></thead><tbody>{(data || []).map((l: any) => <tr key={l.id} className="border-t border-line"><td className="p-3">{new Date(l.created_at).toLocaleString("en-IN")}</td><td>{l.user_email}</td><td>{l.action}</td><td>{l.resource} {l.resource_id ? String(l.resource_id).slice(0, 8) : ""}</td></tr>)}</tbody></table></div></div>);
}
