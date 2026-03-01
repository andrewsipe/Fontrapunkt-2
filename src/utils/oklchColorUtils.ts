/**
 * OKLCH Color Utilities
 * Leverages OKLCH's perceptual uniformity for dynamic accent-driven theming
 */

import { ACCENT_DERIVATION } from "../constants/themeConstants";

/**
 * Returns chroma and lightness for a given mode so the same hue feels balanced in both themes.
 * Stored accent is treated as canonical (light-mode reference). Light mode may get a small
 * yellow-range chroma boost; dark mode gets reduced chroma (dark surround increases perceived
 * saturation) and lifted lightness so the accent doesn’t disappear.
 */
export function getAccentForMode(
  hue: number,
  chroma: number,
  lightness: number,
  mode: "light" | "dark"
): { chroma: number; lightness: number } {
  const h = ((hue % 360) + 360) % 360;
  const [yellowMin, yellowMax] = ACCENT_DERIVATION.YELLOW_HUE_RANGE;
  const isYellow = h >= yellowMin && h <= yellowMax;

  if (mode === "light") {
    const c = chroma * (isYellow ? ACCENT_DERIVATION.LIGHT_YELLOW_CHROMA_BOOST : 1.1);
    const baseNudge = ACCENT_DERIVATION.LIGHT_LIGHTNESS_NUDGE;
    const extraYellowDrop =
      isYellow && lightness > ACCENT_DERIVATION.LIGHT_YELLOW_HIGH_L_THRESHOLD
        ? ACCENT_DERIVATION.LIGHT_YELLOW_HIGH_L_DROP
        : 0;
    const l = Math.max(
      ACCENT_DERIVATION.LIGHTNESS_MIN,
      Math.min(ACCENT_DERIVATION.LIGHTNESS_MAX, lightness - baseNudge - extraYellowDrop)
    );
    return {
      chroma: Math.min(c, ACCENT_DERIVATION.CHROMA_MAX),
      lightness: l,
    };
  }

  // Dark: tone down chroma so it doesn’t oversaturate on dark bg; lift lightness
  const darkChromaScale = isYellow
    ? ACCENT_DERIVATION.DARK_YELLOW_CHROMA_SCALE
    : ACCENT_DERIVATION.DARK_CHROMA_SCALE;
  const c = Math.min(chroma * darkChromaScale, ACCENT_DERIVATION.CHROMA_MAX);
  const l = Math.max(
    ACCENT_DERIVATION.LIGHTNESS_MIN,
    Math.min(ACCENT_DERIVATION.LIGHTNESS_MAX, lightness + ACCENT_DERIVATION.DARK_LIGHTNESS_LIFT)
  );
  return { chroma: c, lightness: l };
}

/**
 * Derives optimal tone mode from accent hue
 * Uses OKLCH hue wheel (0-360°)
 */
export function deriveToneFromHue(hue: number): "neutral" | "warm" | "cool" {
  // Normalize hue to 0-360 range
  const normalizedHue = ((hue % 360) + 360) % 360;

  // Warm hues: Reds, oranges (345-45°)
  if (normalizedHue >= 345 || normalizedHue < 45) {
    return "warm";
  }

  // Cool hues: Cyans, blues, purples (165-315°)
  if (normalizedHue >= 165 && normalizedHue < 315) {
    return "cool";
  }

  // Neutral hues: Yellows, greens, yellow-greens (45-165°)
  // These work well with both warm and cool, default to neutral
  return "neutral";
}

/**
 * Get optimal chroma for accessibility across hue range
 * OKLCH handles this well, but some hues benefit from adjustment
 */
export function getOptimalChroma(hue: number, mode: "light" | "dark"): number {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const baseChroma = mode === "light" ? 0.22 : 0.24;

  // Yellows (70-110°) can handle less chroma while staying vibrant
  if (normalizedHue >= 70 && normalizedHue <= 110) {
    return baseChroma * 0.85;
  }

  // Blues (220-260°) benefit from slightly more chroma in dark mode
  if (mode === "dark" && normalizedHue >= 220 && normalizedHue <= 260) {
    return baseChroma * 1.1;
  }

  return baseChroma;
}

/**
 * Get optimal lightness for accessibility
 */
export function getOptimalLightness(hue: number, mode: "light" | "dark"): number {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const baseLightness = mode === "light" ? 0.5 : 0.65;

  // Yellows need higher lightness to maintain vibrancy
  if (normalizedHue >= 70 && normalizedHue <= 110) {
    return mode === "light" ? 0.6 : 0.75;
  }

  // Purples can go slightly darker in light mode
  if (mode === "light" && normalizedHue >= 270 && normalizedHue <= 310) {
    return 0.48;
  }

  return baseLightness;
}
