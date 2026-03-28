// @ts-nocheck — Untyped third-party APIs (Zustand persist); type checking disabled for this file.
/**
 * Settings Store
 * User preferences for display, theme, performance, and export.
 * Color system simplified to fixed sienna palette (v8).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  animationFPS: 60,
  renderQuality: "high",
  exportFormat: "png",
  exportResolution: 1920,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
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
      setAnimationFPS: (fps) => set({ animationFPS: Math.max(24, Math.min(120, fps)) }),
      setRenderQuality: (quality) => set({ renderQuality: quality }),
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportResolution: (resolution) => set({ exportResolution: resolution }),
      reset: () => set(defaultSettings),
    }),
    {
      name: "app-settings",
      version: 8,
      migrate: (persistedState: any, version: number) => {
        if (persistedState == null || typeof persistedState !== "object") {
          return persistedState;
        }
        const migrated: any = { ...persistedState };

        if (version < 2) {
          if (migrated.colorScheme === "auto") {
            migrated.colorScheme = "system";
          }
        }

        if (version < 5) {
          if (migrated.defaultText === undefined) {
            migrated.defaultText =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
          }
        }

        if (version < 6) {
          if (migrated.compactMode === undefined) {
            migrated.compactMode = false;
          }
        }

        if (version < 7) {
          if (migrated.canvasTheme === undefined) {
            migrated.canvasTheme = "light";
          }
        }

        if (version < 8) {
          // v8: Remove accent/tone customization (now fixed sienna palette)
          delete migrated.accentColor;
          delete migrated.tonePreference;
          delete migrated.toneMode;
          delete migrated.toneIntensity;
        }

        return migrated;
      },
    }
  )
);
