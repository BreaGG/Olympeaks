// PATH: app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const goalText = ctx.goal
    ? `Goal Race: ${ctx.goal.name} (${ctx.goal.distance}) on ${ctx.goal.date}${ctx.goal.target ? `, target time ${ctx.goal.target}` : ""}. ${ctx.goal.daysLeft} days out.`
    : "No specific goal race set.";

  const systemPrompt = `You are an elite endurance coach AI with expertise in periodisation, TrainingPeaks methodology, and CTL/ATL/TSB modelling. Generate a detailed, professional training plan.

Format the plan as:
- A brief assessment of the athlete's current fitness
- Weekly structure overview
- Each week as: **Week N — [Phase name]** followed by 7 days with specific sessions
- Each day: day name, session type, duration/distance, intensity zone, key workout details
- A brief taper/race-week section at the end
- Recovery and nutrition notes

Use precise training terminology. Include TSS estimates per session. Be specific about paces/zones.`;

  const userPrompt = `Athlete profile:
- Sport: ${ctx.sport}
- CTL (fitness): ${ctx.ctl} pts
- ATL (fatigue): ${ctx.atl} pts  
- TSB (form): ${ctx.tsb} pts
- FTP: ${ctx.ftp ? ctx.ftp + " W" : "unknown"}
- LTHR: ${ctx.lthr ? ctx.lthr + " bpm" : "unknown"}
- VDOT: ${ctx.vdot ?? "unknown"}
- Recent session TSS: ${ctx.recentTSS.join(", ")} (last 4 sessions)

${goalText}

Plan parameters:
- Duration: ${ctx.weeks} weeks
- Focus phase: ${ctx.focus === "auto" ? "automatically determined based on time to goal" : ctx.focus}

Generate a complete ${ctx.weeks}-week training plan. Be very specific — exact sessions, paces, durations, and TSS targets per week. Structure it for progressive overload with recovery weeks every 3-4 weeks.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return NextResponse.json({ plan: response.choices[0].message.content });
}