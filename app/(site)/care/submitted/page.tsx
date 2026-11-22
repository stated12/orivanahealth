import Link from "next/link";
import PageHead from "@/components/PageHead";
export const metadata = { title: "Request received", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string; code?: string; kind?: string; skipped?: string }> }) {
  const sp = await searchParams;
  return (<><PageHead kicker="Thank you" title="We have received your request" /><div className="narrow space-y-4 py-10"><div className="card p-6"><p className="text-sm text-muted">Your case ID</p><p className="font-serif text-3xl text-navy">{sp.ref}</p><p className="mt-3 text-sm text-muted">Your private access code</p><p className="font-mono text-2xl tracking-widest text-navy">{sp.code}</p><p className="mt-3 text-sm">Write these down. You need both to follow your case. We also email them to you if email is configured.</p></div>
    {sp.skipped && <p className="rounded-lg bg-yellow-50 p-3 text-sm">{sp.skipped} document(s) could not be uploaded (type or size). You can add them from the tracking page.</p>}
    <p className="text-sm text-muted">This does not guarantee treatment, assistance or any outcome. A coordinator will review your request.</p><Link href={`/care/track/${sp.ref}`} className="btn btn-dark">Open my case</Link></div></>);
}
