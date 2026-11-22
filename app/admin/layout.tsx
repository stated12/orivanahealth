import Link from "next/link";
import type { Metadata } from "next";
import { getAdmin, can } from "@/lib/auth";
import { NAV } from "@/lib/adminConfig";
import { adminLogout } from "./actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ORIVANA Health Admin", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const a = await getAdmin();
  if (!a) return <div className="min-h-screen bg-paper">{children}</div>;
  const links = NAV.filter((n) => can(a, n.perm)); const groups = Array.from(new Set(links.map((l) => l.group || "")));
  const menu = groups.map((g) => (<div key={g} className="mb-2">{g && <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-gold">{g}</p>}{links.filter((l) => (l.group || "") === g).map((n) => <Link key={n.href} href={n.href} className="block rounded px-3 py-1.5 text-sm hover:bg-white/10">{n.label}</Link>)}</div>));
  return (<div className="min-h-screen bg-paper md:flex"><aside className="bg-navy text-white md:min-h-screen md:w-60 md:shrink-0"><div className="flex items-center justify-between p-3 md:block"><Link href="/admin" className="font-serif text-xl">ORIVANA Health · Admin</Link>
    <details className="md:hidden"><summary className="btn list-none !border-white/40 !px-3 !py-1 !text-white">Menu</summary><nav className="absolute right-3 z-50 mt-2 max-h-[80vh] w-64 overflow-auto bg-navy p-2 shadow-xl">{menu}<form action={adminLogout}><button className="px-3 py-2 text-sm underline">Log out</button></form></nav></details></div>
    <nav className="hidden p-2 md:block">{menu}<a href="/" target="_blank" className="mt-3 block rounded px-3 py-1.5 text-sm opacity-80 hover:bg-white/10">View website ↗</a></nav>
    <form action={adminLogout} className="hidden p-3 md:block"><div className="mb-2 truncate text-xs opacity-70">{a.email}</div><button className="text-xs underline">Log out</button></form></aside>
    <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div></div>);
}
