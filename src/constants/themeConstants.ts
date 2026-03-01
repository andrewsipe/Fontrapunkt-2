/* FROZEN – no edits until FP2 is complete. Tokens stay loaded. */

/**
 * THEME SYSTEM CONSTANTS
 * Single source of truth for all theme-related constants
 */

/**
 * Accent color presets: "Sturdy" OKLCH palette for readability in light and dark.
 * Used by AccentPresetGrid.
 */
export const ACCENT_PRESETS = [
  { name: "Coral", hue: 25, chroma: 0.24, lightness: 0.55 },
  { name: "Vermillion", hue: 39, chroma: 0.24, lightness: 0.62 }, // Last color before the gap
  // --- GAP (46° to 134°) ---
  { name: "Lime", hue: 135, chroma: 0.26, lightness: 0.64 }, // First color after the gap
  { name: "Emerald", hue: 160, chroma: 0.22, lightness: 0.62 },
  { name: "Teal", hue: 195, chroma: 0.22, lightness: 0.62 }, // Dropped C slightly for Teal gamut
  { name: "Cyan", hue: 215, chroma: 0.22, lightness: 0.6 },
  { name: "Sky", hue: 230, chroma: 0.26, lightness: 0.63 },
  { name: "Blue", hue: 240, chroma: 0.24, lightness: 0.55 }, // Your EXACT Default Anchor
  { name: "Sapphire", hue: 265, chroma: 0.21, lightness: 0.59 },
  { name: "Violet", hue: 280, chroma: 0.2, lightness: 0.61 },
  { name: "Grape", hue: 310, chroma: 0.2, lightness: 0.53 },
  { name: "Magenta", hue: 330, chroma: 0.22, lightness: 0.55 },
  { name: "Rose", hue: 355, chroma: 0.24, lightness: 0.58 },
] as const;

/**
 * Tone system constants (cool/warm neutrals).
 * useTheme maps intensity to chroma in [MIN_CHROMA, MAX_CHROMA].
 * The neutral palette (tokens.palettes.css) applies a sine curve per step so
 * chroma peaks in the middle of the lightness scale; --base-chroma-* is that peak.
 */
export const TONE_SYSTEM = {
  /** Cool hue (Slate/Zinc): steely blue around 260-265° */
  COOL_HUE: 270,

  /** Warm hue (Stone): yellow-ish around 60-70° (NOT orange 30-40) */
  WARM_HUE: 65,

  /** Min chroma when toned (avoids muddy near-neutral; intensity maps [MIN, MAX]) */
  MIN_CHROMA: 0.006,

  /** Max chroma for toned neutrals (Tailwind peaks around 0.02-0.03) */
  MAX_CHROMA: 0.125,

  /** Threshold below which tone is considered neutral (0 chroma) */
  NEUTRAL_THRESHOLD: 0,
} as const;

/**
 * Base chroma multipliers for light/dark modes
 * Dark mode gets slightly less chroma for "clean" look
 */
export const BASE_CHROMA_MULTIPLIERS = {
  LIGHT: 1.0,
  DARK: 0.8,
} as const;

/**
 * Default canvas colors (bespoke off-white / rich black; aligned with --canvas-bg-light/dark and --bg-canvas)
 */
export const DEFAULT_CANVAS_COLORS = {
  LIGHT: {
    background: { l: 0.985, c: 0, h: 0 },
    foreground: { l: 0.2, c: 0, h: 0 },
  },
  DARK: {
    background: { l: 0.13, c: 0, h: 0 },
    foreground: { l: 0.95, c: 0, h: 0 },
  },
} as const;

/**
 * Text-on-accent lightness threshold
 * Below 0.55: use white text
 * Above 0.55: use dark text
 */
export const TEXT_ON_ACCENT_THRESHOLD = 0.55;

/**
 * Accent derivation: stored accent is canonical (light-mode reference).
 * getAccentForMode(hue, chroma, lightness, mode) in oklchColorUtils produces
 * balanced light/dark values so the same hue feels consistent in both themes.
 * Dark mode: tone down chroma (dark surround makes colors look more saturated)
 * and nudge up lightness so the accent doesn’t disappear.
 */
export const ACCENT_DERIVATION = {
  /** Hue range [min, max] for yellow/amber/lime — need extra chroma in light to avoid muddiness */
  YELLOW_HUE_RANGE: [60, 125] as [number, number],
  /** Light: strong chroma boost for yellow so it reads clear yellow, not muddy orange-brown */
  LIGHT_YELLOW_CHROMA_BOOST: 1.7,
  /** Light: when canonical lightness > this, drop yellow lightness more for punch (avoids washed-out) */
  LIGHT_YELLOW_HIGH_L_THRESHOLD: 0.7,
  /** Light: extra lightness drop for high-L yellow (e.g. preset Yellow 0.795 → ~0.72) */
  LIGHT_YELLOW_HIGH_L_DROP: 0.06,
  /** Light: default lightness nudge for punch (subtract from canonical) */
  LIGHT_LIGHTNESS_NUDGE: 0.02,
  /** Dark: scale chroma down so same hue doesn’t oversaturate on dark background */
  DARK_CHROMA_SCALE: 0.88,
  /** Dark: yellow range keeps a bit more chroma so it doesn’t go flat */
  DARK_YELLOW_CHROMA_SCALE: 0.94,
  /** Dark: lift lightness so accent stays visible on dark bg */
  DARK_LIGHTNESS_LIFT: 0.06,
  /** Clamp chroma to OKLCH-safe range */
  CHROMA_MAX: 0.4,
  /** Clamp lightness to [0, 1] */
  LIGHTNESS_MIN: 0.15,
  LIGHTNESS_MAX: 0.92,
} as const;

/**
 * WCAG contrast ratio thresholds
 */
export const CONTRAST_RATIOS = {
  /** AAA standard for normal text */
  AAA: 7,

  /** AA standard for normal text */
  AA: 4.5,

  /** AA standard for large text (18pt+ or 14pt+ bold) */
  AA_LARGE: 3,
} as const;

/**
 * Accent lightness guardrail: clamp so accent stays readable in each mode.
 * Light mode: L capped at max so accent doesn’t wash out.
 * Dark mode: L floored at min so accent stays visible.
 */
export const ACCENT_LIGHTNESS_GUARDRAIL = {
  /** Light theme: max lightness (cap) */
  LIGHT_MAX: 0.72,
  /** Dark theme: min lightness (floor) */
  DARK_MIN: 0.55,
} as const;

/**
 * Semantic color hues (fixed, not accent-derived)
 */
export const SEMANTIC_HUES = {
  SUCCESS: 140,
  INFO: 240,
  WARNING: 85, // Amber (clear yellow/amber)
  DANGER: 25,
} as const;
