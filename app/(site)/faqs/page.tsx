import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/faqs", "Frequently asked questions"); }
export default async function Page() {
  const { data } = await db().from("faqs").select("*").eq("is_published", true).order("sort_order");
  return (<><PageHead kicker="Help" title="Frequently asked questions" /><div className="narrow py-10 space-y-3">{((data || []) as any[]).map((f) => (<details key={f.id} className="card p-4"><summary className="cursor-pointer font-semibold text-navy">{f.question}</summary><p className="mt-2 text-muted">{f.answer}</p></details>))}</div></>);
}
