import nodemailer from "nodemailer";
import { smtpConfigured } from "./env";
import { esc } from "./format";
import { getSettings } from "./settings";

/** Sends an email when SMTP is configured; otherwise returns false (nothing is lost, the app also records everything in the database). */
export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!smtpConfigured() || !to) return false;
  try {
    const s = await getSettings(); const port = Number(process.env.SMTP_PORT || 587);
    const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.sendMail({ from: process.env.SMTP_FROM || `${s.brand_name || "ORIVANA Health"} <${process.env.SMTP_USER}>`, to, subject, html });
    return true;
  } catch { return false; }
}
export const wrapMail = (title: string, body: string, footer = "") => `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#17243a"><h2 style="border-bottom:3px solid #c9a96a;padding-bottom:8px;color:#0b2545">${esc(title)}</h2>${body}<p style="color:#777;font-size:12px;margin-top:28px">ORIVANA Health is not a hospital and does not provide diagnosis or treatment. ${footer}</p></div>`;
