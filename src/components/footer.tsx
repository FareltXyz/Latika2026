import { Heart } from "lucide-react";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";

import { Brand } from "@/components/app/brand";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Fitur", href: "/#fitur" },
      { label: "Cara Kerja", href: "/#cara-kerja" },
      { label: "FAQ", href: "/#faq" },
      { label: "Kebijakan Privasi", href: "/privacy" },
    ],
  },
  {
    title: "SMKN Gudo",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/smkn_gudo/" },
      {
        label: "YouTube",
        href: "https://www.youtube.com/channel/UC_BHo7vpC9ROxI4oLA_kQJA",
      },
      { label: "X / Twitter", href: "https://x.com/smkngudo" },
      { label: "TikTok", href: "https://www.tiktok.com/@smkn_gudo" },
    ],
  },
  {
    title: "Kontak",
    links: [
      { label: "arivito.com@gmail.com", href: "mailto:arivito.com@gmail.com" },
      { label: "fareltxyz@gmail.com", href: "mailto:fareltxyz@gmail.com" },
    ],
  },
];

const socials = [
  {
    icon: FaInstagram,
    label: "Instagram SMKN Gudo",
    href: "https://www.instagram.com/smkn_gudo/",
  },
  {
    icon: FaYoutube,
    label: "YouTube SMKN Gudo",
    href: "https://www.youtube.com/channel/UC_BHo7vpC9ROxI4oLA_kQJA",
  },
  {
    icon: FaXTwitter,
    label: "X SMKN Gudo",
    href: "https://x.com/smkngudo",
  },
  {
    icon: FaTiktok,
    label: "TikTok SMKN Gudo",
    href: "https://www.tiktok.com/@smkn_gudo",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Brand href="/" tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              Platform yang mengubah dokumen soal PDF atau Word menjadi quiz
              interaktif dengan bantuan AI. Pembuatan dan penilaian kuis jadi
              lebih cepat dan terukur.
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
                {column.links.map((link) => {
                  const opensNewTab = link.href.startsWith("https://");
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={opensNewTab ? "_blank" : undefined}
                        rel={opensNewTab ? "noopener noreferrer" : undefined}
                        className="break-words text-sm text-neutral-400 transition-colors hover:text-orange-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
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
