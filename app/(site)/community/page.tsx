import Link from "next/link";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/community", "Community health and prevention"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string; sent?: string }> }) {
  const sp = await searchParams; const [ev, rp] = await Promise.all([db().from("events").select("*").eq("is_published", true).order("starts_at", { ascending: false }), db().from("community_reports").select("id,title,body").eq("is_published", true).order("created_at", { ascending: false }).limit(5)]);
  const list = ((ev.data || []) as any[]).filter((e) => !sp.kind || e.kind === sp.kind); const kinds = Array.from(new Set(((ev.data || []) as any[]).map((e) => e.kind)));
  return (<><PageHead kicker="Community health" title="Awareness, prevention and community programmes" intro="Health awareness, preventive campaigns, education and community events, organised with community partners and volunteers. Services such as screening are described only where confirmed for a specific programme." />
    <div className="wrap py-10">{kinds.length > 0 && <div className="mb-5 flex flex-wrap gap-2"><Link href="/community" className={`badge ${!sp.kind ? "" : "badge-grey"}`}>All</Link>{kinds.map((k) => <Link key={k} href={`/community?kind=${k}`} className={`badge ${sp.kind === k ? "" : "badge-grey"}`}>{k}</Link>)}</div>}
      {list.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((e) => (<Link key={e.id} href={`/community/${e.slug}`} className="card card-hover overflow-hidden"><Slot src={e.photo_url} icon="users" className="aspect-[16/9] !rounded-none" /><div className="p-4"><span className="badge badge-green">{e.kind}</span><h2 className="mt-2 text-lg">{e.title}</h2>{e.starts_at && <p className="text-xs text-muted">{new Date(e.starts_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>}{e.location && <p className="text-xs text-muted">{e.location}</p>}<p className="mt-1 line-clamp-2 text-sm text-muted">{e.summary}</p></div></Link>))}</div> : <div className="card p-6"><p className="text-muted">Programmes and events are published here as they are organised. You can register as a volunteer or onboard your community organisation now.</p></div>}
      {(rp.data || []).length > 0 && <section className="mt-12"><h2 className="text-2xl">Programme reports</h2><div className="mt-3 space-y-3">{(rp.data as any[]).map((r) => <details key={r.id} className="card p-4"><summary className="cursor-pointer font-semibold text-navy">{r.title}</summary><div className="prose-oh mt-2" dangerouslySetInnerHTML={{ __html: r.body || "" }} /></details>)}</div></section>}
      <div className="mt-12 grid gap-6 lg:grid-cols-2"><FormBox formKey="volunteer_registration" ret="/community" sent={sp.sent} cta="Register as volunteer" /><FormBox formKey="community_partner" ret="/community" sent={sp.sent} cta="Submit" /></div></div></>);
}
