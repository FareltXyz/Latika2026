import { ArrowRight, FileText, Plus, Radio, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  const { data: quizzes } = await admin
    .from("quizzes")
    .select(
      "id, title, description, join_code, status, source_name, created_at, participants(count)",
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
              Generate soal dari PDF, bagikan kode, lalu lihat hasil peserta
              secara langsung.
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

      {!quizzes?.length ? (
        <section className="mt-6 rounded-[1.75rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <FileText className="size-7" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-neutral-950">
            Belum ada kuis
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Unggah PDF pertama Anda untuk memulai.
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
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="flex items-center gap-2 text-sm text-neutral-500">
                    <Users className="size-4" />{" "}
                    {quiz.participants?.[0]?.count ?? 0} peserta
                  </span>
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Buka{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
