/**
 * OpenType Features Drawer — fp2
 * Right-side drawer: OpenType feature toggles by category.
 */

import { useUIStore } from "../../../stores/uiStore";
import { OpenTypeFeaturesPanel } from "../../features/OpenTypeFeaturesPanel/OpenTypeFeaturesPanel";
import styles from "./OpenTypeDrawer.module.css";

export function OpenTypeDrawer() {
  const open = useUIStore((state) => state.openOpenTypeDrawer);
  const setOpen = useUIStore((state) => state.setOpenOpenTypeDrawer);

  if (!open) return null;

  return (
    <aside className={styles.drawer} data-side="right" aria-label="OpenType Features">
      <div className={styles.header}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Close OpenType drawer"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <OpenTypeFeaturesPanel />
      </div>
    </aside>
  );
}
