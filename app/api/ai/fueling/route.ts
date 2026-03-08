import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { duration, intensity, weight, temp, sport = "cycling" } = body;

    const prompt = `You are a sports nutritionist specializing in endurance performance. Create a precise fueling plan.

WORKOUT PARAMETERS:
- Duration: ${duration} min
- Intensity: ${intensity}
- Sport: ${sport}
- Athlete weight: ${weight} kg
- Temperature: ${temp}°C

Respond ONLY with valid JSON matching this exact structure (no markdown, no explanation):
{
  "carbs_per_hour": <number>,
  "fluid_per_hour_ml": <number>,
  "sodium_per_hour_mg": <number>,
  "schedule": [
    { "minute": <number>, "action": "<string>", "type": "<gel|fluid|bar|chews>" }
  ],
  "ai_notes": "<2-3 sentence summary with key nutrition insights>"
}

Rules:
- carbs: easy=40-55g/h, moderate=60-75g/h, hard=75-90g/h, race=90-120g/h
- fluid: base 400-600ml/h, add 100ml per 5°C above 20°C
- sodium: 500-600mg/h normal, 700-900mg/h if >28°C
- schedule entries: every 15-25 min, starting at minute 20-30
- alternate between gels, fluids, bars
- be specific about product amounts`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    const raw = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(raw);

    // Save plan
    await supabase.from("nutrition_plans").insert({
      user_id: user.id,
      workout_type: sport,
      duration_minutes: duration,
      intensity,
      temperature_celsius: temp,
      carbs_per_hour: plan.carbs_per_hour,
      fluid_per_hour_ml: plan.fluid_per_hour_ml,
      sodium_per_hour_mg: plan.sodium_per_hour_mg,
      schedule: plan.schedule,
      ai_notes: plan.ai_notes,
    });

    return NextResponse.json(plan);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}