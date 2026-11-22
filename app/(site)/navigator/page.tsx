import Link from "next/link";
import { db } from "@/lib/db";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Icon from "@/components/Icon";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/navigator", "Health Navigator"); }
export default async function Page() {
  const { data } = await db().from("navigator_options").select("*").eq("is_active", true).order("sort_order");
  return (<><PageHead kicker="Health Navigator" title="What do you need help with?" intro="Choose the option that fits. We will take you to the right ORIVANA Health page or form. The Navigator helps with administrative routing only: it does not diagnose, prescribe or recommend treatment." />
    <div className="wrap py-10"><div className="grid gap-3 md:grid-cols-2">{((data || []) as any[]).map((o) => (<Link key={o.id} href={o.href} className="card card-hover flex items-center gap-4 p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark"><Icon name="compass" /></span><span><span className="block font-serif text-lg text-navy">{o.label}</span><span className="block text-sm text-muted">{o.description}</span></span></Link>))}</div>
      <p className="mt-8 rounded-xl bg-soft p-4 text-sm text-muted">ORIVANA Health is not a substitute for professional medical advice or emergency care. If you think you are having a medical emergency, contact your local emergency number or go to the nearest emergency department now.</p></div></>);
}
