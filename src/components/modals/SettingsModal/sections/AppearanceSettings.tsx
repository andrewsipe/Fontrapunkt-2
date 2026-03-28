/**
 * Appearance section (color scheme, canvas theme).
 */

import { useSettingsStore } from "../../../../stores/settingsStore";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { CustomToggleGroup } from "../../../components/ToggleGroup/CustomToggleGroup";
import { Label } from "../../../primitives/Label/Label";
import styles from "../SettingsModal.module.css";

export function AppearanceSettings() {
  const settings = useSettingsStore();
  const { setColorScheme, setCanvasTheme } = useSettingsStore();

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

      <p className={styles.settingHint}>
        Sidebar density follows its width: resize the sidebar narrower for a more compact layout.
      </p>
    </div>
  );
}
