/**
 * HeaderControls - Feature: global reset and swatch book (open settings to appearance).
 * Owns domain logic (reset axes, update tab settings, open settings modal); composes Button features.
 */

import { useFontStore } from "../../../stores/fontStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useUIStore } from "../../../stores/uiStore";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../../../utils/themeUtils";
import { ResetButton, SwatchBookButton } from "../Button";
import styles from "./HeaderControls.module.css";

const DEFAULT_SAMPLE_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function HeaderControls() {
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const openModal = useUIStore((state) => state.openModal);
  const setOpenSettingsScrollTo = useUIStore((state) => state.setOpenSettingsScrollTo);
  const resetAxes = useFontStore((state) => state.resetAxes);
  const fontId = useFontStore((state) => state.currentFontId);
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const axes = useFontStore((state) => state.getFontAxes());
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const canvasTheme = useSettingsStore((state) => state.canvasTheme);

  const openSwatchBook = () => {
    setOpenSettingsScrollTo("appearance");
    openModal("settings");
  };

  const handleGlobalReset = () => {
    if (!activeTab) return;

    if (fontId && isVariable && axes?.length) {
      resetAxes(fontId);
    }

    const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
    const { color, backgroundColor } = getDefaultCanvasColors(isDark);

    updateTabSettings(activeTab.id, {
      text: DEFAULT_SAMPLE_TEXT,
      fontSize: 72,
      letterSpacing: 0,
      lineHeight: 1.2,
      alignment: "left",
      direction: "ltr",
      textTransform: "none",
      verticalAlignment: "top",
      zoomToFit: false,
      verticalTrim: false,
      color,
      backgroundColor,
      otFeatures: {},
    });
  };

  return (
    <>
      <ResetButton
        tooltip="Reset all panels to defaults"
        onClick={handleGlobalReset}
        aria-label="Reset all panels to defaults"
        disabled={!activeTab}
        fontSize="base"
      />
      <SwatchBookButton
        onClick={openSwatchBook}
        className={styles.swatchBookButton}
        fontSize="base"
      />
    </>
  );
}
