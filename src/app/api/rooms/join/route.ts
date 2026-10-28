import { cookies } from "next/headers";

import {
  addBannedQuizId,
  getBannedQuizIds,
  getParticipantCredentials,
  MAX_QUIZ_VIOLATIONS,
} from "@/lib/participant";
import { createAdminClient } from "@/lib/supabase/admin";

const BAN_ERROR_MESSAGE =
  "Anda telah dikeluarkan (di-ban) dari kuis ini karena melakukan 3 kali pelanggaran dan tidak dapat masuk kembali.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "")
    .trim()
    .toUpperCase();
  const normalizedName = String(body.name ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return Response.json(
      { error: "Kode kuis harus terdiri dari 6 karakter." },
      { status: 400 },
    );
  }
  if (normalizedName.length < 2 || normalizedName.length > 40) {
    return Response.json(
      { error: "Nama harus 2–40 karakter." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: quiz } = await admin
    .from("quizzes")
    .select("id, status, ends_at, expires_at")
    .eq("join_code", code)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!quiz)
    return Response.json(
      { error: "Kode kuis tidak ditemukan." },
      { status: 404 },
    );
  if (quiz.ends_at && new Date(quiz.ends_at).getTime() <= Date.now()) {
    await admin
      .from("quizzes")
      .update({ status: "finished" })
      .eq("id", quiz.id);
    return Response.json(
      { error: "Waktu kuis ini sudah habis." },
      { status: 409 },
    );
  }
  if (quiz.status === "finished") {
    return Response.json(
      { error: "Kuis ini sudah berakhir." },
      { status: 409 },
    );
  }

  const [bannedQuizIds, existingCreds, { data: bannedParticipants }] =
    await Promise.all([
      getBannedQuizIds(),
      getParticipantCredentials(),
      admin
        .from("participants")
        .select("name")
        .eq("quiz_id", quiz.id)
        .gte("violations", MAX_QUIZ_VIOLATIONS),
    ]);

  if (bannedQuizIds.includes(quiz.id)) {
    return Response.json({ error: BAN_ERROR_MESSAGE }, { status: 403 });
  }

  if (existingCreds) {
    const { data: existingParticipant } = await admin
      .from("participants")
      .select("id, violations")
      .eq("id", existingCreds.id)
      .eq("access_token", existingCreds.token)
      .eq("quiz_id", quiz.id)
      .maybeSingle();

    if (
      existingParticipant &&
      existingParticipant.violations >= MAX_QUIZ_VIOLATIONS
    ) {
      await addBannedQuizId(quiz.id);
      return Response.json({ error: BAN_ERROR_MESSAGE }, { status: 403 });
    }
  }

  const isNameBanned = (bannedParticipants ?? []).some(
    (item) =>
      item.name.replace(/\s+/g, " ").trim().toLowerCase() ===
      normalizedName.toLowerCase(),
  );
  if (isNameBanned) {
    return Response.json({ error: BAN_ERROR_MESSAGE }, { status: 403 });
  }

  const { count: participantCount } = await admin
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quiz.id);
  if ((participantCount ?? 0) >= 100) {
    return Response.json({ error: "Ruang kuis sudah penuh." }, { status: 409 });
  }

  const { data: participant, error } = await admin
    .from("participants")
    .insert({ quiz_id: quiz.id, name: normalizedName })
    .select("id, access_token")
    .single();

  if (error || !participant) {
    return Response.json(
      { error: "Belum berhasil bergabung." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "latika_participant",
    `${participant.id}.${participant.access_token}`,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  );

  return Response.json({ code });
}
