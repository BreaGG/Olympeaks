// PATH: app/auth/callback/route.ts
// Google OAuth callback — handles the code exchange after Supabase redirects here.
// IMPORTANT: This file must be at app/auth/callback/route.ts and committed to Git.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");

  // If Supabase sent back an error (e.g. user cancelled)
  if (error) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
    return NextResponse.redirect(`${base}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Always redirect to the production URL, never localhost
      const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
      return NextResponse.redirect(`${base}${next}`);
    }

    console.error("OAuth exchange error:", exchangeError.message);
  }

  // Fallback — something went wrong
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  return NextResponse.redirect(`${base}/login?error=auth_failed`);
}