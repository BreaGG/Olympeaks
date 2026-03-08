// lib/openai/prompts.ts

export const SYSTEM_COACH = `Eres un entrenador de deportes de resistencia de élite con 20 años de experiencia. 
Conoces en profundidad el modelo de carga CTL/ATL/TSB, la periodización del entrenamiento, 
la fisiología del rendimiento en running, ciclismo, natación y triatlón.

Tu comunicación es directa, concisa y basada en datos. No uses lenguaje genérico.
Habla como un coach real: claro, específico, sin rodeos.
Siempre justifica tus recomendaciones con los datos proporcionados.
Usa términos técnicos apropiados (Z2, HRV, TSS, CTL, etc.) pero explícalos brevemente cuando sea necesario.
Responde SIEMPRE en español.`;

export const SYSTEM_FUELING = `Eres un nutricionista deportivo especializado en deportes de resistencia.
Conoces en profundidad la nutrición para running, ciclismo, natación y triatlón.
Calculas planes de nutrición precisos basados en ciencia actualizada.
Usa los últimos estudios sobre ingesta de carbohidratos múltiples transportadores (glucosa+fructosa).
Responde SIEMPRE en español. Sé preciso con los gramos y tiempos.`;

export const SYSTEM_ANALYSIS = `Eres un analista de rendimiento deportivo especializado en atletas de resistencia.
Analizas datos de entrenamiento para identificar tendencias, puntos de mejora y riesgos de sobreentrenamiento.
Explicas los datos de forma clara y accionable, no solo descriptiva.
Siempre conecta los datos con recomendaciones prácticas.
Responde SIEMPRE en español.`;

export const SYSTEM_RACE = `Eres un analista táctico de competiciones de resistencia.
Analizas pacing, distribución del esfuerzo, errores estratégicos y pérdidas de rendimiento en carrera.
Eres directo y honesto sobre los errores, pero constructivo en las recomendaciones.
Responde SIEMPRE en español. Usa datos específicos (ritmos, km, porcentajes).`;

// ─────────────────────────────────────────────────────────────────────────────

// app/api/ai/coach/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const input = await req.json();

    // Fetch recent activities for context
    const { data: activities } = await supabase
      .from("activities")
      .select("title, sport, date, duration_seconds, tss, feel_score")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    // Fetch profile for athlete context
    const { data: profile } = await supabase
      .from("profiles")
      .select("sport, weight_kg, ftp_watts, lthr, vdot")
      .eq("id", user.id)
      .single();

    const recentLoad = activities?.reduce((sum, a) => sum + (a.tss || 0), 0) || 0;

    const prompt = `
ESTADO DEL ATLETA HOY:
- Sueño: ${input.sleep_hours}h (calidad: ${input.sleep_quality}/10)
- HRV matutino: ${input.hrv_ms} ms
- FC en reposo: ${input.resting_hr} ppm
- Fatiga percibida: ${input.fatigue}/10
- Motivación: ${input.motivation}/10
- Tiempo disponible: ${input.available_minutes} minutos
- Temperatura exterior: ${input.temperature || "desconocida"}°C
- Notas del atleta: ${input.notes || "ninguna"}

CONTEXTO DEL ATLETA:
- Deporte principal: ${profile?.sport || "triatlón"}
- Peso: ${profile?.weight_kg} kg
- FTP: ${profile?.ftp_watts || "no definido"} W
- LTHR: ${profile?.lthr || "no definido"} ppm

CARGA RECIENTE (últimas 2 semanas):
${activities?.map(a => `- ${a.date}: ${a.title} (${a.sport}) - TSS: ${a.tss || "N/A"} - Sensación: ${a.feel_score || "N/A"}/10`).join("\n") || "Sin actividades registradas"}
TSS total últimas 2 semanas: ${recentLoad}

Genera una recomendación de entrenamiento para HOY. Incluye:
1. Evaluación del estado de recuperación (2-3 frases)
2. La sesión exacta recomendada con duración, intensidad y estructura
3. Justificación basada en los datos
4. Precauciones si las hay

Sé específico. Si no conviene entrenar, dilo claramente.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_COACH },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const recommendation = completion.choices[0].message.content;

    // Save recommendation
    await supabase.from("ai_recommendations").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      type: "daily_coach",
      input_data: input,
      recommendation,
    });

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ error: "Error generating recommendation" }, { status: 500 });
  }
}