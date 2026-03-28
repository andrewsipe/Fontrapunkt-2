/**
 * Variable axes drawer (left).
 * Left-side drawer: axis sliders and preset styles when a variable font is loaded.
 */

import { useUIStore } from "../../../stores/uiStore";
import { VariableAxesPanel } from "../../features/VariableAxesPanel/VariableAxesPanel";
import styles from "./VariableAxesDrawer.module.css";

export function VariableAxesDrawer() {
  const open = useUIStore((state) => state.openVariableAxesDrawer);
  const setOpen = useUIStore((state) => state.setOpenVariableAxesDrawer);

  if (!open) return null;

  return (
    <aside className={styles.drawer} data-side="left" aria-label="Variable Axes">
      <div className={styles.header}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Close Variable Axes drawer"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <VariableAxesPanel />
      </div>
    </aside>
  );
}
