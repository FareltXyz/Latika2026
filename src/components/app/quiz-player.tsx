"use client";

import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Expand,
  LoaderCircle,
  LockKeyhole,
  Radio,
  ShieldAlert,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Question, QuizResult, QuizStatus } from "@/lib/types";

type RoomData = {
  quiz: {
    title: string;
    description: string;
    status: QuizStatus;
    duration_minutes: number;
    started_at: string | null;
    ends_at: string | null;
  };
  participant: {
    name: string;
    score: number | null;
    violations: number;
    answered_at: string | null;
  };
  questions: Question[];
  result?: QuizResult;
};

type WakeLockHandle = { release: () => Promise<void> };

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QuizPlayer({ code }: { code: string }) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [violationMessage, setViolationMessage] = useState("");
  const [error, setError] = useState("");
  const audioRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);
  const lastViolationRef = useRef(0);
  const armedAtRef = useRef(Number.POSITIVE_INFINITY);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`, { cache: "no-store" });
      const data: RoomData & { error?: string } = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Ruang kuis gagal dimuat.");
      setRoom(data);
      setViolations(data.participant.violations);
      if (data.result) setResult(data.result);
      if (data.questions.length) {
        setAnswers((previous) =>
          previous.length === data.questions.length
            ? previous
            : Array(data.questions.length).fill(null),
        );
      }
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Ruang kuis gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (result) return;
    void load();
    const timer = window.setInterval(() => void load(), 2500);
    return () => window.clearInterval(timer);
  }, [load, result]);

  const releaseExamMode = useCallback(async () => {
    armedAtRef.current = Number.POSITIVE_INFINITY;
    setExamStarted(false);
    setViolationMessage("");
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    if (wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => undefined);
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (result || room?.quiz.status === "finished") void releaseExamMode();
  }, [releaseExamMode, result, room?.quiz.status]);

  const playAlarm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .resume()
      .then(() => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(1_150, audio.currentTime);
        oscillator.frequency.setValueAtTime(820, audio.currentTime + 0.45);
        oscillator.frequency.setValueAtTime(1_150, audio.currentTime + 0.9);
        gain.gain.setValueAtTime(0.75, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 1.5);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + 1.5);
      })
      .catch(() => undefined);
  }, []);

  const recordViolation = useCallback(
    (reason: string) => {
      const now = Date.now();
      if (now < armedAtRef.current || now - lastViolationRef.current < 1500)
        return;
      lastViolationRef.current = now;
      setViolationMessage(reason);
      setViolations((value) => value + 1);
      playAlarm();
      void fetch(`/api/rooms/${code}/violation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    },
    [code, playAlarm],
  );

  const requestFullscreen = useCallback(async () => {
    if (
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen
    ) {
      await document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, []);

  async function startExam() {
    const AudioContextConstructor = window.AudioContext;
    if (!audioRef.current && AudioContextConstructor) {
      audioRef.current = new AudioContextConstructor();
    }
    await audioRef.current?.resume().catch(() => undefined);
    await requestFullscreen();

    if ("wakeLock" in navigator) {
      const wakeLockNavigator = navigator as Navigator & {
        wakeLock: { request: (type: "screen") => Promise<WakeLockHandle> };
      };
      wakeLockRef.current = await wakeLockNavigator.wakeLock
        .request("screen")
        .catch(() => null);
    }

    armedAtRef.current = Date.now() + 1500;
    setExamStarted(true);
  }

  async function resumeExam() {
    armedAtRef.current = Date.now() + 1500;
    await requestFullscreen();
    setViolationMessage("");
  }

  useEffect(() => {
    if (!examStarted || result || room?.quiz.status !== "live") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("Anda meninggalkan tab kuis.");
      }
    };
    const onBlur = () => recordViolation("Jendela kuis kehilangan fokus.");
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation("Mode layar penuh dinonaktifkan.");
      }
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blockedShortcut =
        ((event.ctrlKey || event.metaKey) &&
          ["l", "t", "n", "w", "r"].includes(key)) ||
        (event.altKey && ["tab", "f4"].includes(key)) ||
        key === "f11";
      if (blockedShortcut) {
        event.preventDefault();
        recordViolation("Shortcut untuk meninggalkan kuis diblokir.");
      }
    };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [examStarted, recordViolation, result, room?.quiz.status]);

  const submit = useCallback(
    async (allowIncomplete = false) => {
      if (submitting || result) return;
      if (!allowIncomplete && answers.some((answer) => answer === null)) {
        setError("Jawab semua soal sebelum mengirim.");
        return;
      }

      setSubmitting(true);
      setError("");
      const response = await fetch(`/api/rooms/${code}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: answers.map((answer) => answer ?? -1),
        }),
      });
      const data = await response.json();
      setSubmitting(false);
      if (!response.ok) {
        setError(data.error ?? "Jawaban gagal dikirim.");
        return;
      }
      setResult(data);
      await releaseExamMode();
    },
    [answers, code, releaseExamMode, result, submitting],
  );

  useEffect(() => {
    if (!room?.quiz.ends_at || room.quiz.status !== "live" || result) return;
    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(room.quiz.ends_at as string).getTime() - Date.now()) / 1000,
        ),
      );
      setRemainingSeconds(remaining);
      if (remaining === 0 && examStarted) void submit(true);
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [examStarted, result, room?.quiz.ends_at, room?.quiz.status, submit]);

  function selectAnswer(index: number) {
    setAnswers((previous) =>
      previous.map((answer, questionIndex) =>
        questionIndex === current ? index : answer,
      ),
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <LoaderCircle className="size-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-4">
        <p className="max-w-md rounded-2xl bg-red-50 p-6 text-center text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!room) return null;

  if (result) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-7 text-center shadow-2xl shadow-orange-950/10 sm:p-10">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Trophy className="size-10" />
          </span>
          <p className="mt-6 text-sm font-bold text-orange-600">Kuis selesai</p>
          <h1 className="mt-2 text-3xl font-extrabold text-neutral-950">
            Kerja bagus, {room.participant.name}!
          </h1>
          <div className="mx-auto mt-7 flex size-36 flex-col items-center justify-center rounded-full border-8 border-orange-100 bg-orange-50">
            <span className="text-5xl font-black text-orange-600">
              {result.score}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-800">
              Nilai
            </span>
          </div>
          <p className="mt-5 text-neutral-600">
            {result.correct} dari {result.total} jawaban benar · {violations}{" "}
            pelanggaran fokus
          </p>
        </section>

        <section className="mx-auto mt-6 max-w-3xl space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950">
              Review jawaban
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Pelajari jawaban yang salah beserta pembahasannya.
            </p>
          </div>
          {result.review.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                {item.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold leading-relaxed text-neutral-900">
                    {item.position + 1}. {item.prompt}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p
                      className={`rounded-xl px-3 py-2 ${item.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
                    >
                      Jawaban Anda:{" "}
                      {item.selectedIndex >= 0
                        ? item.options[item.selectedIndex]
                        : "Tidak dijawab"}
                    </p>
                    {!item.isCorrect && (
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-800">
                        Jawaban benar: {item.options[item.correctIndex]}
                      </p>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    );
  }

  if (room.quiz.status === "waiting") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-4">
        <section className="w-full max-w-lg rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-2xl shadow-orange-950/10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Radio className="size-8 animate-pulse" />
          </span>
          <p className="mt-6 text-sm font-bold text-orange-600">
            Anda sudah bergabung
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-neutral-950">
            {room.quiz.title}
          </h1>
          <p className="mt-3 text-neutral-500">
            Hai {room.participant.name}, tunggu pengajar memulai kuis{" "}
            {room.quiz.duration_minutes} menit.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600">
            <LoaderCircle className="size-4 animate-spin" /> Menunggu dimulai…
          </div>
        </section>
      </main>
    );
  }

  if (room.quiz.status === "finished" || !room.questions.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-4">
        <section className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Kuis sudah berakhir
          </h1>
          <p className="mt-3 text-neutral-500">
            Mode ujian sudah dilepas. Hubungi pengajar jika jawaban Anda belum
            tersimpan.
          </p>
        </section>
      </main>
    );
  }

  if (!examStarted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-white">
        <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur sm:p-9">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
            <LockKeyhole className="size-7" />
          </span>
          <p className="mt-6 text-sm font-bold text-orange-400">
            Mode ujian terpantau
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">{room.quiz.title}</h1>
          <p className="mt-3 text-neutral-400">
            Waktu tersedia: {formatTime(remainingSeconds)}
          </p>
          <ul className="mt-7 space-y-3 text-sm leading-relaxed text-neutral-300">
            <li className="flex gap-3">
              <Expand className="mt-0.5 size-4 shrink-0 text-orange-400" />
              Kuis meminta layar penuh dan menjaga layar tetap menyala.
            </li>
            <li className="flex gap-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-orange-400" />
              Pindah tab, minimize, keluar fullscreen, dan shortcut browser akan
              dicatat.
            </li>
            <li className="flex gap-3">
              <AlarmClock className="mt-0.5 size-4 shrink-0 text-orange-400" />
              Pelanggaran memicu bunyi peringatan selama perangkat tidak dimute.
            </li>
          </ul>
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200">
            Browser tidak dapat memblokir tombol Power/Home/Recent Apps, tombol
            Windows/Alt+Tab di level sistem, aplikasi lain, atau mengabaikan
            volume mute. Untuk penguncian total gunakan kiosk mode/perangkat
            sekolah terkelola.
          </div>
          <Button
            onClick={startExam}
            className="mt-7 h-12 w-full rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-500"
          >
            <LockKeyhole className="size-4" /> Masuk mode ujian
          </Button>
        </section>
      </main>
    );
  }

  const question = room.questions[current];
  const progress = Math.round(((current + 1) / room.questions.length) * 100);

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-6 sm:px-6 sm:py-10">
      {violationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 p-4 text-white backdrop-blur">
          <section className="w-full max-w-md rounded-[2rem] border border-red-400/30 bg-red-950 p-7 text-center shadow-2xl">
            <AlarmClock className="mx-auto size-14 animate-pulse text-red-300" />
            <h2 className="mt-5 text-2xl font-black">Pelanggaran terdeteksi</h2>
            <p className="mt-3 text-red-100">{violationMessage}</p>
            <p className="mt-2 text-sm text-red-300">
              Kejadian ini sudah dicatat dan terlihat oleh pengajar.
            </p>
            <Button
              onClick={resumeExam}
              className="mt-6 h-11 rounded-xl bg-white font-bold text-red-800 hover:bg-red-50"
            >
              <Expand className="size-4" /> Kembali ke layar penuh
            </Button>
          </section>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Kode {code}
            </p>
            <h1 className="mt-1 line-clamp-1 font-extrabold text-neutral-950">
              {room.quiz.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-black ${remainingSeconds <= 60 ? "bg-red-100 text-red-700" : "bg-white text-neutral-700"}`}
            >
              <Clock3 className="size-4" /> {formatTime(remainingSeconds)}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 shadow-sm">
              {current + 1}/{room.questions.length}
            </span>
          </div>
        </header>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-orange-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="mt-6 rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl shadow-orange-950/5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Soal {current + 1}
            </p>
            {violations > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                <ShieldAlert className="size-3.5" /> {violations} pelanggaran
              </span>
            )}
          </div>
          <h2 className="mt-3 text-xl font-extrabold leading-relaxed text-neutral-950 sm:text-2xl">
            {question.prompt}
          </h2>
          <div className="mt-7 space-y-3">
            {question.options.map((option, index) => {
              const selected = answers[current] === index;
              return (
                <button
                  key={`${index}-${option}`}
                  type="button"
                  onClick={() => selectAnswer(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition sm:text-base ${selected ? "border-orange-500 bg-orange-50 text-orange-950" : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50/40"}`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${selected ? "bg-orange-600 text-white" : "bg-neutral-100 text-neutral-500"}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {selected && (
                    <CheckCircle2 className="size-5 shrink-0 text-orange-600" />
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((value) => value - 1)}
              className="rounded-xl"
            >
              <ArrowLeft className="size-4" /> Sebelumnya
            </Button>
            {current < room.questions.length - 1 ? (
              <Button
                type="button"
                disabled={answers[current] === null}
                onClick={() => setCurrent((value) => value + 1)}
                className="rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700"
              >
                Berikutnya <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={answers[current] === null || submitting}
                onClick={() => void submit(false)}
                className="rounded-xl bg-neutral-950 font-bold text-white hover:bg-neutral-800"
              >
                {submitting && <LoaderCircle className="size-4 animate-spin" />}{" "}
                Kirim jawaban
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
