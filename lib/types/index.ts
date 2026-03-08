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
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  sport: Sport;
  type: string | null;
  date: string;
  duration_seconds: number | null;
  distance_meters: number | null;
  elevation_gain: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_pace_sec_km: number | null;
  avg_power_watts: number | null;
  normalized_power: number | null;
  tss: number | null;
  calories: number | null;
  feel_score: number | null;
  notes: string | null;
  created_at: string;
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