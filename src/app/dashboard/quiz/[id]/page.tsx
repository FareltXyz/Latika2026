import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { HostConsole } from "@/components/app/host-console";

export default async function HostQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-orange-600"
      >
        <ArrowLeft className="size-4" /> Semua kuis
      </Link>
      <HostConsole quizId={id} />
    </main>
  );
}
