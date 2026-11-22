import { db, BUCKET } from "./db";
import { supabaseUrl } from "./env";
const IMG = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const DOC = ["application/pdf"];
async function put(f: File, folder: string, ext: string): Promise<string | null> {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db().storage.from(BUCKET).upload(path, Buffer.from(await f.arrayBuffer()), { contentType: f.type, upsert: false });
  return error ? null : `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${path}`;
}
/** Image upload (max 4 MB). Returns public URL or null. */
export async function uploadImage(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!file || typeof file === "string" || !(file as File).size) return null; const f = file as File;
  if (!IMG.includes(f.type) || f.size > 4 * 1024 * 1024) return null;
  return put(f, folder, f.type.split("/")[1].replace("jpeg", "jpg"));
}
/** PDF upload (max 4 MB because of the serverless request limit; larger PDFs can be linked by URL). */
export async function uploadPdf(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!file || typeof file === "string" || !(file as File).size) return null; const f = file as File;
  if (!DOC.includes(f.type) || f.size > 4 * 1024 * 1024) return null;
  return put(f, folder, "pdf");
}
export async function uploadAny(file: FormDataEntryValue | null, folder: string): Promise<string | null> { return (await uploadImage(file, folder)) || (await uploadPdf(file, folder)); }
