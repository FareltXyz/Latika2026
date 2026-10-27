import {
  FileUp,
  Gauge,
  LineChart,
  ListChecks,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "Generator Quiz AI",
    description:
      "AI membaca soal pada dokumen, mengikuti kunci jawaban yang tersedia, atau menyelesaikan soal yang belum memiliki jawaban.",
  },
  {
    icon: FileUp,
    title: "Upload PDF & Word",
    description:
      "Cukup drag & drop dokumen soal PDF atau Word (.docx) hingga 4 MB. File tidak disimpan permanen setelah diproses.",
    href: "/privacy",
    linkLabel: "Baca kebijakan privasi",
  },
  {
    icon: ListChecks,
    title: "Beragam Tipe Soal",
    description:
      "Setiap soal memiliki empat opsi, satu jawaban benar, dan pembahasan ringkas berdasarkan dokumen soal.",
  },
  {
    icon: Gauge,
    title: "Penilaian Otomatis",
    description:
      "Dapatkan skor, jawaban benar, dan pembahasan lengkap secara instan begitu quiz selesai dikerjakan. Tanpa perlu menunggu lama.",
  },
  {
    icon: LineChart,
    title: "Analisis Progres Belajar",
    description:
      "Pantau siapa yang sudah bergabung, siapa yang sudah menjawab, nilai peserta, dan rata-rata kelas dari dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Privasi Data Terjaga",
    description:
      "Kunci database dan AI hanya berjalan di server. Dokumen diproses saat generasi dan tidak disimpan di database aplikasi.",
  },
];

export function Features() {
  return (
    <section id="fitur" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
            Fitur Unggulan
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Semua yang Kamu Butuhkan untuk{" "}
            <span className="text-orange-600">Belajar Efektif</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Dirancang untuk membantu kamu belajar lebih cepat dan terukur — dari
            proses upload soal sampai analisis hasil belajar.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10"
            >
              {/* Decorative hover glow */}
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-orange-50 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="relative">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-neutral-950">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                  {feature.description}
                </p>
                {feature.href && feature.linkLabel && (
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex text-sm font-bold text-orange-600 underline decoration-orange-200 underline-offset-4 transition hover:text-orange-700 hover:decoration-orange-500"
                  >
                    {feature.linkLabel}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
