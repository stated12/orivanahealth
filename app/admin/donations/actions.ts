"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
import { randomCode } from "@/lib/content";
import { finalisePaid } from "@/lib/donations";
import { sendMail, wrapMail } from "@/lib/mail";
import { esc } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
const s = (fd: FormData, k: string, n = 1000) => String(fd.get(k) ?? "").trim().slice(0, n);
export async function recordOffline(fd: FormData) {
  const a = await requirePerm("donations.manage"); const amount = Number(s(fd, "amount", 14)); if (!Number.isFinite(amount) || amount <= 0) redirect("/admin/donations?e=amount");
  const fund = ["case", "general", "community"].includes(s(fd, "fund")) ? s(fd, "fund") : "general"; let caseId: string | null = null;
  if (fund === "case") { const { data: c } = await db().from("cases").select("id").eq("case_ref", s(fd, "case_ref", 40).toUpperCase()).maybeSingle(); if (!c) redirect("/admin/donations?e=case"); caseId = c.id; }
  const { data, error } = await db().from("donations").insert({ fund, case_id: caseId, amount, donor_name: s(fd, "donor_name", 120) || null, donor_email: s(fd, "donor_email", 120).toLowerCase() || null, donor_phone: s(fd, "donor_phone", 30) || null, is_anonymous: s(fd, "anonymous") === "on", status: "paid", source: "offline", provider: s(fd, "provider", 60) || "bank transfer / UPI / cash", provider_payment_id: s(fd, "reference", 120) || null, notes: s(fd, "notes") || null, receipt_code: randomCode(10) }).select("id").single();
  if (error || !data) redirect("/admin/donations?e=save"); await audit(a, "donation_record_offline", "donations", data.id, { amount }); revalidatePath("/", "layout"); redirect(`/admin/donations/${data.id}?ok=1`);
}
export async function updateDonation(fd: FormData) {
  const a = await requirePerm("donations.manage"); const id = s(fd, "id", 60); const { data: d } = await db().from("donations").select("*").eq("id", id).maybeSingle(); if (!d) redirect("/admin/donations");
  const status = s(fd, "status", 20); if (!["intent", "pending", "paid", "failed", "refunded", "cancelled"].includes(status)) redirect(`/admin/donations/${id}`);
  const refund = Math.max(0, Number(s(fd, "refund_amount", 14)) || 0); if (refund > Number(d.amount)) redirect(`/admin/donations/${id}?e=` + encodeURIComponent("Refund cannot exceed the amount."));
  const rec = s(fd, "reconciled") === "on"; const upd: Record<string, any> = { status, refund_amount: status === "refunded" ? refund : 0, refund_note: s(fd, "refund_note") || null, notes: s(fd, "notes") || null, reconciled: rec };
  if (rec && !d.reconciled) { upd.reconciled_at = new Date().toISOString(); upd.reconciled_by = a.email; } if (!rec) { upd.reconciled_at = null; upd.reconciled_by = null; }
  await db().from("donations").update(upd).eq("id", id); await audit(a, "donation_update", "donations", id, { status, reconciled: rec, refund }); revalidatePath("/", "layout"); redirect(`/admin/donations/${id}?ok=1`);
}
export async function sendAcknowledgement(fd: FormData) {
  const a = await requirePerm("donations.manage"); const id = s(fd, "id", 60); const { data: d } = await db().from("donations").select("*").eq("id", id).maybeSingle(); if (!d || d.status !== "paid") redirect(`/admin/donations/${id}?e=` + encodeURIComponent("Only paid donations can be acknowledged."));
  if (!d.donor_email) { await db().from("donations").update({ acknowledged_at: new Date().toISOString(), ack_note: "Marked acknowledged manually (no email address)" }).eq("id", id); redirect(`/admin/donations/${id}?ok=1`); }
  const ok = await sendMail(d.donor_email, `Thank you: acknowledgement ${d.donation_ref}`, wrapMail("Thank you for your support", `<p>We have recorded your contribution of <b>₹${esc(d.amount)}</b> (reference ${esc(d.donation_ref)}).</p><p><a href="${SITE_URL}/donate/receipt/${esc(d.donation_ref)}?code=${esc(d.receipt_code || "")}">View your acknowledgement</a></p>`));
  await db().from("donations").update({ acknowledged_at: ok ? new Date().toISOString() : null, ack_note: ok ? "Emailed" : "Email not sent (SMTP not configured?)" }).eq("id", id); await audit(a, "donation_ack", "donations", id); redirect(`/admin/donations/${id}?${ok ? "ok=1" : "e=" + encodeURIComponent("Email could not be sent. Configure SMTP or mark it manually.")}`);
}
export async function markAckManual(fd: FormData) { const a = await requirePerm("donations.manage"); const id = s(fd, "id", 60); await db().from("donations").update({ acknowledged_at: new Date().toISOString(), ack_note: "Acknowledged manually" }).eq("id", id); await audit(a, "donation_ack_manual", "donations", id); redirect(`/admin/donations/${id}?ok=1`); }
export async function reprocessPaid(fd: FormData) { const a = await requirePerm("donations.manage"); const id = s(fd, "id", 60); await finalisePaid(id); await audit(a, "donation_reprocess", "donations", id); redirect(`/admin/donations/${id}?ok=1`); }
