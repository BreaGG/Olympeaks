// PATH: app/api/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── Parse GPX file ───────────────────────────────────────────────────────────
function parseGPX(xml: string) {
  const get = (tag: string) => {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
    return m?.[1]?.trim() ?? null;
  };
  const getAttr = (tag: string, attr: string) => {
    const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`));
    return m?.[1] ?? null;
  };

  const name = get("name") ?? "Imported Activity";

  // Get all trackpoints
  const trkptMatches = [...xml.matchAll(/<trkpt\s[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g)];

  let totalDist = 0;
  let prevLat: number | null = null, prevLon: number | null = null;
  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let minEle: number | null = null, maxEle: number | null = null;
  let totalEleGain = 0;
  let prevEle: number | null = null;
  const hrs: number[] = [];

  for (const m of trkptMatches) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const inner = m[3];

    // Time
    const timeMatch = inner.match(/<time>([^<]+)<\/time>/);
    const t = timeMatch ? new Date(timeMatch[1]) : null;
    if (t) {
      if (!startTime) startTime = t;
      endTime = t;
    }

    // Elevation
    const eleMatch = inner.match(/<ele>([^<]+)<\/ele>/);
    if (eleMatch) {
      const ele = parseFloat(eleMatch[1]);
      if (prevEle !== null && ele > prevEle) totalEleGain += ele - prevEle;
      prevEle = ele;
      if (minEle === null || ele < minEle) minEle = ele;
      if (maxEle === null || ele > maxEle) maxEle = ele;
    }

    // HR from extensions
    const hrMatch = inner.match(/<gpxtpx:hr>(\d+)<\/gpxtpx:hr>|<hr>(\d+)<\/hr>/);
    if (hrMatch) hrs.push(parseInt(hrMatch[1] ?? hrMatch[2]));

    // Distance
    if (prevLat !== null && prevLon !== null) {
      totalDist += haversine(prevLat, prevLon, lat, lon);
    }
    prevLat = lat; prevLon = lon;
  }

  const durationSec = startTime && endTime
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
    : null;

  const avgHr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null;
  const maxHr = hrs.length ? Math.max(...hrs) : null;

  // Guess sport from type attribute
  const typeMatch = xml.match(/<type>([^<]+)<\/type>/);
  const sport = guessGPXSport(typeMatch?.[1] ?? "");

  const dateStr = startTime
    ? startTime.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    title: name,
    sport,
    type: "easy",
    date: dateStr,
    duration_seconds: durationSec,
    distance_meters: Math.round(totalDist),
    elevation_gain: Math.round(totalEleGain),
    avg_heart_rate: avgHr,
    max_heart_rate: maxHr,
    avg_pace_sec_km: totalDist > 0 && durationSec
      ? Math.round(durationSec / (totalDist / 1000))
      : null,
    tss: durationSec ? estimateTSS(durationSec / 60, "easy") : null,
    source: "gpx",
  };
}

// ─── Parse TCX (Garmin's native format) ──────────────────────────────────────
function parseTCX(xml: string) {
  const get = (tag: string) => {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
    return m?.[1]?.trim() ?? null;
  };

  const name = get("Name") ?? "Garmin Activity";
  const sport = guessGPXSport(xml.match(/Sport="([^"]+)"/)?.[1] ?? "");

  // Duration from TotalTimeSeconds
  const durMatch = xml.match(/<TotalTimeSeconds>([^<]+)<\/TotalTimeSeconds>/);
  const duration_seconds = durMatch ? Math.round(parseFloat(durMatch[1])) : null;

  // Distance
  const distMatch = xml.match(/<DistanceMeters>([^<]+)<\/DistanceMeters>/g);
  const distance_meters = distMatch
    ? Math.round(parseFloat(distMatch[distMatch.length - 1].replace(/<[^>]+>/g, "")))
    : null;

  // HR
  const hrMatches = [...xml.matchAll(/<Value>(\d+)<\/Value>/g)].map(m => parseInt(m[1]));
  const avgHr = hrMatches.length ? Math.round(hrMatches.reduce((a, b) => a + b, 0) / hrMatches.length) : null;
  const maxHr = hrMatches.length ? Math.max(...hrMatches) : null;

  // Calories
  const calMatch = xml.match(/<Calories>(\d+)<\/Calories>/);
  const calories = calMatch ? parseInt(calMatch[1]) : null;

  // Elevation gain
  let totalEle = 0;
  const eleVals = [...xml.matchAll(/<AltitudeMeters>([^<]+)<\/AltitudeMeters>/g)].map(m => parseFloat(m[1]));
  for (let i = 1; i < eleVals.length; i++) {
    if (eleVals[i] > eleVals[i - 1]) totalEle += eleVals[i] - eleVals[i - 1];
  }

  // Date
  const idMatch = xml.match(/<Id>([^<]+)<\/Id>/);
  const dateStr = idMatch ? idMatch[1].split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    title: name,
    sport,
    type: "easy",
    date: dateStr,
    duration_seconds,
    distance_meters,
    elevation_gain: Math.round(totalEle),
    avg_heart_rate: avgHr,
    max_heart_rate: maxHr,
    calories,
    avg_pace_sec_km: distance_meters && duration_seconds
      ? Math.round(duration_seconds / (distance_meters / 1000))
      : null,
    tss: duration_seconds ? estimateTSS(duration_seconds / 60, "easy") : null,
    source: "garmin",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function guessGPXSport(hint: string): string {
  const h = hint.toLowerCase();
  if (h.includes("run")) return "running";
  if (h.includes("bike") || h.includes("cycling") || h.includes("ride")) return "cycling";
  if (h.includes("swim")) return "swimming";
  if (h.includes("strength") || h.includes("gym")) return "strength";
  return "running";
}

function estimateTSS(mins: number, type: string): number {
  const i: Record<string, number> = { race: 1.0, hard: 0.85, long: 0.75, easy: 0.60 };
  return Math.round(mins * (i[type] ?? 0.65));
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const imported: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const text = await file.text();
      const name = file.name.toLowerCase();
      let activity: Record<string, unknown> | null = null;

      if (name.endsWith(".gpx")) {
        activity = parseGPX(text);
      } else if (name.endsWith(".tcx")) {
        activity = parseTCX(text);
      } else {
        errors.push(`${file.name}: unsupported format (use .gpx or .tcx)`);
        continue;
      }

      if (!activity) {
        errors.push(`${file.name}: could not parse file`);
        continue;
      }

      const { error } = await supabase
        .from("activities")
        .insert({ user_id: user.id, ...activity });

      if (error) {
        errors.push(`${file.name}: ${error.message}`);
      } else {
        imported.push(file.name);
      }
    } catch (e) {
      errors.push(`${file.name}: parse error`);
    }
  }

  return NextResponse.json({
    imported: imported.length,
    files_imported: imported,
    errors,
    message: `Imported ${imported.length} of ${files.length} files`,
  });
}