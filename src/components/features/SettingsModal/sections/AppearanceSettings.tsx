/**
 * Appearance section (color scheme, canvas theme, accent, tone).
 */

import { useSettingsStore } from "../../../../stores/settingsStore";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { CustomToggleGroup } from "../../../components/ToggleGroup/CustomToggleGroup";
import { Label } from "../../../primitives/Label/Label";
import { NativeRangeSliderWithLayout } from "../../../primitives/NativeRangeSlider";
import { ResetButton } from "../../Button/ResetButton";
import { OKLCHPickerPanel } from "../../OKLCHPicker/OKLCHPickerPanel";
import { AccentPresetGrid } from "../components/AccentPresetGrid";
import styles from "../SettingsModal.module.css";

export function AppearanceSettings() {
  const settings = useSettingsStore();
  const { setColorScheme, setCanvasTheme, setAccentColorFull, setTonePreference } =
    useSettingsStore();

  return (
    <div id="settings-appearance" className={styles.section}>
      <SectionHeader border={false}>Appearance</SectionHeader>

      <div className={styles.settingGroup}>
        <CustomToggleGroup.Root
          type="single"
          value={settings.colorScheme}
          onValueChange={(value) => {
            if (value) setColorScheme(value as "system" | "light" | "dark");
          }}
          variant="segmented"
          className={styles.buttonGroup}
          aria-label="Color scheme"
        >
          <CustomToggleGroup.Item value="system">System</CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="light">Light</CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="dark">Dark</CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </div>

      <div className={styles.settingGroup}>
        <Label as="span" variant="form" className={styles.settingLabel}>
          Canvas (font view)
        </Label>
        <CustomToggleGroup.Root
          type="single"
          value={settings.canvasTheme}
          onValueChange={(value) => {
            if (value) setCanvasTheme(value as "match" | "light" | "dark");
          }}
          variant="segmented"
          className={styles.buttonGroup}
          aria-label="Canvas theme"
        >
          <CustomToggleGroup.Item value="match">Match</CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="light">Light</CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="dark">Dark</CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabel}>Accent Color</div>
        <AccentPresetGrid />
        <OKLCHPickerPanel
          color={{
            l: settings.accentColor.lightness,
            c: settings.accentColor.chroma,
            h: settings.accentColor.hue,
          }}
          onChange={(oklch) => setAccentColorFull(oklch.h, oklch.c, oklch.l)}
          showHex={false}
          showPreview={false}
          compactSliders={false}
          idPrefix="settings-accent-oklch"
        />
      </div>

      <div className={styles.settingGroup}>
        <div className={styles.toneSliderWrapper}>
          <NativeRangeSliderWithLayout
            id="settings-tone-preference"
            label="Background Tint"
            valueDisplay={
              settings.tonePreference === 0
                ? "Neutral"
                : settings.tonePreference < 0
                  ? `Cool ${Math.round(Math.abs(settings.tonePreference) * 100)}%`
                  : `Warm ${Math.round(settings.tonePreference * 100)}%`
            }
            trailing={
              <ResetButton
                tooltip="Reset to Neutral"
                onClick={() => setTonePreference(0)}
                disabled={settings.tonePreference === 0}
                aria-label="Reset to Neutral"
              />
            }
            min={-1}
            max={1}
            step={0.01}
            value={settings.tonePreference}
            onChange={setTonePreference}
            trackVariant="tone"
            snapPoints={[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]}
            snapThreshold={0.1}
            className={styles.toneSliderInputWrap}
            aria-label="Background tint slider"
            aria-valuetext={
              settings.tonePreference === 0
                ? "Neutral"
                : settings.tonePreference < 0
                  ? `Cool ${Math.round(Math.abs(settings.tonePreference) * 100)}%`
                  : `Warm ${Math.round(settings.tonePreference * 100)}%`
            }
          />
          <div className={styles.toneLabel}>
            <span>Cool</span>
            <span>Neutral</span>
            <span>Warm</span>
          </div>
        </div>
        <p className={styles.settingHint}>
          {settings.tonePreference === 0
            ? "Neutral (adapts subtly to your accent)"
            : Math.abs(settings.tonePreference) <= 0.3
              ? `${settings.tonePreference < 0 ? "Subtle Cool" : "Subtle Warm"} Tint`
              : `${settings.tonePreference < 0 ? "Strong Cool" : "Strong Warm"} Tone (${Math.round(Math.abs(settings.tonePreference) * 100)}%)`}
        </p>
      </div>

      <p className={styles.settingHint}>
        Sidebar density follows its width: resize the sidebar narrower for a more compact layout.
      </p>
    </div>
  );
}
