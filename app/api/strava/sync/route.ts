// PATH: app/api/strava/sync/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getValidToken(profile: Record<string, string | number>): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (profile.strava_token_expires_at && Number(profile.strava_token_expires_at) > now + 60) {
    return profile.strava_access_token as string;
  }
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: profile.strava_refresh_token,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

function mapSport(t: string): string {
  const s = t.toLowerCase();
  if (s.includes("run")) return "running";
  if (s.includes("ride") || s.includes("cycling") || s.includes("virtual")) return "cycling";
  if (s.includes("swim")) return "swimming";
  if (s.includes("weight") || s.includes("crossfit") || s.includes("workout") || s.includes("strength")) return "strength";
  if (s.includes("triathlon")) return "triathlon";
  return "running";
}

function mapType(workoutType: number | null, sport: string): string {
  if (sport === "running") {
    if (workoutType === 1) return "race";
    if (workoutType === 2) return "long";
    if (workoutType === 3) return "hard";
  }
  if (sport === "cycling") {
    if (workoutType === 11) return "race";
    if (workoutType === 12) return "hard";
  }
  return "easy";
}

function estimateTSS(movingTimeSec: number, type: string): number {
  const mins = movingTimeSec / 60;
  const i: Record<string, number> = { race: 1.0, hard: 0.85, long: 0.75, moderate: 0.70, easy: 0.55 };
  return Math.round(mins * (i[type] ?? 0.65));
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date_local: string;
  moving_time: number;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  elev_low?: number;
  elev_high?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  max_watts?: number;
  average_speed?: number;
  max_speed?: number;
  average_cadence?: number;
  kilojoules?: number;
  suffer_score?: number;
  workout_type?: number;
  description?: string;
  calories?: number;
  achievement_count?: number;
  pr_count?: number;
  kudos_count?: number;
  device_name?: string;
  gear?: { name?: string };
  splits_metric?: Array<{
    distance: number;
    elapsed_time: number;
    moving_time: number;
    split: number;
    average_speed: number;
    average_heartrate?: number;
    average_grade_adjusted_speed?: number;
    pace_zone?: number;
  }>;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("strava_access_token, strava_refresh_token, strava_token_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile?.strava_access_token)
    return NextResponse.json({ error: "Strava not connected" }, { status: 400 });

  const token = await getValidToken(profile as Record<string, string | number>);
  if (!token)
    return NextResponse.json({ error: "Could not refresh Strava token" }, { status: 401 });

  const { days = 30 } = await req.json().catch(() => ({}));
  const after = Math.floor((Date.now() - days * 86400000) / 1000);

  // Fetch activity list
  let page = 1;
  const allActivities: StravaActivity[] = [];
  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) break;
    const batch: StravaActivity[] = await res.json();
    if (!batch.length) break;
    allActivities.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  if (!allActivities.length)
    return NextResponse.json({ imported: 0, message: "No activities found in this period" });

  // Get existing strava_ids
  const { data: existing } = await supabase
    .from("activities").select("strava_id").eq("user_id", user.id).not("strava_id", "is", null);
  const existingIds = new Set((existing ?? []).map((r: { strava_id: string }) => r.strava_id));

  const newOnes = allActivities.filter(a => !existingIds.has(String(a.id)));
  if (!newOnes.length)
    return NextResponse.json({ imported: 0, message: "All activities already synced" });

  // Fetch detailed data for each new activity (includes splits, gear, device)
  const detailed: StravaActivity[] = await Promise.all(
    newOnes.map(async a => {
      try {
        const r = await fetch(`https://www.strava.com/api/v3/activities/${a.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return r.ok ? await r.json() : a;
      } catch { return a; }
    })
  );

  const toInsert = detailed.map(a => {
    const sport = mapSport(a.sport_type || a.type);
    const type  = mapType(a.workout_type ?? null, sport);
    const avgPaceSec = a.distance && a.moving_time
      ? Math.round(a.moving_time / (a.distance / 1000)) : null;
    const np = a.weighted_average_watts ?? null;
    const ap = a.average_watts ?? null;
    const vi = np && ap && ap > 0 ? Math.round((np / ap) * 100) / 100 : null;

    return {
      user_id:            user.id,
      strava_id:          String(a.id),
      source:             "strava",
      title:              a.name,
      sport,
      type,
      date:               a.start_date_local.split("T")[0],

      // Time
      duration_seconds:   a.moving_time ?? null,
      elapsed_seconds:    a.elapsed_time ?? null,

      // Distance & Geo
      distance_meters:    a.distance ? Math.round(a.distance) : null,
      elevation_gain:     a.total_elevation_gain ? Math.round(a.total_elevation_gain) : null,
      elevation_loss:     null,
      max_elevation:      a.elev_high ? Math.round(a.elev_high) : null,

      // HR
      avg_heart_rate:     a.average_heartrate ? Math.round(a.average_heartrate) : null,
      max_heart_rate:     a.max_heartrate     ? Math.round(a.max_heartrate)     : null,

      // Pace / Speed
      avg_pace_sec_km:    avgPaceSec,
      max_speed_ms:       a.max_speed ?? null,

      // Power
      avg_power_watts:    ap ? Math.round(ap) : null,
      normalized_power:   np ? Math.round(np) : null,
      max_power_watts:    a.max_watts ?? null,
      variability_index:  vi,

      // Load
      tss:                a.suffer_score ? Math.round(a.suffer_score) : estimateTSS(a.moving_time, type),
      suffer_score:       a.suffer_score ?? null,
      calories:           a.calories ? Math.round(a.calories) : null,
      kilojoules:         a.kilojoules ? Math.round(a.kilojoules) : null,

      // Cadence
      average_cadence:    a.average_cadence ? Math.round(a.average_cadence) : null,

      // Social / achievements
      achievement_count:  a.achievement_count ?? null,
      pr_count:           a.pr_count ?? null,
      kudos_count:        a.kudos_count ?? null,

      // Gear & device
      device_name:        a.device_name ?? null,
      gear_name:          a.gear?.name ?? null,

      // Splits (stored as JSON)
      splits_metric:      a.splits_metric ?? null,

      notes:              a.description ?? null,
    };
  });

  const { error } = await supabase.from("activities").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    imported: toInsert.length,
    total_found: allActivities.length,
    message: `Imported ${toInsert.length} new activities from Strava`,
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("strava_access_token, strava_athlete_id").eq("id", user.id).single();

  return NextResponse.json({
    connected: !!profile?.strava_access_token,
    athlete_id: profile?.strava_athlete_id ?? null,
  });
}