import { notFound } from "next/navigation";
import { getPage, meta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const p = await getPage(slug); return meta(`/page/${slug}`, p?.seo_title || p?.title || "Page", p?.seo_description); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await getPage(slug); if (!p) notFound();
  return (<><PageHead title={p.title} /><div className="narrow prose-oh py-10" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.body) }} /></>);
}
