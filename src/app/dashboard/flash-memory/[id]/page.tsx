import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashMemoryArena } from "@/components/app/flash-memory-arena";
import { getCurrentUserId } from "@/lib/auth";
import { getFlashMemorySet } from "@/lib/flash-memory-store";

export default async function FlashMemoryArenaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");

  const { id } = await params;
  const set = await getFlashMemorySet(id, userId);

  if (!set) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Arena Flash Memory Tidak Ditemukan
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Deck mungkin sudah dihapus atau Anda tidak memiliki akses ke arena
            ini.
          </p>
          <Link
            href="/dashboard/flash-memory"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
          >
            <ArrowLeft className="size-4" /> Kembali ke Flash Memory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/flash-memory"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-blue-700"
        >
          <ArrowLeft className="size-4" /> Semua Arena Flash Memory
        </Link>
        <Link
          href="/dashboard/flash-memory/create"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
        >
          <Plus className="size-4" /> Buat dari PDF Baru
        </Link>
      </div>

      <FlashMemoryArena initialSet={set} />
    </main>
  );
}
