"use client";

import {
  Check,
  CircleStop,
  Clipboard,
  Clock3,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { QuestionEditor } from "@/components/app/question-editor";
import { Button } from "@/components/ui/button";
import type {
  Participant,
  Question,
  QuizResult,
  QuizStatus,
} from "@/lib/types";

type HostData = {
  quiz: {
    id: string;
    title: string;
    description: string;
    join_code: string;
    status: QuizStatus;
    source_name: string;
    duration_minutes: number;
    started_at: string | null;
    ends_at: string | null;
  };
  questions: Question[];
  participants: Participant[];
  results: Array<QuizResult & { participantId: string }>;
};

export function HostConsole({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [data, setData] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Kuis gagal dimuat.");
      setData(result);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kuis gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function changeStatus(action: "start" | "finish") {
    setActing(true);
    const response = await fetch(`/api/quizzes/${quizId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    setActing(false);
    if (!response.ok) {
      setError(result.error ?? "Status gagal diperbarui.");
      return;
    }
    router.refresh();
    await load();
  }

  async function copyCode() {
    if (!data) return;
    await navigator.clipboard.writeText(data.quiz.join_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700">
        {error || "Kuis tidak ditemukan."}
      </div>
    );
  }

  const answered = data.participants.filter(
    (participant) => participant.answered_at,
  ).length;
  const average = answered
    ? Math.round(
        data.participants.reduce(
          (sum, participant) => sum + (participant.score ?? 0),
          0,
        ) / answered,
      )
    : 0;
  const remainingSeconds = data.quiz.ends_at
    ? Math.max(
        0,
        Math.ceil((new Date(data.quiz.ends_at).getTime() - now) / 1000),
      )
    : data.quiz.duration_minutes * 60;
  const remainingLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const totalViolations = data.participants.reduce(
    (sum, participant) => sum + participant.violations,
    0,
  );

  return (
    <div>
      <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 p-6 text-white shadow-xl sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${data.quiz.status === "live" ? "bg-emerald-500/15 text-emerald-300" : data.quiz.status === "finished" ? "bg-white/10 text-neutral-300" : "bg-amber-500/15 text-amber-300"}`}
              >
                {data.quiz.status === "live"
                  ? "● Sedang live"
                  : data.quiz.status === "finished"
                    ? "Selesai"
                    : "Menunggu peserta"}
              </span>
              <span className="text-xs text-neutral-500">
                {data.quiz.source_name}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-2xl font-extrabold tracking-tight sm:text-3xl">
              {data.quiz.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
              {data.quiz.description}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Kode bergabung
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-3xl font-black tracking-[0.18em] text-orange-400">
                {data.quiz.join_code}
              </span>
              <button
                onClick={copyCode}
                type="button"
                className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                aria-label="Salin kode"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Clipboard className="size-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Peserta buka halaman /join
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Peserta", value: data.participants.length },
          {
            label: "Sudah menjawab",
            value: `${answered}/${data.participants.length}`,
          },
          { label: "Rata-rata nilai", value: answered ? average : "—" },
          {
            label:
              data.quiz.status === "waiting" ? "Durasi kuis" : "Sisa waktu",
            value:
              data.quiz.status === "finished"
                ? "00:00"
                : data.quiz.status === "waiting"
                  ? `${data.quiz.duration_minutes} menit`
                  : remainingLabel,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-neutral-950">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-neutral-950">Kontrol sesi</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {data.quiz.status === "waiting" &&
              `Mulai saat seluruh peserta sudah bergabung. Timer ${data.quiz.duration_minutes} menit aktif setelah dimulai.`}
            {data.quiz.status === "live" &&
              "Peserta sedang mengerjakan soal. Akhiri setelah semuanya mengirim."}
            {data.quiz.status === "finished" &&
              "Sesi sudah ditutup dan nilai akhir tersimpan."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} className="rounded-xl">
            <RefreshCw className="size-4" /> Refresh
          </Button>
          {data.quiz.status === "waiting" && (
            <Button
              disabled={acting}
              onClick={() => changeStatus("start")}
              className="rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {acting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}{" "}
              Mulai kuis
            </Button>
          )}
          {data.quiz.status === "live" && (
            <Button
              disabled={acting}
              onClick={() => changeStatus("finish")}
              className="rounded-xl bg-neutral-950 font-bold text-white hover:bg-neutral-800"
            >
              {acting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CircleStop className="size-4" />
              )}{" "}
              Akhiri kuis
            </Button>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-neutral-950">Peserta</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Terbarui otomatis · {totalViolations} pelanggaran fokus.
              </p>
            </div>
            <Users className="size-5 text-orange-600" />
          </div>
          <div className="mt-5 space-y-2">
            {!data.participants.length && (
              <p className="rounded-xl bg-neutral-50 p-5 text-center text-sm text-neutral-500">
                Belum ada peserta bergabung.
              </p>
            )}
            {data.participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">
                  {participant.name}
                </p>
                {participant.violations > 0 && (
                  <span
                    title="Pelanggaran pindah tab atau keluar fullscreen"
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-700"
                  >
                    <ShieldAlert className="size-3.5" />{" "}
                    {participant.violations}
                  </span>
                )}
                <span
                  className={`text-sm font-bold ${participant.answered_at ? "text-emerald-600" : "text-neutral-400"}`}
                >
                  {participant.answered_at
                    ? `${participant.score}`
                    : "Menunggu"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-neutral-950">
            Soal & kunci jawaban
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {data.questions.length} soal pilihan ganda
            {data.quiz.status === "waiting"
              ? " · dapat diedit sebelum kuis dimulai"
              : " · edit dikunci setelah kuis dimulai"}
          </p>
          <div className="mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
            {data.questions.map((question) => (
              <QuestionEditor
                key={question.id}
                quizId={quizId}
                question={question}
                canEdit={data.quiz.status === "waiting"}
                onSaved={load}
              />
            ))}
          </div>
        </section>
      </div>

      {data.results.length > 0 && (
        <section className="mt-6 rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-extrabold text-neutral-950">
              Hasil & jawaban salah
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Buka nama peserta untuk melihat jawaban yang perlu ditinjau.
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {data.results.map((result) => {
              const participant = data.participants.find(
                (item) => item.id === result.participantId,
              );
              const wrongAnswers = result.review.filter(
                (item) => !item.isCorrect,
              );

              return (
                <details
                  key={result.participantId}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 open:bg-white"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-neutral-900">
                          {participant?.name ?? "Peserta"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {result.correct}/{result.total} benar ·{" "}
                          {wrongAnswers.length} salah ·{" "}
                          {participant?.violations ?? 0} pelanggaran
                        </p>
                      </div>
                      <span className="rounded-lg bg-neutral-950 px-3 py-1.5 text-sm font-black text-white">
                        Nilai {result.score}
                      </span>
                    </div>
                  </summary>
                  <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                    {wrongAnswers.length === 0 ? (
                      <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                        Semua jawaban benar.
                      </p>
                    ) : (
                      wrongAnswers.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-red-100 bg-red-50/60 p-4"
                        >
                          <p className="text-sm font-bold leading-relaxed text-neutral-900">
                            {item.position + 1}. {item.prompt}
                          </p>
                          <p className="mt-3 text-sm text-red-700">
                            Jawaban peserta:{" "}
                            <strong>
                              {item.selectedIndex >= 0
                                ? item.options[item.selectedIndex]
                                : "Tidak dijawab"}
                            </strong>
                          </p>
                          <p className="mt-1 text-sm text-emerald-700">
                            Jawaban benar:{" "}
                            <strong>{item.options[item.correctIndex]}</strong>
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                            {item.explanation}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      <p className="mt-8 text-center text-sm text-neutral-500">
        <Clock3 className="mr-1 inline size-4" /> Mode ujian browser berakhir
        otomatis saat timer habis. Kontrol tombol sistem perangkat membutuhkan
        kiosk mode/perangkat terkelola.
      </p>
      <p className="mt-2 text-center text-sm text-neutral-500">
        Bagikan{" "}
        <Link href="/join" className="font-bold text-orange-600">
          halaman bergabung
        </Link>{" "}
        dan kode di atas kepada peserta.
      </p>
    </div>
  );
}
