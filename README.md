# Belajar Mandiri — Platform Asesmen & Pembelajaran Interaktif Berbasis AI

Dokumentasi resmi repositori proyek **Belajar Mandiri**. Berkas ini disusun sesuai dengan struktur baku dokumentasi produk digital.

---

## a. Judul & Deskripsi

### Nama Produk Digital
**Belajar Mandiri** (*AI-Powered Quiz Generator & Interactive Learning Arena*)

### Latar Belakang Masalah yang Diselesaikan
1. **Beban Waktu Pembuatan Soal Digital**: Guru dan pendidik sering kali telah memiliki arsip materi atau bank soal dalam dokumen PDF maupun Microsoft Word (`.docx`). Namun, proses memindahkan dan mengonversi soal-soal tersebut ke dalam format kuis digital interaktif membutuhkan waktu lama karena harus diinput satu per satu secara manual.
2. **Keterbatasan Validasi Kunci Jawaban Otomatis**: Banyak alat bantu digital tidak mampu membedakan apakah sebuah dokumen telah memuat kunci jawaban eksplisit atau belum, sehingga sering menghasilkan kunci jawaban yang keliru atau inkonsisten.
3. **Integritas Ujian Digital Daring**: Pelaksanaan ujian berbasis web kerap rentan terhadap kecurangan, seperti peserta membuka tab baru, mencari jawaban di internet, atau beralih aplikasi saat ujian berlangsung.
4. **Hambatan Akses Siswa**: Banyak aplikasi evaluasi mengharuskan setiap siswa membuat akun terlebih dahulu sebelum mengerjakan soal, yang memakan waktu dan menyulitkan proses asesmen kilat di kelas.
5. **Kurangnya Metode Pengulangan Interaktif**: Setelah ujian selesai, peserta didik sering tidak memiliki sarana yang menyenangkan untuk memperkuat daya ingat terhadap materi yang baru diujikan.

**Belajar Mandiri** memecahkan permasalahan di atas dengan menyediakan solusi menyeluruh:
- **Generator Kuis Berbasis AI**: Mengubah dokumen soal PDF dan Word (`.docx`) menjadi paket kuis pilihan ganda lengkap dengan kunci jawaban dan pembahasan dalam hitungan detik. AI mempertahankan kunci jawaban bawaan dokumen dan menyelesaikan soal secara nalar jika kunci belum tersedia.
- **Mode Ujian Berintegritas (Anti-Cheat)**: Dilengkapi fitur *fullscreen lock*, deteksi pergantian tab/jendela browser, alarm audio peringatan, pencatatan log pelanggaran waktu nyata, dan sistem pembatasan otomatis (*auto-ban*).
- **Akses Cepat Tanpa Akun Bagi Siswa**: Peserta cukup memasukkan 6 karakter kode ruang dan nama panggilan tanpa perlu registrasi akun.
- **Flash Memory Arena**: Mode gamifikasi hafalan materi (Cocokkan Kartu, Kilat Ingatan, dan Kartu Hafalan 3D / Jembatan Keledai) untuk melatih retensi memori jangka panjang siswa secara mandiri.

### Target Pengguna
- **Guru / Pendidik / Instruktur**: Untuk membuat kuis digital secara instan dari modul/bank soal, memandu ruang ujian langsung (*host live session*), serta menganalisis hasil belajar peserta didik secara otomatis.
- **Siswa / Peserta Didik**: Untuk mengikuti asesmen kelas dengan mudah dan melatih pemahaman mandiri menggunakan mini-game memori interaktif.
- **Sekolah & Lembaga Pelatihan**: Sebagai sarana evaluasi pembelajaran ramah lingkungan (*paperless*), efisien, dan berintegritas tinggi.

---

## b. Teknologi yang Digunakan

### Bahasa Pemrograman
- **TypeScript**: Digunakan secara menyeluruh (*full-stack*) untuk menjamin keamanan tipe (*type safety*), ketahanan kode, dan skalabilitas arsitektur aplikasi.
- **JavaScript (ESNext)** / **HTML5** / **CSS3**.

### Modul & Pustaka Utama
- **Framework & Runtime**:
  - `Next.js 16` (App Router, React Server Components, Server Actions & API Route Handlers)
  - `React 19` & `React DOM 19`
- **Integrasi Artificial Intelligence (AI)**:
  - `ai` (Vercel AI SDK Core)
  - `@ai-sdk/google` (Integrasi resmi Google Gemini API)
  - Model Utama: `gemini-3.5-flash-lite`, dengan mekanisme cadangan (*fallback*) ke `gemini-3.1-flash-lite` dan `gemini-3.8-flash`
- **Basis Data & Autentikasi**:
  - `@supabase/supabase-js` & `@supabase/ssr` (Koneksi Supabase PostgreSQL & Auth)
  - PostgreSQL dengan sistem keamanan ketat *Row Level Security* (RLS)
- **Ekstraksi & Pemrosesan Dokumen**:
  - `mammoth`: Ekstraksi teks mentah dari berkas Microsoft Word (`.docx`) pada lingkungan server Node.js.
  - Native binary stream/buffer reader untuk pemrosesan berkas PDF langsung ke AI multimodal.
- **Antarmuka Pengguna & Desain (UI/UX)**:
  - `Tailwind CSS v4`
  - `Radix UI Primitives` (`@radix-ui/react-accordion`, `@radix-ui/react-progress`, `@radix-ui/react-slot`)
  - `lucide-react` & `react-icons` (Ikonografi modern)
  - `class-variance-authority` & `tailwind-merge` & `clsx` (Komposisi utilitas styling dinamis)
  - `tw-animate-css` (Animasi interaktif)
- **Validasi Data & Kualitas Kode**:
  - `zod`: Validasi skema input formulir dan penegakan struktur data keluaran AI (*Structured Output*).
  - `@biomejs/biome`: Linter dan formatter berkinerja tinggi.

### Platform Publikasi & Infrastruktur
- **Platform Publikasi Web**: [Vercel](https://vercel.com/) (Penyebaran otomatis CI/CD terintegrasi ke GitHub dengan dukungan Node.js Serverless Function).
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/) (Penyedia database PostgreSQL terkelola dan Autentikasi pengguna).
- **AI Gateway / Service**: Google AI Studio & Vercel AI Gateway.
- **Penjadwal Otomatis (Automation Scheduler)**: Vercel Cron Jobs (untuk pembersihan kuis kedaluwarsa secara berkala).

---

## c. Pemanfaatan AI (AI Usage Disclosure)

### ○ Alat AI yang Digunakan
1. **Alat AI dalam Pengembangan Produk (*Development Assistant*)**:
   - **Google Antigravity / Gemini Code Assist**: Digunakan selama tahap riset arsitektur, penyusunan boilerplate Next.js App Router, pembuatan struktur skema Zod untuk keluaran terstruktur (*structured output*), perancangan logika proteksi ujian (*event listeners*), serta pembuatan kueri Supabase RLS.
2. **Model AI dalam Fitur Aplikasi (*Application Runtime Engine*)**:
   - **Google Gemini 3.5 Flash-Lite** (Model Primer): Dipilih karena memiliki latensi rendah (*low latency*), throughput cepat, dan hemat token untuk memproses dokumen soal panjang berbahasa Indonesia.
   - **Google Gemini 3.1 Flash-Lite & Gemini 3.8 Flash** (Model Sekunder / Fallback): Digunakan sebagai sistem cadangan otomatis apabila terjadi lonjakan kuota (*rate limit HTTP 429*) atau kendala ketersediaan layanan (*HTTP 503*).

### ○ Contoh Perintah (Prompt) Utama yang Digunakan saat Mengembangkan Produk
1. **Prompt Perancangan Logika Ekstraksi Dokumen & Structured Output (Fase Pengembangan)**:
   > *"Buatkan API Route Handler Next.js 16 App Router untuk menerima berkas dokumen soal format PDF dan DOCX. Gunakan library mammoth untuk mengekstrak teks DOCX dan teruskan buffer PDF ke model Google Gemini melalui Vercel AI SDK. Pastikan respons yang dihasilkan divalidasi menggunakan Zod Schema menjadi objek terstruktur berisi judul kuis, deskripsi, daftar pertanyaan, 4 pilihan jawaban, indeks jawaban benar, dan penjelasan alasan jawabannya."*

2. **System Prompt Utama pada Mesin Generator Kuis (Runtime Aplikasi)**:
   > *"Anda adalah guru Indonesia yang teliti. Dokumen input adalah dokumen soal. Jika dokumen memuat jawaban atau kunci jawaban, pertahankan jawaban yang tercantum sebagai jawaban benar. Jika soal tidak memiliki jawaban, kerjakan sendiri dengan penalaran yang benar sebelum membuat empat opsi. Setiap soal harus punya tepat satu jawaban benar, opsi pengecoh yang masuk akal, dan penjelasan yang menerangkan alasan jawabannya. Jangan mengubah kunci jawaban eksplisit dari dokumen. Gunakan bahasa Indonesia yang jelas."*

3. **User Prompt Dinamis Generator Kuis (Runtime Aplikasi)**:
   > *"Susun tepat ${questionCount} soal pilihan ganda dengan tingkat kesulitan ${difficulty} dari soal yang terdapat pada dokumen. Prioritaskan soal dan kunci jawaban eksplisit. Untuk soal tanpa kunci, selesaikan dengan benar terlebih dahulu. Jika jumlah soal pada dokumen melebihi kebutuhan, pilih soal yang paling bervariasi dan hindari duplikat."*

### ○ Penyesuaian/Perbaikan Mandiri yang Dilakukan Peserta terhadap Saran Kode dari AI
1. **Penanganan Format File DOCX vs PDF**:
   - *Saran Awal AI*: Mengirimkan seluruh buffer biner file DOCX mentah langsung ke endpoint multimodal AI seperti halnya file PDF.
   - *Perbaikan Peserta*: Model LLM multimodal tidak dapat membaca format zip biner dari file `.docx` secara konsisten. Peserta secara mandiri mengintegrasikan modul server `mammoth` untuk mengekstrak teks mentah dari `.docx` terlebih dahulu, memvalidasi keberadaan teks (mencegah file kosong/gambar saja), membatasi panjang teks agar tidak melampaui konteks token, dan memberikan pesan kesalahan yang jelas kepada pengguna.
2. **Implementasi Sistem Fallback Model Multi-Tingkat**:
   - *Saran Awal AI*: Pemanggilan model tunggal standar tanpa penanganan error komprehensif.
   - *Perbaikan Peserta*: Peserta menambahkan logika penanganan kegagalan (*error recovery pipeline*) yang mencoba `gemini-3.5-flash-lite`, lalu melakukan peralihan dinamis (*fallback loop*) ke `gemini-3.1-flash-lite` dan `gemini-3.8-flash` jika terdeteksi error *rate limit* (HTTP 429), kendala server (HTTP 503), atau waktu tunggu habis (*timeout*).
3. **Penyempurnaan Fitur Anti-Kecurangan (Exam Mode) & Sintesis Audio**:
   - *Saran Awal AI*: Hanya mengandalkan event `window.onblur`.
   - *Perbaikan Peserta*: Peserta memperluas sistem pengawasan dengan menggabungkan Web Fullscreen API (`fullscreenchange`), Page Visibility API (`visibilitychange`), penangkapan kombinasi tombol shortcut keyboard mencurigakan, pencatatan histori pelanggaran ke database, pembunyian alarm otomatis menggunakan Web Audio API Synthesizer (*OscillatorNode*), dan pembatasan akses (*auto-ban*) setelah mencapai 3 kali pelanggaran.
4. **Keamanan Row Level Security (RLS) & Isolasi Service Role**:
   - *Saran Awal AI*: Menyimpan kuis dan peserta melalui query client dengan kebijakan akses publik terbuka (*public access policy*).
   - *Perbaikan Peserta*: Peserta mengunci seluruh tabel database di Supabase dengan RLS ketat, memisahkan hak akses antara pemilik kuis (host) dan peserta ujian, serta membatasi operasi penulisan skor hanya melalui Route Handlers bersisi server dengan token unik terenkripsi.

---

## d. Panduan Penggunaan

### Tautan Situs Web Aktif
- **Tautan Website (Production)**: `https://latika2026.vercel.app` *(Silakan perbarui dengan URL deployment aktif Anda)*
- **Tautan Repositori GitHub**: [https://github.com/FareltXyz/Latika2026](https://github.com/FareltXyz/Latika2026)

---

### Petunjuk Langkah Demi Langkah Menjalankan Program (Secara Lokal)

#### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi 20.x atau lebih baru
- **NPM** atau manajer paket yang kompatibel (pnpm / yarn)
- **Akun Supabase** (untuk konfigurasi database dan otentikasi)
- **Google AI Studio API Key** (Gemini API)

#### 2. Kloning Repositori
```bash
git clone https://github.com/FareltXyz/Latika2026.git
cd Latika2026
```

#### 3. Konfigurasi Environment Variables
Salin berkas contoh konfigurasi `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka file `.env.local` dan lengkapi variabel berikut:
```env
# Konfigurasi Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Kunci API Google AI Studio (Direkomendasikan)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-studio-api-key
GOOGLE_AI_MODEL=gemini-3.5-flash-lite

# Alternatif: Vercel AI Gateway (Opsional jika memakai Google API langsung)
AI_GATEWAY_API_KEY=your-ai-gateway-key
AI_MODEL=google/gemini-3.5-flash-lite

# Kunci Rahasia Endpoint Pembersihan Kuis Otomatis (Cron)
CRON_SECRET=masukkan-string-acak-yang-panjang
```

#### 4. Menyiapkan Database Supabase
Buka dashboard proyek Supabase Anda pada menu **SQL Editor**, lalu jalankan skrip migrasi secara berurutan yang terdapat di direktori `supabase/migrations/`:
1. `001_initial.sql` (Skema tabel utama, akun, kuis, soal, opsi, dan sesi)
2. `002_exam_mode.sql` (Pencatatan log pelanggaran anti-cheat)
3. `003_quiz_retention.sql` (Kolom durasi dan masa retensi kuis)
4. `004_quiz_retention_7_14.sql` (Batasan retensi kuis 7 atau 14 hari)

Pastikan provider Email pada **Authentication > Providers > Email** diaktifkan.

#### 5. Instalasi Dependensi
Jalankan perintah berikut pada terminal:
```bash
npm install
```

#### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban (browser) dan akses alamat:
```
http://localhost:3000
```

---

### Alur Singkat Penggunaan Aplikasi

#### A. Untuk Guru / Pembuat Kuis (Host):
1. Buka situs web dan masuk menggunakan akun Google atau email terdaftar.
2. Pada menu Dashboard, pilih **"Buat Kuis Baru"**.
3. Unggah dokumen soal berformat PDF atau Word (`.docx`) dengan ukuran maksimal 4 MB.
4. Tentukan jumlah soal (5–25 butir), tingkat kesulitan, durasi pengerjaan, dan masa retensi penyimpanan (7 atau 14 hari).
5. Klik **"Generate Kuis dengan AI"** dan tunggu beberapa detik saat AI mengekstrak soal.
6. Periksa dan tinjau soal, pilihan opsi, serta kunci jawaban yang dihasilkan. Anda dapat mengedit teks pertanyaan jika diperlukan.
7. Bagikan **Kode Ruang (6 Karakter)** kepada peserta didik.
8. Buka konsol host untuk memantau peserta di lobby, memulai kuis, memantau log ujian, dan melihat rekap nilai akhir.

#### B. Untuk Siswa / Peserta Kuis:
1. Akses halaman utama tanpa perlu registrasi akun.
2. Masukkan **Kode Ruang 6 Karakter** yang diberikan oleh guru dan tuliskan nama Anda.
3. Klik **"Masuk Ruang Kuis"** dan tunggu di lobby hingga guru memulai kuis.
4. Saat kuis dimulai, setujui permintaan layar penuh (*fullscreen*).
5. Kerjakan soal pilihan ganda hingga selesai, lalu klik **"Kirim Jawaban"**.
6. Nilai akhir, rekap jawaban benar/salah, dan pembahasan akan langsung ditampilkan.

#### C. Untuk Latihan Mandiri (Flash Memory Arena):
1. Akses menu **Flash Memory** melalui dashboard.
2. Pilih mode latihan:
   - **Cocokkan Kartu**: Mencocokkan istilah dengan definisinya secara cepat.
   - **Kilat Ingatan**: Tantangan menjawab cepat dengan batasan 12 detik dan 3 nyawa.
   - **Kartu Hafalan 3D**: Mengulang hafalan dengan jembatan keledai visual.

---

## e. Identitas Pengembang

### Tim Pengembang

#### 1. Peserta 1 (Ketua Tim)
- **Nama Lengkap**: `Muhammad Arivito`
- **Kelas**: `XI`
- **Jurusan**: `Teknik Jaringan Komputer dan Telekomunikasi`
- **Asal Sekolah**: `SMKN GUDO`
- **Peran / Tanggung Jawab**: `[Frontend / Backend / Integrasi AI / Desain Antarmuka]`

#### 2. Peserta 2 (Anggota Tim)
- **Nama Lengkap**: `Muhammad Farel Wardhana`
- **Kelas**: `XI`
- **Jurusan**: `Teknik Jaringan Komputer dan Telekomunikasi`
- **Asal Sekolah**: `SMKN GUDO`
- **Peran / Tanggung Jawab**: `[Frontend / Database & Keamanan / Testing / Dokumentasi]`

### Kontak & Informasi Sekolah
- **Nama Sekolah**: `SMKN GUDO`
- **Alamat Sekolah**: `Jalan Pawiyatan No 06 Gudo Jombang`
- **Website Sekolah**: `https://www.smkngudo.sch.id/`
- **Email Tim / Sekolah**: `arivito.com@gmail.com`
