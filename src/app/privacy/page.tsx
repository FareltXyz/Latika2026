import {
  ArrowLeft,
  BrainCircuit,
  Clock3,
  Cookie,
  Database,
  FileLock2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "@/components/app/brand";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Belajar Mandiri",
  description:
    "Penjelasan mengenai pemrosesan dokumen, penyimpanan data kuis, autentikasi, dan hak pengguna Belajar Mandiri.",
};

const sections = [
  {
    icon: Database,
    title: "Data yang kami proses",
    content: [
      "Data akun pengajar, seperti nama dan alamat email, diproses untuk autentikasi dan pengelolaan kuis.",
      "Data kuis mencakup judul, pertanyaan, opsi jawaban, kunci, pembahasan, durasi, serta kode ruang.",
      "Data peserta mencakup nama, jawaban, nilai, waktu pengumpulan, dan catatan pelanggaran fokus selama mode ujian.",
    ],
  },
  {
    icon: FileLock2,
    title: "Pemrosesan PDF dan Word",
    content: [
      "File asli tidak disimpan permanen di database aplikasi. File hanya diterima ketika proses generate berlangsung.",
      "PDF dikirim ke layanan AI yang dikonfigurasi untuk dibaca. Untuk DOCX, teks diekstrak terlebih dahulu lalu dikirim ke layanan AI.",
      "Jangan mengunggah dokumen yang memuat data pribadi sensitif apabila tidak diperlukan untuk membuat kuis.",
    ],
  },
  {
    icon: BrainCircuit,
    title: "Layanan pihak ketiga",
    content: [
      "Belajar Mandiri menggunakan Supabase untuk autentikasi dan database, serta Google Gemini atau Vercel AI Gateway untuk menghasilkan soal.",
      "Pemrosesan oleh penyedia tersebut tunduk pada konfigurasi akun dan kebijakan masing-masing layanan.",
    ],
  },
  {
    icon: Clock3,
    title: "Masa penyimpanan",
    content: [
      "Pengajar memilih masa simpan kuis selama 7 atau 14 hari sejak kuis dibuat.",
      "Setelah masa simpan berakhir, kuis beserta pertanyaan, peserta, jawaban, nilai, dan catatan terkait dihapus otomatis.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookie dan penyimpanan browser",
    content: [
      "Cookie digunakan untuk menjaga sesi login pengajar dan sesi peserta yang bergabung ke ruang kuis.",
      "Penyimpanan lokal browser digunakan untuk mengingat bahwa popup panduan sudah pernah ditutup.",
    ],
  },
  {
    icon: Trash2,
    title: "Kontrol pengguna",
    content: [
      "Pengajar dapat menghapus kuis yang sudah selesai langsung dari dashboard tanpa menunggu masa simpan berakhir.",
      "Untuk pertanyaan mengenai data atau permintaan bantuan, hubungi salah satu alamat email di bagian kontak.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf5] text-neutral-900">
      <header className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Brand />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-neutral-600 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-10 text-white shadow-2xl shadow-orange-950/15 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300">
                <ShieldCheck className="size-4" /> Transparansi data
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Kebijakan Privasi
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
                Halaman ini menjelaskan data apa yang diproses oleh Belajar
                Mandiri, untuk tujuan apa, serta kapan data tersebut dihapus.
              </p>
              <p className="mt-6 text-xs font-semibold text-neutral-500">
                Terakhir diperbarui: 28 Oktober 2026
              </p>
            </div>
          </section>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <section.icon className="size-5" />
                </span>
                <h2 className="mt-5 text-lg font-extrabold text-neutral-950">
                  {section.title}
                </h2>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
                  {section.content.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[1.5rem] border border-orange-200 bg-orange-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-700">
                  <Mail className="size-5" />
                  <h2 className="font-extrabold">Kontak pengelola</h2>
                </div>
                <p className="mt-2 text-sm text-orange-900/75">
                  Hubungi kami jika ada pertanyaan tentang privasi atau data
                  kuis Anda.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm font-bold">
                <a
                  href="mailto:arivito.com@gmail.com"
                  className="text-orange-700 underline decoration-orange-300 underline-offset-4"
                >
                  arivito.com@gmail.com
                </a>
                <a
                  href="mailto:fareltxyz@gmail.com"
                  className="text-orange-700 underline decoration-orange-300 underline-offset-4"
                >
                  fareltxyz@gmail.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
