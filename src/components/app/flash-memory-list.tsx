"use client";

import {
  ArrowRight,
  Clock3,
  FileText,
  Gamepad2,
  Layers,
  LoaderCircle,
  Trash2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { FlashMemoryDifficulty, FlashMemorySetSummary } from "@/lib/types";

const difficultyBadge: Record<
  FlashMemoryDifficulty,
  { label: string; className: string }
> = {
  mudah: {
    label: "Mudah",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  sedang: {
    label: "Sedang",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  sulit: {
    label: "Sulit",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

function formatDuration(seconds: number | null) {
  if (seconds === null || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}d` : `${secs}d`;
}

export function FlashMemoryList({
  initialSets,
}: {
  initialSets: FlashMemorySetSummary[];
}) {
  const router = useRouter();
  const [sets, setSets] = useState(initialSets);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/flash-memory/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSets((previous) => previous.filter((item) => item.id !== id));
        setConfirmDeleteId(null);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (!sets.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Gamepad2 className="size-7" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-neutral-950">
          Belum ada arena Flash Memory
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Unggah PDF materi pertama Anda pada panel di atas untuk langsung
          memainkan minigame daya ingat berbasis AI.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {sets.map((set) => {
        const diff = difficultyBadge[set.difficulty] ?? difficultyBadge.sedang;
        const isConfirming = confirmDeleteId === set.id;
        const isDeleting = deletingId === set.id;

        return (
          <article
            key={set.id}
            className="group flex flex-col justify-between rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-bold ${diff.className}`}
                >
                  {diff.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <Layers className="size-3.5 text-blue-600" />
                  {set.cards_count} pasang ({set.cards_count * 2} kartu)
                </span>
              </div>

              <h3 className="mt-4 line-clamp-2 text-lg font-extrabold text-neutral-950">
                {set.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-neutral-500">
                {set.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{set.source_name}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-neutral-50 p-3 text-center">
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-extrabold text-neutral-900">
                    <Trophy className="size-3.5 text-amber-500" />
                    {set.best_score}
                  </p>
                  <p className="text-[11px] text-neutral-500">Skor Terbaik</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-extrabold text-neutral-900">
                    <Clock3 className="size-3.5 text-blue-600" />
                    {formatDuration(set.best_time_seconds)}
                  </p>
                  <p className="text-[11px] text-neutral-500">Tercepat</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-extrabold text-neutral-900">
                    <Gamepad2 className="size-3.5 text-indigo-600" />
                    {set.plays_count}x
                  </p>
                  <p className="text-[11px] text-neutral-500">Dimainkan</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3.5">
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void handleDelete(set.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : null}
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setConfirmDeleteId(null)}
                      className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(set.id)}
                    title="Hapus arena ini"
                    className="inline-flex size-9 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}

                <Link
                  href={`/dashboard/flash-memory/${set.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Mainkan{" "}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
