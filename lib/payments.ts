import crypto from "crypto";
/** Razorpay adapter. Nothing here runs unless the admin switches are on AND the keys exist (see paymentsLive). Raw card data never touches this server: the provider's hosted checkout collects it. */
const auth = () => "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
export async function createOrder(amountInr: number, receipt: string): Promise<{ id: string } | null> {
  try {
    const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: auth(), "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.round(amountInr * 100), currency: "INR", receipt, payment_capture: 1 }) });
    if (!r.ok) return null; const j: any = await r.json(); return j?.id ? { id: j.id } : null;
  } catch { return null; }
}
const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
/** Checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export const verifyCheckout = (orderId: string, paymentId: string, sig: string) => !!process.env.RAZORPAY_KEY_SECRET && eq(crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex"), sig);
/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export const verifyWebhook = (raw: string, sig: string) => !!process.env.RAZORPAY_WEBHOOK_SECRET && !!sig && eq(crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest("hex"), sig);
