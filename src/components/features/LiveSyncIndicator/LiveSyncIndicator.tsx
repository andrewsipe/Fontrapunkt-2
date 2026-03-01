/**
 * Live Sync Indicator Component
 * Shows when a font file is being watched for live reload
 * Phase 6: Single-file hot reload watcher
 */

import { useEffect, useState } from "react";
import { getWatchStatus } from "../../../engine/FontLoader";
import { Radio } from "../../../utils/icons";
import { Label } from "../../primitives/Label/Label";
import styles from "./LiveSyncIndicator.module.css";

export function LiveSyncIndicator() {
  const [isWatching, setIsWatching] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = getWatchStatus();
      setIsWatching(status.isWatching);
      setFileName(status.fileName);
    };

    // Check status immediately
    updateStatus();

    // Listen for font reload events
    const handleFontReloaded = () => {
      updateStatus();
    };

    window.addEventListener("font-reloaded", handleFontReloaded);

    // Poll status every second (in case watcher starts/stops externally)
    const interval = setInterval(updateStatus, 1000);

    return () => {
      window.removeEventListener("font-reloaded", handleFontReloaded);
      clearInterval(interval);
    };
  }, []);

  // Only show indicator when live sync is actively watching
  if (!isWatching || !fileName) {
    return null;
  }

  return (
    <div className={styles.indicator} title={`Live sync active: ${fileName}`}>
      <div className={styles.icon}>
        <Radio size={14} />
        <div className={styles.pulseDot} />
      </div>
      <Label as="span" variant="small" className={styles.label}>
        Live Sync
      </Label>
    </div>
  );
}
