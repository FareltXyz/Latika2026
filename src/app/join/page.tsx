import { ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/app/brand";
import { JoinForm } from "@/components/app/join-form";

export default function JoinPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf5] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -right-36 top-24 size-96 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-96 rounded-full bg-amber-100 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-orange-600"
        >
          <ArrowLeft className="size-4" /> Beranda
        </Link>
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col items-center justify-center py-10">
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Radio className="size-7" />
        </span>
        <JoinForm />
        <p className="mt-6 text-center text-xs text-neutral-500">
          Kode hanya berlaku untuk satu ruang kuis.
        </p>
      </div>
    </main>
  );
}
