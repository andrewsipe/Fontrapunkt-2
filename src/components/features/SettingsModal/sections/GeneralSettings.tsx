/**
 * General settings section (default text, direction, hidden axes).
 */

import { useSettingsStore } from "../../../../stores/settingsStore";
import { useUIStore } from "../../../../stores/uiStore";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { CustomToggleGroup } from "../../../components/ToggleGroup/CustomToggleGroup";
import { Label } from "../../../primitives/Label/Label";
import { ResetButton } from "../../Button/ResetButton";
import styles from "../SettingsModal.module.css";

const DEFAULT_CANVAS_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function GeneralSettings() {
  const settings = useSettingsStore();
  const setDefaultTextDirection = useSettingsStore((s) => s.setDefaultTextDirection);
  const setDefaultText = useSettingsStore((s) => s.setDefaultText);
  const setShowHiddenAxes = useSettingsStore((s) => s.setShowHiddenAxes);
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);

  const handleDefaultTextChange = (value: string) => {
    setDefaultText(value);
    if (activeTab) updateTabSettings(activeTab.id, { text: value });
  };

  const handleResetDefaultText = () => handleDefaultTextChange(DEFAULT_CANVAS_TEXT);

  return (
    <div className={styles.section}>
      <Label as="h3" variant="section" className={styles.sectionTitle}>
        General Settings
      </Label>
      <div className={styles.settingGroup}>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>Default Canvas Text</div>
          <ResetButton
            tooltip="Reset to default text"
            onClick={handleResetDefaultText}
            disabled={settings.defaultText === DEFAULT_CANVAS_TEXT}
            aria-label="Reset to default text"
          />
        </div>
        <textarea
          value={settings.defaultText}
          onChange={(e) => handleDefaultTextChange(e.target.value)}
          className={styles.defaultTextInput}
          dir={settings.defaultTextDirection}
          rows={2}
          aria-label="Default canvas text"
        />
      </div>
      <div className={styles.settingGroup}>
        <Label as="span" variant="form" className={styles.settingLabel}>
          Default Text Direction
        </Label>
        <CustomToggleGroup.Root
          type="single"
          value={settings.defaultTextDirection}
          onValueChange={(value) => {
            if (value) setDefaultTextDirection(value as "ltr" | "rtl");
          }}
          variant="segmented"
          className={styles.buttonGroup}
          aria-label="Default text direction"
        >
          <CustomToggleGroup.Item value="ltr">LTR</CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="rtl">RTL</CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </div>
      <div className={styles.settingGroup}>
        <Checkbox
          checked={settings.showHiddenAxes}
          onChange={(e) => setShowHiddenAxes(e.target.checked)}
          className={styles.settingLabel}
        >
          Show Hidden Font Axes
        </Checkbox>
      </div>
    </div>
  );
}
