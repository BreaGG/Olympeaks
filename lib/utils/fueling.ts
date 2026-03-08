interface FuelingParams {
  duration_minutes: number;
  intensity: "easy" | "moderate" | "hard" | "race";
  weight_kg: number;
  temperature_celsius: number;
}

export function calculateBaseFueling(params: FuelingParams) {
  const { duration_minutes, intensity, weight_kg, temperature_celsius } = params;

  const carbsMap = { easy: 50, moderate: 68, hard: 83, race: 105 };
  const carbs_per_hour = carbsMap[intensity];

  const baseFluid = 500;
  const heatBonus = Math.max(0, (temperature_celsius - 20) / 10) * 150;
  const fluid_per_hour_ml = Math.round(baseFluid + heatBonus);

  const sodium_per_hour_mg = temperature_celsius > 25 ? 800 : 600;

  return { carbs_per_hour, fluid_per_hour_ml, sodium_per_hour_mg };
}
