import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
import Slot from "@/components/Slot";
import Breadcrumbs from "@/components/Breadcrumbs";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { data } = await db().from("specialties").select("name,summary,seo_title,seo_description").eq("slug", slug).eq("is_published", true).maybeSingle(); return meta(`/healthcare/${slug}`, data?.seo_title || data?.name || "Specialty", data?.seo_description || data?.summary); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { slug } = await params; const sp = await searchParams;
  const { data: x } = await db().from("specialties").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!x) notFound();
  const [prov, links, courses] = await Promise.all([db().from("providers").select("id,name,slug,designation,photo_url,verification_status,partner_id").eq("specialty_id", x.id).eq("is_published", true).order("sort_order"), db().from("partner_specialties").select("partner_id").eq("specialty_id", x.id), db().from("courses").select("title,slug,format").eq("is_published", true).order("sort_order").limit(3)]);
  const pids = (links.data || []).map((l: any) => l.partner_id); const { data: partners } = pids.length ? await db().from("partners").select("id,name,slug,city,verification_status,photo_url,logo_url").in("id", pids).eq("is_published", true) : { data: [] as any[] };
  const pName = new Map(((partners || []) as any[]).map((p) => [p.id, p.name]));
  return (<><PageHead kicker="Specialty" title={x.name} intro={x.summary}><div className="mt-4"><Breadcrumbs items={[{ name: "Find healthcare", href: "/healthcare" }, { name: x.name }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-3"><div className="space-y-10 lg:col-span-2">
      <section className="prose-oh"><h2>Overview</h2><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(x.overview) }} />{x.addresses && <><h2>What it addresses</h2><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(x.addresses) }} /></>}{x.navigation_info && <><h2>Navigating care</h2><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(x.navigation_info) }} /></>}{x.educational_content && <><h2>Learn more</h2><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(x.educational_content) }} /></>}</section>
      <section><h2 className="text-2xl">Providers</h2>{(prov.data || []).length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{(prov.data as any[]).map((p) => (<div key={p.id} className="card flex gap-3 p-4"><Slot src={p.photo_url} icon="stetho" className="h-16 w-16 shrink-0 !rounded-xl" /><div><h3 className="text-base">{p.name}</h3>{p.designation && <p className="text-sm text-muted">{p.designation}</p>}{p.partner_id && pName.get(p.partner_id) && <p className="text-xs text-muted">{pName.get(p.partner_id)}</p>}<span className={`badge mt-1 ${p.verification_status === "verified" ? "badge-green" : "badge-grey"}`}>{p.verification_status === "verified" ? "Verified" : "Not yet verified"}</span></div></div>))}</div> : <p className="mt-2 text-sm text-muted">Providers are listed here once they have been added and verified by ORIVANA. Use the enquiry form and our team will help you reach a suitable provider.</p>}</section>
      <section><h2 className="text-2xl">Partner hospitals</h2>{(partners || []).length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{(partners as any[]).map((p) => (<Link key={p.id} href={`/partners/${p.slug}`} className="card card-hover flex gap-3 p-4"><Slot src={p.logo_url || p.photo_url} icon="shield" className="h-16 w-16 shrink-0 !rounded-xl" /><div><h3 className="text-base">{p.name}</h3><p className="text-sm text-muted">{p.city}</p><span className={`badge mt-1 ${p.verification_status === "verified" ? "badge-green" : "badge-grey"}`}>{p.verification_status === "verified" ? "Verified partner" : "Verification pending"}</span></div></Link>))}</div> : <p className="mt-2 text-sm text-muted">Partner hospitals for this specialty appear here after verification.</p>}</section>
      {(courses.data || []).length > 0 && <section><h2 className="text-2xl">Related training</h2><ul className="mt-2 space-y-1">{(courses.data as any[]).map((c) => <li key={c.slug}><Link className="text-green-dark underline" href={`/training/${c.slug}`}>{c.title}</Link></li>)}</ul></section>}
      <p className="rounded-xl bg-soft p-4 text-sm text-muted">This page is general information, not medical advice. A qualified, licensed doctor must assess your health. In an emergency, contact your local emergency number.</p></div>
      <aside><FormBox formKey="specialty_enquiry" ret={`/healthcare/${slug}`} sent={sp.sent} prefill={{ specialty: x.name }} cta="Send enquiry" /></aside></div></>);
}
