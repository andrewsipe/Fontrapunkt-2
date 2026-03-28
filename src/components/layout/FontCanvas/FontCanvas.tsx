/**
 * FontCanvas — main canvas that renders the active view (Plain, Waterfall, Styles, Glyphs, Present).
 * Lazy-loads views; uses EmptyState and LoadingSpinner.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useUIStore } from "../../../stores/uiStore";
import { oklchToCss } from "../../../utils/colorUtils";
import { EmptyState } from "../../ui/EmptyState/EmptyState";
import { LoadingSpinner } from "../../ui/LoadingSpinner/LoadingSpinner";
import styles from "./FontCanvas.module.css";

// Lazy load view components for code splitting
const PlainView = lazy(() =>
  import("../../views/PlainView/PlainView").then((m) => ({ default: m.PlainView }))
);
const WaterfallView = lazy(() =>
  import("../../views/WaterfallView/WaterfallView").then((m) => ({
    default: m.WaterfallView,
  }))
);
const StylesView = lazy(() =>
  import("../../views/StylesView/StylesView").then((m) => ({ default: m.StylesView }))
);
const GlyphsView = lazy(() =>
  import("../../views/GlyphsView/GlyphsView").then((m) => ({ default: m.GlyphsView }))
);
const PresentView = lazy(() =>
  import("../../views/PresentView/PresentView").then((m) => ({
    default: m.PresentView,
  }))
);

export function FontCanvas() {
  const viewMode = useUIStore((state) => state.viewMode);
  const activeTab = useUIStore((state) => state.getActiveTab());
  const fontId = useFontStore((state) => state.currentFontId);
  const canvasTheme = useSettingsStore((state) => state.canvasTheme);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  const canvasScheme = canvasTheme === "match" ? undefined : canvasTheme;

  // Expose ref globally for screenshot capture
  useEffect(() => {
    if (canvasRef.current) {
      (window as Window & { __fontCanvasRef?: HTMLElement }).__fontCanvasRef = canvasRef.current;
    }
    return () => {
      delete (window as Window & { __fontCanvasRef?: HTMLElement }).__fontCanvasRef;
    };
  }, []);

  // Flash animation and re-render on font reload
  useEffect(() => {
    const handleFontReloaded = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(`[FontCanvas] Font reloaded event received:`, customEvent.detail?.fileName);

      // Force re-render to pull latest data from store
      forceUpdate((prev) => prev + 1);

      if (canvasRef.current) {
        // Add flash class
        canvasRef.current.classList.add(styles.flash);
        // Remove after animation completes
        setTimeout(() => {
          canvasRef.current?.classList.remove(styles.flash);
        }, 150);
      }
    };

    // Listen on window for global events
    window.addEventListener("font-reloaded", handleFontReloaded as EventListener);
    return () => {
      window.removeEventListener("font-reloaded", handleFontReloaded as EventListener);
    };
  }, []);

  if (!fontId || !activeTab) {
    return (
      <div
        ref={canvasRef}
        className={styles.canvas}
        data-font-canvas="true"
        {...(canvasScheme != null && { "data-canvas-scheme": canvasScheme })}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      data-font-canvas="true"
      {...(canvasScheme != null && { "data-canvas-scheme": canvasScheme })}
      style={{
        ["--bg-canvas" as string]: oklchToCss(activeTab.settings.backgroundColor),
      }}
    >
      <Suspense
        fallback={
          <div className={styles.viewLoader}>
            <LoadingSpinner size="lg" label="Loading view…" />
          </div>
        }
      >
        {viewMode === "plain" && <PlainView />}
        {viewMode === "waterfall" && <WaterfallView />}
        {viewMode === "styles" && <StylesView />}
        {viewMode === "glyphs" && <GlyphsView />}
        {viewMode === "present" && <PresentView />}
      </Suspense>
    </div>
  );
}
