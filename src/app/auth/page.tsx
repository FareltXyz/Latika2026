import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AuthForm } from "@/components/app/auth-form";
import { Brand } from "@/components/app/brand";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-orange-600"
        >
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 py-14 lg:grid-cols-[1fr_28rem] lg:py-20">
        <section className="hidden lg:block">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-100/70 px-4 py-2 text-sm font-bold text-orange-700">
            Ruang kuis siap dalam hitungan menit
          </span>
          <h2 className="mt-6 max-w-xl text-5xl font-extrabold leading-[1.08] tracking-tight text-neutral-950">
            Dari PDF menjadi pengalaman belajar yang hidup.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
            Buat soal dengan AI, bagikan kode enam karakter, dan pantau hasil
            peserta dari satu dashboard.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "PDF tidak disimpan permanen",
              "Jawaban dinilai otomatis",
              "Peserta cukup memakai kode kuis",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 font-semibold text-neutral-700"
              >
                <CheckCircle2 className="size-5 text-orange-600" /> {item}
              </li>
            ))}
          </ul>
        </section>
        <AuthForm
          initialError={
            error === "callback"
              ? "Tautan login tidak valid atau sudah kedaluwarsa."
              : undefined
          }
        />
      </div>
    </main>
  );
}
