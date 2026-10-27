import { getParticipantCredentials } from "@/lib/participant";
import { buildQuizResult } from "@/lib/quiz-result";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const credentials = await getParticipantCredentials();
  if (!credentials)
    return Response.json(
      { error: "Sesi peserta tidak ditemukan." },
      { status: 401 },
    );

  const { code: rawCode } = await context.params;
  const admin = createAdminClient();
  const { data: quiz } = await admin
    .from("quizzes")
    .select("id, status, ends_at")
    .eq("join_code", rawCode.toUpperCase())
    .maybeSingle();

  if (!quiz || quiz.status !== "live") {
    return Response.json(
      { error: "Kuis belum dimulai atau sudah berakhir." },
      { status: 409 },
    );
  }

  if (quiz.ends_at && new Date(quiz.ends_at).getTime() + 15_000 < Date.now()) {
    await admin
      .from("quizzes")
      .update({ status: "finished" })
      .eq("id", quiz.id);
    return Response.json(
      { error: "Batas waktu pengiriman jawaban sudah lewat." },
      { status: 409 },
    );
  }

  const { data: participant } = await admin
    .from("participants")
    .select("id, answered_at")
    .eq("id", credentials.id)
    .eq("access_token", credentials.token)
    .eq("quiz_id", quiz.id)
    .maybeSingle();

  if (!participant)
    return Response.json(
      { error: "Sesi peserta tidak valid." },
      { status: 401 },
    );
  if (participant.answered_at) {
    return Response.json(
      { error: "Jawaban sudah pernah dikirim." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const answers: number[] = Array.isArray(body.answers)
    ? body.answers.map(Number)
    : [];
  const { data: questions, error: questionsError } = await admin
    .from("questions")
    .select("id, position, prompt, options, correct_index, explanation")
    .eq("quiz_id", quiz.id)
    .order("position");

  if (questionsError || !questions || answers.length !== questions.length) {
    return Response.json({ error: "Jawaban belum lengkap." }, { status: 400 });
  }

  if (
    answers.some(
      (answer) => !Number.isInteger(answer) || answer < -1 || answer > 3,
    )
  ) {
    return Response.json(
      { error: "Format jawaban tidak valid." },
      { status: 400 },
    );
  }

  const correct = questions.reduce(
    (total, question, index) =>
      total + (question.correct_index === answers[index] ? 1 : 0),
    0,
  );
  const score = Math.round((correct / questions.length) * 100);

  const { error: submissionError } = await admin.from("submissions").insert({
    participant_id: participant.id,
    answers,
    score,
  });
  if (submissionError) {
    return Response.json({ error: "Jawaban gagal disimpan." }, { status: 500 });
  }

  await admin
    .from("participants")
    .update({ score, answered_at: new Date().toISOString() })
    .eq("id", participant.id);

  return Response.json(buildQuizResult(questions, answers, score));
}
