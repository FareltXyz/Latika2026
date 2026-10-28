import { BackLink } from "@/components/app/back-link";
import { HostConsole } from "@/components/app/host-console";

export default async function HostQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <BackLink href="/dashboard" accent="orange" className="mb-6">
        Semua kuis
      </BackLink>
      <HostConsole quizId={id} />
    </main>
  );
}
