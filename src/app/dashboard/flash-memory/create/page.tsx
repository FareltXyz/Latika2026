import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashMemoryBuilder } from "@/components/app/flash-memory-builder";
import { getCurrentUserId } from "@/lib/auth";

export default async function CreateFlashMemoryPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/dashboard/flash-memory"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-4" /> Kembali ke Flash Memory
      </Link>
      <div className="mb-8 mt-6">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
          <Sparkles className="size-4" /> Generator Minigame Memori AI
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
          Buat Arena Flash Memory Baru
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Unggah materi PDF Anda dan AI akan menyusun permainan kartu memori,
          tantangan kilat, serta jembatan keledai secara otomatis.
        </p>
      </div>
      <FlashMemoryBuilder />
    </main>
  );
}
