import Link from "next/link";
import { db } from "@/lib/db";
import { getAdmin, can, requirePerm } from "@/lib/auth";
import { markNotifications } from "../ops";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("notifications.read"); const a = await getAdmin();
  const { data } = await db().from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = ((data || []) as any[]).filter((n) => !n.permission || can(a, n.permission));
  return (<div className="max-w-3xl"><div className="flex items-center justify-between"><h1 className="text-3xl">Notifications</h1><form action={markNotifications}><input type="hidden" name="id" value="" /><button className="btn btn-line">Mark all as read</button></form></div>
    <ul className="card mt-4 divide-y divide-line">{rows.map((n) => (<li key={n.id} className={`flex items-start justify-between gap-3 p-4 ${n.is_read ? "" : "bg-mint/50"}`}><div><p className="text-xs text-muted">{new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {n.kind}</p><p className="font-semibold text-navy">{n.link ? <Link className="underline" href={n.link}>{n.title}</Link> : n.title}</p>{n.body && <p className="text-sm text-muted">{n.body}</p>}</div>{!n.is_read && <form action={markNotifications}><input type="hidden" name="id" value={n.id} /><button className="text-sm underline">Mark read</button></form>}</li>))}{!rows.length && <li className="p-6 text-center text-muted">No notifications.</li>}</ul></div>);
}
