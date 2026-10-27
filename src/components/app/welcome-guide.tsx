"use client";

import {
  CheckCircle2,
  Clock3,
  FileQuestion,
  FileText,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "belajar-mandiri-guide-v1";

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);
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
      if (event.key === "Escape") closeGuide();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeGuide, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-guide-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-white shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeGuide}
          aria-label="Tutup panduan"
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="size-5" />
        </button>

        <div className="rounded-t-[1.75rem] bg-neutral-950 px-6 py-7 text-white sm:px-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="size-6" />
          </span>
          <p className="mt-5 text-sm font-bold text-orange-400">
            Selamat datang di Belajar Mandiri
          </p>
          <h2
            id="welcome-guide-title"
            className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Cara membuat dan menjalankan kuis
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-300">
            Ikuti panduan singkat ini agar dokumen dapat diproses dengan benar.
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex gap-3">
              <FileQuestion className="mt-0.5 size-5 shrink-0 text-orange-600" />
              <div>
                <h3 className="font-extrabold text-orange-950">
                  Saat ini khusus dokumen soal
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-orange-900/80">
                  Unggah PDF atau Word (.docx) yang sudah berisi soal. Dokumen
                  yang hanya berisi materi belum menjadi mode terpisah pada
                  versi ini.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FileText,
                title: "1. Unggah dokumen",
                text: "Pilih PDF atau Word (.docx), maksimal 4 MB.",
              },
              {
                icon: Clock3,
                title: "2. Atur kuis",
                text: "Tentukan jumlah soal, kesulitan, durasi, dan masa simpan.",
              },
              {
                icon: Sparkles,
                title: "3. Generate",
                text: "AI mengikuti kunci yang tertulis atau menyelesaikan soal tanpa kunci.",
              },
              {
                icon: Users,
                title: "4. Bagikan kode",
                text: "Peserta bergabung dengan kode, lalu host memulai kuis.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-neutral-200 p-4"
              >
                <step.icon className="size-5 text-orange-600" />
                <h3 className="mt-3 text-sm font-extrabold text-neutral-950">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <p>
              Mode khusus materi sedang dipersiapkan. Nantinya pengguna dapat
              memilih antara <strong>Dokumen Soal</strong> dan
              <strong> Materi Pelajaran</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={closeGuide}
            className="h-12 w-full rounded-xl bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
          >
            Saya mengerti, mulai gunakan
          </button>
          <p className="text-center text-xs text-neutral-400">
            Panduan ini hanya tampil sekali di browser ini.
          </p>
        </div>
      </section>
    </div>
  );
}
