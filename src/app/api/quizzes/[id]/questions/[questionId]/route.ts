import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateQuestionSchema = z.object({
  prompt: z.string().trim().min(3).max(500),
  options: z.array(z.string().trim().min(1).max(240)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(500),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; questionId: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error:
          "Periksa kembali pertanyaan, empat pilihan jawaban, kunci, dan pembahasan.",
      },
      { status: 400 },
    );
  }

  const { id, questionId } = await context.params;
  const admin = createAdminClient();
  const { data: quiz, error: quizError } = await admin
    .from("quizzes")
    .select("id, status")
    .eq("id", id)
    .eq("owner_id", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (quizError) {
    console.error("Editable quiz lookup failed", {
      quizId: id,
      code: quizError.code,
      message: quizError.message,
    });
    return Response.json({ error: "Kuis gagal diperiksa." }, { status: 500 });
  }
  if (!quiz) {
    return Response.json({ error: "Kuis tidak ditemukan." }, { status: 404 });
  }
  if (quiz.status !== "waiting") {
    return Response.json(
      { error: "Soal hanya dapat diedit sebelum kuis dimulai." },
      { status: 409 },
    );
  }

  const { data: question, error: updateError } = await admin
    .from("questions")
    .update({
      prompt: parsed.data.prompt,
      options: parsed.data.options,
      correct_index: parsed.data.correctIndex,
      explanation: parsed.data.explanation,
    })
    .eq("id", questionId)
    .eq("quiz_id", id)
    .select("id, position, prompt, options, correct_index, explanation")
    .maybeSingle();

  if (updateError) {
    console.error("Question update failed", {
      quizId: id,
      questionId,
      code: updateError.code,
      message: updateError.message,
    });
    return Response.json({ error: "Soal gagal disimpan." }, { status: 500 });
  }
  if (!question) {
    return Response.json({ error: "Soal tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ question });
}
