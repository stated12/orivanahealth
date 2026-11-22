import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { currentUser } from "@/lib/supabase-server";
import { getNav } from "@/lib/content";
import Logo from "./Logo";
import DonateButton from "./DonateButton";
export default async function Header() {
  const [s, items, user] = await Promise.all([getSettings(), getNav("header"), currentUser()]);
  return (<header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur no-print">
    <div className="bg-navy text-[11px] text-white/85"><div className="wrap flex items-center justify-between py-1.5"><span className="truncate">{s.brand_tagline}</span><div className="flex shrink-0 items-center gap-4"><Link href="/care/track" className="hover:text-white">Track a case</Link><Link href={user ? "/account" : "/login"} className="hover:text-white">{user ? "My account" : "Sign in"}</Link></div></div></div>
    <div className="wrap flex items-center justify-between gap-3 py-3">
      <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="ORIVANA Health, home"><Logo /><span className="leading-tight"><span className="block font-serif text-xl font-semibold text-navy">ORIVANA Health</span><span className="block text-[10px] uppercase tracking-[.16em] text-muted">ORIVANA Global Foundation</span></span></Link>
      <nav aria-label="Main" className="hidden items-center gap-5 text-[13px] font-semibold lg:flex">{items.map((i: any) => <Link key={i.id} href={i.href} className="whitespace-nowrap text-ink hover:text-green-dark">{i.label}</Link>)}</nav>
      <div className="flex items-center gap-2"><DonateButton className="!px-4 !py-2 text-sm" />
        <details className="relative lg:hidden"><summary className="btn btn-line cursor-pointer list-none !px-3 !py-2" aria-label="Menu">Menu</summary><div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-line bg-white p-2 shadow-xl">{items.map((i: any) => <Link key={i.id} href={i.href} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-soft">{i.label}</Link>)}<Link href="/navigator" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-soft">Health Navigator</Link></div></details></div></div></header>);
}
