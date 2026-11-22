import { db } from "@/lib/db";
import { submitForm } from "@/app/actions";
/** Renders a form defined in Admin > Form builder. Submissions land in Admin > Enquiries & applications. */
export default async function FormBox({ formKey, ret, sent, cta = "Send", prefill = {} }: { formKey: string; ret: string; sent?: string; cta?: string; prefill?: Record<string, string> }) {
  const { data: f } = await db().from("forms").select("*").eq("key", formKey).eq("is_active", true).maybeSingle();
  if (!f) return null;
  return (<form action={submitForm} id="form" className="card space-y-4 p-5 md:p-6"><input type="hidden" name="form_key" value={formKey} /><input type="hidden" name="ret" value={ret} /><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
    <div><h2 className="text-2xl">{f.title}</h2>{f.description && <p className="mt-1 text-sm text-muted">{f.description}</p>}</div>
    {sent === "ok" && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-900">{f.success_message || "Thank you. We have received your message."}</p>}{sent === "err" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Something went wrong. Please check the required fields and the consent box, then try again.</p>}
    {((f.fields || []) as any[]).map((x) => (<div key={x.name}><label className="label" htmlFor={"f_" + x.name}>{x.label}{x.required && " *"}</label>{x.type === "textarea" ? <textarea id={"f_" + x.name} name={"f_" + x.name} rows={4} required={!!x.required} defaultValue={prefill[x.name] || ""} className="input" /> : <input id={"f_" + x.name} name={"f_" + x.name} type={x.type === "email" ? "email" : "text"} required={!!x.required} defaultValue={prefill[x.name] || ""} className="input" />}</div>))}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" required className="mt-1 h-4 w-4" /><span>I agree that my details may be used to reply to this request, as described in the <a href="/page/privacy-policy" className="underline">privacy policy</a>.</span></label>
    <p className="text-xs text-muted">Please do not use this form for emergencies. ORIVANA Health does not give medical advice.</p>
    <button className="btn btn-dark">{cta}</button></form>);
}
