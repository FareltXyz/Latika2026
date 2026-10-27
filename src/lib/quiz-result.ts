import "server-only";

import type { QuizResult } from "@/lib/types";

type ReviewQuestion = {
  id: string;
  position: number;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export function buildQuizResult(
  questions: ReviewQuestion[],
  answers: number[],
  score: number,
): QuizResult {
  const review = questions.map((question, index) => ({
    id: question.id,
    position: question.position,
    prompt: question.prompt,
    options: question.options,
    selectedIndex: answers[index] ?? -1,
    correctIndex: question.correct_index,
    explanation: question.explanation,
    isCorrect: answers[index] === question.correct_index,
  }));

  return {
    score,
    correct: review.filter((item) => item.isCorrect).length,
    total: review.length,
    review,
  };
}
