import { randomInt } from "node:crypto";

import { generateText, Output } from "ai";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_SIZE = 8 * 1024 * 1024;
const DAILY_GENERATION_LIMIT = 10;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generatedQuizSchema = z.object({
  title: z.string().min(3).max(100).describe("Judul kuis yang ringkas"),
  description: z
    .string()
    .min(10)
    .max(240)
    .describe("Ringkasan singkat topik materi"),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(10).max(500),
        options: z.array(z.string().min(1).max(240)).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(5).max(500),
      }),
    )
    .min(3)
    .max(15),
});

function createJoinCode() {
  return Array.from(
    { length: 6 },
    () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
  ).join("");
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json(
        { error: "Silakan masuk terlebih dahulu." },
        { status: 401 },
      );
    }

    if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
      return Response.json(
        { error: "AI Gateway belum dikonfigurasi di server." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedCount = Number(formData.get("questionCount") ?? 8);
    const requestedDuration = Number(formData.get("durationMinutes") ?? 20);
    const difficulty = String(formData.get("difficulty") ?? "sedang");
    const questionCount = Math.min(15, Math.max(3, requestedCount));
    const durationMinutes = Math.min(180, Math.max(5, requestedDuration));

    if (!(file instanceof File)) {
      return Response.json(
        { error: "File PDF wajib dipilih." },
        { status: 400 },
      );
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return Response.json(
        { error: "Format file harus PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return Response.json(
        { error: "Ukuran PDF maksimal 8 MB untuk versi ini." },
        { status: 413 },
      );
    }

    const admin = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count: generatedToday } = await admin
      .from("quizzes")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .gte("created_at", startOfDay.toISOString());

    if ((generatedToday ?? 0) >= DAILY_GENERATION_LIMIT) {
      return Response.json(
        { error: "Batas 10 generasi per hari sudah tercapai." },
        { status: 429 },
      );
    }

    const pdf = new Uint8Array(await file.arrayBuffer());
    const { output } = await generateText({
      model: process.env.AI_MODEL ?? "google/gemini-3.8-flash",
      output: Output.object({
        name: "QuizDariPDF",
        description: "Kuis pilihan ganda berbahasa Indonesia berdasarkan PDF",
        schema: generatedQuizSchema,
      }),
      system:
        "Anda adalah guru Indonesia yang teliti. Jika PDF memuat soal beserta jawaban atau kunci jawaban, pertahankan jawaban yang tercantum di PDF sebagai jawaban benar. Jika PDF memuat soal tanpa jawaban, kerjakan sendiri soal tersebut dengan penalaran yang benar sebelum membuat empat opsi. Jika PDF hanya berisi materi, buat soal dari konsep penting lalu tentukan sendiri jawaban yang benar. Setiap soal harus punya tepat satu jawaban benar, opsi pengecoh yang masuk akal, dan penjelasan yang menerangkan alasan jawabannya. Jangan mengubah kunci jawaban eksplisit dari PDF. Gunakan bahasa Indonesia yang jelas.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Buat tepat ${questionCount} soal pilihan ganda dengan tingkat kesulitan ${difficulty}. Prioritaskan soal dan kunci jawaban yang sudah ada di PDF. Untuk soal tanpa kunci, selesaikan dengan benar terlebih dahulu. Jika jumlah soal di PDF kurang, tambahkan soal baru dari materi. Variasikan cakupan konsep penting dan hindari pertanyaan duplikat.`,
            },
            {
              type: "file",
              mediaType: "application/pdf",
              data: pdf,
              filename: file.name,
            },
          ],
        },
      ],
    });

    let joinCode = createJoinCode();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: existing } = await admin
        .from("quizzes")
        .select("id")
        .eq("join_code", joinCode)
        .maybeSingle();
      if (!existing) break;
      joinCode = createJoinCode();
    }

    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .insert({
        owner_id: userId,
        title: output.title,
        description: output.description,
        source_name: file.name.slice(0, 255),
        join_code: joinCode,
        status: "waiting",
        duration_minutes: durationMinutes,
      })
      .select("id, join_code")
      .single();

    if (quizError || !quiz)
      throw quizError ?? new Error("Kuis gagal disimpan.");

    const questions = output.questions
      .slice(0, questionCount)
      .map((question, position) => ({
        quiz_id: quiz.id,
        position,
        prompt: question.prompt,
        options: question.options,
        correct_index: question.correctIndex,
        explanation: question.explanation,
      }));

    const { error: questionError } = await admin
      .from("questions")
      .insert(questions);
    if (questionError) {
      await admin.from("quizzes").delete().eq("id", quiz.id);
      throw questionError;
    }

    return Response.json({ quizId: quiz.id, joinCode: quiz.join_code });
  } catch (error) {
    console.error("Quiz generation failed", error);
    return Response.json(
      {
        error:
          "Kuis belum berhasil dibuat. Coba PDF lain atau ulangi beberapa saat lagi.",
      },
      { status: 500 },
    );
  }
}
