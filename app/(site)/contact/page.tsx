import { getSettings } from "@/lib/settings";
import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/contact", "Contact ORIVANA Health"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const s = await getSettings();
  return (<><PageHead kicker="Contact" title="Contact and support" intro="Write to us about healthcare access, assistance, partnerships, training or anything else. We reply as soon as we can." />
    <div className="wrap grid gap-8 py-10 md:grid-cols-3"><div className="md:col-span-2"><FormBox formKey="contact" ret="/contact" sent={sp.sent} cta="Send message" /></div>
      <aside className="card h-fit space-y-2 p-5 text-sm">{s.contact_email && <p><b>Email</b><br />{s.contact_email}</p>}{s.contact_phone && <p><b>Phone</b><br />{s.contact_phone}</p>}{s.contact_address && <p><b>Address</b><br />{s.contact_address}</p>}<p className="text-muted">This website is not for emergencies. Please contact your local emergency number if you need urgent help.</p></aside></div></>);
}
