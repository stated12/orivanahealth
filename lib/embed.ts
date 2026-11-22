/** Turns a YouTube or Vimeo page link into a safe embed URL; anything else returns null (shown as a direct video file). */
export function embedUrl(u: string): string | null {
  try { const x = new URL(u); const h = x.hostname.replace(/^www\./, "");
    if (h === "youtu.be") return `https://www.youtube-nocookie.com/embed/${x.pathname.slice(1)}`;
    if (h === "youtube.com" || h === "m.youtube.com") { const v = x.searchParams.get("v"); return v ? `https://www.youtube-nocookie.com/embed/${v}` : x.pathname.startsWith("/embed/") ? `https://www.youtube-nocookie.com${x.pathname}` : null; }
    if (h === "vimeo.com") { const id = x.pathname.split("/").filter(Boolean)[0]; return /^\d+$/.test(id || "") ? `https://player.vimeo.com/video/${id}` : null; }
  } catch { /* fall through */ } return null;
}
