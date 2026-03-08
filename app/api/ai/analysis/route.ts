import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const [{ data: activities }, { data: metrics }] = await Promise.all([
      supabase.from("activities")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", sixWeeksAgo.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase.from("daily_metrics")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", sixWeeksAgo.toISOString().split("T")[0])
        .order("date", { ascending: true }),
    ]);

    if (!activities?.length) {
      return NextResponse.json({ analysis: "Not enough training data to generate analysis. Log at least one week of activities." });
    }

    const totalTss = activities.reduce((s, a) => s + (a.tss ?? 0), 0);
    const totalKm = activities.reduce((s, a) => s + (a.distance_meters ?? 0) / 1000, 0);
    const avgHRV = metrics?.length
      ? (metrics.reduce((s, m) => s + (m.hrv_ms ?? 0), 0) / metrics.filter(m => m.hrv_ms).length).toFixed(0)
      : "no data";
    const sessionCount = activities.length;
    const sportBreakdown = activities.reduce((acc: Record<string, number>, a) => {
      acc[a.sport] = (acc[a.sport] ?? 0) + 1;
      return acc;
    }, {});

    const prompt = `You are an expert performance coach analyzing 6 weeks of endurance training data.

TRAINING SUMMARY (last 6 weeks):
- Sessions: ${sessionCount}
- Total volume: ${totalKm.toFixed(0)} km
- Total load: ${totalTss} TSS
- Avg weekly TSS: ${(totalTss / 6).toFixed(0)}
- Sports distribution: ${JSON.stringify(sportBreakdown)}
- Average HRV: ${avgHRV} ms

WEEK-BY-WEEK LOAD:
${buildWeeklySummary(activities)}

Provide a structured performance analysis covering:
1. **Training load trend** (is it progressive, flat, or declining?)
2. **Recovery quality** (based on HRV and session distribution)
3. **Sport balance** (if triathlon/multi-sport)
4. **3 specific recommendations** to improve performance in the next 4 weeks
5. **Risk assessment** (overtraining risk, injury risk indicators)

Use specific numbers. Be precise and actionable. No padding.`;

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
    return NextResponse.json({ analysis: data.choices[0].message.content });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

function buildWeeklySummary(activities: Array<{date: string; tss?: number | null; distance_meters?: number | null}>) {
  const weeks: Record<string, {tss: number; km: number; count: number}> = {};
  for (const a of activities) {
    const d = new Date(a.date);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const k = monday.toISOString().split("T")[0];
    if (!weeks[k]) weeks[k] = { tss: 0, km: 0, count: 0 };
    weeks[k].tss += a.tss ?? 0;
    weeks[k].km += (a.distance_meters ?? 0) / 1000;
    weeks[k].count += 1;
  }
  return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([w, v]) => `  Week of ${w}: ${v.count} sessions · ${v.km.toFixed(0)} km · ${v.tss} TSS`)
    .join("\n");
}