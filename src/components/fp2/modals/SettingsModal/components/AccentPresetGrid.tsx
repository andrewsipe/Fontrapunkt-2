/**
 * Accent preset color swatches for Settings modal.
 */

import { ACCENT_PRESETS } from "../../../../../constants/themeConstants";
import { useSettingsStore } from "../../../../../stores/settingsStore";
import { TooltipButton } from "../../../../components/Tooltip/TooltipButton";
import styles from "./AccentPresetGrid.module.css";

export function AccentPresetGrid() {
  const settings = useSettingsStore();
  const setAccentColorFull = useSettingsStore((s) => s.setAccentColorFull);

  return (
    <div className={styles.accentPresets}>
      {ACCENT_PRESETS.map((preset) => {
        const { hue, chroma, lightness } = preset;
        const isActive =
          Math.abs(settings.accentColor.hue - hue) < 2 &&
          Math.abs(settings.accentColor.chroma - chroma) < 0.02 &&
          Math.abs(settings.accentColor.lightness - lightness) < 0.05;

        return (
          <TooltipButton
            key={preset.name}
            tooltip={preset.name}
            className={`${styles.presetSwatch} ${isActive ? styles.presetSwatchActive : ""}`}
            style={{
              ["--preset-bg" as string]: `oklch(${lightness} ${chroma} ${hue})`,
            }}
            onClick={() => setAccentColorFull(hue, chroma, lightness)}
            aria-label={`Select ${preset.name} accent`}
          >
            <span aria-hidden="true" />
          </TooltipButton>
        );
      })}
    </div>
  );
}
