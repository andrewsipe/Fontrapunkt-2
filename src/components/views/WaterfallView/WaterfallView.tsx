/**
 * Waterfall View - Same text at multiple sizes
 */

import { memo, useMemo } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import { oklchToCss } from "../../../utils/colorUtils";
import { buildFeatureSettings } from "../../../utils/fontFeatureUtils";
import { getCanvasFontStack } from "../../../utils/notDefFontLoader";
import styles from "./WaterfallView.module.css";

const WATERFALL_SIZES = [180, 140, 110, 90, 70, 60, 50, 40, 30, 24, 20, 16, 14, 12, 10, 9, 8, 7];

function WaterfallViewComponent() {
  const fontName = useFontStore((state) => state.getFontName());
  const axes = useFontStore((state) => state.getFontAxes());
  const fontId = useFontStore((state) => state.currentFontId);
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const activeTab = useUIStore((state) => state.getActiveTab());

  const variationSettings = useMemo(() => {
    if (!isVariable || !axes?.length) return "";
    const axisValues: Record<string, number> = {};
    axes.forEach((axis) => {
      axisValues[axis.tag] = axis.current;
    });
    if (Object.keys(axisValues).length === 0) return "";
    return Object.entries(axisValues)
      .map(([tag, value]) => `"${tag}" ${value}`)
      .join(", ");
  }, [isVariable, axes]);

  const featureSettings = useMemo(() => {
    return buildFeatureSettings(activeTab?.settings.otFeatures);
  }, [activeTab?.settings.otFeatures]);

  if (!activeTab || !fontId || !fontName) {
    return (
      <div className={styles.emptyState}>
        <p>No font loaded</p>
      </div>
    );
  }

  const { text, color, backgroundColor } = activeTab.settings;

  return (
    <div
      className={styles.waterfallView}
      style={{ ["--waterfall-bg" as string]: oklchToCss(backgroundColor) }}
    >
      <div className={styles.waterfallContent}>
        {WATERFALL_SIZES.map((size) => (
          <div key={size} className={styles.waterfallRow}>
            <span className={styles.sizeLabel}>{size}px</span>
            <span
              className={styles.waterfallText}
              style={
                {
                  "--waterfall-font-size": `${size}px`,
                  "--waterfall-font-family": getCanvasFontStack(fontName),
                  "--waterfall-color": oklchToCss(color),
                  "--waterfall-variation-settings": variationSettings || undefined,
                  "--waterfall-feature-settings": featureSettings,
                } as CSSProperties
              }
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const WaterfallView = memo(WaterfallViewComponent);
