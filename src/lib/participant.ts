import { cookies } from "next/headers";

export async function getParticipantCredentials() {
  const value = (await cookies()).get("latika_participant")?.value;
  if (!value) return null;

  const [id, token] = value.split(".");
  if (!id || !token) return null;
  return { id, token };
}
