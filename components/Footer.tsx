import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getNav } from "@/lib/content";
import Logo from "./Logo";
import DonateButton from "./DonateButton";
export default async function Footer() {
  const [s, nav] = await Promise.all([getSettings(), getNav("footer")]);
  const social: [string, string][] = [["Instagram", s.social_instagram], ["Facebook", s.social_facebook], ["X", s.social_x], ["LinkedIn", s.social_linkedin], ["YouTube", s.social_youtube]];
  return (<footer className="mt-16 bg-navy text-white no-print"><div className="wrap grid gap-10 py-12 md:grid-cols-3">
    <div><div className="flex items-center gap-3"><Logo size={48} /><div><p className="font-serif text-xl">ORIVANA Health</p><p className="text-xs text-white/70">{s.brand_tagline}</p></div></div><p className="mt-4 text-sm text-white/75">{s.footer_note}</p><div className="mt-4"><DonateButton /></div></div>
    <div><h2 className="font-serif text-xl !text-white">Explore</h2><ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">{nav.map((i: any) => <li key={i.id}><Link href={i.href} className="hover:text-gold">{i.label}</Link></li>)}</ul></div>
    <div className="text-sm text-white/75"><h2 className="font-serif text-xl !text-white">Contact</h2>{s.contact_email && <p className="mt-2">{s.contact_email}</p>}{s.contact_phone && <p>{s.contact_phone}</p>}{s.contact_address && <p>{s.contact_address}</p>}<p className="mt-2"><Link href="/contact" className="underline">Contact form</Link></p>
      <div className="mt-3 flex flex-wrap gap-4">{social.filter(([, u]) => u).map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a>)}</div></div></div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-white/65"><div className="wrap space-y-1"><p>ORIVANA Health is not a hospital and does not provide diagnosis or treatment. In an emergency, contact your local emergency number or go to the nearest emergency department.</p><p>© {new Date().getFullYear()} {s.legal_name || "ORIVANA Health"} · An initiative within the ORIVANA Global Foundation ecosystem</p></div></div></footer>);
}
