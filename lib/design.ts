// ─── OLYMPEAKS Design System v2 ──────────────────────────────────────────────
// Greek Marble (light) · Polished Obsidian (dark)

export const T = {
  // These match CSS variables — use for inline styles
  // Light mode values (dark mode handled via data-theme="dark" in CSS)
  bg:         "var(--bg)",
  surface:    "var(--surface)",
  surfaceHi:  "var(--surface-hi)",
  border:     "var(--border)",
  borderHi:   "var(--border-hi)",

  text:       "var(--text)",
  text2:      "var(--text-2)",
  muted:      "var(--text-muted)",
  subtle:     "var(--text-subtle)",

  gold:       "var(--gold)",
  goldDim:    "var(--gold-dim)",
  terra:      "var(--terra)",
  terraDim:   "var(--terra-dim)",
  olive:      "var(--olive)",
  oliveDim:   "var(--olive-dim)",
  stone:      "var(--stone)",

  // Semantic status colors (still using CSS vars)
  green:      "var(--olive)",
  greenDim:   "var(--olive-dim)",
  red:        "var(--terra)",
  redDim:     "var(--terra-dim)",
  blue:       "var(--gold)",      // gold is the primary accent
  blueDim:    "var(--gold-dim)",

  // Fonts
  font:       "var(--font-body)",
  display:    "var(--font-display)",
  mono:       "var(--font-mono)",
} as const;

// ─── Semantic helpers ─────────────────────────────────────────────────────────

export function tssColor(tss: number): string {
  if (tss === 0) return "var(--text-subtle)";
  if (tss < 100)  return "var(--olive)";
  if (tss < 150)  return "var(--gold)";
  return "var(--terra)";
}

export function formColor(tsb: number): string {
  if (tsb > 15)  return "var(--olive)";
  if (tsb > -10) return "var(--gold)";
  if (tsb > -25) return "var(--terra)";
  return "var(--terra)";
}

export function sportColor(sport: string): string {
  switch (sport) {
    case "running":  return "var(--gold)";
    case "cycling":  return "var(--olive)";
    case "swimming": return "var(--stone)";
    default:         return "var(--terra)";
  }
}

export function sportIcon(sport: string): string {
  switch (sport) {
    case "running":  return "↗";
    case "cycling":  return "⟳";
    case "swimming": return "≈";
    default:         return "◈";
  }
}

export function getFormLabel(tsb: number) {
  if (tsb > 15)  return { label: "Peak form",    color: "var(--olive)", bg: "var(--olive-dim)", border: "var(--olive)" };
  if (tsb > -10) return { label: "Training",     color: "var(--gold)",  bg: "var(--gold-dim)",  border: "var(--gold)" };
  if (tsb > -25) return { label: "High load",    color: "var(--terra)", bg: "var(--terra-dim)", border: "var(--terra)" };
  return              { label: "Overreaching",  color: "var(--terra)", bg: "var(--terra-dim)", border: "var(--terra)" };
}