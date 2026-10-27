import type { LucideIcon } from "lucide-react";
import { BrainCircuit, ClipboardCheck, FileUp } from "lucide-react";

type Step = {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: FileUp,
    number: "01",
    title: "Upload Materi PDF",
    description:
      "Unggah file PDF materi pelajaran, rangkuman, atau catatan kuliahmu. Prosesnya cepat dan mendukung berbagai ukuran file.",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "AI Menganalisis Materi",
    description:
      "Kecerdasan buatan membaca seluruh dokumen, memahami poin-poin penting, dan menyusun pertanyaan berkualitas secara otomatis.",
  },
  {
    icon: ClipboardCheck,
    number: "03",
    title: "Quiz Siap Dikerjakan",
    description:
      "Quiz interaktif langsung tersedia dalam hitungan detik. Kerjakan, dapatkan skor instan, dan lihat pembahasan setiap soalnya.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="relative overflow-hidden bg-orange-50/60 py-20 sm:py-28"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-100/80 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-amber-100/80 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 shadow-sm">
            Cara Kerja
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Tiga Langkah Mudah,{" "}
            <span className="text-orange-600">Tanpa Ribet</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Tidak perlu keahlian khusus. Dari PDF biasa menjadi quiz yang siap
            menguji pemahamanmu hanya dalam hitungan detik.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-12 sm:gap-10 lg:grid-cols-3 lg:gap-8">
          {/* Dashed connector (desktop only) */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-9 hidden border-t-[3px] border-dashed border-orange-300/70 lg:block"
          />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Icon badge */}
              <div className="relative z-10 mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-neutral-950 text-orange-400 shadow-xl shadow-neutral-900/20 transition-transform duration-300 hover:scale-105">
                <step.icon className="h-7 w-7" aria-hidden="true" />
                <span className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-extrabold text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-50">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-neutral-950">
                {step.title}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600 sm:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
