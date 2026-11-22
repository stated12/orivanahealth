import { db } from "@/lib/db";
import { verifyWebhook } from "@/lib/payments";
import { finalisePaid } from "@/lib/donations";
export const dynamic = "force-dynamic";
/** Razorpay webhook: payment.captured / payment.failed / refund.processed. Signature-verified and idempotent (event id is stored once). */
export async function POST(req: Request) {
  const raw = await req.text(); if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature") || "")) return new Response("bad signature", { status: 400 });
  let ev: any; try { ev = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  const eid = req.headers.get("x-razorpay-event-id") || `${ev.event}:${ev.payload?.payment?.entity?.id || ev.payload?.refund?.entity?.id || Date.now()}`;
  const ins = await db().from("payment_events").insert({ provider: "razorpay", event_id: eid, payload: ev }); if (ins.error) return new Response("duplicate", { status: 200 });
  const pay = ev.payload?.payment?.entity; const ref = ev.payload?.refund?.entity;
  if (ev.event === "payment.captured" && pay?.order_id) { const { data: d } = await db().from("donations").select("id,status").eq("provider_order_id", pay.order_id).maybeSingle(); if (d && d.status !== "paid") { await db().from("donations").update({ status: "paid", provider_payment_id: pay.id }).eq("id", d.id); await finalisePaid(d.id); } }
  if (ev.event === "payment.failed" && pay?.order_id) await db().from("donations").update({ status: "failed" }).eq("provider_order_id", pay.order_id).neq("status", "paid");
  if (ev.event === "refund.processed" && ref?.payment_id) await db().from("donations").update({ status: "refunded", refund_amount: Number(ref.amount || 0) / 100, refund_note: "Refund processed by provider" }).eq("provider_payment_id", ref.payment_id);
  return new Response("ok");
}
