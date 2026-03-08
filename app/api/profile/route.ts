// PATH: app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Only update columns that actually exist in the profiles table
  // (no updated_at — not in schema)
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name:  body.full_name  ?? null,
      sport:      body.sport      ?? "running",
      weight_kg:  body.weight_kg  ?? null,
      height_cm:  body.height_cm  ?? null,
      birth_date: body.birth_date || null,
      ftp_watts:  body.ftp_watts  ?? null,
      lthr:       body.lthr       ?? null,
      vdot:       body.vdot       ?? null,
      timezone:   body.timezone   ?? "UTC",
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[profile PATCH]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}