import { meta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import FormBox from "@/components/FormBox";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return meta("/equipment/supplier", "Supplier registration"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) { const sp = await searchParams; return (<><PageHead kicker="Equipment" title="Supplier registration" intro="Suppliers are listed publicly only after ORIVANA reviews and verifies them." /><div className="narrow py-10"><FormBox formKey="supplier_registration" ret="/equipment/supplier" sent={sp.sent} cta="Submit registration" /></div></>); }
