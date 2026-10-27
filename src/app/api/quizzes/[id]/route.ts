import { getCurrentUserId } from "@/lib/auth";
import { buildQuizResult } from "@/lib/quiz-result";
import { createAdminClient } from "@/lib/supabase/admin";

async function getOwnedQuiz(id: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("quizzes")
    .select(
      "id, title, description, join_code, status, source_name, duration_minutes, started_at, ends_at, created_at",
    )
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();

  return { admin, quiz: data };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId)
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });

  const { id } = await context.params;
  const { admin, quiz } = await getOwnedQuiz(id, userId);
  if (!quiz)
    return Response.json({ error: "Kuis tidak ditemukan." }, { status: 404 });

  let currentQuiz = quiz;
  if (
    quiz.status === "live" &&
    quiz.ends_at &&
    new Date(quiz.ends_at).getTime() + 15_000 <= Date.now()
  ) {
    await admin.from("quizzes").update({ status: "finished" }).eq("id", id);
    currentQuiz = { ...quiz, status: "finished" };
  }

  const [
    { data: questions, error: questionsError },
    { data: participants, error: participantsError },
  ] = await Promise.all([
    admin
      .from("questions")
      .select("id, position, prompt, options, correct_index, explanation")
      .eq("quiz_id", id)
      .order("position"),
    admin
      .from("participants")
      .select("id, name, score, violations, answered_at, joined_at")
      .eq("quiz_id", id)
      .order("joined_at"),
  ]);

  if (questionsError || participantsError) {
    return Response.json({ error: "Data kuis gagal dimuat." }, { status: 500 });
  }

  const participantIds = (participants ?? []).map(
    (participant) => participant.id,
  );
  const { data: submissions, error: submissionsError } = participantIds.length
    ? await admin
        .from("submissions")
        .select("participant_id, answers, score")
        .in("participant_id", participantIds)
    : { data: [], error: null };

  if (submissionsError) {
    return Response.json(
      { error: "Hasil kuis gagal dimuat." },
      { status: 500 },
    );
  }

  const results = (submissions ?? []).map((submission) => ({
    participantId: submission.participant_id,
    ...buildQuizResult(
      questions ?? [],
      submission.answers as number[],
      submission.score,
    ),
  }));

  return Response.json({ quiz: currentQuiz, questions, participants, results });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId)
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });

  const { id } = await context.params;
  const { admin, quiz } = await getOwnedQuiz(id, userId);
  if (!quiz)
    return Response.json({ error: "Kuis tidak ditemukan." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  if (action !== "start" && action !== "finish") {
    return Response.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  if (action === "start" && quiz.status !== "waiting") {
    return Response.json(
      { error: "Kuis hanya dapat dimulai dari status menunggu." },
      { status: 409 },
    );
  }

  const now = new Date();
  const update =
    action === "start"
      ? {
          status: "live",
          started_at: now.toISOString(),
          ends_at: new Date(
            now.getTime() + quiz.duration_minutes * 60_000,
          ).toISOString(),
        }
      : { status: "finished", ends_at: now.toISOString() };

  const { error } = await admin.from("quizzes").update(update).eq("id", id);
  if (error)
    return Response.json(
      { error: "Status kuis gagal diperbarui." },
      { status: 500 },
    );

  return Response.json(update);
}
