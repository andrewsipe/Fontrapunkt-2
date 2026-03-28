/**
 * Glyph Card component
 * Individual glyph card with character, name, and unicode
 */

import type { CSSProperties } from "react";
import type { GlyphInfo } from "../../../utils/glyphCategorizer";
import { Tooltip } from "../../components/Tooltip";
import styles from "./GlyphCard.module.css";

interface GlyphCardProps {
  glyph: GlyphInfo;
  fontSize: number;
  featureSettings: string;
  variationSettings?: string;
  textTransform: string;
  fontFamily: string;
  isCopied: boolean;
  onDoubleClick: (glyph: GlyphInfo) => void;
}

export function GlyphCard({
  glyph,
  fontSize,
  featureSettings,
  variationSettings,
  textTransform,
  fontFamily,
  isCopied,
  onDoubleClick,
}: GlyphCardProps) {
  return (
    <Tooltip tooltip={`Double-click to copy "${glyph.char}"`}>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.glyphCard} ${isCopied ? styles.copied : ""}`}
        onDoubleClick={() => onDoubleClick(glyph)}
      >
        <div
          className={styles.glyphChar}
          style={
            {
              "--glyph-char-font-family": fontFamily,
              "--glyph-char-font-size": `${fontSize}px`,
              "--glyph-char-feature-settings": featureSettings,
              "--glyph-char-variation-settings": variationSettings || undefined,
              "--glyph-char-text-transform":
                textTransform === "small-caps" ? "none" : textTransform,
              "--glyph-char-variant-caps": textTransform === "small-caps" ? "small-caps" : "normal",
            } as CSSProperties
          }
        >
          {glyph.char}
        </div>
        <div className={styles.glyphInfo}>
          <span className={styles.glyphName}>{isCopied ? "Copied!" : glyph.name}</span>
          {glyph.unicodeNumber !== null && (
            <Tooltip tooltip={`View ${glyph.unicode} on symbl.cc`}>
              <a
                href={`https://symbl.cc/en/${glyph.unicode.replace(/^U\+/i, "")}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.glyphUnicode}
                onClick={(e) => e.stopPropagation()}
              >
                {glyph.unicode}
              </a>
            </Tooltip>
          )}
        </div>
      </div>
    </Tooltip>
  );
}
