import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

const PUBLIC_SESSIONLESS_PREFIXES = [
  "/join",
  "/play/",
  "/privacy",
  "/api/rooms/",
  "/api/cron/",
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    PUBLIC_SESSIONLESS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next({ request });
  }

  const allCookies = request.cookies.getAll();
  const hasSupabaseCookie = allCookies.some((cookie) =>
    cookie.name.startsWith("sb-"),
  );
  if (!hasSupabaseCookie) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getPublicSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes expired/expiring access tokens and syncs Set-Cookie headers in <1ms
  // when still valid. Cryptographic verification (getClaims) is performed in
  // getCurrentAuth() before trusting any user identity on the server.
  await supabase.auth.getSession();
  return response;
}
