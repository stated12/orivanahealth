"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { authClient, currentUser } from "@/lib/supabase-server";
import { allow } from "@/lib/ratelimit";
import { SITE_URL } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { sendMail, wrapMail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { esc } from "@/lib/format";
import { randomCode } from "@/lib/content";
import { uploadCaseDoc } from "@/lib/private";

const s = (fd: FormData, k: string, n = 300) => String(fd.get(k) ?? "").trim().slice(0, n);
const okEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e);
const safe = (n: string, d = "/") => (n.startsWith("/") && !n.startsWith("//") ? n : d);
const withQ = (p: string, q: string) => p + (p.includes("?") ? "&" : "?") + q;
const num = (v: string) => { const n = Number(v.replace(/[, ]/g, "")); return v && Number.isFinite(n) && n >= 0 ? n : null; };

// ---------- accounts ----------
export async function login(fd: FormData) {
  const next = safe(s(fd, "next"), "/account"); if (!(await allow("login", 10, 600))) redirect("/login?e=rate");
  const { error } = await (await authClient()).auth.signInWithPassword({ email: s(fd, "email", 120), password: String(fd.get("password") || "") });
  if (error) redirect(`/login?e=bad&next=${encodeURIComponent(next)}`); redirect(next);
}
export async function register(fd: FormData) {
  if (!(await allow("register", 5, 900))) redirect("/register?e=rate");
  const email = s(fd, "email", 120), password = String(fd.get("password") || ""), name = s(fd, "name", 100), next = safe(s(fd, "next"), "/account");
  if (password.length < 8 || !okEmail(email)) redirect("/register?e=form");
  const { data, error } = await (await authClient()).auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error) redirect("/register?e=form");
  if (data?.user) { try { await db().from("profiles").upsert({ id: data.user.id, email, full_name: name }, { onConflict: "id" }); } catch { /* optional */ } }
  redirect(data?.session ? next : "/login?r=1");
}
export async function forgot(fd: FormData) { if (await allow("forgot", 5, 900)) await (await authClient()).auth.resetPasswordForEmail(s(fd, "email", 120), { redirectTo: `${SITE_URL}/auth/callback?next=/reset-password` }); redirect("/forgot-password?sent=1"); }
export async function resetPassword(fd: FormData) {
  const pw = String(fd.get("password") || ""); if (pw.length < 8) redirect("/reset-password?e=short");
  const { error } = await (await authClient()).auth.updateUser({ password: pw }); if (error) redirect("/reset-password?e=bad"); redirect("/login?u=1");
}
export async function logout() { await (await authClient()).auth.signOut(); redirect("/"); }
export async function saveProfile(fd: FormData) {
  const u = await currentUser(); if (!u) redirect("/login");
  await db().from("profiles").upsert({ id: u.id, email: u.email, full_name: s(fd, "full_name", 100), phone: s(fd, "phone", 25) }, { onConflict: "id" }); redirect("/account?ok=1");
}

// ---------- generic configurable forms (contact, partner, supplier, equipment, training, volunteer ...) ----------
export async function submitForm(fd: FormData) {
  const key = s(fd, "form_key", 60); const ret = safe(s(fd, "ret"), "/"); const bad = withQ(ret, "sent=err") + "#form";
  if (s(fd, "website") || !(await allow("form:" + key, 5, 900))) redirect(bad);
  const { data: f } = await db().from("forms").select("*").eq("key", key).eq("is_active", true).maybeSingle(); if (!f) redirect(bad);
  const data: Record<string, string> = {};
  for (const fld of (f.fields || []) as any[]) {
    const v = s(fd, "f_" + fld.name, fld.type === "textarea" ? 4000 : 300);
    if (fld.required && !v) redirect(bad); if (fld.type === "email" && v && !okEmail(v)) redirect(bad); if (v) data[fld.label || fld.name] = v;
  }
  const flds = (f.fields || []) as any[]; const email = flds.find((x) => x.type === "email") ? s(fd, "f_" + flds.find((x) => x.type === "email").name, 120).toLowerCase() : null;
  const name = flds.find((x) => x.name === "name") ? s(fd, "f_name", 100) : null; const phone = flds.find((x) => x.name === "phone") ? s(fd, "f_phone", 30) : null;
  if (s(fd, "consent") !== "on") redirect(bad);
  const u = await currentUser();
  const { error } = await db().from("form_submissions").insert({ form_key: key, data, email, name, phone, user_id: u?.id || null }); if (error) redirect(bad);
  await notify("form", `${f.title}: new submission`, [name, email].filter(Boolean).join(" · "), "/admin/submissions", "forms.read");
  const to = f.notify_email || (await getSettings()).contact_email;
  if (to) await sendMail(to, `New submission: ${f.title}`, wrapMail(f.title, Object.entries(data).map(([k, v]) => `<p><b>${esc(k)}</b><br>${esc(v)}</p>`).join("")));
  redirect(withQ(ret, "sent=ok") + "#form");
}

// ---------- ORIVANA Care application and medical tourism enquiry ----------
async function createCase(kind: "assistance" | "tourism", fd: FormData) {
  const base = kind === "assistance" ? "/care/apply" : "/medical-tourism/enquiry"; const bad = (c: string) => redirect(`${base}?e=${c}`);
  if (s(fd, "website")) bad("form"); if (!(await allow("case:" + kind, 4, 1800))) bad("rate");
  const email = s(fd, "email", 120).toLowerCase(), applicant = s(fd, "applicant_name", 120); if (!applicant || !okEmail(email)) bad("form");
  if (s(fd, "consent_processing") !== "on") bad("consent"); if (kind === "assistance" && s(fd, "declaration") !== "on") bad("consent");
  const u = await currentUser(); const code = randomCode(8);
  const row: Record<string, any> = { kind, access_code: code, user_id: u?.id || null, applicant_name: applicant, email, phone: s(fd, "phone", 30) || null, country: s(fd, "country", 80) || null, language: s(fd, "language", 60) || null,
    consent_processing: true, consent_public: s(fd, "consent_public") === "on", consent_comms: s(fd, "consent_comms") === "on", declaration: s(fd, "declaration") === "on", status: "submitted" };
  if (kind === "assistance") Object.assign(row, { patient_name: s(fd, "patient_name", 120) || applicant, relationship: s(fd, "relationship", 60) || null, patient_age: num(s(fd, "patient_age", 3)), state: s(fd, "state", 80) || null, city: s(fd, "city", 80) || null,
    medical_concern: s(fd, "medical_concern", 3000) || null, hospital_doctor: s(fd, "hospital_doctor", 300) || null, treatment_status: s(fd, "treatment_status", 300) || null, treatment_required: s(fd, "treatment_required", 1500) || null,
    estimated_cost: num(s(fd, "estimated_cost", 14)), needs_financial: s(fd, "needs_financial") === "yes", amount_requested: num(s(fd, "amount_requested", 14)) });
  else Object.assign(row, { patient_name: s(fd, "patient_name", 120) || applicant, specialty: s(fd, "specialty", 120) || null, medical_concern: s(fd, "medical_concern", 3000) || null, treatment_sought: s(fd, "treatment_sought", 500) || null, existing_diagnosis: s(fd, "existing_diagnosis", 1500) || null, preferred_destination: s(fd, "preferred_destination", 200) || null, additional_info: s(fd, "additional_info", 3000) || null });
  const { data: c, error } = await db().from("cases").insert(row).select("id,case_ref").single(); if (error || !c) bad("save");
  await db().from("case_events").insert({ case_id: c.id, status: "submitted", note: "Application submitted.", created_by: "system" });
  let skipped = 0; const kinds: [string, string][] = [["doc_records", "Medical records"], ["doc_prescription", "Prescription"], ["doc_reports", "Diagnosis reports"], ["doc_estimate", "Hospital estimate"], ["doc_other", "Additional documents"]];
  for (const [field, label] of kinds) { const f = fd.get(field); if (f && typeof f !== "string" && (f as File).size) { const r = await uploadCaseDoc(f, c.id, label, "patient"); if (!r.ok) skipped++; } }
  await notify("case", `${kind === "assistance" ? "New assistance application" : "New medical tourism enquiry"} ${c.case_ref}`, `${applicant} · ${row.country || ""}`, `/admin/cases/${c.id}`, "cases.read");
  const track = `${SITE_URL}/care/track`;
  await sendMail(email, `Your ORIVANA Health case ${c.case_ref}`, wrapMail("We have received your request", `<p>Your case ID is <b>${esc(c.case_ref)}</b> and your private access code is <b>${esc(code)}</b>. Keep both safe. Use them at <a href="${track}">${track}</a> to see updates, send messages and upload documents.</p><p>This does not guarantee any treatment, assistance or outcome.</p>`));
  const ck = await cookies(); ck.set("oh_case", `${c.case_ref}:${code}`, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect(`/care/submitted?ref=${encodeURIComponent(c.case_ref)}&code=${code}&kind=${kind}${skipped ? "&skipped=" + skipped : ""}`);
}
export async function submitCare(fd: FormData) { await createCase("assistance", fd); }
export async function submitTourism(fd: FormData) { await createCase("tourism", fd); }

// ---------- private case tracking (case ID + access code, or signed-in owner) ----------
export async function trackLookup(fd: FormData) {
  if (!(await allow("track", 8, 600))) redirect("/care/track?e=rate");
  const ref = s(fd, "ref", 40).toUpperCase(), code = s(fd, "code", 20).toUpperCase();
  const { data } = await db().from("cases").select("case_ref,access_code").eq("case_ref", ref).maybeSingle();
  if (!data || data.access_code !== code) redirect("/care/track?e=bad");
  (await cookies()).set("oh_case", `${ref}:${code}`, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 }); redirect(`/care/track/${ref}`);
}
export async function patientMessage(fd: FormData) {
  const { ownedCase } = await import("@/lib/cases"); const ref = s(fd, "ref", 40); const c = await ownedCase(ref); if (!c) redirect("/care/track");
  const body = s(fd, "body", 3000); if (!body || !(await allow("pmsg", 15, 600, ref))) redirect(`/care/track/${ref}?e=msg`);
  await db().from("case_messages").insert({ case_id: c.id, sender: "patient", body }); await notify("message", `New message on ${ref}`, body.slice(0, 140), `/admin/cases/${c.id}`, "cases.read"); redirect(`/care/track/${ref}?ok=msg#messages`);
}
export async function patientUpload(fd: FormData) {
  const { ownedCase } = await import("@/lib/cases"); const ref = s(fd, "ref", 40); const c = await ownedCase(ref); if (!c) redirect("/care/track");
  if (!(await allow("pup", 10, 600, ref))) redirect(`/care/track/${ref}?e=rate`);
  const r = await uploadCaseDoc(fd.get("file"), c.id, s(fd, "kind", 60) || "Document", "patient");
  if (r.ok) await notify("document", `New document on ${ref}`, "Uploaded by the patient", `/admin/cases/${c.id}`, "cases.read");
  redirect(`/care/track/${ref}?${r.ok ? "ok=doc" : "e=doc"}#documents`);
}

// ---------- events / volunteers ----------
export async function registerEvent(fd: FormData) {
  const ret = safe(s(fd, "ret"), "/community"); const bad = withQ(ret, "sent=err") + "#register";
  if (s(fd, "website") || !(await allow("event", 6, 900))) redirect(bad);
  const name = s(fd, "name", 100), email = s(fd, "email", 120).toLowerCase(); if (!name || (email && !okEmail(email)) || s(fd, "consent") !== "on") redirect(bad);
  const eid = s(fd, "event_id", 60) || null;
  const { error } = await db().from("event_registrations").insert({ event_id: eid, reg_type: s(fd, "reg_type", 20) === "volunteer" ? "volunteer" : "attendee", name, email: email || null, phone: s(fd, "phone", 30) || null, notes: s(fd, "notes", 500) || null }); if (error) redirect(bad);
  await notify("event", "New event or volunteer registration", name, "/admin/event-registrations", "events.write"); redirect(withQ(ret, "sent=ok") + "#register");
}
