import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
import Slot from "@/components/Slot";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { data } = await db().from("partners").select("name,summary").eq("slug", slug).eq("is_published", true).maybeSingle(); return meta(`/partners/${slug}`, data?.name || "Partner", data?.summary); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const { data: p } = await db().from("partners").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!p) notFound();
  const { data: ls } = await db().from("partner_specialties").select("specialty_id").eq("partner_id", p.id); const ids = (ls || []).map((x: any) => x.specialty_id); const { data: sp2 } = ids.length ? await db().from("specialties").select("name,slug").in("id", ids) : { data: [] as any[] };
  const v = p.verification_status === "verified";
  return (<><PageHead kicker="Healthcare partner" title={p.name} intro={p.summary} /><div className="wrap grid gap-8 py-10 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Slot src={p.photo_url || p.logo_url} icon="shield" label={p.name} className="aspect-[16/7]" light />
    <p><span className={`badge ${v ? "badge-green" : "badge-grey"}`}>{v ? "Verified partner" : "Verification pending: details are as supplied and not yet confirmed by ORIVANA"}</span></p>
    {p.description && <div className="prose-oh" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description) }} />}
    {(sp2 || []).length > 0 && <div><h2 className="text-xl">Specialties</h2><div className="mt-2 flex flex-wrap gap-2">{(sp2 as any[]).map((s) => <Link key={s.slug} className="badge badge-green" href={`/healthcare/${s.slug}`}>{s.name}</Link>)}</div></div>}
    <div className="card p-4 text-sm">{[p.city, p.state, p.country].filter(Boolean).join(", ") && <p><b>Location:</b> {[p.city, p.state, p.country].filter(Boolean).join(", ")}</p>}{p.website && <p><b>Website:</b> <a className="underline" rel="noopener noreferrer" target="_blank" href={p.website}>{p.website}</a></p>}{v && p.email && <p><b>Email:</b> {p.email}</p>}{v && p.phone && <p><b>Phone:</b> {p.phone}</p>}</div></div>
    <aside><FormBox formKey="general_enquiry" ret={`/partners/${slug}`} sent={sp.sent} prefill={{ message: `Enquiry about ${p.name}: ` }} cta="Send enquiry" /></aside></div></>);
}
