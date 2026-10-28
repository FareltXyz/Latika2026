import { Brain, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { BackLink } from "@/components/app/back-link";
import { FlashMemoryBuilder } from "@/components/app/flash-memory-builder";
import { FlashMemoryList } from "@/components/app/flash-memory-list";
import { getCurrentUserId } from "@/lib/auth";
import { listFlashMemorySets } from "@/lib/flash-memory-store";

function SavedArenasSkeleton() {
  return (
    <section className="mt-12" aria-hidden="true">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-950">
            Koleksi Arena Flash Memory Anda
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Mainkan kembali materi yang pernah dibuat dan pecahkan rekor skor
            terbaik Anda.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["stat-a", "stat-b", "stat-c"].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-xs"
            >
              <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="mt-2 h-6 w-10 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {["deck-1", "deck-2", "deck-3"].map((key) => (
          <div
            key={key}
            className="h-64 animate-pulse rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm"
          />
        ))}
      </div>
    </section>
  );
}

async function SavedArenasSection() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");

  const sets = await listFlashMemorySets(userId);
  const totalPlays = sets.reduce((sum, item) => sum + item.plays_count, 0);
  const highestScore = sets.reduce(
    (max, item) => Math.max(max, item.best_score),
    0,
  );

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-950">
            Koleksi Arena Flash Memory Anda
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Mainkan kembali materi yang pernah dibuat dan pecahkan rekor skor
            terbaik Anda.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:w-auto">
          {[
            { icon: Brain, label: "Total Arena", value: sets.length },
            { icon: Gamepad2, label: "Dimainkan", value: `${totalPlays}x` },
            { icon: Trophy, label: "Rekor Skor", value: highestScore },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <stat.icon className="size-3.5 text-blue-700" />
                <span>{stat.label}</span>
              </div>
              <p className="mt-1 text-xl font-extrabold text-neutral-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <FlashMemoryList initialSets={sets} />
    </section>
  );
}

export default function FlashMemoryHubPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BackLink href="/dashboard" accent="blue">
        Kembali ke dashboard
      </BackLink>

      <div className="mt-6">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-700">
          <Sparkles className="size-4" /> Generator Minigame Memori AI
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
          Flash Memory: Latih Ingatan dari PDF
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Unggah materi PDF Anda, biarkan AI menyusun pasangan konsep dan
          jembatan keledai, lalu taklukkan 3 mode minigame latihan daya ingat.
        </p>
      </div>

      <div className="mt-8">
        <FlashMemoryBuilder />
      </div>

      <Suspense fallback={<SavedArenasSkeleton />}>
        <SavedArenasSection />
      </Suspense>
    </main>
  );
}
