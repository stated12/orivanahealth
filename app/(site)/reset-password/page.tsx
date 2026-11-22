import { resetPassword } from "@/app/actions";
export const metadata = { title: "Reset password", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams; return (<div className="narrow max-w-md py-14"><h1 className="text-4xl">New password</h1><form action={resetPassword} className="card mt-5 space-y-3 p-5">{sp.e && <p className="text-red-700">Could not update the password.</p>}<div><label className="label">New password (8+)</label><input name="password" type="password" minLength={8} required className="input" /></div><button className="btn btn-dark w-full">Save</button></form></div>);
}
