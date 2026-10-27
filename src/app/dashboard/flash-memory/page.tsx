import { ArrowLeft, Brain, Gamepad2, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashMemoryBuilder } from "@/components/app/flash-memory-builder";
import { FlashMemoryList } from "@/components/app/flash-memory-list";
import { getCurrentUserId } from "@/lib/auth";
import { listFlashMemorySets } from "@/lib/flash-memory-store";

export default async function FlashMemoryHubPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");

  const sets = await listFlashMemorySets(userId);
  const totalPlays = sets.reduce((sum, item) => sum + item.plays_count, 0);
  const highestScore = sets.reduce(
    (max, item) => Math.max(max, item.best_score),
    0,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-4" /> Kembali ke dashboard
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
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

      <div className="mt-8">
        <FlashMemoryBuilder />
      </div>

      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-neutral-950">
            Koleksi Arena Flash Memory Anda
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Mainkan kembali materi yang pernah dibuat dan pecahkan rekor skor
            terbaik Anda.
          </p>
        </div>
        <FlashMemoryList initialSets={sets} />
      </section>
    </main>
  );
}
