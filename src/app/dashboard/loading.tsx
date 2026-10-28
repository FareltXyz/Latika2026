import { ArrowRight, Brain, Plus, Sparkles } from "lucide-react";

import { DashboardQuizzesSkeleton } from "@/app/dashboard/page";

export default function DashboardLoading() {
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
          <span className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 font-bold text-white shadow-lg shadow-orange-500/25">
            <Plus className="size-5" /> Buat kuis baru
          </span>
        </div>
      </section>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 px-6 py-9 text-white shadow-xl shadow-indigo-950/20 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-6 -bottom-10 text-white/10 sm:-right-4 sm:-bottom-8">
          <Brain className="size-64 stroke-[1.25] sm:size-80" />
        </div>
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-200">
              <Sparkles className="size-3.5 text-cyan-300" />
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
          <span className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 font-bold text-blue-950 shadow-lg shadow-black/10">
            Mulai Latihan <ArrowRight className="size-4" />
          </span>
        </div>
      </section>

      <DashboardQuizzesSkeleton />
    </main>
  );
}
