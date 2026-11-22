import Link from "next/link";
import Icon from "./Icon";
export default function DonateButton({ href = "/donate", className = "", label = "Donate for the Needy" }: { href?: string; className?: string; label?: string }) {
  return <Link href={href} className={`btn btn-gold ${className}`}><Icon name="heart" className="h-4 w-4" />{label}</Link>;
}
