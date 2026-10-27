import { QuizPlayer } from "@/components/app/quiz-player";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <QuizPlayer code={code.toUpperCase()} />;
}
