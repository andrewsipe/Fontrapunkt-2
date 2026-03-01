/**
 * LoadingSpinner — fp2
 * Reusable loading indicator for async operations.
 * Token-based styling, no external dependencies.
 */

import type React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label = "Loading",
}) => {
  return (
    <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label={label}>
      <div className={styles.spinnerCircle} />
      {label && <span className={styles.srOnly}>{label}</span>}
    </div>
  );
};
