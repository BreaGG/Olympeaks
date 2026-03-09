import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");

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
          getAll() { return cookieStore.getAll(); },
          setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
        },
      }
    );
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  return NextResponse.redirect(`${base}/login?error=auth_failed`);
}
