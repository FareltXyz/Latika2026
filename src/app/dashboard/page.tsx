import {
  ArrowRight,
  Brain,
  FileText,
  Plus,
  Radio,
  Sparkles,
  CalendarClock,
  FileText,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteQuizButton } from "@/components/app/delete-quiz-button";
import { getCurrentUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const statusLabel = {
  waiting: { label: "Menunggu", className: "bg-amber-50 text-amber-700" },
  live: { label: "Sedang live", className: "bg-emerald-50 text-emerald-700" },
  finished: { label: "Selesai", className: "bg-neutral-100 text-neutral-600" },
} as const;

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Also clean up when the owner opens the dashboard, so expiration remains
  // reliable even if a scheduled cleanup is temporarily delayed.
  await admin
    .from("quizzes")
    .update({ status: "finished" })
    .eq("owner_id", userId)
    .eq("status", "live")
    .lte("ends_at", now);

  await admin
    .from("quizzes")
    .delete()
    .eq("owner_id", userId)
    .neq("status", "live")
    .lte("expires_at", now);

  const { data: quizzes, error: quizzesError } = await admin
    .from("quizzes")
    .select(
      "id, title, description, join_code, status, source_name, retention_days, expires_at, created_at, participants(count)",
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const totalParticipants = (quizzes ?? []).reduce(
    (total, quiz) => total + Number(quiz.participants?.[0]?.count ?? 0),
    0,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold text-orange-400">
              Dashboard pengajar
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Buat sesi belajar berikutnya.
            </h1>
            <p className="mt-3 max-w-xl text-neutral-400">
              Generate soal dari PDF atau Word, bagikan kode, lalu lihat hasil
              peserta secara langsung.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-500"
          >
            <Plus className="size-5" /> Buat kuis baru
          </Link>
        </div>
      </section>
      <section className="group relative mt-6 overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 px-6 py-9 text-white shadow-xl shadow-indigo-950/20 sm:px-10 sm:py-11">
        {/* Glow ambient effects */}
        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 size-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-60 rounded-full bg-indigo-500/30 blur-2xl" />

        {/* Decorative brain watermark */}
        <div className="pointer-events-none absolute -right-6 -bottom-10 text-white/10 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:text-white/[0.14] sm:-right-4 sm:-bottom-8">
          <Brain className="size-64 stroke-[1.25] sm:size-80" />
        </div>

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-300 animate-pulse" />
              <span>Flash Memory</span>
              <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-950">
                Baru
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Latih Ingatan & Hafalanmu.
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-blue-100/85 sm:text-base">
              Perkuat penguasaan materi dengan kartu memori interaktif berbasis
              repetisi bertahap (spaced repetition) untuk daya ingat maksimal.
            </p>
          </div>
          <Link
            href="/dashboard/flash-memory"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 font-bold text-blue-950 shadow-lg shadow-black/10 transition hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
          >
            Mulai Latihan{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: FileText, label: "Total kuis", value: quizzes?.length ?? 0 },
          { icon: Users, label: "Total peserta", value: totalParticipants },
          {
            icon: Radio,
            label: "Kuis aktif",
            value:
              quizzes?.filter((quiz) => quiz.status === "live").length ?? 0,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-neutral-950">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-950">Kuis Anda</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Kelola ruang dan pantau hasil.
          </p>
        </div>
      </div>

      {quizzesError ? (
        <section
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-relaxed text-red-800"
        >
          Data kuis belum dapat dimuat. Jalankan migration
          <strong> supabase/migrations/003_quiz_retention.sql</strong> di
          Supabase SQL Editor, lalu muat ulang halaman.
        </section>
      ) : !quizzes?.length ? (
        <section className="mt-6 rounded-[1.75rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <FileText className="size-7" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-neutral-950">
            Belum ada kuis
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Unggah dokumen soal pertama Anda untuk memulai.
          </p>
          <Link
            href="/dashboard/create"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700"
          >
            <Plus className="size-4" /> Buat kuis
          </Link>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => {
            const status =
              statusLabel[quiz.status as keyof typeof statusLabel] ??
              statusLabel.waiting;
            return (
              <article
                key={quiz.id}
                className="group rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="font-mono text-sm font-extrabold tracking-[0.18em] text-orange-600">
                    {quiz.join_code}
                  </span>
                </div>
                <h3 className="mt-5 line-clamp-2 text-lg font-extrabold text-neutral-950">
                  {quiz.title}
                </h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-neutral-500">
                  {quiz.description}
                </p>
                <p className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <CalendarClock className="size-4 text-orange-600" />
                  Tersimpan sampai{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(quiz.expires_at))}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="flex items-center gap-2 text-sm text-neutral-500">
                    <Users className="size-4" />{" "}
                    {quiz.participants?.[0]?.count ?? 0} peserta
                  </span>
                  <div className="flex items-center gap-4">
                    {quiz.status === "finished" && (
                      <DeleteQuizButton
                        quizId={quiz.id}
                        quizTitle={quiz.title}
                      />
                    )}
                    <Link
                      href={`/dashboard/quiz/${quiz.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700"
                    >
                      Buka{" "}
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
