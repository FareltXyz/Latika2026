import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Bagaimana cara kerja AI dalam membuat quiz?",
    answer:
      "Unggah dokumen PDF atau Word (.docx) yang berisi soal. AI mempertahankan kunci jawaban yang tertulis; jika suatu soal belum memiliki jawaban, AI menyelesaikannya sebelum membuat empat pilihan dan pembahasan.",
  },
  {
    question: "Apakah ada batas ukuran dokumen?",
    answer:
      "Sistem menerima PDF dan Word (.docx) maksimal 4 MB. Jika file lebih besar, kompres atau pecah dokumen menjadi beberapa bagian sebelum diunggah. Format .doc lama perlu disimpan ulang sebagai .docx.",
  },
  {
    question: "Tipe soal apa saja yang bisa dihasilkan?",
    answer:
      "Saat ini sistem menghasilkan soal pilihan ganda dengan empat opsi, satu jawaban benar, dan pembahasan singkat. Jumlah soal dapat dipilih antara 5 hingga 25.",
  },
  {
    question: "Apakah dokumen saya aman?",
    answer:
      "Dokumen dikirim untuk diproses oleh model AI dan tidak disimpan di database aplikasi. Data kuis diakses melalui endpoint server; kunci service-role dan kunci AI tidak dikirim ke browser.",
  },
  {
    question: "Apakah bisa digunakan untuk semua jenjang dan mata pelajaran?",
    answer:
      "Bisa! Belajar Mandiri dapat memproses dokumen soal dari berbagai bidang — matematika, sains, sejarah, bahasa, ekonomi, dan banyak lagi. Mode khusus dokumen materi akan hadir pada pembaruan berikutnya.",
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
