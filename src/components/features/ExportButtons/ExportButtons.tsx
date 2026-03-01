/**
 * Export Buttons component
 * CSS copy, screenshot, video export
 */

import { useState } from "react";
import toast from "react-hot-toast";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/shared.module.css";
import toastStyles from "../../../styles/toasts.module.css";
import { oklchToHex } from "../../../utils/colorUtils";
import {
  captureScreenshot,
  copyToClipboard,
  generateCSS,
  generateScreenshotFilename,
} from "../../../utils/exportUtils";
import { Camera, FileBraces } from "../../../utils/icons";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import styles from "./ExportButtons.module.css";

export function ExportButtons() {
  const fontId = useFontStore((state) => state.currentFontId);
  const fontName = useFontStore((state) => state.getFontName());
  const namedVariations = useFontStore((state) => state.getFontNamedVariations()) ?? [];
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const axes = useFontStore((state) => state.getFontAxes());
  const activeTab = useUIStore((state) => state.getActiveTab());
  const viewMode = useUIStore((state) => state.viewMode);
  const openModal = useUIStore((state) => state.openModal);
  const setScreenshotData = useUIStore((state) => state.setScreenshotData);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCopyCSS = async () => {
    if (!fontId || !activeTab) return;
    const currentFont = useFontStore.getState().getCurrentFont();
    if (!currentFont) return;

    let css = "";

    if (viewMode === "styles" && namedVariations.length > 0) {
      css = namedVariations
        .map((variation) => {
          const instanceCSS = generateCSS(currentFont, {
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

          // Replace the generic class name with the instance name
          return instanceCSS.replace(
            ".my-text",
            `.${variation.name.replace(/\s+/g, "-").toLowerCase()}`
          );
        })
        .join("\n\n");
    } else {
      // Default behavior: copy current font settings
      // Get enabled OpenType features
      const enabledFeatures = Object.entries(activeTab.settings.otFeatures || {})
        .filter(([, enabled]) => enabled)
        .map(([tag]) => tag);

      // Get axis variations
      const variations: Record<string, number> = {};
      if (isVariable && axes?.length) {
        axes.forEach((axis) => {
          variations[axis.tag] = axis.current;
        });
      }

      css = generateCSS(currentFont, {
        variations,
        features: enabledFeatures,
        fontSize: activeTab.settings.fontSize,
        lineHeight: activeTab.settings.lineHeight,
        letterSpacing: activeTab.settings.letterSpacing,
        color: activeTab.settings.color
          ? `oklch(${activeTab.settings.color.l * 100}% ${activeTab.settings.color.c} ${activeTab.settings.color.h})`
          : undefined,
      });
    }

    const success = await copyToClipboard(css);
    if (success) {
      // Show toast with CSS snippet preview
      toast.success(
        () => (
          <div className={shared.standardToast}>
            <div className={toastStyles.toastTitle}>CSS saved to clipboard</div>
            <pre className={toastStyles.toastPre}>{css}</pre>
          </div>
        ),
        {
          duration: 5000,
        }
      );
    } else {
      toast.error("Failed to copy CSS to clipboard");
    }
  };

  const handleScreenshot = async () => {
    if (!activeTab || !fontId) return;

    // Set loading state immediately to prevent double-clicks
    setIsCapturing(true);

    const canvasElement =
      (window as Window & { __fontCanvasRef?: HTMLElement }).__fontCanvasRef ||
      (document.querySelector('[data-font-canvas="true"]') as HTMLElement);

    if (!canvasElement) {
      console.error("Could not find canvas element");
      setIsCapturing(false);
      return;
    }

    try {
      // Use activeTab's backgroundColor for screenshot (respects user's canvas theme/color choice)
      const backgroundColor = oklchToHex(activeTab.settings.backgroundColor);
      const result = await captureScreenshot(canvasElement, backgroundColor);

      if (!result) {
        toast.error("Failed to capture screenshot");
        setIsCapturing(false);
        return;
      }

      // Generate filename with font name
      const filename = generateScreenshotFilename(fontName ?? "font");

      // Create ObjectURL for preview
      const objectURL = URL.createObjectURL(result.blob);

      // Store screenshot data in UI store
      setScreenshotData({
        blob: result.blob,
        objectURL,
        filename,
      });

      // Open preview modal
      openModal("screenshotPreview");
    } catch (error) {
      console.error("[Screenshot] Error in handleScreenshot:", error);
      toast.error("Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!fontId || !activeTab) {
    return null;
  }

  return (
    <div className={styles.exportButtons}>
      <button
        type="button"
        className={styles.exportButton}
        onClick={handleCopyCSS}
        aria-label="Copy CSS code"
      >
        <IconContainer icon={FileBraces} variant="static" fontSize="base" />
        Copy CSS Code
      </button>
      <button
        type="button"
        className={styles.exportButton}
        onClick={handleScreenshot}
        disabled={isCapturing}
        aria-label="Take screenshot"
      >
        <IconContainer icon={Camera} variant="static" fontSize="base" />
        {isCapturing ? "Capturing..." : "Screenshot"}
      </button>
    </div>
  );
}
