/**
 * Color utility functions
 * OKLCH color space conversions and manipulation
 */

import { formatHex, formatRgb, oklch } from "culori";

export interface OKLCHColor {
  l: number; // Lightness: 0-1
  c: number; // Chroma: 0-0.4 (typically)
  h: number; // Hue: 0-360
}

/**
 * Normalize hex color string (handles 3-digit, 6-digit, with/without #)
 */
function normalizeHex(hex: string): string {
  // Remove whitespace
  let normalized = hex.trim();

  // Add # if missing
  if (!normalized.startsWith("#")) {
    normalized = `#${normalized}`;
  }

  // Expand 3-digit hex to 6-digit
  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized;
}

/**
 * Validate hex color string
 */
export function isValidHex(hex: string): boolean {
  const normalized = normalizeHex(hex);
  return /^#[0-9A-Fa-f]{6}$/.test(normalized);
}

/**
 * Convert hex color to OKLCH
 */
export function hexToOklch(hex: string): OKLCHColor {
  try {
    const normalized = normalizeHex(hex);
    const oklchColor = oklch(normalized);
    if (!oklchColor) {
      throw new Error("Invalid hex color");
    }
    return {
      l: oklchColor.l ?? 0,
      c: oklchColor.c ?? 0,
      h: oklchColor.h ?? 0,
    };
  } catch (error) {
    console.warn("Failed to convert hex to OKLCH:", hex, error);
    return { l: 0, c: 0, h: 0 };
  }
}

/**
 * Convert OKLCH to hex
 */
export function oklchToHex(color: OKLCHColor): string {
  const oklchColor = {
    mode: "oklch" as const,
    l: color.l,
    c: color.c,
    h: color.h,
  };
  const hex = formatHex(oklchColor);
  return hex || "#000000";
}

/**
 * Convert OKLCH to RGB
 */
export function oklchToRgb(color: OKLCHColor): {
  r: number;
  g: number;
  b: number;
} {
  const oklchColor = {
    mode: "oklch" as const,
    l: color.l,
    c: color.c,
    h: color.h,
  };
  const rgb = formatRgb(oklchColor);
  if (!rgb || typeof rgb === "string") {
    return { r: 0, g: 0, b: 0 };
  }
  // formatRgb returns an object with r, g, b in 0-1 range
  const rgbObj = rgb as { r?: number; g?: number; b?: number };
  return {
    r: Math.round((rgbObj.r ?? 0) * 255),
    g: Math.round((rgbObj.g ?? 0) * 255),
    b: Math.round((rgbObj.b ?? 0) * 255),
  };
}

/**
 * Convert OKLCH to CSS string
 */
export function oklchToCss(color: OKLCHColor): string {
  return `oklch(${color.l * 100}% ${color.c} ${color.h})`;
}

/**
 * Clamp OKLCH values to valid ranges
 */
export function clampOklch(color: OKLCHColor): OKLCHColor {
  return {
    l: Math.max(0, Math.min(1, color.l)),
    c: Math.max(0, Math.min(0.4, color.c)),
    h: ((color.h % 360) + 360) % 360, // Normalize to 0-360
  };
}
