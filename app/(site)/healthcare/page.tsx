import Link from "next/link";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/healthcare", "Find healthcare"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; sent?: string }> }) {
  const sp = await searchParams; const q = (sp.q || "").trim().toLowerCase();
  const [g, s] = await Promise.all([db().from("specialty_groups").select("id,name,slug").eq("is_active", true).order("sort_order"), db().from("specialties").select("id,name,slug,summary,group_id").eq("is_published", true).order("sort_order")]);
  const specs = ((s.data || []) as any[]).filter((x) => !q || x.name.toLowerCase().includes(q) || (x.summary || "").toLowerCase().includes(q));
  return (<><PageHead kicker="Healthcare access" title="Find healthcare" intro="Browse specialties to understand what each area covers and how to reach participating providers. ORIVANA Health helps with the administrative next step; it does not diagnose or recommend treatment." />
    <div className="wrap py-10"><form className="flex max-w-xl gap-2" role="search"><input name="q" defaultValue={sp.q || ""} className="input" aria-label="Search specialties" /><button className="btn btn-dark">Search</button></form>
      <div className="mt-8 space-y-10">{((g.data || []) as any[]).map((gr) => { const list = specs.filter((x) => x.group_id === gr.id); if (!list.length) return null; return (<section key={gr.id}><h2 className="text-2xl">{gr.name}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((x) => (<Link key={x.id} href={`/healthcare/${x.slug}`} className="card card-hover p-4"><h3 className="text-lg">{x.name}</h3><p className="mt-1 line-clamp-3 text-sm text-muted">{x.summary}</p></Link>))}</div></section>); })}
        {!specs.length && <p className="text-muted">No specialty matches your search. Try another word, or tell us what you need below.</p>}</div>
      <div className="mt-12 max-w-2xl"><FormBox formKey="healthcare_enquiry" ret="/healthcare" sent={sp.sent} cta="Send enquiry" /></div></div></>);
}
