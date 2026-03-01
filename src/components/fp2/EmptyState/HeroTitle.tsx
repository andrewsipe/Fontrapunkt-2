/**
 * Hero title (animated "Fontrapunkt" with per-character font display).
 * Used by EmptyState.
 */

import type { RefObject } from "react";
import type { FontInfo } from "../../../utils/dynamicFontLoader";
import styles from "./EmptyState.module.css";

export interface HeroTitleProps {
  characterFonts: (FontInfo | null)[];
  fontsLoaded: boolean;
  fontLoading: boolean;
  isBlurring: boolean;
  charRefs: RefObject<(HTMLSpanElement | HTMLButtonElement | null)[]>;
  onCharacterClick: (index: number) => void;
  onCharacterHover: (index: number) => void;
  onCharacterHoverEnd: () => void;
  titleText?: string;
  titleRef?: RefObject<HTMLHeadingElement | null>;
}

const DEFAULT_TITLE = "Fontrapunkt";

export function HeroTitle({
  characterFonts,
  fontsLoaded,
  fontLoading,
  isBlurring,
  charRefs,
  onCharacterClick,
  onCharacterHover,
  onCharacterHoverEnd,
  titleText = DEFAULT_TITLE,
  titleRef,
}: HeroTitleProps) {
  const characters = titleText.split("");
  const firstFontInfo = characterFonts[0] ?? null;
  const firstFont = firstFontInfo != null && fontsLoaded;

  return (
    <div className={styles.heroSection}>
      <h1
        ref={titleRef ?? undefined}
        className={`${styles.heroTitle} ${fontsLoaded ? styles.animated : ""} ${isBlurring ? styles.blurring : ""} ${firstFont ? styles.heroTitleFont : ""}`}
        style={
          firstFont && firstFontInfo
            ? {
                ["--hero-font-family" as string]: `"${firstFontInfo.name}", ${getComputedStyle(document.documentElement).getPropertyValue("--font-ui")}`,
              }
            : undefined
        }
      >
        {characters.map((char, index) => {
          const fontInfo = characterFonts[index];
          const isClickable = fontsLoaded && fontInfo != null && !fontLoading;
          const charKey = `${char}-${index}-${fontInfo?.name ?? "default"}`;
          const charClass = `${styles.heroChar} ${isClickable ? styles.clickable : ""} ${isClickable && fontLoading ? styles.heroCharCursorWait : ""} ${isClickable && !fontLoading ? styles.heroCharCursorPointer : ""}`;

          if (isClickable) {
            return (
              <button
                key={charKey}
                type="button"
                ref={(el) => {
                  if (charRefs.current) charRefs.current[index] = el;
                }}
                className={`${charClass} ${styles.heroCharButton}`}
                aria-label={`Load font: ${fontInfo?.name ?? "unknown"}`}
                onClick={() => onCharacterClick(index)}
                onMouseEnter={() => onCharacterHover(index)}
                onMouseLeave={onCharacterHoverEnd}
              >
                {char === " " ? "\u00A0" : char}
              </button>
            );
          }
          if (fontInfo != null) {
            return (
              <button
                key={charKey}
                type="button"
                disabled
                ref={(el) => {
                  if (charRefs.current) charRefs.current[index] = el;
                }}
                className={`${charClass} ${styles.heroCharButton}`}
                onMouseEnter={() => onCharacterHover(index)}
                onMouseLeave={onCharacterHoverEnd}
              >
                {char === " " ? "\u00A0" : char}
              </button>
            );
          }
          return (
            <span
              key={charKey}
              ref={(el) => {
                if (charRefs.current) charRefs.current[index] = el;
              }}
              className={charClass}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </h1>
      <p className={styles.fontCredit}>
        {fontLoading && !fontsLoaded
          ? "Loading fonts..."
          : fontsLoaded && characterFonts.some((f) => f !== null)
            ? "Click any character to open font in viewer or..."
            : "Geist, via System Font"}
      </p>
    </div>
  );
}
