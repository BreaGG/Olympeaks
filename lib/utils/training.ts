export function calculateCTL(activities: Array<{ date: string; tss: number | null }>, days = 42): number {
  if (!activities.length) return 0;
  let ctl = 0;
  const k = 1 - Math.exp(-1 / days);
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  
  for (const activity of sorted) {
    const tss = activity.tss || 0;
    ctl = ctl + k * (tss - ctl);
  }
  return Math.round(ctl);
}

export function calculateATL(activities: Array<{ date: string; tss: number | null }>, days = 7): number {
  if (!activities.length) return 0;
  let atl = 0;
  const k = 1 - Math.exp(-1 / days);
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  
  for (const activity of sorted) {
    const tss = activity.tss || 0;
    atl = atl + k * (tss - atl);
  }
  return Math.round(atl);
}

export function calculateTSB(ctl: number, atl: number): number {
  return ctl - atl;
}

export function getFormStatus(tsb: number): {
  label: string;
  color: string;
  description: string;
} {
  if (tsb > 25) return { label: "Fresco", color: "#22C55E", description: "Óptimo para competir" };
  if (tsb > 5) return { label: "Forma óptima", color: "#22C55E", description: "Buena forma, listo para calidad" };
  if (tsb > -10) return { label: "Entrenando", color: "#F5A623", description: "Carga normal de entrenamiento" };
  if (tsb > -25) return { label: "Cargado", color: "#F97316", description: "Carga alta, prioriza recuperación" };
  return { label: "Sobreentrenado", color: "#EF4444", description: "Reducir carga urgentemente" };
}

export function formatPace(secPerKm: number): string {
  if (!secPerKm) return "—";
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}