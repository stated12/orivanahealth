// Rebuilds HTML from an allow-list. Text is escaped; tags are re-emitted from scratch with only safe attributes.
const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption", "hr"]);
const VOID = new Set(["br", "img", "hr"]);
const ent = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const url = (v: string, mail = false) => { const t = v.trim(); return /^https?:\/\//i.test(t) || t.startsWith("/") && !t.startsWith("//") || (mail && /^mailto:/i.test(t)) ? t : ""; };
const attr = (tag: string, name: string) => { const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag); return m ? ent(m[2] ?? m[3] ?? m[4] ?? "") : ""; };
export function sanitizeHtml(input: string | null | undefined): string {
  const src = String(input || ""); const out: string[] = []; const stack: string[] = []; let last = 0; const re = /<[^>]*>/g; let m: RegExpExecArray | null;
  const text = (t: string) => { if (t) out.push(esc(ent(t))); };
  while ((m = re.exec(src))) {
    text(src.slice(last, m.index)); last = m.index + m[0].length;
    const tag = m[0]; const mm = /^<\s*(\/?)\s*([a-zA-Z0-9]+)/.exec(tag); if (!mm) continue;
    const closing = !!mm[1]; let name = mm[2].toLowerCase(); if (name === "div") name = "p"; if (!ALLOWED.has(name)) continue;
    if (closing) { if (VOID.has(name)) continue; const i = stack.lastIndexOf(name); if (i >= 0) { while (stack.length > i) out.push(`</${stack.pop()}>`); } continue; }
    if (name === "a") { const h = url(attr(tag, "href"), true); if (!h) continue; out.push(`<a href="${esc(h)}" rel="noopener noreferrer nofollow" target="_blank">`); stack.push("a"); continue; }
    if (name === "img") { const s = url(attr(tag, "src")); if (s) out.push(`<img src="${esc(s)}" alt="${esc(attr(tag, "alt"))}" loading="lazy" />`); continue; }
    if (VOID.has(name)) { out.push(`<${name} />`); continue; }
    out.push(`<${name}>`); stack.push(name);
  }
  text(src.slice(last)); while (stack.length) out.push(`</${stack.pop()}>`);
  return out.join("");
}
export const stripHtml = (s: string | null | undefined) => ent(String(s || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
export const readingTime = (s: string | null | undefined) => Math.max(1, Math.round(stripHtml(s).split(" ").filter(Boolean).length / 220));
/** Plain text (older/pasted content) becomes paragraphs. */
export const toHtml = (s: string | null | undefined) => { const t = String(s || ""); return /<\/?(p|h2|h3|ul|ol|blockquote)\b/i.test(t) ? sanitizeHtml(t) : sanitizeHtml(t.split(/\n{2,}/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br />")}</p>`).join("")); };
