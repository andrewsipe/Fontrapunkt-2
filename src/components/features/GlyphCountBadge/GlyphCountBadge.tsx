/**
 * GlyphCountBadge - Feature: displays total glyph count from font store.
 * Used in BottomBar when a font is loaded.
 */

import { useFontStore } from "../../../stores/fontStore";
import styles from "./GlyphCountBadge.module.css";

export function GlyphCountBadge() {
  const glyphCount = useFontStore((state) => state.glyphCount);

  if (glyphCount <= 0) return null;

  return (
    <div className={styles.badge} title="Total Glyphs">
      <span className={styles.dimmedLabel}>Glyphs:</span>
      {glyphCount.toLocaleString()}
    </div>
  );
}
