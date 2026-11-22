export const inr = (n: number | string | null | undefined) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const dateFmt = (d: string | Date | null | undefined, lang = "en") =>
  d ? new Date(d).toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
export const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
