import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { WelcomeGuide } from "@/components/app/welcome-guide";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Ubah dokumen soal PDF atau Word menjadi kuis interaktif, bagikan kode ruang, dan pantau hasil peserta.";
const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(
    productionDomain ? `https://${productionDomain}` : "http://localhost:3000",
  ),
  title: "Belajar Mandiri — Kuis AI dari PDF & Word",
  description: siteDescription,
  openGraph: {
    title: "Belajar Mandiri — Kuis AI dari PDF & Word",
    description: siteDescription,
    siteName: "Belajar Mandiri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Belajar Mandiri — Kuis AI dari PDF & Word",
    description: siteDescription,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-orange-200 selection:text-orange-950">
        {children}
        <WelcomeGuide />
      </body>
    </html>
  );
}
