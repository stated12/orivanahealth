import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { registerEvent } from "@/app/actions";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { data } = await db().from("events").select("title,summary").eq("slug", slug).eq("is_published", true).maybeSingle(); return meta(`/community/${slug}`, data?.title || "Event", data?.summary); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const { data: e } = await db().from("events").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!e) notFound();
  return (<><PageHead kicker={e.kind} title={e.title} intro={e.summary} /><div className="wrap grid gap-8 py-10 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Slot src={e.photo_url} icon="users" label={e.title} className="aspect-[16/8]" />{e.description && <div className="prose-oh" dangerouslySetInnerHTML={{ __html: sanitizeHtml(e.description) }} />}</div>
    <aside className="space-y-4"><div className="card p-5 text-sm">{e.starts_at && <p><b>When:</b> {new Date(e.starts_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>}{e.location && <p><b>Where:</b> {e.location}</p>}</div>
      {e.registration_open && <form action={registerEvent} id="register" className="card space-y-3 p-5"><h2 className="text-xl">Register</h2><input type="hidden" name="event_id" value={e.id} /><input type="hidden" name="ret" value={`/community/${slug}`} /><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />{sp.sent === "ok" && <p className="rounded-lg bg-green-50 p-3 text-green-900">Thank you. You are registered.</p>}{sp.sent === "err" && <p className="rounded-lg bg-red-50 p-3 text-red-800">Please check your details.</p>}
        <div><label className="label" htmlFor="name">Name *</label><input id="name" name="name" required className="input" /></div><div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" /></div><div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="input" /></div>
        <select name="reg_type" className="input" aria-label="Registering as"><option value="attendee">Attendee</option><option value="volunteer">Volunteer</option></select><label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" required className="mt-1 h-4 w-4" /><span>I agree to be contacted about this event. *</span></label><button className="btn btn-dark">Register</button></form>}</aside></div></>);
}
