"use client";
import { useEffect, useRef, useState } from "react";
/** Rich text editor (no third-party service). Writes HTML to a hidden input. Autosaves a local copy and warns before leaving with unsaved work. */
export default function RichEditor({ name, defaultValue = "", draftKey }: { name: string; defaultValue?: string; draftKey: string }) {
  const ref = useRef<HTMLDivElement>(null); const input = useRef<HTMLInputElement>(null); const [dirty, setDirty] = useState(false); const [msg, setMsg] = useState(""); const [restore, setRestore] = useState<string | null>(null);
  const sync = () => { if (input.current && ref.current) input.current.value = ref.current.innerHTML; };
  useEffect(() => { if (ref.current) { ref.current.innerHTML = defaultValue; sync(); } try { const d = localStorage.getItem("hcdraft:" + draftKey); if (d && d !== defaultValue && d.length > 20) setRestore(d); } catch { /* ignore */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setInterval(async () => { if (!dirty || !ref.current) return; const html = ref.current.innerHTML; try { localStorage.setItem("hcdraft:" + draftKey, html); setMsg("Draft saved on this device " + new Date().toLocaleTimeString()); } catch { /* ignore */ } }, 12000);
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", warn);
    const form = ref.current?.closest("form"); const clear = () => { setDirty(false); try { localStorage.removeItem("hcdraft:" + draftKey); } catch { /* ignore */ } }; form?.addEventListener("submit", clear);
    return () => { clearInterval(t); window.removeEventListener("beforeunload", warn); form?.removeEventListener("submit", clear); };
  }, [dirty, draftKey]);
  const cmd = (c: string, v?: string) => { ref.current?.focus(); document.execCommand(c, false, v); sync(); setDirty(true); };
  const link = () => { const u = prompt("Link URL (https://…)"); if (u && /^https?:\/\//i.test(u)) cmd("createLink", u); };
  const img = () => { const u = prompt("Image URL (https://…)"); if (u && /^https?:\/\//i.test(u)) cmd("insertImage", u); };
  const B = "border border-line bg-white px-2.5 py-1 text-sm hover:bg-soft";
  return (<div>
    <div className="mb-1 flex flex-wrap gap-1 bg-soft p-1">
      <button type="button" className={B} onClick={() => cmd("bold")}><b>B</b></button><button type="button" className={B} onClick={() => cmd("italic")}><i>I</i></button><button type="button" className={B} onClick={() => cmd("underline")}><u>U</u></button>
      <button type="button" className={B} onClick={() => cmd("formatBlock", "h2")}>H2</button><button type="button" className={B} onClick={() => cmd("formatBlock", "h3")}>H3</button><button type="button" className={B} onClick={() => cmd("formatBlock", "p")}>¶</button>
      <button type="button" className={B} onClick={() => cmd("formatBlock", "blockquote")}>“ Quote</button><button type="button" className={B} onClick={() => cmd("insertUnorderedList")}>• List</button><button type="button" className={B} onClick={() => cmd("insertOrderedList")}>1. List</button>
      <button type="button" className={B} onClick={link}>Link</button><button type="button" className={B} onClick={img}>Image</button><button type="button" className={B} onClick={() => cmd("removeFormat")}>Clear</button></div>
    {restore && <p className="mb-1 bg-yellow-50 p-2 text-sm">An unsaved draft from this device was found. <button type="button" className="underline" onClick={() => { if (ref.current) { ref.current.innerHTML = restore; sync(); setDirty(true); } setRestore(null); }}>Restore it</button> · <button type="button" className="underline" onClick={() => { try { localStorage.removeItem("hcdraft:" + draftKey); } catch { /* ignore */ } setRestore(null); }}>Discard</button></p>}
    <div ref={ref} className="re" contentEditable suppressContentEditableWarning onInput={() => { sync(); setDirty(true); }} onPaste={(e) => { e.preventDefault(); const t = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, t); }} />
    <input ref={input} type="hidden" name={name} /><p className="mt-1 text-xs text-muted">{msg || "Pasted text is inserted as plain text. Formatting is cleaned when published."}</p></div>);
}
