"use client";

import { ArrowRight, Hash, LoaderCircle, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, name }),
    });
    const result = await response.json();
    if (!response.ok) {
      setLoading(false);
      setError(result.error ?? "Belum berhasil bergabung.");
      return;
    }

    router.push(`/play/${result.code}`);
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-2xl shadow-orange-950/10 sm:p-8"
    >
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950">
        Gabung ke kuis
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Masukkan kode dari pengajar. Anda tidak perlu membuat akun.
      </p>

      <label className="mt-7 block">
        <span className="mb-2 block text-sm font-semibold text-neutral-700">
          Kode kuis
        </span>
        <span className="relative block">
          <Hash className="pointer-events-none absolute left-4 top-4 size-5 text-neutral-400" />
          <input
            required
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
              )
            }
            className="h-14 w-full rounded-xl border border-neutral-300 bg-white pl-12 pr-4 font-mono text-xl font-black uppercase tracking-[0.2em] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            placeholder="ABC123"
          />
        </span>
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-neutral-700">
          Nama peserta
        </span>
        <span className="relative block">
          <UserRound className="pointer-events-none absolute left-4 top-4 size-5 text-neutral-400" />
          <input
            required
            minLength={2}
            maxLength={40}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-14 w-full rounded-xl border border-neutral-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            placeholder="Nama Anda"
          />
        </span>
      </label>

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
        disabled={loading || code.length !== 6}
        className="mt-6 h-12 w-full rounded-xl bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {loading ? "Menghubungkan…" : "Gabung sekarang"}
      </Button>
    </form>
  );
}
