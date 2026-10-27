import { GraduationCap, Heart } from "lucide-react";
import Link from "next/link";
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";

const footerColumns = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#fitur" },
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Harga", href: "#beranda" },
      { label: "Update Terbaru", href: "#beranda" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#beranda" },
      { label: "Blog", href: "#beranda" },
      { label: "Karier", href: "#beranda" },
      { label: "Kontak", href: "#beranda" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", href: "#faq" },
      { label: "FAQ", href: "#faq" },
      { label: "Kebijakan Privasi", href: "#beranda" },
      { label: "Syarat & Ketentuan", href: "#beranda" },
    ],
  },
];

const socials = [
  {
    icon: FaInstagram,
    label: "Instagram Belajar Mandiri",
    href: "https://instagram.com",
  },
  {
    icon: FaTwitter,
    label: "Twitter Belajar Mandiri",
    href: "https://twitter.com",
  },
  {
    icon: FaYoutube,
    label: "YouTube Belajar Mandiri",
    href: "https://youtube.com",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn Belajar Mandiri",
    href: "https://linkedin.com",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link
              href="#beranda"
              className="inline-flex items-center gap-2.5"
              aria-label="Belajar Mandiri — kembali ke atas"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Belajar<span className="text-orange-500">Mandiri</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              Platform belajar mandiri yang mengubah materi PDF-mu menjadi quiz
              interaktif dengan bantuan AI. Belajar jadi lebih cepat, seru, dan
              terukur — kapan pun dan di mana pun.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition-all hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-orange-600 hover:text-white"
                >
                  <social.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <nav
              key={column.title}
              aria-label={`Tautan ${column.title}`}
              className="lg:col-span-2"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-orange-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Newsletter — spans remaining column */}
          <div className="lg:col-span-1" aria-hidden="true" />
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-neutral-800/80 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Belajar Mandiri. Seluruh hak cipta
            dilindungi undang-undang.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            Dibuat dengan
            <Heart
              className="h-3.5 w-3.5 fill-orange-500 text-orange-500"
              aria-hidden="true"
            />
            di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
