/**
 * ErrorMessage component
 * Standardized error display with optional retry/dismiss actions
 */

import type React from "react";
import { AlertCircle } from "../../../utils/icons";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Error",
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorHeader}>
        <AlertCircle className={styles.errorIcon} />
        <h3 className={styles.errorTitle}>{title}</h3>
      </div>
      <p className={styles.errorMessage}>{message}</p>
      {(onRetry || onDismiss) && (
        <div className={styles.errorActions}>
          {onRetry && (
            <button type="button" className={styles.retryButton} onClick={onRetry}>
              Try Again
            </button>
          )}
          {onDismiss && (
            <button type="button" className={styles.dismissButton} onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
};
