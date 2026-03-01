/**
 * Present View - Fullscreen presentation mode
 */

import { useEffect, useRef } from "react";
import { useUIStore } from "../../../../stores/uiStore";
import { PlainView } from "../PlainView";
import styles from "./PresentView.module.css";

export function PresentView() {
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const setBottomBarVisible = useUIStore((state) => state.setBottomBarVisible);

  // Refs to store previous state to restore upon exit
  const prevSidebarRef = useRef(true);
  const prevBottomBarRef = useRef(true);

  useEffect(() => {
    // Save current state
    const { sidebarOpen, bottomBarVisible } = useUIStore.getState();
    prevSidebarRef.current = sidebarOpen;
    prevBottomBarRef.current = bottomBarVisible;

    // Hide everything for Presentation
    setSidebarOpen(false);
    setBottomBarVisible(false);

    // Cleanup: Restore state on unmount
    return () => {
      setSidebarOpen(prevSidebarRef.current);
      setBottomBarVisible(prevBottomBarRef.current);
    };
  }, [setSidebarOpen, setBottomBarVisible]);

  return (
    <div className={styles.presentView}>
      <PlainView />
      <span className={styles.exitHint} aria-hidden="true">
        Esc to exit
      </span>
    </div>
  );
}
