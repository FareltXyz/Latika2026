"use client";

import {
  Brain,
  CheckCircle2,
  Clock3,
  Eye,
  Flame,
  Gamepad2,
  Heart,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { FlashMemoryCard, FlashMemorySetDetail } from "@/lib/types";

type ArenaMode = "match" | "blitz" | "study";
type MatchPhase = "ready" | "peek" | "playing" | "won";
type BlitzPhase = "ready" | "playing" | "feedback" | "finished";

type MemoryTile = {
  tileId: string;
  pairId: string;
  kind: "term" | "definition";
  text: string;
  category: string;
  memoryTip: string;
  slot: number;
};

type BlitzRound = {
  roundId: string;
  card: FlashMemoryCard;
  direction: "term-to-def" | "def-to-term";
  options: Array<{
    cardId: string;
    text: string;
  }>;
};

const BLITZ_ROUND_SECONDS = 12;
const PEEK_DURATION_SECONDS = 5;

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function buildMatchTiles(
  cards: FlashMemoryCard[],
  pairLimit: number,
): MemoryTile[] {
  const chosenCards = shuffleArray(cards).slice(0, pairLimit);
  const rawTiles: Omit<MemoryTile, "slot">[] = [];

  for (const card of chosenCards) {
    rawTiles.push({
      tileId: `${card.id}-term`,
      pairId: card.id,
      kind: "term",
      text: card.term,
      category: card.category,
      memoryTip: card.memory_tip,
    });
    rawTiles.push({
      tileId: `${card.id}-def`,
      pairId: card.id,
      kind: "definition",
      text: card.definition,
      category: card.category,
      memoryTip: card.memory_tip,
    });
  }

  return shuffleArray(rawTiles).map((tile, index) => ({
    ...tile,
    slot: index + 1,
  }));
}

function buildBlitzRounds(cards: FlashMemoryCard[]): BlitzRound[] {
  const firstPass = shuffleArray(cards).map((card, idx) => ({
    card,
    direction: (idx % 2 === 0 ? "def-to-term" : "term-to-def") as
      | "term-to-def"
      | "def-to-term",
  }));

  const extraNeeded = cards.length < 8 ? Math.min(4, cards.length) : 0;
  const secondPass =
    extraNeeded > 0
      ? shuffleArray(cards)
          .slice(0, extraNeeded)
          .map((card) => ({
            card,
            direction: "def-to-term" as const,
          }))
      : [];

  return [...firstPass, ...secondPass].map((entry, idx) => {
    const distractors = shuffleArray(
      cards.filter((candidate) => candidate.id !== entry.card.id),
    ).slice(0, 3);

    const optionPool = shuffleArray([entry.card, ...distractors]).map(
      (optionCard) => ({
        cardId: optionCard.id,
        text:
          entry.direction === "def-to-term"
            ? optionCard.term
            : optionCard.definition,
      }),
    );

    return {
      roundId: `${entry.card.id}-r${idx}`,
      card: entry.card,
      direction: entry.direction,
      options: optionPool,
    };
  });
}

export function FlashMemoryArena({
  initialSet,
}: {
  initialSet: FlashMemorySetDetail;
}) {
  const [mode, setMode] = useState<ArenaMode>("match");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestScore, setBestScore] = useState(initialSet.best_score);
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(
    initialSet.best_time_seconds,
  );
  const [playsCount, setPlaysCount] = useState(initialSet.plays_count);
  const [newRecordBanner, setNewRecordBanner] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  // --- Match Mode State ---
  const defaultPairLimit = Math.min(8, initialSet.cards.length);
  const [pairLimit, setPairLimit] = useState(defaultPairLimit);
  const [matchPhase, setMatchPhase] = useState<MatchPhase>("ready");
  const [tiles, setTiles] = useState<MemoryTile[]>([]);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchedTileIds, setMismatchedTileIds] = useState<string[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [peekSeconds, setPeekSeconds] = useState(PEEK_DURATION_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [radarCharges, setRadarCharges] = useState(2);
  const [radarActive, setRadarActive] = useState(false);
  const [hintCharges, setHintCharges] = useState(2);
  const [hintedPairId, setHintedPairId] = useState<string | null>(null);
  const [lastMatchedCard, setLastMatchedCard] =
    useState<FlashMemoryCard | null>(null);

  // --- Blitz Mode State ---
  const [blitzPhase, setBlitzPhase] = useState<BlitzPhase>("ready");
  const [blitzRounds, setBlitzRounds] = useState<BlitzRound[]>([]);
  const [blitzIndex, setBlitzIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(BLITZ_ROUND_SECONDS);
  const [blitzElapsed, setBlitzElapsed] = useState(0);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzStreak, setBlitzStreak] = useState(0);
  const [blitzMaxStreak, setBlitzMaxStreak] = useState(0);
  const [blitzCorrectCount, setBlitzCorrectCount] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [lastBlitzOutcome, setLastBlitzOutcome] = useState<
    "correct" | "wrong" | "timeout" | null
  >(null);

  // --- Study Mode State ---
  const [studyQueue, setStudyQueue] = useState<FlashMemoryCard[]>(
    initialSet.cards,
  );
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [studyFlipped, setStudyFlipped] = useState(false);

  const clearScheduledTimeouts = useCallback(() => {
    for (const id of timeoutsRef.current) {
      window.clearTimeout(id);
    }
    timeoutsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => clearScheduledTimeouts();
  }, [clearScheduledTimeouts]);

  const playSound = useCallback(
    (kind: "flip" | "match" | "wrong" | "win") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          void ctx.resume();
        }

        const now = ctx.currentTime;
        if (kind === "flip") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(540, now + 0.055);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.065);
        } else if (kind === "match") {
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            const start = now + idx * 0.065;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.06, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.17);
          });
        } else if (kind === "wrong") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(210, now);
          osc.frequency.linearRampToValueAtTime(155, now + 0.14);
          gain.gain.setValueAtTime(0.035, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (kind === "win") {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            const start = now + idx * 0.085;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.07, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.26);
          });
        }
      } catch {
        // Ignore audio errors on restricted devices
      }
    },
    [soundEnabled],
  );

  const submitStats = useCallback(
    async (score: number, timeSeconds: number | null) => {
      const beatBest = score > bestScore && score > 0;
      if (beatBest) {
        setNewRecordBanner(true);
        setBestScore(score);
      }
      if (timeSeconds !== null && timeSeconds > 0) {
        setBestTimeSeconds((prev) =>
          prev === null ? timeSeconds : Math.min(prev, timeSeconds),
        );
      }
      setPlaysCount((prev) => prev + 1);

      try {
        const response = await fetch(`/api/flash-memory/${initialSet.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, timeSeconds }),
        });
        if (response.ok) {
          const data = (await response.json()) as {
            stats?: {
              best_score: number;
              best_time_seconds: number | null;
              plays_count: number;
            };
          };
          if (data.stats) {
            setBestScore(data.stats.best_score);
            setBestTimeSeconds(data.stats.best_time_seconds);
            setPlaysCount(data.stats.plays_count);
          }
        }
      } catch {
        // Keep optimistic local score if network blips
      }
    },
    [bestScore, initialSet.id],
  );

  // =========================================================================
  // MODE 1: MEMORY MATCH (COCOKKAN KARTU)
  // =========================================================================

  function startMatchGame(withPeek: boolean, customLimit?: number) {
    clearScheduledTimeouts();
    const limit = customLimit ?? pairLimit;
    const nextTiles = buildMatchTiles(initialSet.cards, limit);

    setTiles(nextTiles);
    setSelectedTileIds([]);
    setMatchedPairIds([]);
    setMismatchedTileIds([]);
    setIsResolving(false);
    setMoves(0);
    setMistakes(0);
    setCombo(0);
    setMaxCombo(0);
    setMatchScore(0);
    setElapsedSeconds(0);
    setRadarCharges(2);
    setRadarActive(false);
    setHintCharges(2);
    setHintedPairId(null);
    setLastMatchedCard(null);
    setNewRecordBanner(false);

    if (withPeek) {
      setPeekSeconds(PEEK_DURATION_SECONDS);
      setMatchPhase("peek");
    } else {
      setPeekSeconds(0);
      setMatchPhase("playing");
    }
    playSound("flip");
  }

  useEffect(() => {
    if (mode !== "match" || matchPhase !== "peek") return;
    if (peekSeconds <= 0) {
      setMatchPhase("playing");
      return;
    }
    const timer = window.setTimeout(() => {
      setPeekSeconds((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [matchPhase, mode, peekSeconds]);

  useEffect(() => {
    if (mode !== "match" || matchPhase !== "playing") return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [matchPhase, mode]);

  function handleTileClick(tile: MemoryTile) {
    if (
      matchPhase !== "playing" ||
      isResolving ||
      radarActive ||
      matchedPairIds.includes(tile.pairId) ||
      selectedTileIds.includes(tile.tileId)
    ) {
      return;
    }

    playSound("flip");
    const nextSelected = [...selectedTileIds, tile.tileId];
    setSelectedTileIds(nextSelected);

    if (nextSelected.length < 2) return;

    const firstTile = tiles.find((item) => item.tileId === nextSelected[0]);
    if (!firstTile) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (firstTile.pairId === tile.pairId && firstTile.kind !== tile.kind) {
      // MATCH!
      const nextCombo = combo + 1;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);
      const earnedPoints = 150 * nextCombo;
      const nextScore = matchScore + earnedPoints;
      const nextMatched = [...matchedPairIds, tile.pairId];
      const matchedConcept =
        initialSet.cards.find((card) => card.id === tile.pairId) ?? null;

      setCombo(nextCombo);
      setMaxCombo(nextMaxCombo);
      setMatchScore(nextScore);
      setMatchedPairIds(nextMatched);
      setSelectedTileIds([]);
      if (hintedPairId === tile.pairId) {
        setHintedPairId(null);
      }
      setLastMatchedCard(matchedConcept);

      const totalPairsInRound = tiles.length / 2;
      if (nextMatched.length >= totalPairsInRound) {
        const accuracy = Math.round((totalPairsInRound / nextMoves) * 100);
        const accuracyBonus = accuracy >= 85 ? 250 : accuracy >= 65 ? 120 : 50;
        const speedBonus = Math.max(
          0,
          (totalPairsInRound * 14 - elapsedSeconds) * 8,
        );
        const powerupBonus = (radarCharges + hintCharges) * 40;
        const finalScore =
          nextScore + accuracyBonus + speedBonus + powerupBonus;

        setMatchScore(finalScore);
        setMatchPhase("won");
        playSound("win");
        void submitStats(finalScore, Math.max(1, elapsedSeconds));
      } else {
        playSound("match");
      }
    } else {
      // MISMATCH
      setIsResolving(true);
      setCombo(0);
      setMistakes((prev) => prev + 1);
      setMismatchedTileIds(nextSelected);
      playSound("wrong");

      scheduleTimeout(() => {
        setSelectedTileIds([]);
        setMismatchedTileIds([]);
        setIsResolving(false);
      }, 900);
    }
  }

  function activateRadar() {
    if (
      matchPhase !== "playing" ||
      radarCharges <= 0 ||
      radarActive ||
      isResolving
    ) {
      return;
    }
    setRadarCharges((prev) => prev - 1);
    setRadarActive(true);
    playSound("flip");
    scheduleTimeout(() => {
      setRadarActive(false);
    }, 1800);
  }

  function activateHint() {
    if (matchPhase !== "playing" || hintCharges <= 0 || hintedPairId) return;
    const unmatchedIds = Array.from(
      new Set(
        tiles
          .filter((tile) => !matchedPairIds.includes(tile.pairId))
          .map((tile) => tile.pairId),
      ),
    );
    if (!unmatchedIds.length) return;
    const randomPair =
      unmatchedIds[Math.floor(Math.random() * unmatchedIds.length)];
    setHintCharges((prev) => prev - 1);
    setHintedPairId(randomPair);
    playSound("flip");
  }

  // =========================================================================
  // MODE 2: SPEED RECALL BLITZ (KILAT INGATAN)
  // =========================================================================

  function startBlitzGame() {
    clearScheduledTimeouts();
    const rounds = buildBlitzRounds(initialSet.cards);
    setBlitzRounds(rounds);
    setBlitzIndex(0);
    setHearts(3);
    setBlitzTimeLeft(BLITZ_ROUND_SECONDS);
    setBlitzElapsed(0);
    setBlitzScore(0);
    setBlitzStreak(0);
    setBlitzMaxStreak(0);
    setBlitzCorrectCount(0);
    setSelectedOptionId(null);
    setLastBlitzOutcome(null);
    setNewRecordBanner(false);
    setBlitzPhase("playing");
    playSound("flip");
  }

  const finishBlitz = useCallback(
    (finalScore: number, remainingHearts: number, elapsed: number) => {
      const heartBonus = remainingHearts * 150;
      const total = finalScore + heartBonus;
      setBlitzScore(total);
      setBlitzPhase("finished");
      if (remainingHearts > 0) {
        playSound("win");
      }
      void submitStats(
        total,
        remainingHearts > 0 ? Math.max(1, elapsed) : null,
      );
    },
    [playSound, submitStats],
  );

  const advanceBlitzRound = useCallback(
    (nextHearts: number, currentScore: number, elapsed: number) => {
      if (nextHearts <= 0 || blitzIndex + 1 >= blitzRounds.length) {
        finishBlitz(currentScore, nextHearts, elapsed);
        return;
      }
      setBlitzIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setLastBlitzOutcome(null);
      setBlitzTimeLeft(BLITZ_ROUND_SECONDS);
      setBlitzPhase("playing");
    },
    [blitzIndex, blitzRounds.length, finishBlitz],
  );

  const handleBlitzAnswer = useCallback(
    (chosenCardId: string) => {
      if (blitzPhase !== "playing" || selectedOptionId !== null) return;
      const currentRound = blitzRounds[blitzIndex];
      if (!currentRound) return;

      setSelectedOptionId(chosenCardId);
      const isCorrect = chosenCardId === currentRound.card.id;

      if (isCorrect) {
        const nextStreak = blitzStreak + 1;
        const multiplier = Math.min(4, 1 + Math.floor((nextStreak - 1) / 2));
        const earned = (100 + blitzTimeLeft * 10) * multiplier;
        const nextScore = blitzScore + earned;

        setBlitzStreak(nextStreak);
        setBlitzMaxStreak((prev) => Math.max(prev, nextStreak));
        setBlitzScore(nextScore);
        setBlitzCorrectCount((prev) => prev + 1);
        setLastBlitzOutcome("correct");
        playSound("match");

        scheduleTimeout(() => {
          advanceBlitzRound(hearts, nextScore, blitzElapsed + 1);
        }, 700);
      } else {
        const nextHearts = Math.max(0, hearts - 1);
        setHearts(nextHearts);
        setBlitzStreak(0);
        setLastBlitzOutcome("wrong");
        setBlitzPhase("feedback");
        playSound("wrong");
      }
    },
    [
      advanceBlitzRound,
      blitzElapsed,
      blitzIndex,
      blitzPhase,
      blitzRounds,
      blitzScore,
      blitzStreak,
      blitzTimeLeft,
      hearts,
      playSound,
      scheduleTimeout,
      selectedOptionId,
    ],
  );

  useEffect(() => {
    if (
      mode !== "blitz" ||
      blitzPhase !== "playing" ||
      selectedOptionId !== null
    ) {
      return;
    }
    if (blitzTimeLeft <= 0) {
      setHearts((currentHearts) => Math.max(0, currentHearts - 1));
      setBlitzStreak(0);
      setLastBlitzOutcome("timeout");
      setBlitzPhase("feedback");
      playSound("wrong");
      return;
    }
    const timer = window.setTimeout(() => {
      setBlitzElapsed((prev) => prev + 1);
      setBlitzTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [blitzPhase, blitzTimeLeft, mode, playSound, selectedOptionId]);

  useEffect(() => {
    if (mode !== "blitz") return;
    function onKeyDown(event: KeyboardEvent) {
      if (blitzPhase === "playing" && selectedOptionId === null) {
        const currentRound = blitzRounds[blitzIndex];
        if (!currentRound) return;
        const num = Number(event.key);
        if (num >= 1 && num <= currentRound.options.length) {
          event.preventDefault();
          handleBlitzAnswer(currentRound.options[num - 1].cardId);
        }
      } else if (
        blitzPhase === "feedback" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        advanceBlitzRound(hearts, blitzScore, blitzElapsed);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    advanceBlitzRound,
    blitzElapsed,
    blitzIndex,
    blitzPhase,
    blitzRounds,
    blitzScore,
    handleBlitzAnswer,
    hearts,
    mode,
    selectedOptionId,
  ]);

  // =========================================================================
  // MODE 3: ACTIVE STUDY & SPACED REPETITION (KARTU HAFALAN)
  // =========================================================================

  function markStudyCard(mastered: boolean) {
    const current = studyQueue[0];
    if (!current) return;
    playSound(mastered ? "match" : "flip");
    setStudyFlipped(false);

    if (mastered) {
      const nextMastered = masteredIds.includes(current.id)
        ? masteredIds
        : [...masteredIds, current.id];
      setMasteredIds(nextMastered);
      setStudyQueue((prev) => prev.slice(1));
    } else {
      setStudyQueue((prev) => {
        const rest = prev.slice(1);
        const reinsertAt = Math.min(rest.length, 2);
        return [
          ...rest.slice(0, reinsertAt),
          current,
          ...rest.slice(reinsertAt),
        ];
      });
    }
  }

  function resetStudyDeck() {
    setStudyQueue(shuffleArray(initialSet.cards));
    setMasteredIds([]);
    setStudyFlipped(false);
    playSound("flip");
  }

  const totalRoundPairs = tiles.length / 2 || pairLimit;
  const matchAccuracy =
    moves > 0
      ? Math.min(100, Math.round((matchedPairIds.length / moves) * 100))
      : 100;
  const starCount = matchAccuracy >= 80 ? 3 : matchAccuracy >= 55 ? 2 : 1;
  const currentBlitzRound = blitzRounds[blitzIndex];
  const currentStudyCard = studyQueue[0];

  return (
    <div className="space-y-6">
      {/* Arena Header Banner */}
      <section className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 size-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                <Brain className="size-3.5 text-cyan-300" />
                Arena Flash Memory
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                {initialSet.cards.length} Konsep Materi ·{" "}
                <span className="capitalize">{initialSet.difficulty}</span>
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {initialSet.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-blue-100/80">
              {initialSet.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div>
                <p className="flex items-center gap-1 text-xs text-blue-200/80">
                  <Trophy className="size-3.5 text-amber-400" /> Rekor Skor
                </p>
                <p className="mt-0.5 text-lg font-extrabold">{bestScore}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="flex items-center gap-1 text-xs text-blue-200/80">
                  <Clock3 className="size-3.5 text-cyan-300" /> Tercepat
                </p>
                <p className="mt-0.5 text-lg font-extrabold">
                  {bestTimeSeconds ? formatClock(bestTimeSeconds) : "—"}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="flex items-center gap-1 text-xs text-blue-200/80">
                  <Gamepad2 className="size-3.5 text-indigo-300" /> Main
                </p>
                <p className="mt-0.5 text-lg font-extrabold">{playsCount}x</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={
                soundEnabled ? "Matikan efek suara" : "Nyalakan efek suara"
              }
              className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            >
              {soundEnabled ? (
                <Volume2 className="size-5 text-cyan-300" />
              ) : (
                <VolumeX className="size-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
          {[
            {
              id: "match" as const,
              icon: Layers,
              title: "Cocokkan Kartu",
              subtitle: "Minigame pasang kartu & kombo",
            },
            {
              id: "blitz" as const,
              icon: Zap,
              title: "Kilat Ingatan",
              subtitle: "Refleks cepat 12 detik & 3 nyawa",
            },
            {
              id: "study" as const,
              icon: Sparkles,
              title: "Kartu Hafalan 3D",
              subtitle: "Repetisi & Jembatan Keledai",
            },
          ].map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  clearScheduledTimeouts();
                  setMode(tab.id);
                }}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                  active
                    ? "border-cyan-300/60 bg-white text-slate-950 shadow-lg"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-blue-700 text-white"
                      : "bg-white/10 text-cyan-300"
                  }`}
                >
                  <tab.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{tab.title}</p>
                  <p
                    className={`truncate text-xs ${
                      active ? "text-neutral-500" : "text-blue-200/75"
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          MODE 1: COCOKKAN KARTU (MEMORY MATCH MINIGAME)
         ===================================================================== */}
      {mode === "match" && (
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          {matchPhase === "ready" && (
            <div className="mx-auto max-w-2xl py-8 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                <Layers className="size-8" />
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                Siap Melatih Memori Spasial & Konsep?
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Anda akan diberikan waktu{" "}
                <span className="font-bold text-blue-700">5 detik</span> untuk
                mengintip dan menghafal posisi kartu sebelum tertutup. Pasangkan
                setiap <span className="font-bold">Istilah</span> dengan{" "}
                <span className="font-bold">Definisi</span> yang tepat secara
                beruntun untuk melipatgandakan skor kombo!
              </p>

              {initialSet.cards.length > 6 && (
                <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-neutral-100 p-1.5">
                  {Array.from(
                    new Set(
                      [6, 8, initialSet.cards.length].filter(
                        (count) => count <= initialSet.cards.length,
                      ),
                    ),
                  ).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPairLimit(count)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        pairLimit === count
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-950"
                      }`}
                    >
                      {count} Pasang ({count * 2} Kartu)
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => startMatchGame(true)}
                  className="h-12 rounded-xl bg-blue-700 px-7 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
                >
                  <Play className="size-4" /> Mulai (Intip 5 Detik)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startMatchGame(false)}
                  className="h-12 rounded-xl px-6 font-bold"
                >
                  Langsung Main Tanpa Intip
                </Button>
              </div>
            </div>
          )}

          {(matchPhase === "peek" || matchPhase === "playing") && (
            <div>
              {/* Live HUD */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/90 p-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Skor
                    </p>
                    <p className="text-xl font-extrabold text-neutral-950">
                      {matchScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Kombo
                    </p>
                    <p className="inline-flex items-center gap-1 text-xl font-extrabold text-orange-600">
                      <Flame className="size-4" /> x{Math.max(1, combo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Cocok
                    </p>
                    <p className="text-xl font-extrabold text-blue-700">
                      {matchedPairIds.length}/{totalRoundPairs}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Langkah
                    </p>
                    <p className="text-xl font-extrabold text-neutral-950">
                      {moves}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Waktu
                    </p>
                    <p className="font-mono text-xl font-extrabold text-neutral-950">
                      {formatClock(elapsedSeconds)}
                    </p>
                  </div>
                </div>

                {/* Powerups & Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {matchPhase === "peek" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPeekSeconds(0);
                        setMatchPhase("playing");
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-extrabold text-slate-950 shadow-xs hover:bg-amber-400"
                    >
                      <Eye className="size-4" /> Hafalkan posisi! ({peekSeconds}
                      d) · Lewati
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={radarCharges <= 0 || radarActive}
                        onClick={activateRadar}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 text-xs font-bold text-cyan-900 transition hover:bg-cyan-100 disabled:opacity-40"
                      >
                        <Eye className="size-3.5 text-cyan-700" />
                        Intip Sekilas ({radarCharges})
                      </button>
                      <button
                        type="button"
                        disabled={hintCharges <= 0 || Boolean(hintedPairId)}
                        onClick={activateHint}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-40"
                      >
                        <Lightbulb className="size-3.5 text-amber-600" />
                        Bantuan ({hintCharges})
                      </button>
                      <button
                        type="button"
                        onClick={() => startMatchGame(true)}
                        title="Acak ulang kartu"
                        className="inline-flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Memory Tip Toast when a pair is matched */}
              {lastMatchedCard && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-extrabold">
                      Cocok! {lastMatchedCard.term}:
                    </span>{" "}
                    <span className="text-emerald-900">
                      {lastMatchedCard.memory_tip}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Matrix Grid */}
              <div
                className={`mt-6 grid gap-3 sm:gap-4 ${
                  tiles.length <= 12
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                {tiles.map((tile) => {
                  const isMatched = matchedPairIds.includes(tile.pairId);
                  const isSelected = selectedTileIds.includes(tile.tileId);
                  const isMismatch = mismatchedTileIds.includes(tile.tileId);
                  const isHinted =
                    hintedPairId === tile.pairId && !isMatched && !isSelected;
                  const isFaceUp =
                    matchPhase === "peek" ||
                    radarActive ||
                    isMatched ||
                    isSelected;

                  return (
                    <button
                      key={tile.tileId}
                      type="button"
                      disabled={isMatched || matchPhase === "peek"}
                      onClick={() => handleTileClick(tile)}
                      className={`group relative flex min-h-36 flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:min-h-40 ${
                        isMatched
                          ? "border-emerald-300 bg-emerald-50/70 shadow-none"
                          : isMismatch
                            ? "scale-[0.98] border-rose-400 bg-rose-50 shadow-md"
                            : isFaceUp
                              ? "border-blue-500 bg-white shadow-lg shadow-blue-600/10"
                              : isHinted
                                ? "animate-pulse border-amber-400 bg-gradient-to-br from-indigo-900 to-blue-950 text-white shadow-lg shadow-amber-400/25"
                                : "border-indigo-900/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-sm hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-md"
                      }`}
                    >
                      {isFaceUp ? (
                        <>
                          <div className="flex w-full items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                isMatched
                                  ? "bg-emerald-200/80 text-emerald-900"
                                  : tile.kind === "term"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-violet-100 text-violet-800"
                              }`}
                            >
                              {tile.kind === "term" ? "Istilah" : "Definisi"}
                            </span>
                            {isMatched ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                            ) : (
                              <span className="font-mono text-[11px] font-bold text-neutral-400">
                                #{String(tile.slot).padStart(2, "0")}
                              </span>
                            )}
                          </div>

                          <p
                            className={`my-auto py-2 leading-snug ${
                              tile.kind === "term"
                                ? "text-sm font-extrabold text-neutral-950 sm:text-base"
                                : "text-xs font-medium text-neutral-700 sm:text-[13px]"
                            }`}
                          >
                            {tile.text}
                          </p>

                          <span className="truncate text-[11px] font-semibold text-neutral-400">
                            {tile.category}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex w-full items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-300/60">
                              #{String(tile.slot).padStart(2, "0")}
                            </span>
                            {isHinted && (
                              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                                Pasangan!
                              </span>
                            )}
                          </div>
                          <div className="my-auto flex flex-col items-center justify-center py-2">
                            <Brain className="size-8 text-cyan-300/40 transition group-hover:scale-110 group-hover:text-cyan-300/80" />
                          </div>
                          <span className="text-[11px] font-semibold text-blue-200/40">
                            Ketuk untuk buka
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchPhase === "won" && (
            <div className="mx-auto max-w-xl py-8 text-center">
              {newRecordBanner && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-extrabold text-amber-900">
                  <Trophy className="size-4 text-amber-600" /> Rekor Skor Baru
                  Tercapai!
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((idx) => (
                  <Star
                    key={idx}
                    className={`size-10 ${
                      idx <= starCount
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-200"
                    }`}
                  />
                ))}
              </div>

              <h2 className="mt-4 text-3xl font-extrabold text-neutral-950">
                Luar Biasa! Memori Terlatih!
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Semua {totalRoundPairs} pasangan konsep dari PDF berhasil Anda
                tuntaskan.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-2xl font-extrabold text-blue-800">
                    {matchScore}
                  </p>
                  <p className="text-xs font-semibold text-blue-700/80">
                    Total Skor
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-100 p-4">
                  <p className="text-2xl font-extrabold text-neutral-950">
                    {formatClock(elapsedSeconds)}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    Waktu
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-2xl font-extrabold text-emerald-800">
                    {matchAccuracy}%
                  </p>
                  <p className="text-xs font-semibold text-emerald-700/80">
                    Akurasi ({mistakes} salah)
                  </p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-2xl font-extrabold text-orange-700">
                    x{maxCombo}
                  </p>
                  <p className="text-xs font-semibold text-orange-700/80">
                    Kombo Maks
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => startMatchGame(true)}
                  className="h-12 rounded-xl bg-blue-700 px-6 font-bold text-white hover:bg-blue-800"
                >
                  <RotateCcw className="size-4" /> Main Lagi (Acak Baru)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode("blitz");
                    startBlitzGame();
                  }}
                  className="h-12 rounded-xl px-6 font-bold"
                >
                  <Zap className="size-4 text-amber-500" /> Lanjut ke Kilat
                  Ingatan
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MODE 2: KILAT INGATAN (SPEED RECALL BLITZ)
         ===================================================================== */}
      {mode === "blitz" && (
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          {blitzPhase === "ready" && (
            <div className="mx-auto max-w-2xl py-8 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
                <Zap className="size-8" />
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                Mode Kilat Ingatan (12 Detik / Ronde)
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Uji kecepatan asosiasi otak Anda! Jawab secepat mungkin sebelum
                bar waktu habis untuk meraih{" "}
                <span className="font-bold text-amber-700">Speed Bonus</span>.
                Anda dibekali <span className="font-bold">3 Nyawa</span> dan
                bisa menekan tombol keyboard{" "}
                <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
                  1
                </kbd>
                –
                <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
                  4
                </kbd>{" "}
                untuk menjawab kilat!
              </p>

              <Button
                type="button"
                onClick={startBlitzGame}
                className="mt-7 h-12 rounded-xl bg-blue-700 px-8 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
              >
                <Zap className="size-4" /> Mulai Tantangan Kilat
              </Button>
            </div>
          )}

          {(blitzPhase === "playing" || blitzPhase === "feedback") &&
            currentBlitzRound && (
              <div className="mx-auto max-w-3xl">
                {/* Blitz HUD */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((heartIndex) => (
                      <Heart
                        key={heartIndex}
                        className={`size-6 transition ${
                          heartIndex <= hearts
                            ? "fill-rose-500 text-rose-500"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-5 text-sm font-bold">
                    <span className="text-neutral-500">
                      Ronde {blitzIndex + 1}/{blitzRounds.length}
                    </span>
                    <span className="inline-flex items-center gap-1 text-orange-600">
                      <Flame className="size-4" /> Streak {blitzStreak}
                    </span>
                    <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-blue-800">
                      Skor: {blitzScore}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer Bar */}
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      blitzTimeLeft <= 4 ? "bg-rose-500" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${(blitzTimeLeft / BLITZ_ROUND_SECONDS) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-right font-mono text-xs font-bold text-neutral-500">
                  Sisa waktu: {blitzTimeLeft} detik
                </p>

                {/* Prompt Box */}
                <div className="mt-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-6 sm:p-8">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                    {currentBlitzRound.direction === "def-to-term"
                      ? "Tebak Istilah dari Definisi"
                      : "Tebak Definisi dari Istilah"}
                  </span>
                  <p className="mt-4 text-lg font-extrabold leading-relaxed text-neutral-950 sm:text-2xl">
                    {currentBlitzRound.direction === "def-to-term"
                      ? currentBlitzRound.card.definition
                      : currentBlitzRound.card.term}
                  </p>
                </div>

                {/* 4 Options */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {currentBlitzRound.options.map((option, idx) => {
                    const isCorrectOption =
                      option.cardId === currentBlitzRound.card.id;
                    const isPicked = selectedOptionId === option.cardId;
                    const showReveal =
                      blitzPhase === "feedback" || selectedOptionId !== null;

                    let cardStyle =
                      "border-neutral-200 bg-white hover:border-blue-400 hover:bg-blue-50/40";
                    if (showReveal) {
                      if (isCorrectOption) {
                        cardStyle =
                          "border-emerald-500 bg-emerald-50 text-emerald-950";
                      } else if (isPicked) {
                        cardStyle = "border-rose-400 bg-rose-50 text-rose-950";
                      } else {
                        cardStyle =
                          "border-neutral-200 bg-neutral-50 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={option.cardId}
                        type="button"
                        disabled={showReveal}
                        onClick={() => handleBlitzAnswer(option.cardId)}
                        className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${cardStyle}`}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 font-mono text-xs font-extrabold text-neutral-700">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold leading-snug text-neutral-900">
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Panel when wrong or timeout */}
                {blitzPhase === "feedback" && (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
                        <div>
                          <p className="font-extrabold text-rose-950">
                            {lastBlitzOutcome === "timeout"
                              ? "Waktu Habis!"
                              : "Kurang Tepat!"}
                          </p>
                          <p className="mt-1 text-sm text-rose-900">
                            <span className="font-bold">
                              {currentBlitzRound.card.term}:
                            </span>{" "}
                            {currentBlitzRound.card.definition}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                            <Lightbulb className="size-3.5 shrink-0 text-amber-600" />
                            Jembatan Keledai:{" "}
                            {currentBlitzRound.card.memory_tip}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          advanceBlitzRound(hearts, blitzScore, blitzElapsed)
                        }
                        className="shrink-0 rounded-xl bg-neutral-900 font-bold text-white hover:bg-neutral-800"
                      >
                        {hearts <= 0 || blitzIndex + 1 >= blitzRounds.length
                          ? "Lihat Hasil"
                          : "Lanjut"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

          {blitzPhase === "finished" && (
            <div className="mx-auto max-w-xl py-8 text-center">
              {newRecordBanner && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-extrabold text-amber-900">
                  <Trophy className="size-4 text-amber-600" /> Rekor Skor Baru!
                </div>
              )}

              <span
                className={`mx-auto flex size-16 items-center justify-center rounded-3xl ${
                  hearts > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {hearts > 0 ? (
                  <Trophy className="size-8" />
                ) : (
                  <RotateCcw className="size-8" />
                )}
              </span>

              <h2 className="mt-4 text-3xl font-extrabold text-neutral-950">
                {hearts > 0
                  ? "Tantangan Kilat Ditaklukkan!"
                  : "Nyawa Habis — Coba Lagi!"}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Anda menjawab benar {blitzCorrectCount} dari{" "}
                {blitzRounds.length} tantangan cepat.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-2xl font-extrabold text-blue-800">
                    {blitzScore}
                  </p>
                  <p className="text-xs font-semibold text-blue-700/80">
                    Skor Akhir
                  </p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-2xl font-extrabold text-orange-700">
                    {blitzMaxStreak}
                  </p>
                  <p className="text-xs font-semibold text-orange-700/80">
                    Streak Terbaik
                  </p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-2xl font-extrabold text-rose-700">
                    {hearts}/3
                  </p>
                  <p className="text-xs font-semibold text-rose-700/80">
                    Sisa Nyawa
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={startBlitzGame}
                  className="h-12 rounded-xl bg-blue-700 px-6 font-bold text-white hover:bg-blue-800"
                >
                  <RotateCcw className="size-4" /> Main Kilat Lagi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode("study");
                  }}
                  className="h-12 rounded-xl px-6 font-bold"
                >
                  <Sparkles className="size-4 text-blue-600" /> Pelajari
                  Jembatan Keledai
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MODE 3: KARTU HAFALAN 3D & RINGKASAN KONSEP
         ===================================================================== */}
      {mode === "study" && (
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">
                  Latihan Hafalan Aktif (Spaced Repetition)
                </h2>
                <p className="text-sm text-neutral-500">
                  Kartu yang belum hafal akan diputar kembali hingga semua
                  materi dikuasai 100%.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700">
                Dikuasai: {masteredIds.length}/{initialSet.cards.length}
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${(masteredIds.length / initialSet.cards.length) * 100}%`,
                }}
              />
            </div>

            {currentStudyCard ? (
              <div className="mx-auto mt-7 max-w-2xl">
                <button
                  type="button"
                  onClick={() => {
                    playSound("flip");
                    setStudyFlipped((prev) => !prev);
                  }}
                  className={`flex min-h-72 w-full flex-col justify-between rounded-3xl border-2 p-7 text-left transition sm:p-9 ${
                    studyFlipped
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg"
                      : "border-neutral-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl hover:border-cyan-400/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        studyFlipped
                          ? "bg-blue-100 text-blue-800"
                          : "bg-white/10 text-cyan-300"
                      }`}
                    >
                      {currentStudyCard.category}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        studyFlipped ? "text-neutral-400" : "text-blue-200/70"
                      }`}
                    >
                      {studyFlipped
                        ? "Sisi Belakang (Definisi)"
                        : "Ketuk kartu untuk membalik"}
                    </span>
                  </div>

                  {!studyFlipped ? (
                    <div className="my-auto py-6 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-300/80">
                        Istilah / Konsep
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                        {currentStudyCard.term}
                      </h3>
                    </div>
                  ) : (
                    <div className="my-auto space-y-4 py-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                          {currentStudyCard.term}
                        </p>
                        <p className="mt-1.5 text-lg font-bold leading-relaxed text-neutral-950 sm:text-xl">
                          {currentStudyCard.definition}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-sm text-amber-950">
                        <span className="font-extrabold">
                          💡 Jembatan Keledai:
                        </span>{" "}
                        {currentStudyCard.memory_tip}
                      </div>
                    </div>
                  )}

                  <p
                    className={`text-center text-xs font-semibold ${
                      studyFlipped ? "text-blue-700" : "text-blue-200/60"
                    }`}
                  >
                    Sisa antrean: {studyQueue.length} kartu
                  </p>
                </button>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => markStudyCard(false)}
                    className="h-12 rounded-xl border-amber-300 bg-amber-50/60 font-bold text-amber-900 hover:bg-amber-100"
                  >
                    <RotateCcw className="size-4" /> Masih Ragu (Ulangi)
                  </Button>
                  <Button
                    type="button"
                    onClick={() => markStudyCard(true)}
                    className="h-12 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="size-4" /> Sudah Hafal!
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-md py-10 text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-8" />
                </span>
                <h3 className="mt-4 text-2xl font-extrabold text-neutral-950">
                  100% Konsep Sudah Dihafal!
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Saatnya buktikan daya ingat Anda di mode minigame Cocokkan
                  Kartu atau Kilat Ingatan.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setMode("match");
                      startMatchGame(true);
                    }}
                    className="h-11 rounded-xl bg-blue-700 px-5 font-bold text-white hover:bg-blue-800"
                  >
                    Uji di Cocokkan Kartu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetStudyDeck}
                    className="h-11 rounded-xl px-5 font-bold"
                  >
                    Ulangi Hafalan
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Reference Sheet of All Concepts */}
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-lg font-extrabold text-neutral-950">
              Daftar Lengkap Konsep & Jembatan Keledai (
              {initialSet.cards.length})
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {initialSet.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-blue-700">
                      #{idx + 1} · {card.category}
                    </span>
                    {masteredIds.includes(card.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="size-3.5" /> Hafal
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-extrabold text-neutral-950">
                    {card.term}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                    {card.definition}
                  </p>
                  <p className="mt-2.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
                    <span className="font-bold">💡 Tips Ingat:</span>{" "}
                    {card.memory_tip}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
