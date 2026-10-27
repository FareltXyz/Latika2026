import "server-only";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FlashMemoryCard,
  FlashMemoryDifficulty,
  FlashMemorySetDetail,
  FlashMemorySetSummary,
} from "@/lib/types";

const STORAGE_BUCKET = "flash-memory-data";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type StoredSetDocument = FlashMemorySetDetail & {
  owner_id: string;
};

export type CreateFlashMemoryInput = {
  title: string;
  description: string;
  sourceName: string;
  difficulty: FlashMemoryDifficulty;
  cards: Array<{
    term: string;
    definition: string;
    category: string;
    memoryTip: string;
  }>;
};

function isValidUuid(value: string) {
  return UUID_REGEX.test(value);
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return (
    candidate.code === "PGRST205" ||
    candidate.code === "42P01" ||
    Boolean(candidate.message?.includes("flash_memory_sets")) ||
    Boolean(candidate.message?.includes("flash_memory_cards"))
  );
}

async function ensurePrivateBucket(
  admin: ReturnType<typeof createAdminClient>,
) {
  const { data: existing, error: getError } =
    await admin.storage.getBucket(STORAGE_BUCKET);
  if (existing && !getError) return;

  const { error: createError } = await admin.storage.createBucket(
    STORAGE_BUCKET,
    {
      public: false,
      fileSizeLimit: 1024 * 1024,
    },
  );
  if (
    createError &&
    !createError.message.toLowerCase().includes("already exists")
  ) {
    throw createError;
  }
}

async function readStorageDocument(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  setId: string,
): Promise<StoredSetDocument | null> {
  if (!isValidUuid(userId) || !isValidUuid(setId)) return null;
  const path = `${userId}/${setId}.json`;
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .download(path);
  if (error || !data) return null;

  try {
    const parsed = JSON.parse(await data.text()) as StoredSetDocument;
    if (parsed.owner_id !== userId || parsed.id !== setId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeStorageDocument(
  admin: ReturnType<typeof createAdminClient>,
  doc: StoredSetDocument,
) {
  await ensurePrivateBucket(admin);
  const path = `${doc.owner_id}/${doc.id}.json`;
  const payload = Buffer.from(JSON.stringify(doc), "utf-8");
  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, payload, {
      contentType: "application/json",
      upsert: true,
    });
  if (error) throw error;
}

async function listStorageSummaries(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<FlashMemorySetSummary[]> {
  if (!isValidUuid(userId)) return [];
  const { data: files, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .list(userId, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error || !files?.length) return [];

  const jsonFiles = files.filter((file) => file.name.endsWith(".json"));
  const docs = await Promise.all(
    jsonFiles.map(async (file) => {
      const setId = file.name.slice(0, -5);
      return readStorageDocument(admin, userId, setId);
    }),
  );

  return docs
    .filter((doc): doc is StoredSetDocument => doc !== null)
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      source_name: doc.source_name,
      difficulty: doc.difficulty,
      best_score: doc.best_score,
      best_time_seconds: doc.best_time_seconds,
      plays_count: doc.plays_count,
      cards_count: doc.cards.length,
      created_at: doc.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export async function countFlashMemoryGeneratedToday(
  userId: string,
): Promise<number> {
  const admin = createAdminClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  const { count, error } = await admin
    .from("flash_memory_sets")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .gte("created_at", startIso);

  if (error && !isMissingTableError(error)) {
    throw error;
  }

  // Note: PostgREST HEAD on a missing table may return status 204 with null count or PGRST205
  const storageSummaries = await listStorageSummaries(admin, userId);
  const storageToday = storageSummaries.filter(
    (item) => item.created_at >= startIso,
  ).length;

  return (count ?? 0) + storageToday;
}

export async function listFlashMemorySets(
  userId: string,
): Promise<FlashMemorySetSummary[]> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("flash_memory_sets")
    .select(
      "id, title, description, source_name, difficulty, best_score, best_time_seconds, plays_count, created_at, flash_memory_cards(count)",
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error && !isMissingTableError(error)) {
    throw error;
  }

  const dbSummaries: FlashMemorySetSummary[] = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    source_name: row.source_name,
    difficulty: (row.difficulty as FlashMemoryDifficulty) ?? "sedang",
    best_score: Number(row.best_score ?? 0),
    best_time_seconds:
      row.best_time_seconds === null ? null : Number(row.best_time_seconds),
    plays_count: Number(row.plays_count ?? 0),
    cards_count: Number(
      (row.flash_memory_cards as Array<{ count: number }> | undefined)?.[0]
        ?.count ?? 0,
    ),
    created_at: row.created_at,
  }));

  const storageSummaries = await listStorageSummaries(admin, userId);
  if (!storageSummaries.length) return dbSummaries;

  const seen = new Set(dbSummaries.map((item) => item.id));
  const merged = [
    ...dbSummaries,
    ...storageSummaries.filter((item) => !seen.has(item.id)),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function createFlashMemorySet(
  userId: string,
  input: CreateFlashMemoryInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const safeTitle = input.title.trim().slice(0, 140) || "Latihan Flash Memory";
  const safeDescription = input.description.trim().slice(0, 240);
  const safeSource = input.sourceName.trim().slice(0, 255) || "Materi.pdf";

  const { data: createdSet, error: setError } = await admin
    .from("flash_memory_sets")
    .insert({
      owner_id: userId,
      title: safeTitle,
      description: safeDescription,
      source_name: safeSource,
      difficulty: input.difficulty,
    })
    .select("id")
    .single();

  if (!setError && createdSet) {
    const cardsPayload = input.cards.map((card, position) => ({
      set_id: createdSet.id,
      position,
      term: card.term.trim().slice(0, 160),
      definition: card.definition.trim().slice(0, 400),
      category: card.category.trim().slice(0, 40) || "Konsep",
      memory_tip: card.memoryTip.trim().slice(0, 240),
    }));

    const { error: cardsError } = await admin
      .from("flash_memory_cards")
      .insert(cardsPayload);

    if (cardsError) {
      await admin.from("flash_memory_sets").delete().eq("id", createdSet.id);
      if (!isMissingTableError(cardsError)) {
        throw cardsError;
      }
    } else {
      return { id: createdSet.id };
    }
  } else if (setError && !isMissingTableError(setError)) {
    throw setError;
  }

  // Fallback to private server-only Supabase Storage when SQL migration 003 hasn't been executed yet
  const setId = randomUUID();
  const cards: FlashMemoryCard[] = input.cards.map((card, position) => ({
    id: randomUUID(),
    position,
    term: card.term.trim().slice(0, 160),
    definition: card.definition.trim().slice(0, 400),
    category: card.category.trim().slice(0, 40) || "Konsep",
    memory_tip: card.memoryTip.trim().slice(0, 240),
  }));

  const doc: StoredSetDocument = {
    id: setId,
    owner_id: userId,
    title: safeTitle,
    description: safeDescription,
    source_name: safeSource,
    difficulty: input.difficulty,
    best_score: 0,
    best_time_seconds: null,
    plays_count: 0,
    created_at: new Date().toISOString(),
    cards,
  };

  await writeStorageDocument(admin, doc);
  return { id: setId };
}

export async function getFlashMemorySet(
  id: string,
  userId: string,
): Promise<FlashMemorySetDetail | null> {
  if (!isValidUuid(id) || !isValidUuid(userId)) return null;
  const admin = createAdminClient();

  const { data: setRow, error: setError } = await admin
    .from("flash_memory_sets")
    .select(
      "id, title, description, source_name, difficulty, best_score, best_time_seconds, plays_count, created_at",
    )
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();

  if (setError && !isMissingTableError(setError)) {
    throw setError;
  }

  if (setRow) {
    const { data: cardRows, error: cardsError } = await admin
      .from("flash_memory_cards")
      .select("id, position, term, definition, category, memory_tip")
      .eq("set_id", id)
      .order("position", { ascending: true });

    if (cardsError && !isMissingTableError(cardsError)) {
      throw cardsError;
    }

    if (cardRows) {
      return {
        id: setRow.id,
        title: setRow.title,
        description: setRow.description,
        source_name: setRow.source_name,
        difficulty: (setRow.difficulty as FlashMemoryDifficulty) ?? "sedang",
        best_score: Number(setRow.best_score ?? 0),
        best_time_seconds:
          setRow.best_time_seconds === null
            ? null
            : Number(setRow.best_time_seconds),
        plays_count: Number(setRow.plays_count ?? 0),
        created_at: setRow.created_at,
        cards: cardRows,
      };
    }
  }

  const stored = await readStorageDocument(admin, userId, id);
  if (!stored) return null;

  const { owner_id: _ownerId, ...detail } = stored;
  return detail;
}

export async function recordFlashMemoryPlay(
  id: string,
  userId: string,
  stats: { score: number; timeSeconds: number | null },
): Promise<{
  best_score: number;
  best_time_seconds: number | null;
  plays_count: number;
} | null> {
  if (!isValidUuid(id) || !isValidUuid(userId)) return null;
  const admin = createAdminClient();
  const safeScore = Math.max(0, Math.min(1_000_000, Math.round(stats.score)));
  const safeTime =
    stats.timeSeconds !== null && stats.timeSeconds > 0
      ? Math.min(36_000, Math.round(stats.timeSeconds))
      : null;

  const { data: setRow, error: setError } = await admin
    .from("flash_memory_sets")
    .select("id, best_score, best_time_seconds, plays_count")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();

  if (setError && !isMissingTableError(setError)) {
    throw setError;
  }

  if (setRow) {
    const prevBestScore = Number(setRow.best_score ?? 0);
    const prevBestTime =
      setRow.best_time_seconds === null
        ? null
        : Number(setRow.best_time_seconds);
    const nextStats = {
      best_score: Math.max(prevBestScore, safeScore),
      best_time_seconds:
        safeTime !== null
          ? prevBestTime === null
            ? safeTime
            : Math.min(prevBestTime, safeTime)
          : prevBestTime,
      plays_count: Number(setRow.plays_count ?? 0) + 1,
    };

    const { error: updateError } = await admin
      .from("flash_memory_sets")
      .update(nextStats)
      .eq("id", id)
      .eq("owner_id", userId);

    if (updateError) throw updateError;
    return nextStats;
  }

  const stored = await readStorageDocument(admin, userId, id);
  if (!stored) return null;

  const nextStats = {
    best_score: Math.max(stored.best_score, safeScore),
    best_time_seconds:
      safeTime !== null
        ? stored.best_time_seconds === null
          ? safeTime
          : Math.min(stored.best_time_seconds, safeTime)
        : stored.best_time_seconds,
    plays_count: stored.plays_count + 1,
  };

  await writeStorageDocument(admin, {
    ...stored,
    ...nextStats,
  });

  return nextStats;
}

export async function deleteFlashMemorySet(
  id: string,
  userId: string,
): Promise<boolean> {
  if (!isValidUuid(id) || !isValidUuid(userId)) return false;
  const admin = createAdminClient();
  let deleted = false;

  const { data: deletedRows, error } = await admin
    .from("flash_memory_sets")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId)
    .select("id");

  if (error && !isMissingTableError(error)) {
    throw error;
  }
  if (deletedRows?.length) deleted = true;

  const existingDoc = await readStorageDocument(admin, userId, id);
  if (existingDoc) {
    const { error: removeError } = await admin.storage
      .from(STORAGE_BUCKET)
      .remove([`${userId}/${id}.json`]);
    if (!removeError) deleted = true;
  }

  return deleted;
}
