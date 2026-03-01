/**
 * Font Selector component
 * Shows currently loaded font and allows opening new fonts
 */

import { useEffect, useRef, useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import sharedUtils from "../../../styles/shared.module.css";
import shared from "../../../styles/sidebar/SidebarShared.module.css";
import { LivePulseIcon, type LiveSyncState } from "../../components/LivePulseIcon";
import { TooltipButton } from "../../components/Tooltip/TooltipButton";
import sidebarStyles from "../../containers/Sidebar/Sidebar.module.css";
import { CloseButton } from "../Button/CloseButton";
import styles from "./FontSelector.module.css";

export function FontSelector() {
  const fontName = useFontStore((state) => state.getFontName());
  const fontId = useFontStore((state) => state.currentFontId);
  const fileName = useFontStore((state) => state.getFontFileName());
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const featureDetails = useFontStore((state) => state.getFontFeatureDetails());
  const featureTags = useFontStore((state) => state.getFontFeatures());
  const setCurrentFont = useFontStore((state) => state.setCurrentFont);
  const removeFont = useFontStore((state) => state.removeFont);
  const addFont = useFontStore((state) => state.addFont);
  const addTab = useUIStore((state) => state.addTab);
  const getNewTabSettings = useUIStore((state) => state.getNewTabSettings);
  const openModal = useUIStore((state) => state.openModal);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [syncState, setSyncState] = useState<LiveSyncState>("inactive");

  const handleOpenFont = async () => {
    setLoading(true);

    try {
      // Always try to use File System Access API for automatic live watch
      if (typeof window !== "undefined" && "showOpenFilePicker" in window) {
        const [fileHandle] = await window.showOpenFilePicker!({
          types: [
            {
              description: "Font files",
              accept: {
                "font/ttf": [".ttf"],
                "font/otf": [".otf"],
                "font/woff": [".woff"],
                "font/woff2": [".woff2"],
              },
            },
          ],
          multiple: false,
        });

        if (!fileHandle || fileHandle.kind !== "file") {
          setLoading(false);
          return;
        }

        const file = await fileHandle.getFile();
        const { loadFontFile, startLiveWatch } = await import("../../../engine/FontLoader");
        const cachedFont = await loadFontFile(file, fileHandle);

        if (cachedFont) {
          await addFont(cachedFont, file.name);
          setCurrentFont(cachedFont.id);

          // Automatically start live watch
          startLiveWatch((reloadedFont) => {
            // Preserve axis values and update font
            addFont(reloadedFont, file.name);
          });

          // Create a new tab for this font
          const { v4: uuidv4 } = await import("uuid");
          const tabId = uuidv4();

          // Initialize axis values from font axes
          const axisValues: Record<string, number> = {};
          if (cachedFont.isVariable && cachedFont.axes) {
            cachedFont.axes.forEach((axis) => {
              axisValues[axis.tag] = axis.default;
            });
          }

          // Get settings from active tab or defaults
          const newTabSettings = getNewTabSettings(axisValues);

          // Filter text to only include glyphs available in new font
          if (newTabSettings.text && cachedFont) {
            const { filterToAvailableGlyphs } = await import("../../../utils/glyphUtils");
            newTabSettings.text = filterToAvailableGlyphs(newTabSettings.text, cachedFont);
          }

          addTab({
            id: tabId,
            fontId: cachedFont.id,
            fontName: cachedFont.name,
            isVariable: cachedFont.isVariable || false,
            settings: newTabSettings,
          });
        }
      } else {
        // Fallback to regular file input if File System Access API not available
        fileInputRef.current?.click();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to open file:", error);
        // Fallback to regular file input
        fileInputRef.current?.click();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Regular file input - no handle available, so no live watch
      const { loadFontFile } = await import("../../../engine/FontLoader");
      const cachedFont = await loadFontFile(file);

      if (cachedFont) {
        await addFont(cachedFont, file.name);
        setCurrentFont(cachedFont.id);

        // Create a new tab for this font
        const { v4: uuidv4 } = await import("uuid");
        const tabId = uuidv4();

        // Initialize axis values from font axes
        const axisValues: Record<string, number> = {};
        if (cachedFont.isVariable && cachedFont.axes) {
          cachedFont.axes.forEach((axis) => {
            axisValues[axis.tag] = axis.default;
          });
        }

        // Get settings from active tab or defaults
        const newTabSettings = getNewTabSettings(axisValues);

        // Filter text to only include glyphs available in new font
        if (newTabSettings.text && cachedFont) {
          const { filterToAvailableGlyphs } = await import("../../../utils/glyphUtils");
          newTabSettings.text = filterToAvailableGlyphs(newTabSettings.text, cachedFont);
        }

        addTab({
          id: tabId,
          fontId: cachedFont.id,
          fontName: cachedFont.name,
          isVariable: cachedFont.isVariable || false,
          settings: newTabSettings,
        });
      }
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScrollToPanel = (panelId: string) => {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!fontId || !fileName) {
      setSyncState("inactive");
      return;
    }

    const checkWatchStatus = async () => {
      try {
        const { getWatchStatus } = await import("../../../engine/FontLoader");
        const status = getWatchStatus();
        const isCurrentFont = status.fileName === fileName;

        if (!isCurrentFont || !status.hasHandle) {
          setSyncState("inactive");
          return;
        }

        // Determine state: active, failed, or inactive
        if (status.isWatching) {
          setSyncState("active");
        } else if (status.syncError) {
          setSyncState("failed");
        } else {
          setSyncState("inactive");
        }
      } catch (error) {
        console.error("[FontSelector] Error checking watch status:", error);
        setSyncState("inactive");
      }
    };

    // Check immediately
    checkWatchStatus();

    // Listen for font-reloaded events to update status
    const handleFontReloaded = () => {
      checkWatchStatus();
    };

    window.addEventListener("font-reloaded", handleFontReloaded as EventListener);

    // Poll periodically to ensure status is up-to-date
    const interval = setInterval(checkWatchStatus, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("font-reloaded", handleFontReloaded as EventListener);
    };
  }, [fontId, fileName]);

  const hasOpenTypeFeatures = (featureDetails?.length ?? 0) > 0 || (featureTags?.length ?? 0) > 0;

  if (!fontId || !fontName) {
    return (
      <div className={`${sidebarStyles.sidebarPanel} ${styles.fontSelector}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,application/font-woff,font/woff2"
          onChange={handleFileChange}
          className={sharedUtils.visuallyHidden}
          disabled={loading}
        />
        <button
          type="button"
          className={`${shared.button} ${styles.openButton}`}
          onClick={handleOpenFont}
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Font"}
        </button>
      </div>
    );
  }

  return (
    <div className={`${sidebarStyles.sidebarPanel} ${styles.fontSelector}`}>
      <div className={styles.fontInfoButtonWrapper}>
        <button
          type="button"
          className={`${shared.button} ${styles.fontInfoButton}`}
          onClick={() => openModal("fontDetails")}
          aria-label="View font information"
        >
          <div className={styles.fontInfo}>
            <LivePulseIcon state={syncState} />
            <span className={styles.fontName}>{fontName}</span>
          </div>
        </button>
        <CloseButton
          tooltip="Close font"
          ariaLabel="Close font"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            removeFont(fontId);
            setCurrentFont(null);
          }}
          className={styles.closeButton}
          fontSize="sm"
        />
      </div>
      {(isVariable || hasOpenTypeFeatures) && (
        <div className={styles.badgeRow}>
          {isVariable && (
            <TooltipButton
              tooltip="Scroll to Variable Axes panel"
              className={styles.badge}
              onClick={() => handleScrollToPanel("variable-axes-panel")}
              aria-label="Scroll to Variable Axes panel"
            >
              VF
            </TooltipButton>
          )}
          {hasOpenTypeFeatures && (
            <TooltipButton
              tooltip="Scroll to OpenType Features panel"
              className={styles.badge}
              onClick={() => handleScrollToPanel("opentype-features-panel")}
              aria-label="Scroll to OpenType Features panel"
            >
              OT
            </TooltipButton>
          )}
        </div>
      )}
    </div>
  );
}
