import { requirePerm } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settingsConfig";
import { envProblems, smtpConfigured } from "@/lib/env";
import { saveSettings } from "../ops";
import { adminChangePassword } from "../actions";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; pw?: string }> }) {
  await requirePerm("settings.write"); const sp = await searchParams; const s = await getSettings(); const groups = Array.from(new Set(SETTINGS.map((x) => x.group)));
  return (<div className="max-w-3xl"><h1 className="text-3xl">Website settings &amp; account</h1>{sp.ok === "1" && <p className="mt-3 bg-green-50 p-3 text-green-800">Saved.</p>}{false && <p className="mt-3 bg-green-50 p-3 text-green-800">Sample content removed.</p>}{sp.ok === "err" && <p className="mt-3 bg-red-50 p-3 text-red-800">Could not save.</p>}
    <div className="card mt-4 p-4 text-sm"><b>System status</b><ul className="mt-1 list-disc pl-5"><li>Required variables: {envProblems().length ? <span className="text-red-700">missing {envProblems().join(", ")}</span> : "OK"}</li><li>Email (SMTP): {smtpConfigured() ? "set" : "not set (newsletters/emails not sent)"}</li></ul></div>
    <form action={saveSettings} className="mt-4 space-y-5">{groups.map((g) => <fieldset key={g} className="card space-y-3 p-5"><legend className="px-2 text-lg font-semibold">{g}</legend>{SETTINGS.filter((x) => x.group === g).map((f) => { const v = s[f.key]; const n = "s_" + f.key;
      return (<div key={f.key}>{f.type === "bool" ? <label className="flex items-center gap-2"><input type="checkbox" name={n} defaultChecked={v === true || v === "true"} className="h-5 w-5" /><span className="text-sm font-medium">{f.label}</span></label> : <label className="label">{f.label}</label>}
        {f.type === "text" && <input name={n} defaultValue={typeof v === "string" ? v : ""} className="input" />}{f.type === "number" && <input name={n} type="number" step="any" defaultValue={v ?? 0} className="input" />}{f.type === "textarea" && <textarea name={n} rows={3} defaultValue={typeof v === "string" ? v : ""} className="input" />}
        {f.type === "csv" && <input name={n} defaultValue={Array.isArray(v) ? v.join(", ") : ""} className="input" />}{f.type === "image" && <><input name={n} defaultValue={typeof v === "string" ? v : ""} className="input" /><input type="file" name={n + "__file"} accept="image/*" className="mt-2 text-sm" /></>}
        {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}</div>); })}</fieldset>)}<button className="btn btn-dark">Save settings</button></form>
    <form action={adminChangePassword} className="card mt-6 space-y-2 p-5"><h2 className="text-xl">Change my password</h2>{sp.pw === "ok" && <p className="text-green-800">Password changed.</p>}{sp.pw === "short" && <p className="text-red-700">Use at least 10 characters.</p>}{sp.pw === "err" && <p className="text-red-700">Could not change it.</p>}<input name="password" type="password" minLength={10} autoComplete="new-password" required className="input" /><button className="btn btn-dark">Change password</button></form>
</div>);
}
