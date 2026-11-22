import { forgot } from "@/app/actions";
export const metadata = { title: "Forgot password", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; return (<div className="narrow max-w-md py-14"><h1 className="text-4xl">Reset password</h1><form action={forgot} className="card mt-5 space-y-3 p-5">{sp.sent && <p className="text-green-800">If this email is registered, a reset link has been sent.</p>}<div><label className="label">Email</label><input name="email" type="email" required className="input" /></div><button className="btn btn-dark w-full">Send reset link</button></form></div>);
}
