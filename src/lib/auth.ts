import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getCurrentAuth = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return { userId: null, email: null };
  }

  return {
    userId: data.claims.sub,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
  };
});

export async function getCurrentUserId() {
  const { userId } = await getCurrentAuth();
  return userId;
}
