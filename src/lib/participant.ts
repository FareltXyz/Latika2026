import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const MAX_QUIZ_VIOLATIONS = 3;

const BANNED_COOKIE_NAME = "latika_banned";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getBanSecret() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "latika-participant-ban-secret"
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getBanSecret()).update(payload).digest("hex");
}

export async function getParticipantCredentials() {
  const value = (await cookies()).get("latika_participant")?.value;
  if (!value) return null;

  const [id, token] = value.split(".");
  if (!id || !token) return null;
  return { id, token };
}

export async function getBannedQuizIds(): Promise<string[]> {
  const raw = (await cookies()).get(BANNED_COOKIE_NAME)?.value;
  if (!raw) return [];

  const dotIndex = raw.lastIndexOf(".");
  if (dotIndex <= 0) return [];

  const payload = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);
  const expected = signPayload(payload);

  const sigBuf = Buffer.from(signature, "utf-8");
  const expBuf = Buffer.from(expected, "utf-8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return [];
  }

  return payload.split(",").filter((id) => UUID_REGEX.test(id));
}

export async function addBannedQuizId(quizId: string) {
  if (!UUID_REGEX.test(quizId)) return;
  const existing = await getBannedQuizIds();
  const nextIds = Array.from(new Set([...existing, quizId])).slice(-25);
  const payload = nextIds.join(",");
  const signed = `${payload}.${signPayload(payload)}`;

  const cookieStore = await cookies();
  cookieStore.set(BANNED_COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
