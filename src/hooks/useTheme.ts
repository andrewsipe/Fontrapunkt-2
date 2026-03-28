import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";

/**
 * Theme hook - minimal version for fixed color system.
 * Colors are defined in theme.css; this hook only handles
 * system theme preference changes.
 */
export function useTheme() {
  const colorScheme = useSettingsStore((state) => state.colorScheme);

  useEffect(() => {
    if (colorScheme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-render when system theme changes
      // The CSS light-dark() handles the actual color switching
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorScheme]);
}
