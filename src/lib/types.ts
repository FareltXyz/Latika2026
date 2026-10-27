export type QuizStatus = "waiting" | "live" | "finished";

export type Question = {
  id: string;
  position: number;
  prompt: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
};

export type Participant = {
  id: string;
  name: string;
  score: number | null;
  answered_at: string | null;
  joined_at: string;
  violations: number;
};

export type QuizReviewItem = {
  id: string;
  position: number;
  prompt: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
  isCorrect: boolean;
};

export type QuizResult = {
  score: number;
  correct: number;
  total: number;
  review: QuizReviewItem[];
};
