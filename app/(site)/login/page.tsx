import Link from "next/link";
import { login } from "@/app/actions";
export const metadata = { title: "Sign in", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; r?: string; u?: string; next?: string }> }) {
  const sp = await searchParams;
  return (<div className="narrow max-w-md py-14"><h1 className="text-4xl">Sign in</h1><form action={login} className="card mt-5 space-y-3 p-5"><input type="hidden" name="next" value={sp.next || ""} />{sp.r && <p className="text-green-800">Account created. Check your email if confirmation is required, then sign in.</p>}{sp.u && <p className="text-green-800">Password updated.</p>}{sp.e && <p className="text-red-700">{sp.e === "rate" ? "Too many attempts." : "Email or password is incorrect."}</p>}
    <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div><div><label className="label">Password</label><input name="password" type="password" required className="input" /></div><button className="btn btn-dark w-full">Sign in</button><p className="flex justify-between text-sm"><Link className="underline" href="/forgot-password">Forgot password?</Link><Link className="underline" href="/register">Create account</Link></p></form></div>);
}
