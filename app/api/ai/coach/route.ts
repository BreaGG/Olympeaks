import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { sleep_hours, sleep_quality, hrv_ms, resting_hr, fatigue, motivation, available_minutes, notes } = body;

    // Fetch recent activities for context
    const { data: activities } = await supabase
      .from("activities")
      .select("title, sport, date, tss, duration_seconds, distance_meters, feel_score")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, sport, ftp_watts, lthr, vdot, weight_kg")
      .eq("id", user.id)
      .single();

    const activitySummary = activities?.map(a =>
      `- ${a.date}: ${a.title} (${a.sport}) TSS=${a.tss ?? "?"} Feel=${a.feel_score ?? "?"}/10`
    ).join("\n") ?? "No recent activities.";

    const prompt = `You are an elite endurance sports coach. Analyze this athlete's current state and provide a precise, actionable training recommendation.

ATHLETE PROFILE:
- Name: ${profile?.full_name ?? "Athlete"}
- Primary sport: ${profile?.sport ?? "triathlon"}
- FTP: ${profile?.ftp_watts ?? "unknown"} W | LTHR: ${profile?.lthr ?? "unknown"} bpm | VDOT: ${profile?.vdot ?? "unknown"}
- Weight: ${profile?.weight_kg ?? "unknown"} kg

TODAY'S WELLNESS:
- Sleep: ${sleep_hours}h (quality: ${sleep_quality}/10)
- HRV: ${hrv_ms} ms | Resting HR: ${resting_hr} bpm
- Fatigue: ${fatigue}/10 | Motivation: ${motivation}/10
- Available time: ${available_minutes} min
- Notes: ${notes || "none"}

RECENT TRAINING LOAD:
${activitySummary}

Provide a specific recommendation in this format:
1. **Today's session** (exact workout with zones, duration, structure)
2. **Rationale** (why this workout fits their current state)
3. **Key metrics to watch** (HR cap, pace range, power zone)
4. **Recovery priority** (sleep, nutrition, or mobility focus)

Be precise, data-driven, and concise. Use specific numbers. No fluff.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    const recommendation = data.choices[0].message.content;

    // Save to ai_recommendations
    await supabase.from("ai_recommendations").insert({
      user_id: user.id,
      type: "coach",
      input_data: body,
      recommendation,
    });

    return NextResponse.json({ recommendation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}