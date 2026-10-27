"use client";

import { FileText, LoaderCircle, Sparkles, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

type GenerateQuizResponse = {
  error?: string;
  quizId?: string;
};

async function readGenerateResponse(response: Response) {
  const rawResponse = await response.text();

  if (rawResponse) {
    try {
      return JSON.parse(rawResponse) as GenerateQuizResponse;
    } catch {
      // Vercel may return a plain-text or HTML error before the API route runs.
    }
  }

  if (response.status === 413) {
    return {
      error:
        "Ukuran dokumen terlalu besar. Gunakan PDF/DOCX maksimal 4 MB atau kompres file terlebih dahulu.",
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
      : `Kuis gagal dibuat (HTTP ${response.status}). Silakan coba lagi.`,
  };
}

export function QuizBuilder() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState("8");
  const [difficulty, setDifficulty] = useState("sedang");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [retentionDays, setRetentionDays] = useState("3");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function acceptFile(selected?: File) {
    setError("");
    if (!selected) return;
    const extension = selected.name.toLowerCase().split(".").pop();
    if (extension !== "pdf" && extension !== "docx") {
      setError(
        extension === "doc"
          ? "Format .doc lama belum didukung. Simpan ulang file sebagai .docx."
          : "Pilih dokumen soal berformat PDF atau Word (.docx).",
      );
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("Ukuran dokumen maksimal 4 MB agar dapat diproses di Vercel.");
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
      setError("Pilih dokumen soal terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("questionCount", questionCount);
    formData.set("difficulty", difficulty);
    formData.set("durationMinutes", durationMinutes);
    formData.set("retentionDays", retentionDays);

    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await readGenerateResponse(response);
      if (!response.ok) throw new Error(data.error ?? "Kuis gagal dibuat.");
      if (!data.quizId) {
        throw new Error(
          data.error ?? "Server tidak mengirim ID kuis. Silakan coba lagi.",
        );
      }
      router.push(`/dashboard/quiz/${data.quizId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kuis gagal dibuat.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <UploadCloud className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-950">Unggah dokumen soal</h2>
            <p className="text-sm text-neutral-500">
              PDF atau Word (.docx) · maksimal 4 MB
            </p>
          </div>
        </div>

        <input
          id="quiz-document"
          type="file"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          onChange={onChange}
          className="sr-only"
        />
        <label
          htmlFor="quiz-document"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? "border-orange-500 bg-orange-50"
              : "border-neutral-300 bg-neutral-50/70"
          }`}
        >
          {file ? (
            <>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <FileText className="size-8" />
              </span>
              <p className="mt-4 max-w-xs truncate font-bold text-neutral-900">
                {file.name}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <span className="mt-4 text-sm font-semibold text-orange-600">
                Klik atau jatuhkan dokumen untuk mengganti
              </span>
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <UploadCloud className="size-8" />
              </span>
              <p className="mt-4 font-bold text-neutral-900">
                Tarik PDF atau DOCX ke sini
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                atau pilih dari perangkat Anda
              </p>
              <span className="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold shadow-xs">
                Pilih dokumen
              </span>
            </>
          )}
        </label>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-bold text-neutral-950">Atur kuis</h2>
        <p className="mt-1 text-sm text-neutral-500">
          AI akan menyesuaikan soal dengan pilihan ini.
        </p>

        <label className="mt-6 block text-sm font-semibold text-neutral-700">
          Jumlah soal
          <select
            value={questionCount}
            onChange={(event) => setQuestionCount(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            {[5, 8, 10, 12, 15].map((count) => (
              <option key={count} value={count}>
                {count} soal
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block text-sm font-semibold text-neutral-700">
          Tingkat kesulitan
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </label>

        <label className="mt-5 block text-sm font-semibold text-neutral-700">
          Durasi pengerjaan
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} menit
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-neutral-700">
            Masa simpan kuis
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[3, 5].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRetentionDays(String(days))}
                aria-pressed={retentionDays === String(days)}
                className={`h-12 rounded-xl border text-sm font-bold transition ${
                  retentionDays === String(days)
                    ? "border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-100"
                    : "border-neutral-300 bg-white text-neutral-600 hover:border-orange-300"
                }`}
              >
                {days} hari
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Kuis dan seluruh hasilnya dihapus otomatis setelah masa simpan
            berakhir, meskipun tidak sedang aktif.
          </p>
        </fieldset>

        <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm leading-relaxed text-orange-900">
          Timer dimulai saat host menekan Mulai kuis. Jawaban akan dikirim
          otomatis ketika waktu habis.
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
          className="mt-6 h-12 w-full rounded-xl bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "AI sedang menyusun soal…" : "Generate kuis"}
        </Button>
        {loading && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            Biasanya membutuhkan 15–90 detik. Jangan tutup halaman ini.
          </p>
        )}
      </aside>
    </form>
  );
}
