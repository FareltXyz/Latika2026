"use client";

import {
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialError ?? "");
  const [isError, setIsError] = useState(Boolean(initialError));

  async function handleEmailAuth(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      setLoading(false);
      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setIsError(false);
        setMessage("Cek Gmail Anda dan klik tautan verifikasi sebelum masuk.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setIsError(true);
      setMessage("Email atau kata sandi tidak cocok.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setLoading(false);
      setIsError(true);
      setMessage(error.message);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-neutral-200/80 bg-white p-6 shadow-2xl shadow-orange-950/10 sm:p-8">
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-neutral-100 p-1">
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setMessage("");
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              mode === item
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {item === "login" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950">
        {mode === "login" ? "Selamat datang kembali" : "Buat akun pengajar"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {mode === "login"
          ? "Masuk untuk membuat dan mengelola kuis dari dokumen soal Anda."
          : "Daftar gratis. Kami akan mengirim tautan verifikasi ke Gmail Anda."}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={loading}
        className="mt-6 h-12 w-full rounded-xl border-neutral-300 bg-white font-bold text-neutral-800 hover:bg-neutral-50"
      >
        <LogIn className="size-5" aria-hidden="true" />
        Lanjutkan dengan Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs font-medium text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        atau dengan email
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "register" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Nama lengkap
            </span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-3.5 top-3.5 size-4.5 text-neutral-400" />
              <input
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Nama Anda"
              />
            </span>
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Email
          </span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3.5 top-3.5 size-4.5 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="nama@gmail.com"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Kata sandi
          </span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-4.5 text-neutral-400" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Minimal 8 karakter"
            />
          </span>
        </label>

        {message && (
          <output
            aria-live="polite"
            className={`block rounded-xl px-4 py-3 text-sm ${
              isError
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </output>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
        >
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {mode === "login"
            ? "Masuk ke dashboard"
            : "Daftar & verifikasi email"}
        </Button>
      </form>
    </div>
  );
}
