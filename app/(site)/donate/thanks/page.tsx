import Link from "next/link";
import { db } from "@/lib/db";
import PageHead from "@/components/PageHead";
export const dynamic = "force-dynamic"; export const metadata = { title: "Thank you", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string; code?: string }> }) {
  const sp = await searchParams; const { data: d } = sp.ref ? await db().from("donations").select("donation_ref,status,receipt_code,amount").eq("donation_ref", sp.ref).maybeSingle() : { data: null };
  const ok = d && d.receipt_code === sp.code;
  return (<><PageHead kicker="Thank you" title="Thank you for wanting to help" /><div className="narrow space-y-4 py-10"><div className="card p-6">{ok ? <><p className="text-sm text-muted">Reference</p><p className="font-serif text-2xl text-navy">{d.donation_ref}</p><p className="mt-3">{d.status === "intent" ? "We have recorded your expression of support. Online payments are not active, so no payment has been taken. Our team will contact you with the correct way to contribute when contributions are open." : "Your contribution status is: " + d.status + "."}</p></> : <p>We have recorded your request.</p>}</div><Link href="/donate" className="btn btn-dark">Back to Donate for the Needy</Link></div></>);
}
