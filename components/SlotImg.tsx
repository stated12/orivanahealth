"use client";
import { useState } from "react";
/** Shows an image uploaded to /public/images; if the file does not exist the designed frame underneath stays visible. */
export default function SlotImg({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)} className="absolute inset-0 h-full w-full object-cover" />;
}
