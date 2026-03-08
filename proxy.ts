import { NextResponse, type NextRequest } from "next/server";

// Olympeaks proxy — auth guard
// Uncomment the full version once Supabase auth is wired up.

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};