import { trackLookup } from "@/app/actions";
import PageHead from "@/components/PageHead";
export const metadata = { title: "Track a case", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;
  return (<><PageHead kicker="Private case tracking" title="Track your case" intro="Enter the case ID and the private access code you received when you applied." /><div className="narrow py-10"><form action={trackLookup} className="card space-y-4 p-5">{sp.e === "bad" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">That case ID and access code do not match.</p>}{sp.e === "rate" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Too many attempts. Please wait and try again.</p>}
    <div><label className="label" htmlFor="ref">Case ID (for example ORC-2026-1001)</label><input id="ref" name="ref" required className="input" /></div><div><label className="label" htmlFor="code">Access code</label><input id="code" name="code" required className="input uppercase" /></div><button className="btn btn-dark">Open case</button></form></div></>);
}
