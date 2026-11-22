import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PageHead from "@/components/PageHead";
import PayButton from "./PayButton";
export const dynamic = "force-dynamic"; export const metadata = { title: "Secure payment", robots: { index: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ code?: string }> }) {
  const { ref } = await params; const sp = await searchParams; const { data: d } = await db().from("donations").select("*").eq("donation_ref", ref).maybeSingle();
  if (!d || d.receipt_code !== sp.code || !d.provider_order_id || !process.env.RAZORPAY_KEY_ID) notFound();
  return (<><PageHead kicker="Secure payment" title={`Contribution ₹${Number(d.amount).toLocaleString("en-IN")}`} intro="You will complete the payment on the payment provider's secure window. ORIVANA does not see or store your card details." /><div className="narrow py-10"><PayButton keyId={process.env.RAZORPAY_KEY_ID} orderId={d.provider_order_id} amount={Math.round(Number(d.amount) * 100)} donationRef={d.donation_ref} code={d.receipt_code} name={d.donor_name || ""} email={d.donor_email || ""} /></div></>);
}
