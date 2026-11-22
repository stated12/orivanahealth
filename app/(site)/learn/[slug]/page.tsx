import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/supabase-server";
import { completeLesson, submitQuiz } from "@/app/training-actions";
import { sanitizeHtml } from "@/lib/sanitize";
import { embedUrl } from "@/lib/embed";
import PageHead from "@/components/PageHead";
export const dynamic = "force-dynamic"; export const metadata = { title: "Learning", robots: { index: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lesson?: string; score?: string; e?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const u = await currentUser(); if (!u) redirect(`/login?next=/learn/${slug}`);
  const { data: c } = await db().from("courses").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (!c) notFound();
  const { data: en } = await db().from("enrollments").select("*").eq("course_id", c.id).eq("user_id", u.id).maybeSingle(); if (!en) redirect(`/training/${slug}`);
  const [ls, done, qs] = await Promise.all([db().from("lessons").select("*").eq("course_id", c.id).eq("is_published", true).order("sort_order"), db().from("lesson_progress").select("lesson_id").eq("user_id", u.id), db().from("quiz_questions").select("*").eq("course_id", c.id).order("sort_order")]);
  const lessons = (ls.data || []) as any[]; const doneIds = new Set((done.data || []).map((d: any) => d.lesson_id)); const cur = lessons.find((l) => l.id === sp.lesson) || lessons.find((l) => !doneIds.has(l.id)) || lessons[0]; const quiz = (qs.data || []) as any[];
  const emb = cur?.video_url ? embedUrl(cur.video_url) : null;
  return (<><PageHead kicker="Learner dashboard" title={c.title} intro={`Progress ${en.progress}%${en.status === "completed" ? " · Completed" : ""}`} />
    <div className="wrap grid gap-8 py-10 lg:grid-cols-4"><aside className="card h-fit p-4 lg:col-span-1"><div className="bar mb-3"><i style={{ width: en.progress + "%" }} /></div><ul className="space-y-1 text-sm">{lessons.map((l) => <li key={l.id}><Link href={`/learn/${slug}?lesson=${l.id}`} className={`block rounded-lg px-2 py-1.5 hover:bg-soft ${cur?.id === l.id ? "bg-mint font-semibold" : ""}`}>{doneIds.has(l.id) ? "✓ " : ""}{l.title}</Link></li>)}{quiz.length > 0 && <li><a href="#quiz" className="block rounded-lg px-2 py-1.5 hover:bg-soft">Quiz</a></li>}</ul></aside>
      <div className="space-y-8 lg:col-span-3">{cur ? <article className="card p-5"><h2 className="text-2xl">{cur.title}</h2>
        {emb ? <div className="mt-4 aspect-video overflow-hidden rounded-xl"><iframe src={emb} title={cur.title} className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen /></div> : cur.video_url ? <video controls className="mt-4 w-full rounded-xl" src={cur.video_url} /> : null}
        {cur.body && <div className="prose-oh mt-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(cur.body) }} />}{cur.file_url && <p className="mt-4"><a className="btn btn-line" href={cur.file_url} target="_blank" rel="noopener noreferrer">Open document</a></p>}
        <form action={completeLesson} className="mt-5"><input type="hidden" name="slug" value={slug} /><input type="hidden" name="lesson" value={cur.id} /><button className="btn btn-dark">{doneIds.has(cur.id) ? "Next" : "Mark complete and continue"}</button></form></article> : <p className="card p-5 text-muted">Lessons have not been added to this programme yet.</p>}
        {c.join_url && <p className="card p-4 text-sm">Live session link: <a className="underline" href={c.join_url} target="_blank" rel="noopener noreferrer">Join</a></p>}
        {quiz.length > 0 && <section id="quiz" className="card p-5"><h2 className="text-2xl">Assessment</h2>{sp.score && <p className={`mt-2 rounded-lg p-3 ${en.passed ? "bg-green-50 text-green-900" : "bg-yellow-50"}`}>Your score: {sp.score}%. Pass mark: {c.pass_mark}%. {en.passed ? "Passed." : "You can try again."}</p>}
          <form action={submitQuiz} className="mt-3 space-y-5"><input type="hidden" name="slug" value={slug} />{quiz.map((q, i) => (<fieldset key={q.id}><legend className="font-semibold text-navy">{i + 1}. {q.question}</legend>{(["a", "b", "c", "d"] as const).map((k) => q["option_" + k] ? <label key={k} className="mt-1 flex items-center gap-2 text-sm"><input type="radio" name={"q_" + q.id} value={k} required />{q["option_" + k]}</label> : null)}</fieldset>))}<button className="btn btn-dark">Submit answers</button></form></section>}
        {en.certificate_no && <section className="card p-5"><h2 className="text-xl">Certificate of completion</h2><p className="mt-1 text-sm text-muted">Issued because the completion criteria for this programme were met.</p><Link href={`/learn/certificate/${en.certificate_no}`} className="btn btn-gold mt-3">View certificate</Link></section>}</div></div></>);
}
