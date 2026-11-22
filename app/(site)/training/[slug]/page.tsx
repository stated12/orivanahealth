import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { currentUser } from "@/lib/supabase-server";
import { enrol } from "@/app/training-actions";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { data } = await db().from("courses").select("title,summary").eq("slug", slug).eq("is_published", true).maybeSingle(); return meta(`/training/${slug}`, data?.title || "Course", data?.summary); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ e?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const { data: c } = await db().from("courses").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!c) notFound();
  const u = await currentUser(); const [mods, ls, tr, en] = await Promise.all([db().from("course_modules").select("*").eq("course_id", c.id).order("sort_order"), db().from("lessons").select("id,title,module_id,lesson_type,sort_order").eq("course_id", c.id).eq("is_published", true).order("sort_order"), c.trainer_id ? db().from("trainers").select("*").eq("id", c.trainer_id).maybeSingle() : { data: null }, u ? db().from("enrollments").select("id").eq("course_id", c.id).eq("user_id", u.id).maybeSingle() : { data: null }]);
  const lessons = (ls.data || []) as any[]; const modules = (mods.data || []) as any[];
  return (<><PageHead kicker={c.format} title={c.title} intro={c.summary} />
    <div className="wrap grid gap-8 py-10 lg:grid-cols-3"><div className="space-y-8 lg:col-span-2"><Slot src={c.cover_url} icon="book" label={c.title} className="aspect-[16/7]" />{c.description && <div className="prose-oh" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.description) }} />}
      <section><h2 className="text-2xl">Course content</h2>{lessons.length ? <div className="mt-3 space-y-3">{[...modules, { id: null, title: modules.length ? "Other lessons" : "Lessons" }].map((m: any) => { const ml = lessons.filter((l) => (l.module_id || null) === m.id); if (!ml.length) return null; return (<div key={m.id || "x"} className="card p-4"><h3 className="text-lg">{m.title}</h3><ul className="mt-2 space-y-1 text-sm text-muted">{ml.map((l) => <li key={l.id}>{l.title} <span className="badge badge-grey ml-1">{l.lesson_type}</span></li>)}</ul></div>); })}</div> : <p className="mt-2 text-sm text-muted">Lessons for this programme are added by ORIVANA. Register to be kept informed.</p>}</section></div>
      <aside className="space-y-4"><div className="card p-5">{sp.e === "closed" && <p className="mb-3 rounded-lg bg-yellow-50 p-3 text-sm">Registration is closed for this programme.</p>}
        <dl className="space-y-1 text-sm">{c.level && <div className="flex justify-between"><dt className="text-muted">Level</dt><dd>{c.level}</dd></div>}{c.duration && <div className="flex justify-between"><dt className="text-muted">Duration</dt><dd>{c.duration}</dd></div>}{c.starts_at && <div className="flex justify-between"><dt className="text-muted">Starts</dt><dd>{new Date(c.starts_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</dd></div>}{c.certificate_enabled && <div className="flex justify-between"><dt className="text-muted">Certificate</dt><dd>Of completion</dd></div>}</dl>
        {en.data ? <Link href={`/learn/${slug}`} className="btn btn-dark mt-4 w-full">Continue learning</Link> : c.registration_open ? <form action={enrol} className="mt-4"><input type="hidden" name="slug" value={slug} /><button className="btn btn-dark w-full">{u ? "Register for this programme" : "Sign in to register"}</button></form> : <p className="mt-4 text-sm text-muted">Registration is closed.</p>}</div>
        {tr.data && <div className="card flex gap-3 p-4"><Slot src={tr.data.photo_url} icon="users" className="h-16 w-16 shrink-0 !rounded-xl" /><div><p className="text-xs text-muted">Trainer</p><h3 className="text-base">{tr.data.name}</h3><p className="text-sm text-muted">{[tr.data.designation, tr.data.organisation].filter(Boolean).join(", ")}</p></div></div>}
        <p className="text-xs text-muted">Learning materials support general healthcare education. Completion does not imply accreditation or a professional qualification.</p></aside></div></>);
}
