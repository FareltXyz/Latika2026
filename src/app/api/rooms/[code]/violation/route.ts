import {
  addBannedQuizId,
  getParticipantCredentials,
  MAX_QUIZ_VIOLATIONS,
} from "@/lib/participant";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const credentials = await getParticipantCredentials();
  if (!credentials) {
    return Response.json(
      { error: "Sesi peserta tidak ditemukan." },
      { status: 401 },
    );
  }

  const { code: rawCode } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? "unknown").slice(0, 80);
  const admin = createAdminClient();
  const { data: quiz } = await admin
    .from("quizzes")
    .select("id, status, expires_at")
    .eq("join_code", rawCode.toUpperCase())
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!quiz || quiz.status !== "live") {
    return Response.json(
      { error: "Kuis tidak sedang berlangsung." },
      { status: 409 },
    );
  }

  const { data: participant } = await admin
    .from("participants")
    .select("id, violations, answered_at")
    .eq("id", credentials.id)
    .eq("access_token", credentials.token)
    .eq("quiz_id", quiz.id)
    .maybeSingle();

  if (!participant || participant.answered_at) {
    return Response.json(
      { error: "Sesi peserta tidak aktif." },
      { status: 409 },
    );
  }

  if (participant.violations >= MAX_QUIZ_VIOLATIONS) {
    await addBannedQuizId(quiz.id);
    return Response.json({
      violations: participant.violations,
      banned: true,
    });
  }

  const violations = participant.violations + 1;
  const { error } = await admin
    .from("participants")
    .update({ violations })
    .eq("id", participant.id);

  if (error) {
    return Response.json(
      { error: "Pelanggaran gagal dicatat." },
      { status: 500 },
    );
  }

  const banned = violations >= MAX_QUIZ_VIOLATIONS;
  if (banned) {
    await addBannedQuizId(quiz.id);
  }

  console.warn("Exam focus violation", {
    participantId: participant.id,
    violations,
    banned,
    reason,
  });
  return Response.json({ violations, banned });
}
