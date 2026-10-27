# Belajar Mandiri

Aplikasi Next.js untuk mengubah materi PDF menjadi kuis pilihan ganda dengan AI. Pengajar dapat membagikan kode enam karakter, memulai sesi, dan melihat nilai peserta. Peserta cukup memasukkan kode dan nama tanpa membuat akun.

## Fitur

- Login pengajar dengan Google atau email + kata sandi
- Verifikasi email melalui Supabase Auth
- Generasi 5–15 soal dari PDF (maksimal 8 MB)
- AI mengikuti kunci jawaban yang tertulis di PDF; bila tidak ada kunci, AI menyelesaikan soal sebelum membuat kuis
- Kode ruang kuis, lobby peserta, dan kontrol mulai/selesai
- Durasi kuis dari host, hitung mundur, serta pengiriman otomatis saat waktu habis
- Mode ujian fullscreen dengan deteksi keluar tab/fokus/fullscreen, alarm browser, dan pencatatan pelanggaran
- Penilaian otomatis, rekap nilai, jawaban salah, kunci, dan pembahasan
- PDF diproses saat generasi dan tidak disimpan di database aplikasi
- Siap dijalankan di Vercel dengan Supabase dan Vercel AI Gateway

## Menjalankan lokal

1. Gunakan Node.js 20 atau lebih baru.
2. Salin `.env.example` menjadi `.env.local`, lalu isi semua nilainya.
3. Jalankan migration di folder `supabase/migrations` sesuai urutan melalui Supabase SQL Editor. Untuk database lama yang sudah pernah menjalankan `001_initial.sql`, jalankan juga `002_exam_mode.sql`.
4. Instal dan jalankan proyek:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Mengatur Supabase Auth

### Email + kata sandi

Di Supabase Dashboard buka **Authentication > Providers > Email**. Aktifkan Email provider dan **Confirm email** agar pendaftar harus menekan tautan verifikasi yang dikirim ke Gmail mereka.

Pada **Authentication > URL Configuration**:

- Site URL production: `https://domain-anda.vercel.app`
- Redirect URL lokal: `http://localhost:3000/**`
- Redirect URL preview Vercel: `https://*-nama-akun.vercel.app/**`
- Redirect URL production: `https://domain-anda.vercel.app/**`

Template email bawaan Supabase dapat dipakai tanpa perubahan. Pastikan tautan konfirmasi tetap menggunakan `{{ .ConfirmationURL }}`.

### Google

1. Buat OAuth Client ID bertipe Web Application di Google Cloud Console.
2. Salin callback URL dari halaman provider Google Supabase ke **Authorized redirect URIs** Google. Bentuknya biasanya `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Masukkan Google Client ID dan Client Secret ke **Authentication > Providers > Google** di Supabase, lalu aktifkan provider.
4. Tambahkan domain production pada OAuth consent screen Google.

## Environment Variables di Vercel

Tambahkan variabel berikut untuk Production dan Preview melalui **Vercel Project Settings > Environment Variables**:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AI_GATEWAY_API_KEY (opsional di deployment Vercel yang memakai OIDC)
AI_MODEL=google/gemini-3.8-flash
```

`SUPABASE_SERVICE_ROLE_KEY` dan `AI_GATEWAY_API_KEY` tidak boleh memakai prefix `NEXT_PUBLIC_`.

## Deploy ke Vercel

Import repository ke Vercel, tambahkan environment variables di atas, lalu deploy. Vercel otomatis mendeteksi Next.js. Static export/GitHub Pages sengaja tidak dipakai karena aplikasi membutuhkan Route Handlers untuk auth, database, dan AI.

## Jika generate kuis gagal

- Pastikan migration `001_initial.sql` dan `002_exam_mode.sql` sudah dijalankan di Supabase SQL Editor.
- Buka **Vercel → AI Gateway → Logs** untuk melihat status request. Error `401` berarti autentikasi Gateway bermasalah, `402` berarti kredit/budget tidak cukup, `403` biasanya memerlukan verifikasi akun atau metode pembayaran, dan `429` berarti rate limit.
- Setelah mengubah environment variable di Vercel, lakukan redeploy agar deployment terbaru menerima nilainya.
- PDF harus berbasis teks, berformat `application/pdf`, dan berukuran maksimal 8 MB.

## Keamanan data

Semua tabel mengaktifkan Row Level Security tanpa policy publik. Akses data dilakukan oleh Route Handlers setelah memverifikasi pemilik kuis atau token acak peserta. Service-role hanya dibuat di modul server. Jangan pernah memasukkan service-role ke kode client atau repository.

## Batasan mode ujian berbasis web

Mode ujian memakai kemampuan browser untuk meminta fullscreen, mendeteksi tab yang tersembunyi, kehilangan fokus, keluar fullscreen, serta memblokir beberapa shortcut di dalam halaman. Pelanggaran dicatat ke dashboard host dan alarm browser dibunyikan.

Browser biasa tidak memiliki izin untuk mematikan tombol Power/Home/Recent Apps, tombol Windows, `Alt+Tab`, aplikasi lain, atau menaikkan suara perangkat yang sudah di-mute. Untuk penguncian perangkat penuh, gunakan perangkat terkelola dengan Android Lock Task/MDM, ChromeOS kiosk, Windows Assigned Access/Safe Exam Browser, atau iOS Guided Access. Web ini tetap dapat menjadi server kuisnya.
