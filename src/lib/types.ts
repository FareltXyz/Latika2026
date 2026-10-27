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

export type FlashMemoryDifficulty = "mudah" | "sedang" | "sulit";

export type FlashMemoryCard = {
  id: string;
  position: number;
  term: string;
  definition: string;
  category: string;
  memory_tip: string;
};

export type FlashMemorySetSummary = {
  id: string;
  title: string;
  description: string;
  source_name: string;
  difficulty: FlashMemoryDifficulty;
  best_score: number;
  best_time_seconds: number | null;
  plays_count: number;
  cards_count: number;
  created_at: string;
};

export type FlashMemorySetDetail = Omit<
  FlashMemorySetSummary,
  "cards_count"
> & {
  cards: FlashMemoryCard[];
};
