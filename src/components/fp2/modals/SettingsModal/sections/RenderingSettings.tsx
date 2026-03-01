/**
 * Rendering section (high DPI, render quality).
 */

import { useSettingsStore } from "../../../../../stores/settingsStore";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
import { Select } from "../../../../components/Select";
import styles from "../SettingsModal.module.css";

export function RenderingSettings() {
  const settings = useSettingsStore();
  const { setHighDPI, setRenderQuality } = useSettingsStore();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Rendering</h3>
      <div className={styles.settingGroup}>
        <Checkbox
          checked={settings.highDPI}
          onChange={(e) => setHighDPI(e.target.checked)}
          className={styles.settingLabel}
        >
          High DPI Rendering
        </Checkbox>
      </div>
      <div className={styles.settingGroup}>
        <Select.Root
          variant="modal"
          value={settings.renderQuality}
          onValueChange={(value) => {
            if (value === "high" || value === "medium" || value === "low") {
              setRenderQuality(value);
            } else {
              console.warn(`Invalid render quality: ${value}`);
            }
          }}
        >
          <Select.Label variant="form" htmlFor="render-quality" className={styles.settingLabel}>
            Render Quality
          </Select.Label>
          <Select.Trigger id="render-quality" variant="compact" className={styles.select} />
          <Select.Portal>
            <Select.Content variant="modal">
              <Select.Viewport>
                <Select.Item value="high">
                  <Select.ItemText>High</Select.ItemText>
                </Select.Item>
                <Select.Item value="medium">
                  <Select.ItemText>Medium</Select.ItemText>
                </Select.Item>
                <Select.Item value="low">
                  <Select.ItemText>Low</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}
