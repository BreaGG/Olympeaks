import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { activity_id } = await req.json();

    const { data: race } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activity_id)
      .eq("user_id", user.id)
      .single();

    if (!race) return NextResponse.json({ error: "Race not found" }, { status: 404 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("ftp_watts, lthr, vdot, sport")
      .eq("id", user.id)
      .single();

    const prompt = `You are an elite endurance coach analyzing a race performance. Provide a deep tactical analysis.

RACE DATA:
- Event: ${race.title}
- Sport: ${race.sport}
- Date: ${race.date}
- Distance: ${race.distance_meters ? (race.distance_meters / 1000).toFixed(2) + " km" : "unknown"}
- Time: ${race.duration_seconds ? formatDuration(race.duration_seconds) : "unknown"}
- Avg pace: ${race.avg_pace_sec_km ? formatPace(race.avg_pace_sec_km) + "/km" : "unknown"}
- Avg HR: ${race.avg_heart_rate ?? "unknown"} bpm (LTHR: ${profile?.lthr ?? "unknown"})
- Max HR: ${race.max_heart_rate ?? "unknown"} bpm
- Avg power: ${race.avg_power_watts ?? "unknown"} W (FTP: ${profile?.ftp_watts ?? "unknown"})
- TSS: ${race.tss ?? "unknown"}
- Elevation: ${race.elevation_gain ?? 0} m
- Athlete feel score: ${race.feel_score ?? "unknown"}/10
- Notes: ${race.notes ?? "none"}

Provide:
1. **Performance rating** (vs expected based on fitness markers)
2. **Pacing analysis** (based on avg HR vs LTHR / power vs FTP)
3. **Execution assessment** (positive tactics and tactical errors)
4. **Key performance limiters** (what held back the result)
5. **Next steps** (2-3 specific training adaptations based on this race)

Be honest, precise and data-driven.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    const analysis = data.choices[0].message.content;

    await supabase.from("race_analyses").insert({
      user_id: user.id,
      activity_id,
      ai_analysis: analysis,
    });

    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
}

function formatPace(secKm: number): string {
  const m = Math.floor(secKm / 60), s = Math.round(secKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}