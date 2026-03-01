/**
 * Theme utility functions
 * Manages theme preference (system/light/dark) with localStorage persistence
 */

import { DEFAULT_CANVAS_COLORS } from "../constants/themeConstants";

export type Theme = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

/**
 * Get stored theme preference from localStorage
 */
export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }
  return "system";
}

/**
 * Save theme preference to localStorage
 */
export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to save theme to localStorage:", error);
  }
}

/**
 * Get system theme preference (light or dark)
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Apply theme to the document root
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove("app--light-mode", "app--dark-mode");

  if (theme === "system") {
    // For system, apply based on prefers-color-scheme
    const systemTheme = getSystemTheme();
    if (systemTheme === "dark") {
      root.classList.add("app--dark-mode");
    } else {
      root.classList.add("app--light-mode");
    }
  } else if (theme === "light") {
    root.classList.add("app--light-mode");
  } else if (theme === "dark") {
    root.classList.add("app--dark-mode");
  }
}

/**
 * Get effective theme (resolves 'system' to actual light/dark)
 */
export function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

/** Canvas theme: match app, or explicit light/dark */
export type CanvasTheme = "match" | "light" | "dark";

/**
 * Get effective canvas theme (resolves 'match' to app theme, then light/dark)
 */
export function getEffectiveCanvasTheme(
  colorScheme: Theme,
  canvasTheme: CanvasTheme
): "light" | "dark" {
  if (canvasTheme === "match") {
    return getEffectiveTheme(colorScheme);
  }
  return canvasTheme;
}

export interface DefaultCanvasColors {
  color: { l: number; c: number; h: number };
  backgroundColor: { l: number; c: number; h: number };
}

/**
 * Default foreground and background for the canvas based on light/dark.
 * Aligns with --bg-canvas (bespoke primitives) and --text-primary in tokens.color.css.
 */
export function getDefaultCanvasColors(isDark: boolean): DefaultCanvasColors {
  const colors = isDark ? DEFAULT_CANVAS_COLORS.DARK : DEFAULT_CANVAS_COLORS.LIGHT;
  return {
    color: colors.foreground,
    backgroundColor: colors.background,
  };
}
