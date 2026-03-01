/**
 * Keyboard shortcuts section (static list).
 */

import { SectionHeader } from "../../../../components/SectionHeader/SectionHeader";
import styles from "../SettingsModal.module.css";

export function KeyboardShortcuts() {
  return (
    <div className={styles.section}>
      <SectionHeader border={false}>Shortcuts</SectionHeader>
      <div className={styles.shortcutsList}>
        <div className={styles.shortcutItem}>
          <span className={styles.shortcutLabel}>Increase font size:</span>
          <span className={styles.shortcutKeys}>CMD +</span>
        </div>
        <div className={styles.shortcutItem}>
          <span className={styles.shortcutLabel}>Decrease font size:</span>
          <span className={styles.shortcutKeys}>CMD -</span>
        </div>
        <div className={styles.shortcutItem}>
          <span className={styles.shortcutLabel}>Increase line height:</span>
          <span className={styles.shortcutKeys}>CMD SHIFT +</span>
        </div>
        <div className={styles.shortcutItem}>
          <span className={styles.shortcutLabel}>Decrease line height:</span>
          <span className={styles.shortcutKeys}>CMD SHIFT -</span>
        </div>
      </div>
    </div>
  );
}
