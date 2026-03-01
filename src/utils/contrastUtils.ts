/**
 * WCAG contrast utilities (Culori).
 * Used for palette viewer and dialing in fg/bg contrast.
 * @see https://culorijs.org/ (wcagContrast)
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

import { wcagContrast } from "culori";

/** WCAG 2.1 AA minimum ratio for normal text */
export const WCAG_AA_RATIO = 4.5;

/** WCAG 2.1 AA large text minimum ratio */
export const WCAG_AA_LARGE_RATIO = 3;

/**
 * Get WCAG 2.1 contrast ratio between two colors.
 * Accepts any CSS color string (e.g. from getComputedStyle).
 * Returns ratio 1–21 (or 0 if parsing fails).
 */
export function getWcagContrastRatio(foreground: string, background: string): number {
  try {
    const ratio = wcagContrast(foreground, background);
    return Number.isFinite(ratio) ? ratio : 0;
  } catch {
    return 0;
  }
}

/**
 * Check if ratio meets WCAG 2.1 AA for normal text (≥ 4.5:1).
 */
export function meetsAa(ratio: number): boolean {
  return ratio >= WCAG_AA_RATIO;
}

export const PURE_WHITE = "oklch(1 0 0)";
export const PURE_BLACK = "oklch(0.22 0 0)";

/**
 * Text color on a given accent background that meets minRatio.
 * When preferPure is true (default): use pure white/black if they pass; else nuanced shade.
 * When preferPure is false: always return the nuanced shade (darkest light / lightest dark
 * that passes), to align text with state-modified backgrounds (hover, active) rather than
 * staying at full intensity.
 */
export function getTextOnAccentForBackground(
  bgL: number,
  bgC: number,
  bgH: number,
  family: "light" | "dark",
  minRatio: number,
  preferPure: boolean = true
): string {
  const bgStr = `oklch(${bgL} ${bgC} ${bgH})`;

  if (family === "light") {
    if (preferPure && getWcagContrastRatio(PURE_WHITE, bgStr) >= minRatio) return PURE_WHITE;
    for (let L = 0.7; L <= 1; L += 0.01) {
      const textStr = `oklch(${L} 0 0)`;
      if (getWcagContrastRatio(textStr, bgStr) >= minRatio) return textStr;
    }
    return PURE_WHITE;
  }

  if (preferPure && getWcagContrastRatio(PURE_BLACK, bgStr) >= minRatio) return PURE_BLACK;
  for (let L = 0.4; L >= 0.15; L -= 0.01) {
    const textStr = `oklch(${L} 0 0)`;
    if (getWcagContrastRatio(textStr, bgStr) >= minRatio) return textStr;
  }
  return PURE_BLACK;
}
