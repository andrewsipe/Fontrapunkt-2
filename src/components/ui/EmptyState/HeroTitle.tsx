/**
 * Hero title: single "Fontrapunkt" in one random font. Click to load that font.
 * Used by EmptyState. Simplified from per-character spans to one span.
 */

import type { FontInfo } from "../../../utils/dynamicFontLoader";
import styles from "./EmptyState.module.css";

export interface HeroTitleProps {
  displayFont: FontInfo | null;
  loaded: boolean;
  loading: boolean;
  isBlurring?: boolean;
  isDragActive?: boolean;
  onLoadClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function HeroTitle({
  displayFont,
  loaded,
  loading,
  isBlurring = false,
  isDragActive = false,
  onLoadClick,
  onMouseEnter,
  onMouseLeave,
}: HeroTitleProps) {
  const canClick = loaded && displayFont != null && !loading;

  return (
    <div className={styles.heroSection}>
      <h1
        className={`${styles.heroTitle} ${loaded ? styles.heroTitleAnimated : ""} ${isBlurring ? styles.heroTitleBlurring : ""} ${displayFont ? styles.heroTitleFont : ""} ${canClick ? styles.heroTitleClickable : ""}`}
        style={
          displayFont
            ? {
                fontFamily: `"${displayFont.name}", var(--font-ui)`,
              }
            : undefined
        }
      >
        {canClick ? (
          <button
            type="button"
            className={styles.heroTitleButton}
            onClick={onLoadClick}
            disabled={loading}
            aria-label={`Load font: ${displayFont?.name ?? "unknown"}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            Fontrapunkt
          </button>
        ) : (
          <span>Fontrapunkt</span>
        )}
      </h1>
      {!isDragActive &&
        (loading && !loaded ? (
          <p className={styles.fontCredit}>Loading font…</p>
        ) : !displayFont ? (
          <p className={styles.fontCredit}>Geist, via System Font</p>
        ) : null)}
    </div>
  );
}
