/**
 * Styles View - Grid of named instances
 */

import type { CSSProperties } from "react";
import { memo, useMemo, useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import { oklchToCss } from "../../../utils/colorUtils";
import { copyToClipboard, generateCSS } from "../../../utils/exportUtils";
import { buildFeatureSettings } from "../../../utils/fontFeatureUtils";
import { getCanvasFontStack } from "../../../utils/notDefFontLoader";
import { Tooltip } from "../../components/Tooltip";
import styles from "./StylesView.module.css";

function StylesViewComponent() {
  const fontName = useFontStore((state) => state.getFontName());
  const namedVariations = useFontStore((state) => state.getFontNamedVariations()) ?? [];
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const fontId = useFontStore((state) => state.currentFontId);
  const activeTab = useUIStore((state) => state.getActiveTab());
  const [copiedInstance, setCopiedInstance] = useState<string | null>(null);

  const featureSettings = useMemo(() => {
    return buildFeatureSettings(activeTab?.settings.otFeatures);
  }, [activeTab?.settings.otFeatures]);

  if (!activeTab || !fontId) {
    return (
      <div className={styles.emptyState}>
        <p>No font loaded</p>
      </div>
    );
  }

  if (!isVariable) {
    return (
      <div className={styles.emptyState}>
        <p>This font is not a variable font</p>
      </div>
    );
  }

  if (namedVariations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No named instances (preset styles) found in this variable font</p>
        <p className={styles.hint}>
          Try loading a variable font with preset styles defined in the fvar table
        </p>
      </div>
    );
  }

  const {
    text,
    color,
    backgroundColor,
    fontSize,
    lineHeight,
    letterSpacing,
    alignment,
    direction,
    textTransform,
    verticalTrim,
  } = activeTab.settings;

  const handleDoubleClick = async (variation: (typeof namedVariations)[0]) => {
    const currentFont = useFontStore.getState().getCurrentFont();
    if (!currentFont) return;
    const css = generateCSS(currentFont, {
      variations: variation.coordinates,
      features: Object.entries(activeTab.settings.otFeatures || {})
        .filter(([, enabled]) => enabled)
        .map(([tag]) => tag),
      fontSize: activeTab.settings.fontSize,
      lineHeight: activeTab.settings.lineHeight,
      letterSpacing: activeTab.settings.letterSpacing,
      color: activeTab.settings.color
        ? `oklch(${activeTab.settings.color.l * 100}% ${activeTab.settings.color.c} ${activeTab.settings.color.h})`
        : undefined,
    });

    const success = await copyToClipboard(css);
    if (success) {
      setCopiedInstance(variation.name);
      setTimeout(() => setCopiedInstance(null), 1500);
    }
  };

  return (
    <div className={styles.stylesView}>
      <div className={styles.stylesGrid}>
        {namedVariations.map((variation) => {
          const fontVariationSettings = Object.entries(variation.coordinates)
            .map(([axis, value]) => `"${axis}" ${value}`)
            .join(", ");
          const isCopied = copiedInstance === variation.name;

          return (
            <Tooltip
              key={variation.name}
              tooltip={`Double-click to copy CSS for "${variation.name}"`}
            >
              <div
                role="button"
                tabIndex={0}
                className={`${styles.styleCard} ${isCopied ? styles.copied : ""}`}
                onDoubleClick={() => handleDoubleClick(variation)}
              >
                <h4 className={styles.styleName}>{isCopied ? "Copied!" : variation.name}</h4>
                <div
                  className={`${styles.styleSample} ${verticalTrim ? styles.verticalTrim : ""} ${textTransform === "small-caps" ? styles.smallCaps : ""}`}
                  style={
                    {
                      "--style-sample-font-family": getCanvasFontStack(fontName ?? ""),
                      "--style-sample-variation-settings": fontVariationSettings,
                      "--style-sample-font-size": `${fontSize}px`,
                      "--style-sample-line-height": lineHeight.toString(),
                      "--style-sample-letter-spacing": `${letterSpacing / 1000}em`,
                      "--style-sample-text-align": alignment,
                      "--style-sample-direction": direction,
                      "--style-sample-text-transform":
                        textTransform === "small-caps" ? "none" : textTransform,
                      "--style-sample-feature-settings": featureSettings,
                      "--style-sample-color": oklchToCss(color),
                      "--style-sample-bg": oklchToCss(backgroundColor),
                    } as CSSProperties
                  }
                >
                  {text || "The quick brown fox jumps over the lazy dog"}
                </div>
                <div className={styles.styleInfo}>
                  {Object.entries(variation.coordinates).map(([axis, value]) => (
                    <div key={axis} className={styles.axisInfo}>
                      <span className={styles.axisTag}>{axis}</span>
                      <span className={styles.axisValue}>{value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export const StylesView = memo(StylesViewComponent);
