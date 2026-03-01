/**
 * Syncs tab color/backgroundColor to canvas theme when the user changes
 * canvas light/dark mode (or app theme when canvas is "match").
 * Ensures existing tabs stay readable when switching canvas theme.
 */

import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useUIStore } from "../stores/uiStore";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../utils/themeUtils";

export function useCanvasThemeSync() {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const canvasTheme = useSettingsStore((state) => state.canvasTheme);

  useEffect(() => {
    const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
    const { color, backgroundColor } = getDefaultCanvasColors(isDark);
    const { tabs, updateTabSettings } = useUIStore.getState();
    for (const tab of tabs) {
      updateTabSettings(tab.id, { color, backgroundColor });
    }
  }, [colorScheme, canvasTheme]);
}
