import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section
      aria-label="Ajakan mulai belajar"
      className="bg-gradient-to-b from-orange-50/70 via-white to-white pb-20 pt-4 sm:pb-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-16 text-center shadow-2xl shadow-neutral-900/30 sm:px-12 sm:py-20">
          {/* Background decorations */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-28 right-[-15%] h-72 w-72 rounded-full bg-orange-600/30 blur-3xl" />
            <div className="absolute -bottom-28 left-[-15%] h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(249,115,22,0.12) 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-400">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Gratis untuk memulai
            </div>

            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Siap Belajar dengan Cara yang Lebih{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Seru
              </span>
              ?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
              Bergabung dengan ribuan pelajar yang sudah meningkatkan hasil
              belajarnya. Upload PDF pertamamu dan lihat magic-nya dalam
              hitungan detik.
            </p>

            <div className="mt-9">
              <Button className="h-13 rounded-xl bg-orange-600 px-9 py-3.5 text-base font-semibold text-white shadow-2xl shadow-orange-500/40 transition-all hover:-translate-y-0.5 hover:bg-orange-500">
                Mulai Gratis Sekarang
                <ArrowRight className="size-5" aria-hidden="true" />
              </Button>
              <p className="mt-5 text-xs font-medium text-neutral-500 sm:text-sm">
                Gratis selamanya untuk paket dasar · Tanpa kartu kredit ·
                Batalkan kapan saja
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
