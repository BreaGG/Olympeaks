import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const today = new Date().toISOString().split("T")[0];

    // Upsert — one entry per user per day
    const { data, error } = await supabase
      .from("daily_metrics")
      .upsert({
        user_id: user.id,
        date: today,
        sleep_hours: body.sleep_hours ?? null,
        sleep_quality: body.sleep_quality ?? null,
        hrv_ms: body.hrv_ms ?? null,
        resting_hr: body.resting_hr ?? null,
        fatigue: body.fatigue ?? null,
        motivation: body.motivation ?? null,
        mood: body.mood ?? null,
        weight_kg: body.weight_kg ?? null,
        notes: body.notes ?? null,
      }, { onConflict: "user_id,date" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}