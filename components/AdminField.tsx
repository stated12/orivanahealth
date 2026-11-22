import RichEditor from "@/components/RichEditor";
import type { Field } from "@/lib/adminConfig";
const dd = (v: any) => (v ? String(v).slice(0, 10) : "");
const dt = (v: any) => (v ? new Date(v).toISOString().slice(0, 16) : "");
/** Renders one admin form control. Field names are f_<name> (file/image uploads use f_<name>__file). */
export default function AdminField({ f, value, refs }: { f: Field; value: any; refs?: { value: string; label: string }[] }) {
  const k = "f_" + f.name;
  const L = <label className="label" htmlFor={k}>{f.label}{f.required && " *"}</label>;
  const H = f.help ? <p className="mt-1 text-xs text-muted">{f.help}</p> : null;
  switch (f.type) {
    case "bool": return <label className="flex items-center gap-2 py-1"><input type="checkbox" name={k} defaultChecked={!!value} className="h-5 w-5" /><span className="text-sm font-medium">{f.label}</span></label>;
    case "textarea": return <div>{L}<textarea id={k} name={k} rows={4} defaultValue={value ?? ""} className="input" />{H}</div>;
    case "number": return <div>{L}<input id={k} name={k} type="number" step="any" defaultValue={value ?? ""} className="input" />{H}</div>;
    case "date": return <div>{L}<input id={k} name={k} type="date" defaultValue={dd(value)} className="input" />{H}</div>;
    case "csv": return <div>{L}<input id={k} name={k} defaultValue={Array.isArray(value) ? value.join(", ") : ""} className="input" />{H}</div>;
    case "file": return <div>{L}<input name={k} defaultValue={value ?? ""} placeholder="Paste a link, or upload a PDF below" className="input" /><input name={k + "__file"} type="file" accept="application/pdf" className="mt-2 text-sm" />{H}</div>;
    case "datetime": return <div>{L}<input id={k} name={k} type="datetime-local" defaultValue={dt(value)} className="input" />{H}</div>;
    case "select": return <div>{L}<select id={k} name={k} defaultValue={value ?? ""} className="input"><option value="">—</option>{(f.options || refs?.map((r) => [r.value, r.label] as [string, string]) || []).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>{H}</div>;
    case "image": return <div>{L}{value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="mb-2 h-24 rounded border border-line" />}<input name={k} defaultValue={value ?? ""} placeholder="Image URL (or upload below)" className="input" /><input name={k + "__file"} type="file" accept="image/*" className="mt-2 text-sm" /><p className="mt-1 text-xs text-muted">Upload a JPG/PNG/WebP up to 4 MB.</p></div>;
    case "readonly": return <div>{L}<pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded border border-line bg-soft p-3 text-sm">{value && typeof value === "object" ? Object.entries(value).map(([a, b]) => `${a}: ${b}`).join("\n\n") : String(value ?? "")}</pre></div>;
    case "html": return <div>{L}<RichEditor name={k} defaultValue={value ?? ""} draftKey={"admin-" + k} /></div>;
    case "json": return <div>{L}<textarea id={k} name={k} rows={6} defaultValue={value ? JSON.stringify(value, null, 2) : ""} className="input font-mono text-xs" />{H}</div>;
    default: return <div>{L}<input id={k} name={k} defaultValue={value ?? ""} className="input" />{H}</div>;
  }
}
