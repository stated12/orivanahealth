"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
import { currentUser } from "@/lib/supabase-server";
import { getSettings } from "@/lib/settings";
import { paymentsLive, randomCode } from "@/lib/content";
import { createOrder, verifyCheckout } from "@/lib/payments";
import { notify } from "@/lib/notify";
import { finalisePaid } from "@/lib/donations";

const s = (fd: FormData, k: string, n = 300) => String(fd.get(k) ?? "").trim().slice(0, n);
export async function startDonation(fd: FormData) {
  if (s(fd, "website") || !(await allow("donate", 6, 900))) redirect("/donate/give?e=rate");
  const fund = ["case", "general", "community"].includes(s(fd, "fund")) ? s(fd, "fund") : "general"; const slug = s(fd, "case", 120);
  const settings = await getSettings(); const min = Math.max(1, Number(settings.donation_min) || 100);
  const amount = Number(s(fd, "custom_amount", 12) || s(fd, "amount", 12)); const back = `/donate/give?${fund === "case" && slug ? "case=" + encodeURIComponent(slug) + "&" : ""}fund=${fund}`;
  if (!Number.isFinite(amount) || amount < min || amount > 10000000) redirect(back + "&e=amount");
  const email = s(fd, "donor_email", 120).toLowerCase(), name = s(fd, "donor_name", 120); if (!name || !/^\S+@\S+\.\S+$/.test(email) || s(fd, "consent") !== "on") redirect(back + "&e=form");
  let caseId: string | null = null;
  if (fund === "case") { const { data: c } = await db().from("cases").select("id").eq("public_slug", slug).eq("public_state", "approved").maybeSingle(); if (!c) redirect("/donate/give?e=case"); caseId = c.id; }
  const live = await paymentsLive(); const u = await currentUser(); const receipt = randomCode(10);
  const { data: d, error } = await db().from("donations").insert({ fund, case_id: caseId, amount, donor_name: name, donor_email: email, donor_phone: s(fd, "donor_phone", 30) || null, is_anonymous: s(fd, "anonymous") === "on", message: s(fd, "message", 500) || null, status: live ? "pending" : "intent", provider: live ? "razorpay" : null, receipt_code: receipt, user_id: u?.id || null }).select("id,donation_ref").single();
  if (error || !d) redirect(back + "&e=save");
  if (!live) { await notify("donation", `Support intent ${d.donation_ref}`, `${name} · ₹${amount} (payment not active; intent recorded)`, `/admin/donations/${d.id}`, "donations.read"); redirect(`/donate/thanks?ref=${d.donation_ref}&code=${receipt}`); }
  const order = await createOrder(amount, d.donation_ref); if (!order) { await db().from("donations").update({ status: "failed", notes: "Could not create provider order" }).eq("id", d.id); redirect(back + "&e=provider"); }
  await db().from("donations").update({ provider_order_id: order.id }).eq("id", d.id); redirect(`/donate/pay/${d.donation_ref}?code=${receipt}`);
}
/** Called after the provider's hosted checkout succeeds. The signature is verified server-side; the webhook is the second, independent confirmation. */
export async function confirmPayment(ref: string, code: string, orderId: string, paymentId: string, sig: string): Promise<boolean> {
  const { data: d } = await db().from("donations").select("*").eq("donation_ref", ref).maybeSingle(); if (!d || d.receipt_code !== code || d.provider_order_id !== orderId) return false;
  if (!verifyCheckout(orderId, paymentId, sig)) return false; if (d.status === "paid") return true;
  await db().from("donations").update({ status: "paid", provider_payment_id: paymentId }).eq("id", d.id); await finalisePaid(d.id); return true;
}
