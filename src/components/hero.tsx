import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const quizOptions = [
  { label: "Menyintesis protein sel", state: "default" },
  { label: "Menghasilkan energi (ATP)", state: "correct" },
  { label: "Mengatur pembelahan sel", state: "default" },
  { label: "Menyimpan informasi genetik", state: "default" },
];

export function Hero() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28"
    >
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-white" />
        {/* Dot pattern */}
        <div
          className="absolute inset-x-0 top-0 h-[480px] opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(234, 88, 12, 0.14) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
            maskImage:
              "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute left-[-12%] top-1/3 h-[380px] w-[380px] rounded-full bg-amber-100/70 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          {/* ===== Left: copywriting ===== */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700 shadow-sm">
              <Sparkles
                className="h-4 w-4 animate-pulse-soft"
                aria-hidden="true"
              />
              Didukung Teknologi AI Terkini
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-neutral-950 sm:text-5xl xl:text-[3.75rem]">
              Ubah Dokumen Soal Jadi{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Quiz Interaktif
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 12"
                  className="absolute -bottom-2 left-0 w-full text-orange-400"
                  fill="none"
                >
                  <path
                    d="M3 9C60 3 160 3 217 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              dalam Hitungan Detik
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:mx-0">
              Upload soal dalam bentuk PDF atau Word, biarkan AI menyiapkan
              pilihan jawaban dan pembahasan, lalu bagikan kuis dengan kode.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                asChild
                className="h-13 w-full rounded-xl bg-orange-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-2xl hover:shadow-orange-500/35 sm:w-auto"
              >
                <Link href="/dashboard/create">
                  Buat Quiz Sekarang{" "}
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 w-full rounded-xl border-neutral-300 bg-white/70 px-8 py-3.5 text-base font-semibold text-neutral-800 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 sm:w-auto"
              >
                <Link href="/join">
                  <PlayCircle className="size-5" aria-hidden="true" /> Gabung
                  Kuis
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold text-neutral-600 lg:justify-start">
              {["Tanpa kartu kredit", "Login Google", "Skor otomatis"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-orange-600" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ===== Right: interactive mockup ===== */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* Main quiz card */}
            <div className="relative rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xl shadow-orange-500/10 sm:p-7">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <ListChecks className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Quiz Biologi — Bab 3
                    </p>
                    <p className="text-xs text-neutral-500">
                      Dihasilkan AI · 25 soal
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-orange-400">
                  Soal 8/25
                </span>
              </div>

              {/* Question */}
              <p className="mt-5 text-base font-semibold leading-snug text-neutral-900">
                Apa fungsi utama mitokondria dalam sel?
              </p>

              {/* Options */}
              <ul className="mt-4 space-y-2.5">
                {quizOptions.map((option, i) => (
                  <li
                    key={option.label}
                    className={
                      option.state === "correct"
                        ? "flex items-center justify-between rounded-xl border-2 border-orange-500 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-900"
                        : "flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600"
                    }
                  >
                    <span>
                      <span className="mr-2 font-bold text-neutral-400">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {option.label}
                    </span>
                    {option.state === "correct" && (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-orange-600"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ul>

              {/* Progress */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span>Progres Quiz</span>
                  <span className="font-bold text-orange-600">32%</span>
                </div>
                <Progress
                  value={32}
                  className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-400"
                />
              </div>
            </div>

            {/* Floating card: document uploaded */}
            <div className="absolute -top-9 -left-3 animate-float sm:-left-8">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xl shadow-neutral-900/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    latihan-biologi.docx
                  </p>
                  <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Berhasil diunggah
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card: AI generated */}
            <div className="absolute -bottom-10 -right-2 animate-float-delayed sm:-right-6">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xl shadow-neutral-900/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    +25 Soal Baru
                  </p>
                  <p className="text-xs font-medium text-neutral-500">
                    Dihasilkan AI · 12 detik
                  </p>
                </div>
              </div>
            </div>

            {/* Floating score badge */}
            <div className="absolute -right-3 -top-7 hidden animate-float sm:block lg:-right-5">
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-neutral-950 text-white shadow-xl shadow-neutral-900/25">
                <span className="text-2xl font-extrabold text-orange-400">
                  92
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  Nilai
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
