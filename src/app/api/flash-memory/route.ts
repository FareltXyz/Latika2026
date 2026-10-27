import { getCurrentUserId } from "@/lib/auth";
import { listFlashMemorySets } from "@/lib/flash-memory-store";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json(
        { error: "Silakan masuk terlebih dahulu." },
        { status: 401 },
      );
    }

    const sets = await listFlashMemorySets(userId);
    return Response.json({ sets });
  } catch (error) {
    console.error("Failed to list flash memory sets", error);
    return Response.json(
      { error: "Gagal memuat daftar Flash Memory." },
      { status: 500 },
    );
  }
}
