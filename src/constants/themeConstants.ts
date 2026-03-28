/**
 * THEME SYSTEM CONSTANTS
 * Simplified for fixed sienna + warm neutral palette.
 */

/**
 * Default canvas colors (bespoke off-white / rich black).
 * Single source of truth: scripts/generateCanvasCss.ts generates tokens.canvas.generated.css from this.
 */
export const DEFAULT_CANVAS_COLORS = {
  LIGHT: {
    // A soft, milky parchment that's easy on the eyes
    background: { l: 0.98, c: 0.01, h: 63.7 },
    // Deep "Dark Roast" - dark enough for 10/10 contrast,
    // but light enough to stop the "cutting" effect on the retina
    foreground: { l: 0.16, c: 0.025, h: 66 },
  },
  DARK: {
    // A rich, deep espresso. Dropping L to 0.12 removes the "grey"
    // lift and makes the background feel grounded.
    background: { l: 0.16, c: 0.025, h: 66 },
    // This is the secret: never use pure white or near-white for text.
    // L: 0.88 kills the halation/glow while maintaining perfect legibility.
    foreground: { l: 0.98, c: 0.01, h: 63.7 },
  },
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
 * Semantic color hues (fixed, for status indicators)
 */
export const SEMANTIC_HUES = {
  SUCCESS: 145,
  INFO: 240,
  WARNING: 85,
  error: 25,
} as const;
