# Logbook Pemanfaatan Kecerdasan Artifisial (AI_LOGBOOK.md)

Dokumen ini merupakan catatan resmi (*official logbook*) pemanfaatan kecerdasan artifisial (AI) dalam seluruh siklus pengembangan produk digital **Belajar Mandiri** pada repositori [FareltXyz/Latika2026](https://github.com/FareltXyz/Latika2026). Logbook ini disusun guna memenuhi prinsip transparansi, akuntabilitas, integritas akademik, serta kepatuhan etika pengembangan perangkat lunak berbasis AI.

---

## Informasi Proyek & Identitas Pengembang

- **Nama Produk Digital**: Belajar Mandiri (*AI-Powered Quiz Generator & Interactive Learning Arena*)
- **Repositori**: [https://github.com/FareltXyz/Latika2026](https://github.com/FareltXyz/Latika2026)
- **Teknologi Utama**: Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL + RLS), Vercel AI SDK, Google Gemini API
- **Identitas Tim Pengembang**:
  - **Peserta 1 (Ketua Tim)**: `Muhammad Farel Wardhana` — Kelas `XI TKJ-4`, Jurusan `Teknik Jaringan Komputer dan Telekomunikasi`, `SMKN Gudo`
  - **Peserta 2 (Anggota Tim)**: `Muhammad Arivito` — Kelas `XI TKJ-4`, Jurusan `Teknik Jaringan Komputer dan Telekomunikasi`, `SMKN Gudo`

---

## Kebijakan & Prinsip Penggunaan AI

Pengembangan proyek ini berpegang pada empat pilar integritas:
1. **AI sebagai Asisten, Bukan Pengganti Pemikiran Kritis**: Saran kode atau ide dari AI dianalisis, diuji, dan disesuaikan secara mandiri oleh peserta sebelum diterapkan ke dalam sistem.
2. **Kemandirian Logika & Verifikasi**: Setiap arsitektur, algoritma, skema basis data, dan penanganan galat divalidasi kebenaran teknisnya oleh peserta.
3. **Keamanan & Privasi Pengguna**: Tidak menyertakan kredensial rahasia (*API keys*, *service-role keys*) maupun data pribadi pengguna ke dalam percakapan AI publik.
4. **Transparansi Riwayat**: Mencatat secara jujur interaksi prompt, saran kode, serta modifikasi mandiri yang dilakukan tim.

---

## Ringkasan Matriks Tahapan Pemanfaatan AI

| No | Tahapan Pengembangan | Fokus Interaksi AI | Validasi & Modifikasi Mandiri yang Dilakukan Siswa | Status Verifikasi |
|---|---|---|---|---|
| 1 | **Tahap 1: Eksplorasi Ide & Perancangan Solusi** | Brainstorming ide platform kuis otomatis, perbandingan model AI, dan formulasi flow pengguna | Mengganti sistem login siswa menjadi akses kode 6 karakter tanpa akun; memilih model Gemini Flash-Lite demi efisiensi | Terverifikasi |
| 2 | **Tahap 2: Penyusunan Kerangka Kode (Scaffolding)** | Perancangan struktur Route Handler, skema Zod untuk keluaran terstruktur (*structured output*), dan antarmuka *exam mode* | Menambahkan validasi batas ukuran dokumen 4 MB, pengetatan RLS Supabase, dan sintesis audio alarm native | Terverifikasi |
| 3 | **Tahap 3: Pemecahan Masalah & Penanganan Galat (Debugging)** | Penanganan kegagalan parsing file DOCX, error rate-limit HTTP 429/503, dan bug bypass mode ujian | Mengganti parsing biner mentah dengan pustaka `mammoth`, merancang skema failover model bertingkat, dan auto-ban pelanggaran 3x | Terverifikasi |
| 4 | **Tahap 4: Refleksi & Penjelasan Kode** | Analisis alur data, evaluasi kompleksitas algoritma penilaian, dan penjaminan pemahaman siswa terhadap kode | Memverifikasi seluruh logika kalkulasi skor, siklus retensi kuis via cron, dan kemampuan menjelaskan mekanisme kode tanpa AI | Terverifikasi |

---

## Catatan Rinci Interaksi AI Berdasarkan Tahapan

### Tahap 1: Eksplorasi Ide & Perancangan Solusi

#### Entri Log 1.1: Menentukan Konsep Produk & Alur Pengguna (User Flow)
- **Tanggal & Waktu**: `26 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity / Gemini
- **Perintah (Prompt) yang Diberikan**:
  > *"Kami ingin membuat aplikasi web evaluasi pembelajaran untuk guru dan siswa. Apa tantangan terbesar guru saat membuat kuis daring, dan bagaimana AI dapat mempermudah proses tersebut tanpa membebani siswa?"*
- **Saran / Respon dari AI**:
  - AI menyarankan membuat sistem LMS lengkap dengan autentikasi dua sisi (guru dan siswa), di mana guru mengetik soal secara manual atau mengunggah kisi-kisi berbasis teks, lalu siswa mengerjakan kuis di dashboard masing-masing.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Kritik Tim**: Konsep LMS lengkap yang disarankan AI terlalu rumit dan menghambat penggunaan kilat di kelas karena siswa harus mendaftar akun terlebih dahulu. Selain itu, guru biasanya sudah memiliki soal dalam bentuk PDF/Word, bukan kisi-kisi teks mentah.
  - **Perubahan Mandiri**:
    1. Mengubah konsep agar **hanya guru yang memerlukan akun**, sedangkan **siswa dapat langsung bergabung hanya dengan kode 6 karakter dan nama**.
    2. Menetapkan masukan utama berupa **dokumen soal siap pakai (PDF dan Word `.docx`)** yang langsung diekstraksi menjadi soal pilihan ganda interaktif lengkap dengan pembahasan.
    3. Menambahkan fitur gamifikasi mandiri **Flash Memory Arena** (hafalan kartu) agar platform tidak hanya dipakai saat ujian formal.

#### Entri Log 1.2: Pemilihan Model AI & Efisiensi Operasional
- **Tanggal & Waktu**: `26 Oktober 2026`
- **Alat AI yang Digunakan**: Google Gemini
- **Perintah (Prompt) yang Diberikan**:
  > *"Bandingkan penggunaan Gemini Pro vs Gemini Flash-Lite untuk pembuatan kuis otomatis dari dokumen soal sekolah di Next.js. Faktor mana yang lebih krusial untuk aplikasi web interaktif?"*
- **Saran / Respon dari AI**:
  - AI menyarankan menggunakan model kelas Pro untuk penalaran yang lebih mendalam, atau Flash-Lite untuk kecepatan tinggi dengan biaya token yang jauh lebih rendah.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Analisis Tim**: Model kelas Pro memiliki latensi pemrosesan hingga 15–30 detik per dokumen yang dapat menyebabkan *timeout* pada *serverless function* Vercel (batas 60 detik pada tier hobi).
  - **Perubahan Mandiri**:
    1. Memilih **`gemini-3.5-flash-lite`** sebagai model utama karena kecepatan respons (< 5 detik) dan efisiensi kuota.
    2. Menyiapkan arsitektur *fallback* ke `gemini-3.1-flash-lite` dan `gemini-3.8-flash` untuk menjamin ketersediaan tinggi (*high availability*).

---

### Tahap 2: Penyusunan Kerangka Kode (Scaffolding)

#### Entri Log 2.1: Scaffolding API Route Handler & Structured Output Zod
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity
- **Perintah (Prompt) yang Diberikan**:
  > *"Buatkan kerangka Next.js App Router Route Handler (`POST /api/quizzes/generate`) menggunakan Vercel AI SDK `generateText` dengan skema terstruktur Zod agar hasil AI berupa array pertanyaan, opsi A-B-C-D, correct_index (0-3), dan explanation."*
- **Saran / Respon dari AI**:
  - AI memberikan kode Route Handler dasar dengan `output: Output.object({ schema: quizSchema })`, membaca formData sederhana tanpa pembatasan ukuran atau sanitasi masukan.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Identifikasi Celah**: Kode dari AI tidak memeriksa jenis file, tidak membatasi ukuran payload, dan belum memasukkan instruksi khusus agar AI mematuhi kunci jawaban yang sudah tertulis di dalam dokumen.
  - **Perubahan Mandiri**:
    1. Menyusun **System Prompt Kustom**: *"Anda adalah guru Indonesia yang teliti... Jika dokumen memuat jawaban atau kunci jawaban, pertahankan jawaban yang tercantum sebagai jawaban benar. Jika tidak ada, kerjakan sendiri dengan penalaran yang benar..."*.
    2. Menambahkan validasi Zod ketat pada panjang teks pertanyaan (`min(10)`, `max(500)`), tepat 4 opsi jawaban unik, dan indeks integer antara 0 hingga 3.
    3. Menambahkan batas ukuran file maksimal **4 MB** dan pembatasan pembuatan kuis maksimal 10 kali per pengguna per hari.

#### Entri Log 2.2: Scaffolding Mode Ujian Berintegritas (Exam Mode)
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity
- **Perintah (Prompt) yang Diberikan**:
  > *"Bagaimana cara membuat halaman kuis web di React/Next.js yang mendeteksi jika siswa membuka tab lain atau keluar dari layar fullscreen?"*
- **Saran / Respon dari AI**:
  - AI menyarankan komponen React dengan `useEffect` yang mendengarkan `window.addEventListener('blur', () => alert('Jangan keluar!'))`.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Identifikasi Kelemahan**: Penggunaan `window.alert()` memblokir thread UI browser, mudah ditutup, tidak mencatat bukti ke server, dan event `blur` sering memicu *false positive* jika siswa hanya mengeklik dropdown native.
  - **Perubahan Mandiri**:
    1. Menggabungkan event **`fullscreenchange`**, **`visibilitychange`**, dan **`blur`** dengan *debounce timer* agar tidak memicu deteksi palsu.
    2. Mengganti `alert()` dengan **Web Audio API Synthesizer (`OscillatorNode`)** native yang membunyikan alarm nada ganda secara langsung tanpa file audio eksternal.
    3. Membuat tabel pencatatan pelanggaran `exam_violations` di Supabase untuk mencatat jenis pelanggaran dan stempel waktu ke dashboard guru.

#### Entri Log 2.3: Scaffolding Basis Data & Kebijakan Keamanan (RLS)
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity / Gemini
- **Perintah (Prompt) yang Diberikan**:
  > *"Buatkan skrip SQL Supabase untuk tabel kuis, soal, peserta, dan hasil ujian."*
- **Saran / Respon dari AI**:
  - AI membuatkan tabel dengan relasi foreign key standar, tetapi menyarankan policy `CREATE POLICY "Public full access" ON quizzes FOR ALL USING (true);` untuk memudahkan pengujian.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Temuan Bahaya Keamanan**: Mengaktifkan akses publik terbuka (*public access*) membuat siswa dapat melihat kunci jawaban kuis langsung dari inspect network browser.
  - **Perubahan Mandiri**:
    1. Mengaktifkan **Row Level Security (RLS)** ketat di seluruh tabel.
    2. Memisahkan kueri: endpoint publik siswa (`/api/rooms/[code]`) **tidak mengirimkan kolom `correct_index` maupun `explanation`** ke klien siswa sebelum kuis selesai dikirimkan.
    3. Menggunakan `SUPABASE_SERVICE_ROLE_KEY` secara terisolasi hanya pada Route Handler server untuk verifikasi nilai dan kalkulasi skor akhir.

---

### Tahap 3: Pemecahan Masalah & Penanganan Galat (Debugging)

#### Entri Log 3.1: Galat Pembacaan Berkas Word DOCX pada Lingkungan Serverless
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity
- **Deskripsi Masalah / Galat**:
  - Saat mengunggah dokumen `.docx`, fungsi API mengalami crash dengan pesan galat: `TypeError: Unsupported binary document format for direct Gemini multimodal ingestion` atau menghasilkan output karakter biner acak (*corrupted tokens*).
- **Perintah (Prompt) yang Diberikan**:
  > *"Error: Gemini API gagal membaca file Word .docx yang diunggah melalui FormData. Bagaimana cara parsing file .docx di Next.js App Router Node runtime?"*
- **Saran / Respon dari AI**:
  - AI menyarankan mengonversi file docx menjadi pdf di server menggunakan libreoffice-cli, atau menginstal modul python terpisah.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Analisis Kritis**: Saran instalasi LibreOffice atau proses eksternal tidak mungkin dijalankan pada runtime *Serverless / Edge* Vercel karena batas ukuran container dan ketiadaan binary OS.
  - **Perbaikan Mandiri**:
    1. Memilih pustaka murni JavaScript/Node.js **`mammoth`** (`mammoth.extractRawText`).
    2. Menulis fungsi penanganan: jika file berekstensi `.docx`, buffer diubah menjadi teks bersih terlebih dahulu sebelum digabungkan ke pesan prompt teks LLM.
    3. Menambahkan pengecekan ekstensi: menolak format usang biner `.doc` (Word 97-2003) dengan pesan panduan agar pengguna menyimpannya ulang sebagai `.docx`.

#### Entri Log 3.2: Galat Kuota API HTTP 429 & Waktu Tunggu Serverless (Timeout)
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity
- **Deskripsi Masalah / Galat**:
  - Ketika beberapa guru membuat kuis secara bersamaan, muncul galat `APICallError: [GoogleGenerativeAI Error]: Resource exhausted (HTTP 429)` atau request terhenti (*stuck*) hingga Vercel mengembalikan *Gateway Timeout* (HTTP 504).
- **Perintah (Prompt) yang Diberikan**:
  > *"Bagaimana menangani error 429 quota Gemini API dan timeout pada generateText di Vercel AI SDK?"*
- **Saran / Respon dari AI**:
  - AI menyarankan menambahkan `maxRetries: 5` pada pemanggilan `generateText`.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Analisis Tim**: Menambah `maxRetries: 5` pada model yang sama yang sedang terkena pembatasan kuota (429) justru memperburuk durasi tunggu dan menjamin terjadinya timeout serverless.
  - **Perbaikan Mandiri**:
    1. Membuat **Daftar Model Cadangan Dinamis** (`fallbackModels`): `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-3.8-flash`.
    2. Mengatur timeout spesifik per percobaan model (`MODEL_TIMEOUT_MS = 60_000`) dan menyetel `maxRetries: 0` per model, sehingga jika satu model terkena 429 atau 503, sistem langsung berpindah ke model alternatif berikutnya dalam hitungan detik.
    3. Menyajikan pesan galat berbahasa Indonesia yang informatif jika seluruh kuota habis.

#### Entri Log 3.3: Bug Deteksi Kecurangan & Tindakan Tegas Auto-Ban
- **Tanggal & Waktu**: `27 Oktober 2026`
- **Alat AI yang Digunakan**: Google Antigravity
- **Deskripsi Masalah / Galat**:
  - Siswa yang melakukan kecurangan berulang kali hanya mendapatkan peringatan visual, namun tetap dapat melanjutkan kuis hingga akhir tanpa ada konsekuensi nyata.
- **Perintah (Prompt) yang Diberikan**:
  > *"Bagaimana merancang sistem batas pelanggaran maksimal di komponen kuis React sehingga jika siswa melanggar lebih dari batas tertentu, ujian otomatis dikunci/dikeluarkan?"*
- **Saran / Respon dari AI**:
  - AI memberikan kode state lokal `const [violations, setViolations] = useState(0)` dan merender teks blokir jika `violations >= 3`.
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - **Identifikasi Celah**: Jika hanya disimpan di state React komponen lokal, siswa dapat me-refresh browser untuk mereset jumlah pelanggaran menjadi 0 kembali.
  - **Perbaikan Mandiri**:
    1. Memodifikasi penyimpanan pelanggaran agar dicatat secara persisten ke **`localStorage`** perangkat dan dikirimkan secara asynchronous ke database Supabase.
    2. Menerapkan aturan **Auto-Ban setelah 3 kali peringatan**: layar pengerjaan langsung digantikan dengan layar status diskualifikasi permanen, tombol navigasi soal dinonaktifkan, dan jawaban yang sudah diisi langsung dikirimkan secara paksa dengan status pelanggaran tercatat di konsol guru.

---

### Tahap 4: Refleksi & Penjelasan Kode

#### Entri Log 4.1: Verifikasi Alur Kalkulasi Nilai & Integritas Penyerahan Jawaban
- **Tanggal & Waktu**: `28 Oktober 2026`
- **Alat AI yang Digunakan**: Google Gemini
- **Fokus Pengujian Pemahaman**:
  - Siswa memverifikasi pemahaman menyeluruh terhadap modul [quiz-result.ts](file:///mnt/01DC5BCFBBD923C0/Node%20JS/Latika2026/src/lib/quiz-result.ts) dan endpoint penyerahan [submit/route.ts](file:///mnt/01DC5BCFBBD923C0/Node%20JS/Latika2026/src/app/api/rooms/%5Bcode%5D/submit/route.ts).
- **Pertanyaan Refleksi Tim ke AI**:
  > *"Jelaskan potensi celah keamanan (*race condition*) pada endpoint submit kuis jika dua peserta mengirim jawaban secara bersamaan atau jika peserta memanggil endpoint submit berulang kali."*
- **Penjelasan AI & Evaluasi Pemahaman Siswa**:
  - AI menjelaskan tentang *idempotency* dan potensi manipulasi skor jika data penyerahan tidak diverifikasi apakah kuis masih dalam rentang waktu aktif (`ends_at`).
- **Validasi & Modifikasi Mandiri oleh Siswa**:
  - Siswa secara mandiri memeriksa kode dan menambahkan verifikasi ganda di server:
    1. Memastikan token peserta (`participant_token`) cocok dengan ID sesi kuis yang bersangkutan.
    2. Menolak penyerahan susulan jika status peserta sudah berstatus `submitted` (mencegah manipulasi skor berulang).
    3. Memastikan perhitungan skor akhir dilakukan 100% di sisi server dengan mencocokkan `selected_option_index` terhadap `correct_index` asli yang tersimpan di database.

#### Entri Log 4.2: Audit Otomatisasi Pembersihan Data (Vercel Cron & Data Privacy)
- **Tanggal & Waktu**: `28 Oktober 2026`
- **Alat AI yang Digunakan**: Google Gemini
- **Fokus Pengujian Pemahaman**:
  - Meninjau kepatuhan kebijakan privasi dan siklus retensi kuis pada endpoint [cleanup-quizzes/route.ts](file:///mnt/01DC5BCFBBD923C0/Node%20JS/Latika2026/src/app/api/cron/cleanup-quizzes/route.ts).
- **Pertanyaan Refleksi Tim ke AI**:
  > *"Bagaimana cara mengamankan endpoint cron job di Next.js agar tidak dapat dipicu sembarangan oleh pihak luar di internet?"*
- **Saran AI & Penerapan Nyata Siswa**:
  - AI merekomendasikan penggunaan token otorisasi header `Authorization: Bearer <CRON_SECRET>`.
  - Siswa mengimplementasikan aturan tersebut, menghubungkannya dengan konfigurasi `vercel.json` crons, dan menambahkan lapis ganda: query pembersihan otomatis juga dijalankan saat guru membuka dashboard untuk memastikan data kuis kedaluwarsa (7 atau 14 hari) benar-benar terhapus demi menjaga privasi dokumen sekolah.

---

## Pernyataan Integritas & Tanggung Jawab Tim

Kami yang bertanda tangan di bawah ini menyatakan bahwa:
1. Seluruh catatan yang tertulis dalam berkas `AI_LOGBOOK.md` ini adalah dokumentasi riil dari proses pembuatan dan penyempurnaan proyek **Belajar Mandiri**.
2. Penggunaan alat kecerdasan artifisial dilakukan secara bertanggung jawab sebagai akselerator produktivitas, tanpa meniadakan pemahaman logika dasar pemrograman dan algoritma.
3. Kami memahami secara utuh arsitektur kode sumber, relasi basis data, logika alur pengguna, serta implementasi keamanan yang ada pada repositori ini, dan siap mempertanggungjawabkannya dalam sesi presentasi maupun pengujian teknis.

`Kabupaten Jombang`, `Rabu 28 Oktober 2026`

| Peran | Nama Lengkap Peserta |
|---|---|
| **Ketua Tim (Peserta 1)** | `Muhammad Farel Wardhana` |
| **Anggota Tim (Peserta 2)** | `Muhammad Arivito` |
