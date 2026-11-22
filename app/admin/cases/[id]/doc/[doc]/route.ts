import { db } from "@/lib/db";
import { getAdmin, can, audit } from "@/lib/auth";
import { signedDocUrl } from "@/lib/private";
export const dynamic = "force-dynamic";
/** Opens a private case document through a short-lived signed link, only for staff with documents.read. Every access is written to the audit log. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; doc: string }> }) {
  const { id, doc } = await params; const a = await getAdmin(); if (!a || !can(a, "documents.read")) return new Response("Forbidden", { status: 403 });
  const { data: d } = await db().from("case_documents").select("file_path,case_id").eq("id", doc).eq("case_id", id).maybeSingle(); if (!d) return new Response("Not found", { status: 404 });
  const url = await signedDocUrl(d.file_path, 90); if (!url) return new Response("Unavailable", { status: 502 }); await audit(a, "case_doc_view", "case_documents", doc);
  return Response.redirect(url, 302);
}
