import {
  createGoogleGenerativeAI,
  type GoogleLanguageModelOptions,
} from "@ai-sdk/google";
import { APICallError, generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import {
  countFlashMemoryGeneratedToday,
  createFlashMemorySet,
} from "@/lib/flash-memory-store";
import type { FlashMemoryDifficulty } from "@/lib/types";

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

const VALID_DIFFICULTIES = new Set<FlashMemoryDifficulty>([
  "mudah",
  "sedang",
  "sulit",
]);

const FOCUS_INSTRUCTIONS: Record<string, string> = {
  konsep:
    "Utamakan pasangan istilah kunci dan definisi konseptual terpenting dari materi PDF.",
  fakta:
    "Utamakan fakta spesifik, rumus, tokoh, tanggal/angka penting, klasifikasi, atau mekanisme proses di dalam PDF.",
  campuran:
    "Cakup kombinasi seimbang antara konsep inti, istilah penting, proses, dan fakta kunci dari PDF.",
};

const generatedFlashMemorySchema = z.object({
  title: z
    .string()
    .min(3)
    .max(100)
    .describe("Judul topik latihan memori yang ringkas dan menarik"),
  description: z
    .string()
    .min(10)
    .max(240)
    .describe("Ringkasan singkat materi PDF yang dilatih dalam minigame"),
  cards: z
    .array(
      z.object({
        term: z
          .string()
          .min(2)
          .max(90)
          .describe(
            "Istilah kunci, konsep utama, rumus singkat, atau nama penting (ringkas 1-6 kata)",
          ),
        definition: z
          .string()
          .min(8)
          .max(220)
          .describe(
            "Penjelasan/definisi ringkas dan akurat untuk istilah tersebut tanpa mengulang kata persis dari istilahnya (6-22 kata)",
          ),
        category: z
          .string()
          .min(2)
          .max(40)
          .describe(
            "Label subtopik 1-3 kata seperti Konsep, Definisi, Proses, Rumus, atau Fakta",
          ),
        memoryTip: z
          .string()
          .min(5)
          .max(220)
          .describe(
            "Jembatan keledai, asosiasi unik, atau kata kunci pengingat singkat agar mudah dihafal",
          ),
      }),
    )
    .min(4)
    .max(12),
});

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
    console.error(
      "Flash Memory AI Gateway authentication missing",
      error.message,
    );
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

    console.error("Flash Memory AI request failed", {
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
    console.error("Flash Memory structured output failed", {
      finishReason: error.finishReason,
      cause: error.cause,
    });
    return Response.json(
      {
        error:
          "AI belum berhasil menyusun kartu memori dari PDF ini. Coba PDF berbasis teks atau kurangi jumlah kartu.",
      },
      { status: 422 },
    );
  }

  if (isGenerationTimeout(error)) {
    console.error("Flash Memory AI request timed out", error.message);
    return Response.json(
      {
        error:
          "AI belum selesai memproses PDF dalam batas waktu. Coba lagi atau gunakan PDF yang lebih ringkas.",
      },
      { status: 504 },
    );
  }

  console.error("Flash Memory generation failed", error);
  return Response.json(
    {
      error:
        "Permainan Flash Memory belum berhasil dibuat. Silakan coba lagi sebentar lagi.",
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
            "AI belum dikonfigurasi. Tambahkan GOOGLE_GENERATIVE_AI_API_KEY atau AI_GATEWAY_API_KEY.",
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedPairs = Number(formData.get("pairCount") ?? 8);
    const rawDifficulty = String(formData.get("difficulty") ?? "sedang");
    const rawFocus = String(formData.get("focusMode") ?? "campuran");

    const pairCount = Math.min(12, Math.max(4, requestedPairs));
    const difficulty: FlashMemoryDifficulty = VALID_DIFFICULTIES.has(
      rawDifficulty as FlashMemoryDifficulty,
    )
      ? (rawDifficulty as FlashMemoryDifficulty)
      : "sedang";
    const focusInstruction =
      FOCUS_INSTRUCTIONS[rawFocus] ?? FOCUS_INSTRUCTIONS.campuran;

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
            "Ukuran PDF maksimal 4 MB agar dapat diproses dengan cepat. Kompres PDF lalu coba lagi.",
        },
        { status: 413 },
      );
    }

    const generatedToday = await countFlashMemoryGeneratedToday(userId);
    if (generatedToday >= DAILY_GENERATION_LIMIT) {
      return Response.json(
        {
          error: `Batas ${DAILY_GENERATION_LIMIT} generasi Flash Memory per hari sudah tercapai.`,
        },
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
          name: "FlashMemoryDariPDF",
          description:
            "Deck kartu permainan latih ingatan berbahasa Indonesia berdasarkan materi PDF",
          schema: generatedFlashMemorySchema,
        }),
        system:
          "Anda adalah perancang permainan kognitif & ahli pedagogi Indonesia. Tugas Anda mengekstrak materi dari PDF menjadi pasangan kartu permainan daya ingat (Flash Memory Minigame). Setiap item terdiri atas `term` (istilah/konsep singkat 1-6 kata) dan `definition` (inti penjelasan ringkas 6-22 kata). PENTING: (1) Setiap pasangan `term` dan `definition` harus berkorespondensi 1-ke-1 secara unik dan tidak ambigu dengan kartu lain. (2) Jangan menuliskan kata `term` secara harfiah di dalam `definition` agar pemain benar-benar melatih ingatan konseptual, bukan mencocokkan teks yang sama. (3) Buat `memoryTip` berupa jembatan keledai, analogi visual singkat, atau trik asosiasi kreatif agar konsep mudah melekat di kepala. Gunakan bahasa Indonesia yang padat dan jernih.",
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
                text: `Susun tepat ${pairCount} pasangan kartu Flash Memory dari PDF ini dengan tingkat kesulitan ${difficulty}. ${focusInstruction} Pastikan setiap istilah dan definisi singkat, tajam, tidak duplikat, dan sangat nyaman dibaca di atas kartu minigame.`,
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

    let output: z.infer<typeof generatedFlashMemorySchema> | undefined;
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
          console.warn("Flash Memory Google model fallback", {
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

    const created = await createFlashMemorySet(userId, {
      title: output.title,
      description: output.description,
      sourceName: file.name.slice(0, 255),
      difficulty,
      cards: output.cards.slice(0, pairCount),
    });

    return Response.json({ setId: created.id });
  } catch (error) {
    return generationErrorResponse(error);
  }
}
