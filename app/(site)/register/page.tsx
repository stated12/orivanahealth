import Link from "next/link";
import { register } from "@/app/actions";
export const metadata = { title: "Create account", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;
  return (<div className="narrow max-w-md py-14"><h1 className="text-4xl">Create account</h1><form action={register} className="card mt-5 space-y-3 p-5">{sp.e && <p className="text-red-700">{sp.e === "rate" ? "Too many attempts." : "Please check your details (password 8+ characters)."}</p>}
    <div><label className="label">Full name</label><input name="name" required className="input" /></div><div><label className="label">Email</label><input name="email" type="email" required className="input" /></div><div><label className="label">Password (8+)</label><input name="password" type="password" minLength={8} required className="input" /></div><button className="btn btn-dark w-full">Create account</button><p className="text-sm">Already registered? <Link className="underline" href="/login">Sign in</Link></p></form></div>);
}
