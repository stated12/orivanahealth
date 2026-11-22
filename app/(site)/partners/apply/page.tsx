import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/partners/apply", "Partner with ORIVANA Health"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  return (<><PageHead kicker="Partnerships" title="Partner with ORIVANA Health" intro="Hospitals, clinics, doctors, diagnostic centres, laboratories, rehabilitation providers, educators, equipment suppliers, medical tourism support providers, NGOs, community organisations, sponsors and volunteers can apply. Our team reviews and verifies every application before anything is listed publicly." />
    <div className="narrow py-10"><FormBox formKey="partner_application" ret="/partners/apply" sent={sp.sent} cta="Submit application" /></div></>);
}
