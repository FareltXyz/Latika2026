"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  FileQuestion,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "belajar-mandiri-guide-v2";

const steps = [
  {
    icon: FileQuestion,
    label: "Siapkan file",
    text: "Pilih PDF atau Word (.docx) berisi soal, maksimal 4 MB.",
  },
  {
    icon: Clock3,
    label: "Atur kuis",
    text: "Tentukan jumlah soal, kesulitan, durasi, dan masa simpan.",
  },
  {
    icon: Sparkles,
    label: "Generate dengan AI",
    text: "Kunci yang tersedia dipertahankan; soal tanpa kunci diselesaikan AI.",
  },
  {
    icon: UsersRound,
    label: "Bagikan kode",
    text: "Peserta masuk memakai kode ruang, lalu pengajar memulai kuis.",
  },
];

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeGuide = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // The guide can still be closed when browser storage is unavailable.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(STORAGE_KEY) !== "dismissed");
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGuide();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeGuide, open]);

  if (!open) return null;

  return (
    <div className="guide-backdrop fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto bg-neutral-950/75 p-3 backdrop-blur-md sm:p-6">
      <div className="flex min-h-full min-w-0 items-center justify-center">
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-guide-title"
          aria-describedby="welcome-guide-description"
          className="guide-panel relative grid min-w-0 w-[calc(100vw-1.5rem)] max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_32px_100px_-28px_rgba(0,0,0,0.65)] lg:grid-cols-[0.82fr_1.18fr]"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeGuide}
            aria-label="Tutup panduan"
            className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 text-neutral-500 shadow-sm backdrop-blur transition hover:rotate-6 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <X className="size-5" />
          </button>

          <aside className="relative hidden min-h-full overflow-hidden bg-neutral-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="guide-orb absolute -left-20 -top-20 size-64 rounded-full bg-orange-500/30 blur-3xl" />
            <div className="guide-orb guide-orb-delayed absolute -bottom-24 -right-16 size-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] bg-[size:24px_24px] opacity-30" />

            <div className="relative">
              <div className="w-fit rounded-[1.75rem] bg-white p-2.5 shadow-2xl shadow-orange-500/20">
                <Image
                  src="/belajar-mandiri-logo.png"
                  alt="Logo Belajar Mandiri"
                  width={104}
                  height={104}
                  className="size-24 rounded-2xl object-cover"
                  priority
                />
              </div>
              <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-300">
                <Sparkles className="size-3.5" /> Panduan singkat
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
                Dari dokumen soal menjadi kuis siap pakai.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                Empat langkah sederhana untuk membuat sesi belajar yang rapi,
                cepat, dan mudah diikuti.
              </p>
            </div>

            <div className="relative mt-10 flex flex-wrap gap-2">
              {["PDF", "DOCX", "Maks. 4 MB"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </aside>

          <div className="relative min-w-0 px-5 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-12 lg:px-10 lg:py-10">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image
                src="/belajar-mandiri-logo.png"
                alt="Logo Belajar Mandiri"
                width={56}
                height={56}
                className="size-14 rounded-2xl border border-orange-100 object-cover shadow-md shadow-orange-500/10"
                priority
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Panduan singkat
                </p>
                <p className="font-extrabold text-neutral-950">
                  Belajar Mandiri
                </p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Mulai dengan benar
            </p>
            <h1
              id="welcome-guide-title"
              className="mt-2 max-w-xl text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl"
            >
              Sebelum membuat kuis, perhatikan format dokumennya.
            </h1>
            <p
              id="welcome-guide-description"
              className="mt-3 text-sm leading-relaxed text-neutral-500"
            >
              Saat ini generator dirancang khusus untuk dokumen yang sudah
              berisi soal.
            </p>

            <div className="mt-6 flex min-w-0 gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
                <BookOpenCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-orange-950">
                  Gunakan dokumen soal, bukan materi saja
                </h3>
                <p className="mt-1 break-words text-xs leading-relaxed text-orange-900/75">
                  Mode khusus materi sedang disiapkan. Nantinya tersedia dua
                  pilihan terpisah: <strong>Dokumen Soal</strong> dan
                  <strong> Materi Pelajaran</strong>.
                </p>
              </div>
            </div>

            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {steps.map((step, index) => (
                <li
                  key={step.label}
                  className="guide-step group relative rounded-2xl border border-neutral-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white transition group-hover:bg-orange-600">
                      <step.icon className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        Langkah {index + 1}
                      </p>
                      <h3 className="mt-0.5 text-sm font-extrabold text-neutral-950">
                        {step.label}
                      </h3>
                      <p className="mt-1 break-words text-xs leading-relaxed text-neutral-500">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={closeGuide}
              className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-neutral-950/15 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/20 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:text-sm"
            >
              <Check className="size-4" /> Saya mengerti, mulai gunakan
              <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-center text-[11px] text-neutral-400">
              Panduan ini hanya ditampilkan sekali di browser ini.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
