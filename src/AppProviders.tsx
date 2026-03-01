/**
 * Global App Providers and Hooks
 * Consolidates all global concerns: providers, hooks, and initialization
 */

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useCanvasThemeSync } from "./hooks/useCanvasThemeSync";
import { useDefaultTab } from "./hooks/useDefaultTab";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTheme } from "./hooks/useTheme";
import { useFontStore } from "./stores/fontStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useUIStore } from "./stores/uiStore";
import { loadUnicodeMetadata } from "./utils/glyphSearchUtils";
import { loadNotDefFallback } from "./utils/notDefFontLoader";
import { applyTheme } from "./utils/themeUtils";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // All hooks must be called before any conditional returns
  useKeyboardShortcuts();
  useDefaultTab();
  useTheme();
  useCanvasThemeSync();

  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const sidebarWidthPx = useUIStore((state) => state.sidebarWidthPx);
  const viewMode = useUIStore((state) => state.viewMode);

  /* Sync user-resized sidebar width to CSS so layout and toast use it. */
  useEffect(() => {
    const root = document.documentElement;
    if (sidebarWidthPx !== null) {
      root.style.setProperty("--sidebar-width", `${sidebarWidthPx}px`);
    } else {
      root.style.removeProperty("--sidebar-width");
    }
    return () => {
      root.style.removeProperty("--sidebar-width");
    };
  }, [sidebarWidthPx]);

  /* Toaster: center over canvas only. When sidebar is open (and not overlay/present),
     offset left so toasts align with the canvas; when collapsed or in present mode, full width. */
  const toastLeft =
    sidebarOpen && viewMode !== "present"
      ? sidebarWidthPx !== null
        ? `${sidebarWidthPx}px`
        : "var(--sidebar-width)"
      : 0;

  // Apply theme classes when colorScheme changes
  useEffect(() => {
    applyTheme(colorScheme);
  }, [colorScheme]);

  // Load Unicode metadata and Adobe NotDef fallback font on app start
  useEffect(() => {
    loadUnicodeMetadata().then((success) => {
      if (success) {
        console.log("[AppProviders] Unicode metadata loaded - semantic search enabled!");
      }
    });
    loadNotDefFallback().then(() => {
      console.log("[AppProviders] Adobe NotDef fallback font loaded");
    });
  }, []);

  // Listen for two-phase font enhancement (Phase 2 complete)
  useEffect(() => {
    const handleFontEnhanced = (event: Event) => {
      const customEvent = event as CustomEvent<{ fontId: string }>;
      const { fontId } = customEvent.detail;
      useFontStore.getState().replaceFontWithCached(fontId);
    };
    window.addEventListener("font-enhanced", handleFontEnhanced);
    return () => window.removeEventListener("font-enhanced", handleFontEnhanced);
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          left: toastLeft,
          right: 0,
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--accent-primary)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-sm) var(--space-md)",
            boxShadow: "var(--shadow-lg)",
            fontSize: "var(--text-sm)",
            cursor: "pointer", // Indicate clickability
          },
        }}
      />
    </>
  );
}
