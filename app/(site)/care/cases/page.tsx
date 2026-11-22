import Link from "next/link";
import { db } from "@/lib/db";
import { meta, funding, rupees } from "@/lib/content";
import PageHead from "@/components/PageHead";
import DonateButton from "@/components/DonateButton";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/care/cases", "Verified assistance cases"); }
export default async function Page() {
  const { data } = await db().from("cases").select("id,public_slug,public_title,public_summary,public_state,case_ref,verified_goal").in("public_state", ["approved", "closed"]).order("public_approved_at", { ascending: false });
  const cards = await Promise.all(((data || []) as any[]).map(async (c) => ({ ...c, f: await funding(c.id) }))); const open = cards.filter((c) => c.public_state === "approved"), closed = cards.filter((c) => c.public_state === "closed");
  const Card = ({ c }: { c: any }) => (<Link href={`/care/cases/${c.public_slug}`} className="card card-hover block p-5"><p className="text-xs text-muted">{c.case_ref}</p><h2 className="mt-1 text-xl">{c.public_title}</h2><p className="mt-2 line-clamp-3 text-sm text-muted">{c.public_summary}</p>{c.f.goal != null && <div className="mt-4"><div className="bar"><i style={{ width: `${Math.min(100, Math.round((c.f.raised / Math.max(c.f.goal, 1)) * 100))}%` }} /></div><p className="mt-1 text-xs text-muted">{rupees(c.f.raised)} recorded of {rupees(c.f.goal)} verified requirement</p></div>}</Link>);
  return (<><PageHead kicker="Public assistance board" title="Verified medical assistance cases" intro="Only cases that have been verified, consented to by the patient or family, and approved by ORIVANA appear here. Private documents are never shown." />
    <div className="wrap py-10">{open.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{open.map((c) => <Card key={c.id} c={c} />)}</div> : <div className="card p-6"><p className="text-muted">There are no verified cases on the public board at the moment. Cases are published only after verification, consent and approval. You can still support the broader assistance initiative.</p><div className="mt-4"><DonateButton /></div></div>}
      {closed.length > 0 && <><h2 className="mt-12 text-2xl">Completed and closed cases</h2><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{closed.map((c) => <Card key={c.id} c={c} />)}</div></>}</div></>);
}
