import Link from "next/link";
import { db } from "@/lib/db";
import { meta, PARTNER_TYPES as TYPES } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/partners", "Healthcare partners"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const sp = await searchParams; let q = db().from("partners").select("id,slug,name,partner_type,city,state,country,summary,logo_url,photo_url,verification_status").eq("is_published", true).order("sort_order").order("name");
  if (sp.type && TYPES[sp.type]) q = q.eq("partner_type", sp.type); const { data } = await q; const rows = ((data || []) as any[]).filter((p) => !sp.q || (p.name + " " + (p.city || "")).toLowerCase().includes(sp.q.toLowerCase()));
  return (<><PageHead kicker="Partner network" title="Healthcare partners" intro="Hospitals, clinics, laboratories, educators, suppliers and community organisations collaborating with ORIVANA Health. The verification status of every partner is shown as recorded by ORIVANA." />
    <div className="wrap py-10"><div className="flex flex-wrap gap-2"><Link href="/partners" className={`badge ${!sp.type ? "" : "badge-grey"}`}>All</Link>{Object.entries(TYPES).map(([k, v]) => <Link key={k} href={`/partners?type=${k}`} className={`badge ${sp.type === k ? "" : "badge-grey"}`}>{v}</Link>)}</div>
      <form className="mt-4 flex max-w-md gap-2" role="search"><input name="q" defaultValue={sp.q || ""} className="input" aria-label="Search partners" />{sp.type && <input type="hidden" name="type" value={sp.type} />}<button className="btn btn-dark">Search</button></form>
      {rows.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.map((p) => (<Link key={p.id} href={`/partners/${p.slug}`} className="card card-hover overflow-hidden"><Slot src={p.logo_url || p.photo_url} icon="shield" label={p.logo_url || p.photo_url ? undefined : TYPES[p.partner_type]} className="aspect-[16/9] !rounded-none" light /><div className="p-4"><span className={`badge ${p.verification_status === "verified" ? "badge-green" : "badge-grey"}`}>{p.verification_status === "verified" ? "Verified" : "Verification pending"}</span><h2 className="mt-2 text-lg">{p.name}</h2><p className="text-sm text-muted">{[p.city, p.state, p.country].filter(Boolean).join(", ")}</p></div></Link>))}</div>
        : <div className="card mt-6 p-6"><p className="text-muted">Verified partners will appear in this directory as ORIVANA completes their verification. If you represent a healthcare organisation, you can apply to partner with us.</p><Link href="/partners/apply" className="btn btn-dark mt-4">Partnership application</Link></div>}</div></>);
}
