import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
import { uploadImage, uploadPdf } from "@/lib/upload";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
async function upload(fd: FormData) {
  "use server";
  const a = await requirePerm("media.write"); const f = fd.get("file"); const title = String(fd.get("title") || "").trim().slice(0, 120); const alt = String(fd.get("alt") || "").trim().slice(0, 200);
  const isPdf = f && typeof f !== "string" && (f as File).type === "application/pdf"; const url = isPdf ? await uploadPdf(f, "library") : await uploadImage(f, "library"); if (!url) redirect("/admin/media?e=1");
  await db().from("media").insert({ title: title || (f as File).name, url, kind: isPdf ? "document" : "image", alt: alt || null, size_bytes: (f as File).size, uploaded_by: a.id }); await audit(a, "upload", "media"); redirect("/admin/media?ok=1");
}
async function remove(fd: FormData) { "use server"; const a = await requirePerm("media.write"); await db().from("media").delete().eq("id", String(fd.get("id"))); await audit(a, "delete", "media", String(fd.get("id"))); redirect("/admin/media?ok=1"); }
export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requirePerm("media.write"); const sp = await searchParams; const { data } = await db().from("media").select("*").order("created_at", { ascending: false }).limit(200);
  return (<div className="max-w-4xl"><h1 className="text-3xl">Media library</h1><p className="text-sm text-muted">Upload an image or PDF (up to 4 MB), then copy its link into any article, page or form field.</p>{sp.ok && <p className="mt-3 bg-green-50 p-2 text-green-800">Done.</p>}{sp.e && <p className="mt-3 bg-red-50 p-2 text-red-800">Upload failed. Use a JPG, PNG, WebP, GIF or PDF up to 4 MB.</p>}
    <form action={upload} encType="multipart/form-data" className="card mt-4 grid gap-3 p-4 md:grid-cols-3"><input name="title" placeholder="Title" className="input" /><input name="alt" placeholder="Image description (alt)" className="input" /><input type="file" name="file" accept="image/*,application/pdf" required className="text-sm" /><button className="btn btn-dark md:col-span-3">Upload</button></form>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">{(data || []).map((m: any) => <li key={m.id} className="card flex gap-3 p-3">{m.kind === "image" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt={m.alt || ""} className="h-16 w-16 object-cover" /> : <span className="grid h-16 w-16 place-items-center bg-soft text-xs">PDF</span>}<div className="min-w-0 flex-1 text-sm"><p className="truncate font-semibold">{m.title}</p><input readOnly value={m.url} className="input !py-1 text-xs" aria-label="Link" /><form action={remove}><input type="hidden" name="id" value={m.id} /><button className="mt-1 text-xs text-red-700 underline">Delete</button></form></div></li>)}</ul></div>);
}
