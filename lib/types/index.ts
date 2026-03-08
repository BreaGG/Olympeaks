// PATH: lib/types/index.ts

export type Sport = "running" | "cycling" | "swimming" | "triathlon" | "strength";
export type Intensity = "easy" | "moderate" | "hard" | "race";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  sport: Sport;
  weight_kg: number | null;
  height_cm: number | null;
  birth_date: string | null;
  ftp_watts: number | null;
  lthr: number | null;
  vdot: number | null;
  timezone: string;
  strava_athlete_id: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  strava_id: string | null;
  source: "manual" | "strava" | "gpx" | "garmin" | null;
  title: string;
  sport: Sport;
  type: string | null;
  date: string;

  // Time
  duration_seconds: number | null;
  elapsed_seconds: number | null;        // total clock time incl. stops

  // Distance & Geo
  distance_meters: number | null;
  elevation_gain: number | null;
  elevation_loss: number | null;
  max_elevation: number | null;

  // Heart Rate
  avg_heart_rate: number | null;
  max_heart_rate: number | null;

  // Pace / Speed
  avg_pace_sec_km: number | null;
  max_speed_ms: number | null;           // m/s

  // Power (cycling / running)
  avg_power_watts: number | null;
  normalized_power: number | null;
  max_power_watts: number | null;
  intensity_factor: number | null;       // IF = NP/FTP
  variability_index: number | null;      // VI = NP/avg_power

  // Training load
  tss: number | null;
  calories: number | null;
  kilojoules: number | null;             // cycling energy output

  // Subjective
  feel_score: number | null;
  notes: string | null;

  // Strava extras
  achievement_count: number | null;
  pr_count: number | null;
  kudos_count: number | null;
  suffer_score: number | null;
  average_cadence: number | null;
  device_name: string | null;
  gear_name: string | null;

  // Splits (JSON array from Strava)
  splits_metric: SplitData[] | null;

  created_at: string;
}

export interface SplitData {
  distance: number;           // meters
  elapsed_time: number;       // seconds
  moving_time: number;
  split: number;              // split number
  average_speed: number;      // m/s
  average_heartrate?: number;
  average_grade_adjusted_speed?: number;
  pace_zone?: number;
}

export interface DailyMetrics {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  hrv_ms: number | null;
  resting_hr: number | null;
  fatigue: number | null;
  muscle_soreness: number | null;
  motivation: number | null;
  mood: number | null;
  weight_kg: number | null;
  notes: string | null;
}

export interface FuelingItem {
  minute: number;
  action: string;
  carbs_g: number;
  type: "gel" | "fluid" | "bar" | "chews";
}

export interface FuelingPlan {
  carbs_per_hour: number;
  fluid_per_hour_ml: number;
  sodium_per_hour_mg: number;
  schedule: FuelingItem[];
  ai_notes: string;
}

export interface CoachInput {
  sleep_hours: number;
  sleep_quality: number;
  hrv_ms: number;
  resting_hr: number;
  fatigue: number;
  motivation: number;
  available_minutes: number;
  temperature?: number;
  notes?: string;
}

export interface TrainingMetrics {
  ctl: number;
  atl: number;
  tsb: number;
  weekly_tss: number;
}