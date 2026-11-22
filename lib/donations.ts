import { db } from "./db";
import { getSettings } from "./settings";
import { notify } from "./notify";
import { sendMail, wrapMail } from "./mail";
import { esc } from "./format";
import { SITE_URL } from "./env";
export async function finalisePaid(id: string) {
  const { data: d } = await db().from("donations").select("*").eq("id", id).maybeSingle(); if (!d) return;
  await notify("donation", `Payment received ${d.donation_ref}`, `₹${d.amount}`, `/admin/donations/${d.id}`, "donations.read");
  const s = await getSettings(); if (d.donor_email && !d.acknowledged_at) { const ok = await sendMail(d.donor_email, `Thank you: acknowledgement ${d.donation_ref}`, wrapMail("Thank you for your support", `<p>We have recorded your contribution of <b>₹${esc(d.amount)}</b> (reference ${esc(d.donation_ref)}).</p><p>View your acknowledgement: ${esc(SITE_URL)}/donate/receipt/${esc(d.donation_ref)}?code=${esc(d.receipt_code)}</p>${s.receipt_note ? `<p>${esc(s.receipt_note)}</p>` : ""}`)); if (ok) await db().from("donations").update({ acknowledged_at: new Date().toISOString() }).eq("id", d.id); }
}
