// @ts-nocheck — Untyped third-party APIs (Zustand persist); type checking disabled for this file.
/**
 * Enhanced Settings Store with Tone Intensity Control
 * Adds toneIntensity slider for adjustable warm/cool effect
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getOptimalChroma, getOptimalLightness } from "../utils/oklchColorUtils";

export interface AccentColor {
  hue: number; // 0-360°
  chroma: number; // Calculated for optimal vibrancy
  lightness: number; // Calculated for accessibility
}

interface SettingsState {
  // Display preferences
  showGrid: boolean;
  showBaseline: boolean;
  showRulers: boolean;
  highDPI: boolean;
  defaultTextDirection: "ltr" | "rtl";
  defaultText: string;
  showHiddenAxes: boolean;
  colorScheme: "system" | "light" | "dark";
  canvasTheme: "match" | "light" | "dark";
  compactMode: boolean;

  // Theme customization
  accentColor: AccentColor;
  tonePreference: number; // -1 (cool) to +1 (warm), 0 = neutral (auto-adapts to accent)

  // Performance
  animationFPS: number;
  renderQuality: "high" | "medium" | "low";

  // Export defaults
  exportFormat: "png" | "svg" | "webm";
  exportResolution: number;

  // Actions
  setShowGrid: (show: boolean) => void;
  setShowBaseline: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setHighDPI: (enabled: boolean) => void;
  setDefaultTextDirection: (direction: "ltr" | "rtl") => void;
  setDefaultText: (text: string) => void;
  setShowHiddenAxes: (show: boolean) => void;
  setColorScheme: (scheme: "system" | "light" | "dark") => void;
  setCanvasTheme: (theme: "match" | "light" | "dark") => void;
  setCompactMode: (enabled: boolean) => void;
  setAccentColor: (hue: number) => void;
  setAccentColorFull: (hue: number, chroma: number, lightness: number) => void;
  setTonePreference: (preference: number) => void; // -1 to +1
  setAnimationFPS: (fps: number) => void;
  setRenderQuality: (quality: "high" | "medium" | "low") => void;
  setExportFormat: (format: "png" | "svg" | "webm") => void;
  setExportResolution: (resolution: number) => void;
  reset: () => void;
}

const defaultSettings: Omit<
  SettingsState,
  keyof {
    setShowGrid: never;
    setShowBaseline: never;
    setShowRulers: never;
    setHighDPI: never;
    setDefaultTextDirection: never;
    setDefaultText: never;
    setShowHiddenAxes: never;
    setColorScheme: never;
    setCanvasTheme: never;
    setCompactMode: never;
    setAccentColor: never;
    setAccentColorFull: never;
    setTonePreference: never;
    setAnimationFPS: never;
    setRenderQuality: never;
    setExportFormat: never;
    setExportResolution: never;
    reset: never;
  }
> = {
  showGrid: false,
  showBaseline: false,
  showRulers: false,
  highDPI: true,
  defaultTextDirection: "ltr",
  defaultText: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  showHiddenAxes: true,
  colorScheme: "system",
  canvasTheme: "light",
  compactMode: false,
  accentColor: { hue: 240, chroma: 0.24, lightness: 0.55 }, // Ocean default for light mode
  tonePreference: 0, // 0 = neutral (auto-adapts), -1 = cool, +1 = warm
  animationFPS: 60,
  renderQuality: "high",
  exportFormat: "png",
  exportResolution: 1920,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setShowGrid: (show) => set({ showGrid: show }),
      setShowBaseline: (show) => set({ showBaseline: show }),
      setShowRulers: (show) => set({ showRulers: show }),
      setHighDPI: (enabled) => set({ highDPI: enabled }),
      setDefaultTextDirection: (direction) => set({ defaultTextDirection: direction }),
      setDefaultText: (text) => set({ defaultText: text }),
      setShowHiddenAxes: (show) => set({ showHiddenAxes: show }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setCanvasTheme: (theme) => set({ canvasTheme: theme }),
      setCompactMode: (enabled) => set({ compactMode: enabled }),

      setAccentColor: (hue) => {
        // Store canonical (light-mode reference) so useTheme’s getAccentForMode
        // can derive balanced light and dark from a single source.
        const chroma = getOptimalChroma(hue, "light");
        const lightness = getOptimalLightness(hue, "light");
        set({ accentColor: { hue, chroma, lightness } });
      },

      setAccentColorFull: (hue, chroma, lightness) => {
        set({ accentColor: { hue, chroma, lightness } });
      },

      setTonePreference: (preference) => {
        // Clamp between -1 and +1
        set({ tonePreference: Math.max(-1, Math.min(1, preference)) });
      },

      setAnimationFPS: (fps) => set({ animationFPS: Math.max(24, Math.min(120, fps)) }),
      setRenderQuality: (quality) => set({ renderQuality: quality }),
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportResolution: (resolution) => set({ exportResolution: resolution }),
      reset: () => set(defaultSettings),
    }),
    {
      name: "app-settings",
      version: 7, // Increment version for canvasTheme (two-zone theming)
      migrate: (persistedState: any, version: number) => {
        if (persistedState == null || typeof persistedState !== "object") {
          return persistedState;
        }
        const migrated: any = { ...persistedState };

        if (version < 2) {
          if (migrated.colorScheme === "auto") {
            migrated.colorScheme = "system";
          }
          if (!migrated.accentColor) {
            migrated.accentColor = { hue: 25, chroma: 0.22, lightness: 0.5 };
          }
          if (!migrated.toneMode) {
            migrated.toneMode = "auto";
          }
        }

        if (version < 3) {
          // Add toneIntensity for version 3
          if (migrated.toneIntensity === undefined) {
            migrated.toneIntensity = 0.4;
          }
          // Boost default accent chroma slightly
          if (migrated.accentColor && migrated.accentColor.chroma < 0.24) {
            migrated.accentColor.chroma = 0.24;
          }
        }

        if (version < 4) {
          // Convert toneMode + toneIntensity to tonePreference
          if (migrated.tonePreference === undefined) {
            let preference = 0; // Default to neutral

            if (migrated.toneMode === "cool") {
              preference = -1 * (migrated.toneIntensity || 0.4);
            } else if (migrated.toneMode === "warm") {
              preference = migrated.toneIntensity || 0.4;
            } else if (migrated.toneMode === "neutral") {
              preference = 0;
            } else {
              // 'auto' becomes 0 (neutral, auto-adapts)
              preference = 0;
            }

            migrated.tonePreference = preference;
          }

          // Remove old fields
          delete migrated.toneMode;
          delete migrated.toneIntensity;

          // Update default accent to Ocean if still using old default
          if (migrated.accentColor && migrated.accentColor.hue === 25) {
            migrated.accentColor.hue = 240; // Ocean
          }
        }

        if (version < 5) {
          // Add defaultText if not present
          if (migrated.defaultText === undefined) {
            migrated.defaultText =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
          }
        }

        if (version < 6) {
          // Add compactMode if not present
          if (migrated.compactMode === undefined) {
            migrated.compactMode = false;
          }
        }

        if (version < 7) {
          // Add canvasTheme for two-zone (app vs canvas) theming
          if (migrated.canvasTheme === undefined) {
            migrated.canvasTheme = "light";
          }
        }

        return migrated;
      },
    }
  )
);
