import Icon from "./Icon";
import SlotImg from "./SlotImg";
/** A designed image frame. Shows the uploaded image when there is one (admin upload via `src`, or a file in /public/images via `file`); otherwise a branded composition so the layout always looks finished. */
export default function Slot({ src, file, alt = "", icon = "cross", label, className = "aspect-[4/3]", light = false }: { src?: string | null; file?: string; alt?: string; icon?: string; label?: string; className?: string; light?: boolean }) {
  if (src) { /* eslint-disable-next-line @next/next/no-img-element */ return <div className={`overflow-hidden rounded-2xl bg-soft ${className}`}><img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" /></div>; }
  return (<div className={`slot ${light ? "slot-light" : ""} ${className}`} role="img" aria-label={label || alt || "ORIVANA Health"}><div className="flex flex-col items-center gap-2 p-4 text-center"><span className={`flex h-14 w-14 items-center justify-center rounded-full ${light ? "bg-white/70" : "bg-white/10"} ring-1 ${light ? "ring-navy/15" : "ring-white/25"}`}><Icon name={icon} className="h-7 w-7" /></span>{label && <span className="font-serif text-sm opacity-90">{label}</span>}</div>{file && <SlotImg src={file} alt={alt || label || ""} />}</div>);
}
