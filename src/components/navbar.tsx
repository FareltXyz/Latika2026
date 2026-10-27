"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-neutral-200/70 bg-white/85 shadow-[0_1px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[4.5rem] lg:px-8"
      >
        <Brand href="#beranda" />

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Button
            asChild
            variant="ghost"
            className="h-10 px-5 text-sm font-semibold text-neutral-700 hover:text-orange-600"
          >
            <Link href="/auth">Masuk</Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-500/30"
          >
            <Link href="/dashboard">
              Mulai Gratis <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-orange-50 hover:text-orange-600 md:hidden"
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-1 border-t border-neutral-100 bg-white/95 px-4 pb-6 pt-3 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 pt-3">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-neutral-300 text-sm font-semibold text-neutral-800 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <Link href="/auth">Masuk</Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-xl bg-orange-600 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-700"
            >
              <Link href="/dashboard">
                Mulai Gratis{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
