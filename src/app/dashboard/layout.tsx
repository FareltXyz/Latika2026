import { Brain, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Brand } from "@/components/app/brand";
import { getCurrentAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, email } = await getCurrentAuth();
  if (!userId) redirect("/auth");

  const displayEmail = email ?? "Akun pengajar";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand href="/dashboard" />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
            >
              <LayoutDashboard className="size-4" />{" "}
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/flash-memory"
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              <Brain className="size-4" />{" "}
              <span className="hidden sm:inline">Flash Memory</span>
            </Link>
            <Link
              href="/dashboard/create"
              className="flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-3.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
            >
              <PlusCircle className="size-4" />{" "}
              <span className="hidden sm:inline">Buat kuis</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                title={`Keluar dari ${displayEmail}`}
                className="flex size-10 items-center justify-center rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
