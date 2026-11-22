import Link from "next/link";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/medical-tourism", "Medical tourism and international patient services"); }
export default async function Page() {
  const img = await getSettings();
  const [st, sv, pr] = await Promise.all([db().from("journey_steps").select("*").eq("is_published", true).order("sort_order"), db().from("tourism_services").select("*").eq("is_published", true).order("sort_order"), db().from("partners").select("id,name,slug,city,verification_status").eq("is_published", true).eq("partner_type", "medical_tourism_provider").limit(6)]);
  return (<><PageHead dark kicker="Medical tourism" title="Explore healthcare in India through a coordinated patient journey." intro="ORIVANA Health supports international patients seeking treatment from verified participating healthcare providers. We coordinate; providers make every medical decision."><div className="mt-6 flex gap-3"><Link href="/medical-tourism/enquiry" className="btn btn-gold">Send an enquiry</Link><Link href="/care/track" className="btn btn-light">Track my enquiry</Link></div></PageHead>
    <div className="wrap py-12"><h2 className="text-3xl">The patient journey</h2><ol className="mt-5 grid gap-3 md:grid-cols-2 [counter-reset:st]">{((st.data || []) as any[]).map((x) => (<li key={x.id} className="step card flex items-center gap-3 p-4"><span className="font-semibold text-navy">{x.title}</span></li>))}</ol>
      <h2 className="mt-12 text-3xl">International patient assistance services</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{((sv.data || []) as any[]).map((x) => (<div key={x.id} className="card p-4"><h3 className="text-lg">{x.name}</h3>{x.description && <p className="mt-1 text-sm text-muted">{x.description}</p>}</div>))}</div>
      {(pr.data || []).length > 0 && <><h2 className="mt-12 text-2xl">Participating service providers</h2><div className="mt-3 flex flex-wrap gap-3">{(pr.data as any[]).map((p) => <Link key={p.id} href={`/partners/${p.slug}`} className="card card-hover px-4 py-3 text-sm">{p.name} <span className="badge badge-green ml-2">{p.verification_status === "verified" ? "Verified" : "Pending"}</span></Link>)}</div></>}
      <div className="mt-12 grid items-center gap-6 md:grid-cols-2"><Slot src={img.img_tourism_page} file="/images/tourism-page.jpg" icon="plane" label="International patient support" className="aspect-[16/9]" /><div className="rounded-xl bg-soft p-5 text-sm text-muted"><p><b>Please note.</b> ORIVANA Health does not provide immigration advice and cannot guarantee visas, hospital admission, travel arrangements or any treatment or outcome. We do not publish success rates. Only verified partner institutions and actual services are represented.</p></div></div></div></>);
}
