/**
 * Cache management section (status, clear button).
 */

import { Trash2 } from "../../../../utils/icons";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { LoadingSpinner } from "../../../ui/LoadingSpinner/LoadingSpinner";
import styles from "../SettingsModal.module.css";

export interface CacheManagementProps {
  cacheStatus: { count: number } | null;
  isClearingCache: boolean;
  cacheCleared: boolean;
  onClearCache: () => Promise<void>;
}

export function CacheManagement({
  cacheStatus,
  isClearingCache,
  cacheCleared,
  onClearCache,
}: CacheManagementProps) {
  return (
    <div className={styles.section}>
      <SectionHeader border={false}>Cache Management</SectionHeader>
      <p className={styles.sectionDescription}>
        Fonts are cached locally for faster loading. Clear the cache if fonts aren't updating
        properly.
      </p>
      {cacheStatus != null && (
        <p className={styles.sectionDescription}>
          {cacheStatus.count === 0
            ? "No fonts cached"
            : `${cacheStatus.count} font${cacheStatus.count === 1 ? "" : "s"} cached`}
        </p>
      )}
      <div className={styles.settingGroup}>
        <button
          type="button"
          className={`${styles.errorButton}${cacheCleared ? ` ${styles.success}` : ""}`}
          onClick={onClearCache}
          disabled={cacheCleared || isClearingCache}
        >
          {isClearingCache ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Clearing...</span>
            </>
          ) : (
            <>
              <Trash2 size={16} />
              {cacheCleared
                ? cacheStatus?.count === 0
                  ? "Cache Cleared!"
                  : `Cleared (${cacheStatus?.count ?? 0} remaining)`
                : `Clear Font Cache${cacheStatus != null ? ` (${cacheStatus.count})` : ""}`}
            </>
          )}
        </button>
      </div>
      <p className={styles.sectionDescription}>
        Or run <code className={styles.inlineCode}>__clearFontCache()</code> in the console
      </p>
    </div>
  );
}
