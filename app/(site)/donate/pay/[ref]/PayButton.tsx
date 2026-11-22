"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment } from "@/app/donate/actions";
export default function PayButton(p: { keyId: string; orderId: string; amount: number; donationRef: string; code: string; name: string; email: string }) {
  const [msg, setMsg] = useState(""); const router = useRouter();
  const open = () => {
    const go = () => {
      const R = (window as any).Razorpay; if (!R) { setMsg("The payment window could not load. Please try again."); return; }
      const rz = new R({ key: p.keyId, amount: p.amount, currency: "INR", order_id: p.orderId, name: "ORIVANA Health", prefill: { name: p.name, email: p.email },
        handler: async (r: any) => { setMsg("Confirming your payment..."); const ok = await confirmPayment(p.donationRef, p.code, r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature); router.push(ok ? `/donate/receipt/${p.donationRef}?code=${p.code}` : `/donate/thanks?ref=${p.donationRef}&code=${p.code}`); } });
      rz.open();
    };
    if ((window as any).Razorpay) return go(); const sc = document.createElement("script"); sc.src = "https://checkout.razorpay.com/v1/checkout.js"; sc.onload = go; sc.onerror = () => setMsg("The payment window could not load."); document.body.appendChild(sc);
  };
  return (<div className="card p-6"><button onClick={open} className="btn btn-gold">Pay securely</button>{msg && <p role="status" className="mt-3 text-sm text-muted">{msg}</p>}</div>);
}
