/**
 * Plain View - Single editable text block
 *
 * Auto-Fit (zoomToFit):
 * - A hidden clone with the same container width is used to binary-search the largest font-size
 *   where the text fits (scrollHeight/scrollWidth within bounds). See calculateAutoFitFontSize in fontSizeUtils.
 * - The result is applied to the live element (element.style.fontSize) and synced to tab settings
 *   so the Font Size slider reflects the value. ResizeObserver and window resize trigger recalculation.
 * - The .textContent block has transition: font-size 0.15s ease-out, so when font-size changes
 *   (from auto-fit or from the slider) the change is animated. If auto-fit repeatedly flips between
 *   two sizes (e.g. scrollbar appear/disappear or subpixel rounding), that transition can look like
 *   a bounce. We avoid that by not re-running auto-fit from the "apply styles" effect when the only
 *   change was our own fontSize update (see lastAutoFitSizeRef).
 */

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import { oklchToCss } from "../../../utils/colorUtils";
import { buildFeatureSettings } from "../../../utils/fontFeatureUtils";
import { calculateAutoFitFontSize } from "../../../utils/fontSizeUtils";
import { getCanvasFontStack } from "../../../utils/notDefFontLoader";
import styles from "./PlainView.module.css";

function PlainViewComponent() {
  const fontName = useFontStore((state) => state.getFontName());
  const axes = useFontStore((state) => state.getFontAxes());
  const fontId = useFontStore((state) => state.currentFontId);
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserTypingRef = useRef(false);
  const lastExternalTextRef = useRef<string>("");
  /** When set, the apply-styles effect skips scheduling calculateOptimalFontSize to avoid feedback loop (bounce). */
  const lastAutoFitSizeRef = useRef<number | null>(null);
  const autoFitResizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_FIT_DEBOUNCE_MS = 120;

  // Apply font family (font is loaded globally by fontStore)
  useEffect(() => {
    if (!textRef.current || !fontName || !activeTab) {
      console.log("[PlainView] No font or tab, skipping font application");
      return;
    }

    console.group(`[PlainView] Font changed: ${fontName}`);

    const element = textRef.current;
    const fontFamilyName = fontName.includes(" ") ? `"${fontName}"` : fontName;

    const documentFonts = Array.from(document.fonts);
    const fontInDocument = documentFonts.find(
      (f) => f.family === fontFamilyName || f.family === `"${fontName}"`
    );
    console.log(
      "Font in document.fonts:",
      fontInDocument
        ? { status: fontInDocument.status, family: fontInDocument.family }
        : "NOT FOUND"
    );

    element.style.fontFamily = getCanvasFontStack(fontName);

    const verifyFontLoaded = async () => {
      try {
        await document.fonts.ready;
        void element.offsetHeight;
        const computedFamily = window.getComputedStyle(element).fontFamily;
        const fontFace = Array.from(document.fonts).find(
          (f) =>
            (f.family === fontFamilyName || f.family === `"${fontName}"`) && f.status === "loaded"
        );
        const isSystemFallback =
          computedFamily.includes("system-ui") ||
          computedFamily.includes("Arial") ||
          (computedFamily.includes("sans-serif") && !computedFamily.includes(fontName));

        if (isSystemFallback) {
          if (fontFace) {
            console.warn("⚠️ WARNING: Default system font detected despite font loaded.");
          }
          setTimeout(() => {
            const retryFontFace = Array.from(document.fonts).find(
              (f) =>
                (f.family === fontFamilyName || f.family === `"${fontName}"`) &&
                f.status === "loaded"
            );
            if (!retryFontFace) {
              element.style.fontFamily = "";
              requestAnimationFrame(() => {
                element.style.fontFamily = getCanvasFontStack(fontName);
              });
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error verifying font load:", error);
      }
    };

    verifyFontLoaded();
    console.groupEnd();
  }, [fontName, activeTab]);

  // Memoize feature settings string to avoid recalculation
  // Extract otFeatures to match React Compiler's dependency inference
  // Disable browser defaults so user toggles work properly
  const otFeatures = activeTab?.settings?.otFeatures;
  const featureSettings = useMemo(() => {
    return buildFeatureSettings(otFeatures);
  }, [otFeatures]);

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

  // Extract settings; normalize legacy "trim"|"stretch" to orientation "top"
  const rawVerticalAlignment = activeTab?.settings?.verticalAlignment ?? "top";
  const verticalAlignment: "top" | "center" | "bottom" =
    rawVerticalAlignment === "top" ||
    rawVerticalAlignment === "center" ||
    rawVerticalAlignment === "bottom"
      ? (rawVerticalAlignment as "top" | "center" | "bottom")
      : "top";
  const verticalTrim =
    activeTab?.settings?.verticalTrim ?? activeTab?.settings?.verticalAlignment === "trim";
  const zoomToFit = activeTab?.settings?.zoomToFit ?? false;
  const externalText = activeTab?.settings?.text || "";

  // Initialize contentEditable content when tab changes or on mount
  useEffect(() => {
    if (!textRef.current || !activeTab) return;

    // Initialize with external text if element is empty or different
    const currentText = textRef.current.textContent || "";
    if (currentText !== externalText) {
      textRef.current.textContent = externalText;
      lastExternalTextRef.current = externalText;
    }
  }, [activeTab, externalText]); // Only run when tab changes or external text changes

  // Sync external text changes to contentEditable (only when not typing)
  // This handles external updates (font load, reset, etc.) without interfering with user typing
  useEffect(() => {
    if (!textRef.current || isUserTypingRef.current) return;

    const currentText = textRef.current.textContent || "";
    // Only update if the external text is different from what's in the element
    // and it's actually a change from an external source (not from our own update)
    if (externalText !== currentText && externalText !== lastExternalTextRef.current) {
      // Save caret position before updating
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }

      // Update content
      textRef.current.textContent = externalText;
      lastExternalTextRef.current = externalText;

      // Restore caret position if we had one
      if (savedRange && selection) {
        try {
          // Try to restore the original range
          if (textRef.current.contains(savedRange.startContainer)) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          } else {
            // If original range is invalid, set cursor to end
            const textNode = textRef.current.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              const endOffset = textNode.textContent?.length || 0;
              const newRange = document.createRange();
              newRange.setStart(textNode, endOffset);
              newRange.setEnd(textNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        } catch {
          // If restoration fails, cursor will be at start (browser default)
        }
      }
    } else if (externalText === currentText) {
      // Update ref even if text matches to track external changes
      lastExternalTextRef.current = externalText;
    }
  }, [externalText]); // Include activeTab.id to reset on tab change

  // Auto-Fit: use hidden measuring clone with explicit width so text wraps; then apply result.
  const calculateOptimalFontSize = useCallback(() => {
    if (!textRef.current || !containerRef.current || !activeTab || !fontName) return;
    if (!zoomToFit) return;

    const element = textRef.current;
    const container = containerRef.current;
    const textContent = externalText.trim();
    if (!textContent) return;

    const containerStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
    const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
    const availableWidth = container.clientWidth - paddingLeft - paddingRight;
    const availableHeight = container.clientHeight - paddingTop - paddingBottom;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const { lineHeight, letterSpacing } = activeTab.settings;
    const verticalTrim =
      activeTab.settings.verticalTrim ?? activeTab.settings.verticalAlignment === "trim";
    // Match the clone's text-wrap to the live view so line breaks (and fit) are the same
    const textWrap = "stable";
    const cloneResult = calculateAutoFitFontSize(
      availableWidth,
      availableHeight,
      textContent,
      getCanvasFontStack(fontName),
      lineHeight,
      letterSpacing,
      1.0,
      verticalTrim,
      textWrap
    );

    // Minimum auto-fit size so very long text doesn't go unreadably small; overflow will show scrollbar
    const MIN_AUTOFIT_FONT_SIZE = 10;

    // Use live element overflow as trigger: step up from clone result until we overflow, then use last size that fit
    let bestFit = Math.max(MIN_AUTOFIT_FONT_SIZE, Math.round(cloneResult));
    element.style.fontSize = `${bestFit}px`;
    const maxStep = Math.min(100, Math.max(20, Math.ceil(availableHeight / 10)));
    for (let step = 1; step <= maxStep; step++) {
      const candidate = bestFit + 1;
      if (candidate > availableHeight) break;
      element.style.fontSize = `${candidate}px`;
      const overflowsVertical = element.scrollHeight > availableHeight;
      const overflowsHorizontal = element.scrollWidth > availableWidth;
      if (overflowsVertical || overflowsHorizontal) {
        element.style.fontSize = `${bestFit}px`;
        break;
      }
      bestFit = candidate;
    }

    const rounded = Math.max(MIN_AUTOFIT_FONT_SIZE, bestFit);
    const currentSize = parseFloat(window.getComputedStyle(element).fontSize);
    if (Math.abs(currentSize - rounded) >= 0.5) {
      element.style.fontSize = `${rounded}px`;
    }
    if (Math.abs(activeTab.settings.fontSize - rounded) > 1) {
      lastAutoFitSizeRef.current = rounded;
      updateTabSettings(activeTab.id, { fontSize: rounded });
    }
  }, [zoomToFit, externalText, activeTab, fontName, updateTabSettings]);

  // Apply styles (separate from font loading for performance)
  useEffect(() => {
    if (!textRef.current || !fontId || !activeTab) return;

    const element = textRef.current;
    const container = containerRef.current || element.parentElement;
    if (!container) return;

    const { fontSize, letterSpacing, lineHeight, alignment, direction, textTransform, color } =
      activeTab.settings;

    // Apply styles
    // IMPORTANT: Set direction first to ensure text input works correctly
    element.style.direction = direction;
    // Font size will be set conditionally below based on zoomToFit
    element.style.letterSpacing = `${letterSpacing / 1000}em`;
    element.style.lineHeight = lineHeight.toString();
    element.style.textAlign = alignment;
    element.style.whiteSpace = "pre-wrap";
    element.style.textWrap = "stable";

    // Handle small-caps specially (use font-variant-caps instead of text-transform)
    if (textTransform === "small-caps") {
      element.style.textTransform = "none";
      element.style.fontVariantCaps = "small-caps";
    } else {
      element.style.textTransform = textTransform;
      element.style.fontVariantCaps = "normal";
    }

    element.style.color = oklchToCss(color);

    // Ensure container maintains column direction (critical for text direction)
    container.style.flexDirection = "column";

    // Vertical trim: text-box-trim (cap alphabetic) for tighter line box; independent of orientation
    if (verticalTrim) {
      element.style.setProperty("text-box", "trim-both cap alphabetic");
    } else {
      element.style.removeProperty("text-box");
    }

    // Orientation (top/center/bottom)
    element.style.height = "auto";
    element.style.width = "100%";
    if (verticalAlignment === "top") {
      container.style.alignItems = "flex-start";
      container.style.justifyContent = "flex-start";
    } else if (verticalAlignment === "center") {
      container.style.alignItems = "center";
      container.style.justifyContent = "center";
    } else if (verticalAlignment === "bottom") {
      container.style.alignItems = "flex-end";
      container.style.justifyContent = "flex-end";
    }

    // Auto-fit: run only when zoomToFit is on and this effect wasn't triggered by our own fontSize update (avoids bounce loop)
    if (zoomToFit) {
      const skipRun =
        lastAutoFitSizeRef.current !== null &&
        activeTab.settings.fontSize === lastAutoFitSizeRef.current;
      if (skipRun) {
        lastAutoFitSizeRef.current = null;
      } else {
        requestAnimationFrame(() => {
          calculateOptimalFontSize();
        });
      }
    } else {
      lastAutoFitSizeRef.current = null;
      element.style.fontSize = `${fontSize}px`;
    }

    // Apply variable font settings
    if (variationSettings) {
      element.style.fontVariationSettings = variationSettings;
    } else {
      element.style.fontVariationSettings = "";
    }

    // Apply OpenType features (always set, even if 'normal')
    element.style.fontFeatureSettings = featureSettings;
  }, [
    fontId,
    activeTab,
    variationSettings,
    featureSettings,
    verticalAlignment,
    verticalTrim,
    zoomToFit,
    calculateOptimalFontSize,
  ]);

  // Handle resize events for auto-fit (debounced to avoid reflow flicker from repeated recalc)
  useEffect(() => {
    if (!zoomToFit || !textRef.current || !containerRef.current || !activeTab) return;

    const scheduleRecalc = () => {
      if (autoFitResizeDebounceRef.current) clearTimeout(autoFitResizeDebounceRef.current);
      autoFitResizeDebounceRef.current = setTimeout(() => {
        autoFitResizeDebounceRef.current = null;
        requestAnimationFrame(() => {
          calculateOptimalFontSize();
        });
      }, AUTO_FIT_DEBOUNCE_MS);
    };

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(scheduleRecalc);
    resizeObserver.observe(container);
    window.addEventListener("resize", scheduleRecalc);

    return () => {
      if (autoFitResizeDebounceRef.current) {
        clearTimeout(autoFitResizeDebounceRef.current);
        autoFitResizeDebounceRef.current = null;
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleRecalc);
    };
  }, [zoomToFit, activeTab, calculateOptimalFontSize]);

  if (!activeTab) {
    return (
      <div className={styles.emptyState}>
        <p>No font loaded</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.plainView}>
      <div
        ref={textRef}
        role="textbox"
        tabIndex={0}
        contentEditable
        suppressContentEditableWarning
        className={styles.textContent}
        data-zoom-to-fit={zoomToFit ? "true" : undefined}
        onInput={(e) => {
          isUserTypingRef.current = true;
          const text = e.currentTarget.textContent || "";
          updateTabSettings(activeTab.id, { text });
          lastExternalTextRef.current = text;
          requestAnimationFrame(() => {
            isUserTypingRef.current = false;
            if (zoomToFit) calculateOptimalFontSize();
          });
        }}
        onBlur={() => {
          // Ensure state is synced on blur
          if (textRef.current) {
            const text = textRef.current.textContent || "";
            if (text !== externalText) {
              updateTabSettings(activeTab.id, { text });
              lastExternalTextRef.current = text;
            }
          }
          isUserTypingRef.current = false;
        }}
      />
    </div>
  );
}

export const PlainView = memo(PlainViewComponent);
