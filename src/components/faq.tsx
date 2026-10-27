import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Bagaimana cara kerja AI dalam membuat quiz dari PDF?",
    answer:
      "Setelah kamu mengunggah file PDF, sistem AI kami akan membaca dan menganalisis seluruh isi dokumen. AI mengenali konsep-konsep kunci, definisi, serta hubungan antar materi, lalu menyusunnya menjadi pertanyaan-pertanyaan yang jelas dan relevan lengkap dengan pilihan jawaban. Seluruh prosesnya hanya membutuhkan waktu beberapa detik.",
  },
  {
    question: "Apakah ada batas jumlah halaman untuk file PDF?",
    answer:
      "Pada paket gratis, kamu bisa mengunggah PDF dengan panjang hingga 100 halaman per dokumen. Untuk kebutuhan materi yang lebih panjang seperti buku lengkap atau modul tebal, tersedia paket premium yang mendukung hingga 500 halaman per dokumen.",
  },
  {
    question: "Tipe soal apa saja yang bisa dihasilkan?",
    answer:
      "Saat ini AI kami mampu menghasilkan tiga tipe soal utama: pilihan ganda (dengan 4 opsi jawaban), benar/salah, dan isian singkat. Kamu bisa memilih kombinasi tipe soal sesuai preferensi sebelum quiz dibuat, misalnya 70% pilihan ganda dan 30% isian singkat.",
  },
  {
    question: "Apakah data dan materi saya aman?",
    answer:
      "Tentu aman. Seluruh file dan data belajarmu dienkripsi baik saat tersimpan maupun saat ditransfer. Kami tidak pernah membagikan, menjual, atau menggunakan materi pribadimu untuk kepentingan lain. Kamu juga bisa menghapus data kapan saja langsung dari pengaturan akun.",
  },
  {
    question: "Apakah bisa digunakan untuk semua jenjang dan mata pelajaran?",
    answer:
      "Bisa! Belajar Mandiri cocok untuk pelajar SMP, SMA, mahasiswa, hingga profesional yang sedang mempersiapkan sertifikasi. AI kami mampu memproses materi dari berbagai bidang — matematika, sains, sejarah, bahasa, ekonomi, dan banyak lagi.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
            Pertanyaan yang Sering{" "}
            <span className="text-orange-600">Ditanyakan</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Masih punya pertanyaan lain? Temukan jawabannya di sini atau hubungi
            tim kami.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-12 rounded-2xl border border-neutral-200 bg-white px-6 shadow-sm"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="border-neutral-200"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-neutral-900 hover:no-underline hover:text-orange-600 [&>svg]:text-orange-500">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
