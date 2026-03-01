/**
 * Live Pulse Icon Component
 * Custom "Inside-Out" pulse animation to indicate live sync status
 * States: active (green, pulsing), inactive (greyscale), failed (red)
 */

import styles from "./LivePulseIcon.module.css";

export type LiveSyncState = "active" | "inactive" | "failed";

interface LivePulseIconProps {
  state?: LiveSyncState;
}

export function LivePulseIcon({ state = "inactive" }: LivePulseIconProps) {
  const getTitle = () => {
    switch (state) {
      case "active":
        return "Live Sync Active";
      case "failed":
        return "Live Sync: Error";
      default:
        return "Live Sync: Inactive";
    }
  };

  const getAriaLabel = () => {
    switch (state) {
      case "active":
        return "Live sync active";
      case "failed":
        return "Live sync error";
      default:
        return "Live sync inactive";
    }
  };

  return (
    <div
      className={`${styles.container} ${styles[state]}`}
      title={getTitle()}
      role="img"
      aria-label={getAriaLabel()}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" className={styles.center} />
        <circle className={styles.ring1} cx="12" cy="12" r="8" strokeWidth="2" />
        <circle className={styles.ring2} cx="12" cy="12" r="8" strokeWidth="2" />
        <circle className={styles.ring3} cx="12" cy="12" r="8" strokeWidth="2" />
      </svg>
    </div>
  );
}
