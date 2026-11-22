import { db } from "./db";
export const PRIVATE_BUCKET = "oh-private";
const OK = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const MAX_DOC = 4 * 1024 * 1024;
/** Stores one case document in the PRIVATE bucket (never public; read only through short-lived signed links created for authorised staff or the case owner). */
export async function uploadCaseDoc(file: FormDataEntryValue | null, caseId: string, kind: string, by: "patient" | "staff"): Promise<{ ok: boolean; reason?: string }> {
  if (!file || typeof file === "string" || !(file as File).size) return { ok: false, reason: "empty" }; const f = file as File;
  if (!OK.includes(f.type)) return { ok: false, reason: "type" }; if (f.size > MAX_DOC) return { ok: false, reason: "size" };
  const ext = f.type === "application/pdf" ? "pdf" : f.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${caseId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db().storage.from(PRIVATE_BUCKET).upload(path, Buffer.from(await f.arrayBuffer()), { contentType: f.type, upsert: false }); if (error) return { ok: false, reason: "storage" };
  const { error: e2 } = await db().from("case_documents").insert({ case_id: caseId, kind, file_path: path, file_name: f.name.slice(0, 120), size_bytes: f.size, uploaded_by: by }); return e2 ? { ok: false, reason: "db" } : { ok: true };
}
export async function signedDocUrl(path: string, seconds = 120): Promise<string | null> {
  const { data, error } = await db().storage.from(PRIVATE_BUCKET).createSignedUrl(path, seconds); return error ? null : data?.signedUrl || null;
}
