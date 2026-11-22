import { db } from "./db";
/** Internal notification centre entry. permission = who should see it (null = everyone with notifications.read). */
export async function notify(kind: string, title: string, body?: string, link?: string, permission?: string) {
  try { await db().from("notifications").insert({ kind, title, body: body || null, link: link || null, permission: permission || null }); } catch { /* best effort */ }
}
