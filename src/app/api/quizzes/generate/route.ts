import { randomInt } from "node:crypto";

import {
  createGoogleGenerativeAI,
  type GoogleLanguageModelOptions,
} from "@ai-sdk/google";
import { APICallError, generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 180;

// Keep the complete multipart request below Vercel Functions' 4.5 MB limit.
const MAX_PDF_SIZE = 4 * 1024 * 1024;
const DAILY_GENERATION_LIMIT = 10;
const MODEL_TIMEOUT_MS = 45_000;
const DEFAULT_GOOGLE_MODEL = "gemini-3.5-flash-lite";
const PREVIOUS_DEFAULT_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
]);
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

function isGenerationTimeout(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      error.message.toLowerCase().includes("timeout"))
  );
}

function generationErrorResponse(error: unknown) {
  const usesGoogleDirect = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  );

  if (
    error instanceof Error &&
    (error.name === "GatewayError" ||
      error.name === "GatewayAuthenticationError") &&
    error.message.toLowerCase().includes("unauthenticated")
  ) {
    console.error("Quiz AI Gateway authentication missing", error.message);
    return Response.json(
      {
        error:
          "AI Gateway belum terautentikasi. Tambahkan AI_GATEWAY_API_KEY untuk Production di Vercel lalu redeploy.",
      },
      { status: 503 },
    );
  }

  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    const messages: Record<number, string> = usesGoogleDirect
      ? {
          400: "Google API key atau permintaan Gemini tidak valid. Periksa GOOGLE_GENERATIVE_AI_API_KEY dan model yang dipakai.",
          401: "Google API key tidak valid atau sudah dinonaktifkan.",
          403: "Google Gemini API menolak akses. Periksa API restrictions, quota, dan billing pada project Google.",
          404: "Model Google Gemini tidak tersedia. Gunakan GOOGLE_AI_MODEL=gemini-3.5-flash-lite.",
          429: "Quota Google Gemini API sudah tercapai. Tunggu hingga quota tersedia atau naikkan batasnya.",
          503: "Google Gemini sedang tidak tersedia. Tunggu sebentar lalu coba lagi.",
        }
      : {
          401: "Autentikasi AI Gateway gagal. Periksa AI_GATEWAY_API_KEY atau koneksi OIDC Vercel.",
          402: "Kredit atau budget AI Gateway tidak mencukupi. Tambahkan kredit atau periksa batas budget di Vercel.",
          403: "AI Gateway belum dapat digunakan. Selesaikan verifikasi akun atau metode pembayaran di Vercel.",
          429: "AI Gateway sedang terkena batas permintaan. Tunggu sebentar lalu coba lagi.",
          503: "Model AI sedang tidak tersedia. Tunggu sebentar lalu coba lagi.",
        };

    console.error("Quiz AI request failed", {
      statusCode: status,
      isRetryable: error.isRetryable,
      message: error.message,
    });

    return Response.json(
      {
        error:
          (status ? messages[status] : undefined) ??
          (usesGoogleDirect
            ? "Google Gemini gagal membaca PDF. Periksa konfigurasi dan quota API key."
            : "Layanan AI gagal membaca PDF. Periksa AI Gateway Logs di Vercel."),
      },
      { status: status && status >= 400 && status < 600 ? status : 502 },
    );
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    console.error("Quiz structured output failed", {
      finishReason: error.finishReason,
      cause: error.cause,
    });
    return Response.json(
      {
        error:
          "AI belum berhasil menyusun soal dari PDF ini. Coba PDF berbasis teks atau kurangi jumlah soal.",
      },
      { status: 422 },
    );
  }

  if (isGenerationTimeout(error)) {
    console.error("Quiz AI request timed out", error.message);
    return Response.json(
      {
        error:
          "AI belum selesai memproses PDF dalam batas waktu. Coba lagi atau gunakan PDF yang lebih ringkas.",
      },
      { status: 504 },
    );
  }

  const databaseError = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  if (
    databaseError.code === "PGRST204" ||
    databaseError.message?.includes("duration_minutes") ||
    databaseError.message?.includes("violations")
  ) {
    console.error("Quiz database migration missing", databaseError.code);
    return Response.json(
      {
        error:
          "Database belum diperbarui. Jalankan migration supabase/migrations/002_exam_mode.sql di Supabase SQL Editor.",
      },
      { status: 503 },
    );
  }

  console.error("Quiz generation failed", error);
  return Response.json(
    {
      error:
        "Kuis belum berhasil dibuat. Buka Vercel Runtime Logs untuk melihat detail error server.",
    },
    { status: 500 },
  );
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

    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    const hasGatewayAuth = Boolean(
      process.env.AI_GATEWAY_API_KEY?.trim() ||
        process.env.VERCEL_OIDC_TOKEN?.trim(),
    );

    if (!googleApiKey && !hasGatewayAuth) {
      return Response.json(
        {
          error:
            "AI belum dikonfigurasi. Tambahkan GOOGLE_GENERATIVE_AI_API_KEY atau AI_GATEWAY_API_KEY di Vercel.",
        },
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
        {
          error:
            "Ukuran PDF maksimal 4 MB agar dapat diproses di Vercel. Kompres PDF lalu coba lagi.",
        },
        { status: 413 },
      );
    }

    const admin = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count: generatedToday, error: usageError } = await admin
      .from("quizzes")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .gte("created_at", startOfDay.toISOString());

    if (usageError) throw usageError;

    const { error: migrationError } = await admin
      .from("quizzes")
      .select("duration_minutes")
      .limit(1);
    if (migrationError) throw migrationError;

    if ((generatedToday ?? 0) >= DAILY_GENERATION_LIMIT) {
      return Response.json(
        { error: "Batas 10 generasi per hari sudah tercapai." },
        { status: 429 },
      );
    }

    const pdf = new Uint8Array(await file.arrayBuffer());
    const configuredGoogleModel = process.env.GOOGLE_AI_MODEL?.trim();
    const googleModel =
      !configuredGoogleModel ||
      PREVIOUS_DEFAULT_MODELS.has(configuredGoogleModel)
        ? DEFAULT_GOOGLE_MODEL
        : configuredGoogleModel;
    const runGeneration = (
      selectedModel: Parameters<typeof generateText>[0]["model"],
      maxRetries: number,
      timeoutMs: number,
    ) =>
      generateText({
        model: selectedModel,
        maxRetries,
        maxOutputTokens: 8_192,
        timeout: { totalMs: timeoutMs },
        output: Output.object({
          name: "QuizDariPDF",
          description: "Kuis pilihan ganda berbahasa Indonesia berdasarkan PDF",
          schema: generatedQuizSchema,
        }),
        system:
          "Anda adalah guru Indonesia yang teliti. Jika PDF memuat soal beserta jawaban atau kunci jawaban, pertahankan jawaban yang tercantum di PDF sebagai jawaban benar. Jika PDF memuat soal tanpa jawaban, kerjakan sendiri soal tersebut dengan penalaran yang benar sebelum membuat empat opsi. Jika PDF hanya berisi materi, buat soal dari konsep penting lalu tentukan sendiri jawaban yang benar. Setiap soal harus punya tepat satu jawaban benar, opsi pengecoh yang masuk akal, dan penjelasan yang menerangkan alasan jawabannya. Jangan mengubah kunci jawaban eksplisit dari PDF. Gunakan bahasa Indonesia yang jelas.",
        providerOptions: {
          google: {
            thinkingConfig: { thinkingLevel: "low" },
          } satisfies GoogleLanguageModelOptions,
        },
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

    let output: z.infer<typeof generatedQuizSchema> | undefined;
    if (googleApiKey) {
      const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
      const fallbackModels = Array.from(
        new Set([googleModel, "gemini-3.1-flash-lite", "gemini-3.8-flash"]),
      );
      let lastError: unknown;

      for (const modelId of fallbackModels) {
        try {
          output = (await runGeneration(google(modelId), 0, MODEL_TIMEOUT_MS))
            .output;
          break;
        } catch (error) {
          lastError = error;
          const canFallback =
            (APICallError.isInstance(error) &&
              (error.statusCode === 429 || error.statusCode === 503)) ||
            isGenerationTimeout(error);
          if (!canFallback) throw error;
          console.warn("Google model fallback", {
            modelId,
            reason: APICallError.isInstance(error)
              ? `HTTP ${error.statusCode}`
              : "timeout",
          });
        }
      }

      if (!output) throw lastError ?? new Error("Semua model AI gagal.");
    } else {
      output = (
        await runGeneration(
          process.env.AI_MODEL ?? "google/gemini-3.5-flash-lite",
          1,
          120_000,
        )
      ).output;
    }

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
    return generationErrorResponse(error);
  }
}
