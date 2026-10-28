import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import {
  deleteFlashMemorySet,
  getFlashMemorySet,
  recordFlashMemoryPlay,
} from "@/lib/flash-memory-store";

const patchStatsSchema = z.object({
  score: z.number().min(0).max(1_000_000),
  timeSeconds: z.number().min(1).max(36_000).nullable().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    const { id } = await context.params;
    const set = await getFlashMemorySet(id, userId);
    if (!set) {
      return Response.json(
        { error: "Deck Flash Memory tidak ditemukan." },
        { status: 404 },
      );
    }

    return Response.json({ set });
  } catch (error) {
    console.error("Failed to fetch flash memory set", error);
    return Response.json(
      { error: "Data Flash Memory gagal dimuat." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    const { id } = await context.params;
    const rawBody = await request.json().catch(() => null);
    const parsed = patchStatsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: "Data skor permainan tidak valid." },
        { status: 400 },
      );
    }

    const updated = await recordFlashMemoryPlay(id, userId, {
      score: parsed.data.score,
      timeSeconds: parsed.data.timeSeconds ?? null,
    });

    if (!updated) {
      return Response.json(
        { error: "Deck Flash Memory tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidatePath("/dashboard/flash-memory");
    return Response.json({ stats: updated });
  } catch (error) {
    console.error("Failed to update flash memory stats", error);
    return Response.json(
      { error: "Gagal menyimpan skor permainan." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteFlashMemorySet(id, userId);
    if (!deleted) {
      return Response.json(
        { error: "Deck Flash Memory tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidatePath("/dashboard/flash-memory");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete flash memory set", error);
    return Response.json(
      { error: "Gagal menghapus deck Flash Memory." },
      { status: 500 },
    );
  }
}
