"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/supabase-server";
import { allow } from "@/lib/ratelimit";
import { randomCode } from "@/lib/content";

async function me(next: string) { const u = await currentUser(); if (!u) redirect(`/login?next=${encodeURIComponent(next)}`); return u; }
export async function enrol(fd: FormData) {
  const slug = String(fd.get("slug") || ""); const u = await me(`/training/${slug}`);
  const { data: c } = await db().from("courses").select("id,registration_open").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!c || !c.registration_open) redirect(`/training/${slug}?e=closed`);
  await db().from("enrollments").upsert({ course_id: c.id, user_id: u.id }, { onConflict: "course_id,user_id", ignoreDuplicates: true }); redirect(`/learn/${slug}`);
}
async function recompute(courseId: string, userId: string) {
  const [{ data: ls }, { data: done }, { data: course }, { data: qs }, { data: en }] = await Promise.all([db().from("lessons").select("id").eq("course_id", courseId).eq("is_published", true), db().from("lesson_progress").select("lesson_id").eq("user_id", userId), db().from("courses").select("certificate_enabled").eq("id", courseId).maybeSingle(), db().from("quiz_questions").select("id").eq("course_id", courseId), db().from("enrollments").select("*").eq("course_id", courseId).eq("user_id", userId).maybeSingle()]);
  if (!en) return; const ids = new Set((ls || []).map((l: any) => l.id)); const n = (done || []).filter((d: any) => ids.has(d.lesson_id)).length; const total = ids.size; const progress = total ? Math.round((n / total) * 100) : 0;
  const hasQuiz = (qs || []).length > 0; const complete = progress >= 100 && total > 0 && (!hasQuiz || en.passed === true);
  const upd: any = { progress, status: complete ? "completed" : "enrolled" }; if (complete && !en.completed_at) upd.completed_at = new Date().toISOString();
  if (complete && course?.certificate_enabled && !en.certificate_no) upd.certificate_no = "OHC-" + new Date().getFullYear() + "-" + randomCode(6);
  await db().from("enrollments").update(upd).eq("id", en.id);
}
export async function completeLesson(fd: FormData) {
  const slug = String(fd.get("slug") || ""), lessonId = String(fd.get("lesson") || ""); const u = await me(`/learn/${slug}`);
  const { data: l } = await db().from("lessons").select("id,course_id").eq("id", lessonId).eq("is_published", true).maybeSingle(); if (!l) redirect(`/learn/${slug}`);
  const { data: en } = await db().from("enrollments").select("id").eq("course_id", l.course_id).eq("user_id", u.id).maybeSingle(); if (!en) redirect(`/training/${slug}`);
  await db().from("lesson_progress").upsert({ user_id: u.id, lesson_id: l.id }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true }); await recompute(l.course_id, u.id);
  const { data: all } = await db().from("lessons").select("id").eq("course_id", l.course_id).eq("is_published", true).order("sort_order"); const i = (all || []).findIndex((x: any) => x.id === l.id); const nxt = (all || [])[i + 1];
  redirect(`/learn/${slug}${nxt ? "?lesson=" + nxt.id : "#quiz"}`);
}
export async function submitQuiz(fd: FormData) {
  const slug = String(fd.get("slug") || ""); const u = await me(`/learn/${slug}`); if (!(await allow("quiz", 20, 600, slug))) redirect(`/learn/${slug}?e=rate#quiz`);
  const { data: c } = await db().from("courses").select("id,pass_mark").eq("slug", slug).maybeSingle(); if (!c) redirect("/training");
  const { data: en } = await db().from("enrollments").select("id").eq("course_id", c.id).eq("user_id", u.id).maybeSingle(); if (!en) redirect(`/training/${slug}`);
  const { data: qs } = await db().from("quiz_questions").select("id,correct").eq("course_id", c.id); if (!(qs || []).length) redirect(`/learn/${slug}`);
  let right = 0; for (const q of qs || []) if (String(fd.get("q_" + q.id) || "") === q.correct) right++;
  const score = Math.round((right / (qs || []).length) * 100); const passed = score >= (c.pass_mark || 60);
  await db().from("enrollments").update({ score, passed }).eq("id", en.id); await recompute(c.id, u.id); redirect(`/learn/${slug}?score=${score}#quiz`);
}
