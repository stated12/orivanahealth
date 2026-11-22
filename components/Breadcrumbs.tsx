import Link from "next/link";
import JsonLd from "./JsonLd";
import { SITE_URL } from "@/lib/env";
export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, ...(x.href ? { item: SITE_URL + x.href } : {}) })) };
  return (<nav aria-label="Breadcrumb" className="text-sm text-muted"><JsonLd data={ld} /><ol className="flex flex-wrap gap-1">{all.map((x, i) => <li key={i} className="flex gap-1">{x.href ? <Link href={x.href} className="underline-offset-2 hover:underline">{x.name}</Link> : <span aria-current="page">{x.name}</span>}{i < all.length - 1 && <span aria-hidden>/</span>}</li>)}</ol></nav>);
}
