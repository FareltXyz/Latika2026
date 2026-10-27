import { getParticipantCredentials } from "@/lib/participant";
import { buildQuizResult } from "@/lib/quiz-result";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const credentials = await getParticipantCredentials();
  if (!credentials)
    return Response.json(
      { error: "Sesi peserta tidak ditemukan." },
      { status: 401 },
    );

  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();
  const admin = createAdminClient();
  const { data: quiz } = await admin
    .from("quizzes")
    .select(
      "id, title, description, status, duration_minutes, started_at, ends_at",
    )
    .eq("join_code", code)
    .maybeSingle();

  if (!quiz)
    return Response.json({ error: "Kuis tidak ditemukan." }, { status: 404 });

  if (
    quiz.status === "live" &&
    quiz.ends_at &&
    new Date(quiz.ends_at).getTime() + 15_000 <= Date.now()
  ) {
    await admin
      .from("quizzes")
      .update({ status: "finished" })
      .eq("id", quiz.id);
    quiz.status = "finished";
  }

  const { data: participant } = await admin
    .from("participants")
    .select("id, name, score, violations, answered_at")
    .eq("id", credentials.id)
    .eq("access_token", credentials.token)
    .eq("quiz_id", quiz.id)
    .maybeSingle();

  if (!participant)
    return Response.json(
      { error: "Sesi peserta tidak valid." },
      { status: 401 },
    );

  if (participant.answered_at && participant.score !== null) {
    const [{ data: questions }, { data: submission }] = await Promise.all([
      admin
        .from("questions")
        .select("id, position, prompt, options, correct_index, explanation")
        .eq("quiz_id", quiz.id)
        .order("position"),
      admin
        .from("submissions")
        .select("answers, score")
        .eq("participant_id", participant.id)
        .maybeSingle(),
    ]);

    if (questions && submission) {
      return Response.json({
        quiz,
        participant,
        questions: [],
        result: buildQuizResult(
          questions,
          submission.answers as number[],
          submission.score,
        ),
      });
    }
  }

  if (quiz.status !== "live") {
    return Response.json({ quiz, participant, questions: [] });
  }

  const { data: questions, error } = await admin
    .from("questions")
    .select("id, position, prompt, options")
    .eq("quiz_id", quiz.id)
    .order("position");

  if (error)
    return Response.json({ error: "Soal gagal dimuat." }, { status: 500 });
  return Response.json({ quiz, participant, questions });
}
