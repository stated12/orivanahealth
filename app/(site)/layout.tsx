import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const org = { "@context": "https://schema.org", "@type": "Organization", name: s.brand_name || "ORIVANA Health", parentOrganization: { "@type": "Organization", name: "ORIVANA Global Foundation" }, url: SITE_URL };
  return (<><JsonLd data={org} /><Header /><main id="main" className="min-h-[60vh]">{children}</main><Footer /></>);
}
