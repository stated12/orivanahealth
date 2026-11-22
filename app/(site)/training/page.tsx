import Link from "next/link";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/training", "Medical training and healthcare education"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; format?: string; q?: string; sent?: string }> }) {
  const sp = await searchParams; const [cats, cs, tr] = await Promise.all([db().from("course_categories").select("id,name,slug").eq("is_active", true).order("sort_order"), db().from("courses").select("*").eq("is_published", true).order("sort_order"), db().from("trainers").select("id,name,slug,designation,organisation,photo_url").eq("is_published", true).order("name")]);
  const categories = (cats.data || []) as any[]; const cat = categories.find((c) => c.slug === sp.category);
  const list = ((cs.data || []) as any[]).filter((c) => (!cat || c.category_id === cat.id) && (!sp.format || c.format === sp.format) && (!sp.q || (c.title + " " + (c.summary || "")).toLowerCase().includes(sp.q.toLowerCase())));
  const fm = ["course", "programme", "workshop", "webinar", "institutional"];
  return (<><PageHead kicker="Medical training" title="Healthcare education and training" intro="Courses, programmes, workshops and webinars with modules, video and document lessons, quizzes and progress tracking. Learning here supports general healthcare education and does not by itself confer a professional qualification or accreditation." />
    <div className="wrap py-10"><div className="flex flex-wrap gap-2"><Link href="/training" className={`badge ${!cat ? "" : "badge-grey"}`}>All categories</Link>{categories.map((c) => <Link key={c.id} href={`/training?category=${c.slug}`} className={`badge ${cat?.id === c.id ? "" : "badge-grey"}`}>{c.name}</Link>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">{fm.map((f) => <Link key={f} href={`/training?format=${f}${cat ? "&category=" + cat.slug : ""}`} className={`badge ${sp.format === f ? "" : "badge-grey"}`}>{f}</Link>)}</div>
      {list.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((c) => (<Link key={c.id} href={`/training/${c.slug}`} className="card card-hover overflow-hidden"><Slot src={c.cover_url} icon="book" className="aspect-[16/9] !rounded-none" /><div className="p-4"><span className="badge badge-green">{c.format}</span><h2 className="mt-2 text-lg">{c.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>{c.duration && <p className="mt-2 text-xs text-muted">{c.duration}</p>}</div></Link>))}</div>
        : <div className="card mt-6 p-6"><h2 className="text-xl">Training programmes</h2><p className="mt-2 text-muted">Courses and programmes appear in this catalogue as ORIVANA publishes them. Tell us what you are looking for, or ask about institutional training, using the form below.</p></div>}
      {(tr.data || []).length > 0 && <section className="mt-12"><h2 className="text-2xl">Trainers</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(tr.data as any[]).map((t) => (<div key={t.id} className="card flex gap-3 p-4"><Slot src={t.photo_url} icon="users" className="h-16 w-16 shrink-0 !rounded-xl" /><div><h3 className="text-base">{t.name}</h3><p className="text-sm text-muted">{[t.designation, t.organisation].filter(Boolean).join(", ")}</p></div></div>))}</div></section>}
      <div className="mt-12 max-w-2xl"><FormBox formKey="training_enquiry" ret="/training" sent={sp.sent} cta="Send training enquiry" /></div></div></>);
}
