import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import PageHead from "@/components/PageHead";
export const dynamic = "force-dynamic"; export const metadata = { title: "Acknowledgement", robots: { index: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ code?: string }> }) {
  const { ref } = await params; const sp = await searchParams; const { data: d } = await db().from("donations").select("*").eq("donation_ref", ref).maybeSingle(); if (!d || d.receipt_code !== sp.code) notFound();
  const s = await getSettings();
  return (<><PageHead kicker="Acknowledgement" title="Thank you for your contribution" /><div className="narrow py-10"><div className="card space-y-2 p-6"><p><b>Reference:</b> {d.donation_ref}</p><p><b>Amount:</b> ₹{Number(d.amount).toLocaleString("en-IN")}</p><p><b>Status:</b> {d.status}</p><p><b>Date:</b> {new Date(d.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>{!d.is_anonymous && d.donor_name && <p><b>Name:</b> {d.donor_name}</p>}{s.receipt_note && <p className="text-sm text-muted">{s.receipt_note}</p>}<p className="text-xs text-muted">This is an acknowledgement of a recorded contribution. It is not a tax receipt unless ORIVANA has stated otherwise on the Donate page.</p></div></div></>);
}
