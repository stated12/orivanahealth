"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
import { sendMail, wrapMail } from "@/lib/mail";
import { slugify, esc } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { uploadCaseDoc } from "@/lib/private";

const s = (fd: FormData, k: string, n = 4000) => String(fd.get(k) ?? "").trim().slice(0, n);
const nn = (v: string) => (v === "" ? null : v); const num = (v: string) => (v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
async function load(fd: FormData, perm = "cases.manage") { const a = await requirePerm(perm); const id = s(fd, "id", 60); const { data: c } = await db().from("cases").select("*").eq("id", id).maybeSingle(); if (!c) redirect("/admin/cases"); return { a, c, back: `/admin/cases/${id}` }; }
export async function setStatus(fd: FormData) {
  const { a, c, back } = await load(fd); const status = s(fd, "status", 60); const note = s(fd, "note", 1000);
  const { data: st } = await db().from("case_statuses").select("key,label,patient_message").eq("key", status).maybeSingle(); if (!st) redirect(back + "?e=status");
  await db().from("cases").update({ status }).eq("id", c.id); await db().from("case_events").insert({ case_id: c.id, status, note: nn(note), created_by: a.email, visible_to_patient: s(fd, "visible") === "on" });
  if (c.consent_comms && c.email && s(fd, "email_patient") === "on") await sendMail(c.email, `Update on your ORIVANA Health case ${c.case_ref}`, wrapMail("Your case status changed", `<p>Case <b>${esc(c.case_ref)}</b> is now: <b>${esc(st.label)}</b>.</p>${st.patient_message ? `<p>${esc(st.patient_message)}</p>` : ""}${note ? `<p>${esc(note)}</p>` : ""}<p>See details at <a href="${SITE_URL}/care/track">${SITE_URL}/care/track</a>.</p>`));
  await audit(a, "case_status", "cases", c.id, { status }); redirect(back + "?ok=1");
}
export async function saveCaseDetails(fd: FormData) {
  const { a, c, back } = await load(fd);
  const upd: Record<string, any> = { coordinator_name: nn(s(fd, "coordinator_name", 120)), internal_notes: nn(s(fd, "internal_notes")), verified: s(fd, "verified") === "on" };
  if (c.kind === "tourism") Object.assign(upd, { provider_responses: nn(s(fd, "provider_responses")), provider_estimate: nn(s(fd, "provider_estimate")), appointment_request: nn(s(fd, "appointment_request")), travel_notes: nn(s(fd, "travel_notes")), accommodation_notes: nn(s(fd, "accommodation_notes")), visa_checklist: nn(s(fd, "visa_checklist")), interpreter_notes: nn(s(fd, "interpreter_notes")), followup_at: s(fd, "followup_at") ? new Date(s(fd, "followup_at")).toISOString() : null });
  if (!upd.verified && c.public_state === "approved") redirect(back + "?e=" + encodeURIComponent("Unpublish the case before removing verification."));
  await db().from("cases").update(upd).eq("id", c.id); await audit(a, "case_details", "cases", c.id); redirect(back + "?ok=1");
}
export async function staffMessage(fd: FormData) {
  const { a, c, back } = await load(fd); const body = s(fd, "body", 3000); if (!body) redirect(back);
  await db().from("case_messages").insert({ case_id: c.id, sender: "staff", body, is_info_request: s(fd, "info") === "on", author: a.email });
  if (c.consent_comms && c.email) await sendMail(c.email, `New message on your ORIVANA Health case ${c.case_ref}`, wrapMail("You have a new message", `<p>Your coordinator has written to you about case <b>${esc(c.case_ref)}</b>. Please sign in to your private case page to read it: <a href="${SITE_URL}/care/track">${SITE_URL}/care/track</a>.</p>`));
  await audit(a, "case_message", "cases", c.id); redirect(back + "?ok=1#messages");
}
export async function staffUpload(fd: FormData) { const { a, c, back } = await load(fd, "documents.read"); const r = await uploadCaseDoc(fd.get("file"), c.id, s(fd, "kind", 60) || "Document", "staff"); await audit(a, "case_doc_upload", "cases", c.id); redirect(back + (r.ok ? "?ok=1" : "?e=upload")); }
export async function savePublication(fd: FormData) {
  const { a, c, back } = await load(fd); const state = s(fd, "public_state", 20); if (!["private", "pending_review", "approved", "closed"].includes(state)) redirect(back);
  if ((state === "approved") && (!c.verified || !c.consent_public)) redirect(back + "?e=" + encodeURIComponent("A case can be approved for public display only if it is marked Verified AND the patient gave consent for public sharing."));
  const title = s(fd, "public_title", 200), summary = s(fd, "public_summary", 4000); if (state === "approved" && (!title || !summary)) redirect(back + "?e=" + encodeURIComponent("Add the patient-approved title and summary before approving."));
  let slug = s(fd, "public_slug", 120) || c.public_slug || (title ? slugify(title) + "-" + c.case_ref.toLowerCase().replace(/[^a-z0-9]+/g, "") : null);
  const upd: Record<string, any> = { public_state: state, public_title: nn(title), public_summary: nn(summary), public_requirement: nn(s(fd, "public_requirement")), public_docs_status: nn(s(fd, "public_docs_status", 600)), verified_goal: num(s(fd, "verified_goal", 14)), public_slug: slug };
  if (state === "approved" && c.public_state !== "approved") upd.public_approved_at = new Date().toISOString();
  const { error } = await db().from("cases").update(upd).eq("id", c.id); if (error) redirect(back + "?e=" + encodeURIComponent(error.message.includes("duplicate") ? "That public URL is already used." : "Could not save."));
  await audit(a, "case_publication", "cases", c.id, { state }); revalidatePath("/", "layout"); redirect(back + "?ok=1");
}
export async function addUpdate(fd: FormData) { const { a, c, back } = await load(fd); const t = s(fd, "title", 200); if (!t) redirect(back); await db().from("case_updates").insert({ case_id: c.id, title: t, body: nn(s(fd, "body")), is_published: s(fd, "publish") === "on" }); await audit(a, "case_update", "cases", c.id); revalidatePath("/", "layout"); redirect(back + "?ok=1#updates"); }
export async function toggleUpdate(fd: FormData) { const { a, c, back } = await load(fd); const uid = s(fd, "uid", 60); const { data: u } = await db().from("case_updates").select("is_published").eq("id", uid).eq("case_id", c.id).maybeSingle(); if (u) await db().from("case_updates").update({ is_published: !u.is_published }).eq("id", uid); await audit(a, "case_update_toggle", "cases", c.id); revalidatePath("/", "layout"); redirect(back + "#updates"); }
export async function deleteCase(fd: FormData) { const a = await requirePerm("cases.manage"); const id = s(fd, "id", 60); const { data: paid } = await db().from("donations").select("id").eq("case_id", id).eq("status", "paid").limit(1); if ((paid || []).length) redirect(`/admin/cases/${id}?e=` + encodeURIComponent("This case has recorded donations and cannot be deleted. Close it instead.")); const { data: files } = await db().from("case_documents").select("file_path").eq("case_id", id); if ((files || []).length) await db().storage.from("oh-private").remove(files!.map((f: any) => f.file_path)); await db().from("cases").delete().eq("id", id); await audit(a, "case_delete", "cases", id); redirect("/admin/cases?ok=1"); }
