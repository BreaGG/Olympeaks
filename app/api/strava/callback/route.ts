// PATH: app/api/strava/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!user) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    console.error("[strava/callback] denied or missing code:", error);
    return NextResponse.redirect(new URL("/?strava=denied", appUrl));
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("[strava/callback] token exchange failed:", body);
    return NextResponse.redirect(new URL("/?strava=error", appUrl));
  }

  const tokens = await tokenRes.json();
  console.log("[strava/callback] token exchange OK, athlete:", tokens.athlete?.id);

  // Update tokens in profiles
  const { error: dbError } = await supabase.from("profiles").update({
    strava_access_token:     tokens.access_token,
    strava_refresh_token:    tokens.refresh_token,
    strava_token_expires_at: tokens.expires_at,
    strava_athlete_id:       String(tokens.athlete?.id ?? ""),
  }).eq("id", user.id);

  if (dbError) {
    console.error("[strava/callback] DB update failed:", dbError.message);
    // Most likely the migration SQL hasn't been run yet
    return NextResponse.redirect(new URL("/?strava=error&reason=db", appUrl));
  }

  return NextResponse.redirect(new URL("/?strava=connected", appUrl));
}