import { Sparkles } from "lucide-react";

export default function FlashMemoryLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="h-5 w-40 animate-pulse rounded-md bg-neutral-200" />

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

        <div className="grid grid-cols-3 gap-3 sm:w-auto" aria-hidden="true">
          {["s1", "s2", "s3"].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-xs"
            >
              <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="mt-2 h-6 w-10 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"
        aria-hidden="true"
      >
        <div className="h-96 animate-pulse rounded-[1.75rem] border border-neutral-200 bg-white p-7" />
        <div className="h-96 animate-pulse rounded-[1.75rem] border border-neutral-200 bg-white p-7" />
      </div>
    </main>
  );
}
