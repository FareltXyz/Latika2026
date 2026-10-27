const stats = [
  { value: "6", label: "Karakter Kode Kuis" },
  { value: "15", label: "Soal per Generasi" },
  { value: "4", label: "Opsi per Soal" },
  { value: "100%", label: "Penilaian Otomatis" },
];

export function Stats() {
  return (
    <section
      aria-label="Statistik platform"
      className="relative overflow-hidden bg-neutral-950 py-16 sm:py-20"
    >
      {/* Background decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                {stat.value}
              </dd>
              <dt className="mt-2.5 text-sm font-medium text-neutral-400">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
