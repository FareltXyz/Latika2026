"use client";

import {
  Brain,
  FileText,
  Layers,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/button";

const MAX_PDF_SIZE = 4 * 1024 * 1024;

type GenerateFlashMemoryResponse = {
  error?: string;
  setId?: string;
};

async function readGenerateResponse(response: Response) {
  const rawResponse = await response.text();

  if (rawResponse) {
    try {
      return JSON.parse(rawResponse) as GenerateFlashMemoryResponse;
    } catch {
      // Plain-text or HTML gateway response fallback
    }
  }

  if (response.status === 413) {
    return {
      error:
        "Ukuran PDF terlalu besar untuk dikirim. Gunakan PDF maksimal 4 MB atau kompres PDF terlebih dahulu.",
    };
  }

  if ([500, 502, 503, 504].includes(response.status)) {
    return {
      error:
        "Server atau layanan AI sedang sibuk. Tunggu sebentar lalu coba generate lagi.",
    };
  }

  return {
    error: response.ok
      ? "Respons server tidak dapat dibaca. Silakan coba generate lagi."
      : `Flash Memory gagal dibuat (HTTP ${response.status}). Silakan coba lagi.`,
  };
}

export function FlashMemoryBuilder() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pairCount, setPairCount] = useState("8");
  const [difficulty, setDifficulty] = useState("sedang");
  const [focusMode, setFocusMode] = useState("campuran");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function acceptFile(selected?: File) {
    setError("");
    if (!selected) return;
    if (
      selected.type !== "application/pdf" ||
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Pilih file dengan format PDF.");
      return;
    }
    if (selected.size > MAX_PDF_SIZE) {
      setError("Ukuran PDF maksimal 4 MB agar dapat diproses dengan cepat.");
      return;
    }
    setFile(selected);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Pilih file PDF materi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("pairCount", pairCount);
    formData.set("difficulty", difficulty);
    formData.set("focusMode", focusMode);

    try {
      const response = await fetch("/api/flash-memory/generate", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await readGenerateResponse(response);
      if (!response.ok) {
        throw new Error(data.error ?? "Permainan Flash Memory gagal dibuat.");
      }
      if (!data.setId) {
        throw new Error(
          data.error ??
            "Server tidak mengirim ID permainan. Silakan coba lagi.",
        );
      }
      router.push(`/dashboard/flash-memory/${data.setId}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Permainan Flash Memory gagal dibuat.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <UploadCloud className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-950">
              Unggah PDF untuk Latihan Memori
            </h2>
            <p className="text-sm text-neutral-500">
              AI akan mengekstrak konsep penting menjadi arena minigame (maks. 4
              MB)
            </p>
          </div>
        </div>

        <input
          id="flash-memory-pdf"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onChange}
          className="sr-only"
        />
        <label
          htmlFor="flash-memory-pdf"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? "border-blue-500 bg-blue-50/80"
              : "border-neutral-300 bg-neutral-50/70 hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          {file ? (
            <>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FileText className="size-8" />
              </span>
              <p className="mt-4 max-w-xs truncate font-bold text-neutral-900">
                {file.name}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Siap diekstrak AI
              </p>
              <span className="mt-4 text-sm font-semibold text-blue-700">
                Klik atau jatuhkan PDF lain untuk mengganti
              </span>
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Brain className="size-8" />
              </span>
              <p className="mt-4 font-bold text-neutral-900">
                Tarik materi PDF Anda ke sini
              </p>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Catatan kuliah, rangkuman bab, modul pelajaran, atau handout
                ujian
              </p>
              <span className="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 shadow-xs">
                Pilih File PDF
              </span>
            </>
          )}
        </label>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "Cocokkan Kartu",
              desc: "Uji memori spasial & konsep dengan kombo",
            },
            {
              icon: Zap,
              title: "Kilat Ingatan",
              desc: "Tantangan refleks cepat berbatas waktu",
            },
            {
              icon: Sparkles,
              title: "Jembatan Keledai",
              desc: "Trik asosiasi unik otomatis dari AI",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-bold text-neutral-950">Konfigurasi Minigame</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sesuaikan jumlah kartu dan kedalaman materi yang ingin dilatih.
        </p>

        <label className="mt-6 block text-sm font-semibold text-neutral-700">
          Jumlah pasangan konsep
          <select
            value={pairCount}
            onChange={(event) => setPairCount(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            {[
              { pairs: 6, label: "6 pasang (12 kartu · Pemanasan)" },
              { pairs: 8, label: "8 pasang (16 kartu · Ideal)" },
              { pairs: 10, label: "10 pasang (20 kartu · Menantang)" },
              { pairs: 12, label: "12 pasang (24 kartu · Master)" },
            ].map((option) => (
              <option key={option.pairs} value={option.pairs}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block text-sm font-semibold text-neutral-700">
          Tingkat kesulitan
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="mudah">Mudah — Istilah dasar & populer</option>
            <option value="sedang">Sedang — Konsep inti & hubungan</option>
            <option value="sulit">Sulit — Detail mendalam & analitis</option>
          </select>
        </label>

        <label className="mt-5 block text-sm font-semibold text-neutral-700">
          Fokus ekstraksi AI
          <select
            value={focusMode}
            onChange={(event) => setFocusMode(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="campuran">Campuran Komprehensif</option>
            <option value="konsep">Istilah & Definisi Inti</option>
            <option value="fakta">Fakta, Rumus & Mekanisme</option>
          </select>
        </label>

        <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-950">
          Satu kali generate langsung membuka{" "}
          <span className="font-bold">3 mode minigame</span> sekaligus: Cocokkan
          Kartu, Kilat Ingatan, dan Kartu Hafalan Berulang.
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || !file}
          className="mt-6 h-12 w-full rounded-xl bg-blue-700 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "AI merancang arena memori…" : "Generate Minigame"}
        </Button>
        {loading && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            Membutuhkan sekitar 15–60 detik untuk mengekstrak konsep & jembatan
            keledai dari PDF.
          </p>
        )}
      </aside>
    </form>
  );
}
