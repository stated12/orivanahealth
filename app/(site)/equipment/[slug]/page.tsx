import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Slot from "@/components/Slot";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { data } = await db().from("equipment_listings").select("name").eq("slug", slug).eq("is_published", true).maybeSingle(); return meta(`/equipment/${slug}`, data?.name || "Equipment"); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const { data: l } = await db().from("equipment_listings").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!l) notFound();
  const { data: sup } = l.supplier_id ? await db().from("partners").select("name,slug,verification_status").eq("id", l.supplier_id).maybeSingle() : { data: null };
  return (<><PageHead kicker="Equipment" title={l.name} intro={l.manufacturer ? `Manufacturer: ${l.manufacturer}` : undefined} /><div className="wrap grid gap-8 py-10 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Slot src={l.image_url} icon="tool" label={l.name} className="aspect-[16/9]" light />{l.is_verified ? <span className="badge badge-green">Verified listing</span> : <span className="badge badge-grey">Not yet verified</span>}
    {l.description && <div className="prose-oh" dangerouslySetInnerHTML={{ __html: sanitizeHtml(l.description) }} />}{l.specifications && <div className="prose-oh"><h2>Specifications</h2><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(l.specifications) }} /></div>}
    <div className="card p-4 text-sm">{l.certifications && <p><b>Certifications:</b> {l.certifications}</p>}{l.availability && <p><b>Availability:</b> {l.availability}</p>}{sup && <p><b>Supplier:</b> {sup.name} ({sup.verification_status === "verified" ? "verified" : "verification pending"})</p>}</div></div>
    <aside><FormBox formKey="equipment_enquiry" ret={`/equipment/${slug}`} sent={sp.sent} prefill={{ equipment: l.name }} cta="Request information or quotation" /></aside></div></>);
}
