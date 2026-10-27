import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { QuizBuilder } from "@/components/app/quiz-builder";

export default function CreateQuizPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-orange-600"
      >
        <ArrowLeft className="size-4" /> Kembali ke dashboard
      </Link>
      <div className="mb-8 mt-6">
        <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
          <Sparkles className="size-4" /> Generator kuis AI
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
          Ubah dokumen soal menjadi kuis
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Unggah soal dalam format PDF atau Word (.docx), pilih pengaturan, lalu
          AI menyiapkan ruang kuis beserta kode bergabung.
        </p>
      </div>
      <QuizBuilder />
    </main>
  );
}
