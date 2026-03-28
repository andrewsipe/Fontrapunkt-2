/**
 * Empty state when no font is loaded.
 * Hero ("Fontrapunkt" in one random font, click to load), Open Font / Restore Session, drag hint.
 * Drag-and-drop uses the shared DropZone overlay (content stays on canvas).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useFontLoader } from "../../../hooks/useFontLoader";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/shared.module.css";
import type { FontInfo } from "../../../utils/dynamicFontLoader";
import { loadFontForDisplay, loadFontIntoApp } from "../../../utils/dynamicFontLoader";
import { FileUp, History } from "../../../utils/icons";
import styles from "./EmptyState.module.css";
import { HeroTitle } from "./HeroTitle";

export function EmptyState() {
  const restoreSession = useFontStore((state) => state.restoreSession);
  const addFont = useFontStore((state) => state.addFont);
  const setCurrentFont = useFontStore((state) => state.setCurrentFont);
  const addTab = useUIStore((state) => state.addTab);
  const getNewTabSettings = useUIStore((state) => state.getNewTabSettings);
  const { loading, loadFont } = useFontLoader();
  const [isRestoring, setIsRestoring] = useState(false);
  const [displayFont, setDisplayFont] = useState<FontInfo | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontLoading, setFontLoading] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroToastIdRef = useRef<string | null>(null);

  const handleHeroMouseEnter = useCallback(() => {
    if (!displayFont || heroToastIdRef.current != null) return;
    const label = [displayFont.name, displayFont.provider].filter(Boolean).join(" · ");
    heroToastIdRef.current = toast(label, { duration: Infinity });
  }, [displayFont]);

  const handleHeroMouseLeave = useCallback(() => {
    if (heroToastIdRef.current != null) {
      toast.dismiss(heroToastIdRef.current);
      heroToastIdRef.current = null;
    }
  }, []);

  const handleOpenFont = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const cachedFont = await loadFont(file);
      if (cachedFont) {
        await addFont(cachedFont);
        setCurrentFont(cachedFont.id);
        const { v4: uuidv4 } = await import("uuid");
        const tabId = uuidv4();
        const axisValues: Record<string, number> = {};
        if (cachedFont.isVariable && cachedFont.axes) {
          cachedFont.axes.forEach((axis) => {
            axisValues[axis.tag] = axis.default;
          });
        }
        const newTabSettings = getNewTabSettings(axisValues);
        if (newTabSettings.text && cachedFont) {
          const { filterToAvailableGlyphs } = await import("../../../utils/glyphUtils");
          newTabSettings.text = filterToAvailableGlyphs(newTabSettings.text, cachedFont);
        }
        addTab({
          id: tabId,
          fontId: cachedFont.id,
          fontName: cachedFont.name,
          isVariable: cachedFont.isVariable ?? false,
          settings: newTabSettings,
        });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [loadFont, addFont, setCurrentFont, addTab, getNewTabSettings]
  );

  useEffect(() => {
    let mounted = true;
    async function loadOneRandomFont() {
      try {
        setFontLoading(true);
        const { getRandomFont } = await import("../../../utils/dynamicFontLoader");
        const randomFontName = await getRandomFont();
        if (!randomFontName || !mounted) return;
        const result = await loadFontForDisplay(randomFontName);
        if (!mounted) return;
        setDisplayFont(result.success && result.fontInfo ? result.fontInfo : null);
        setFontLoaded(true);
      } catch (error) {
        console.error("[EmptyState] Error loading random font:", error);
        if (mounted) setFontLoaded(true);
      } finally {
        if (mounted) setFontLoading(false);
      }
    }
    loadOneRandomFont();
    return () => {
      mounted = false;
    };
  }, []);

  const handleHeroClick = useCallback(async () => {
    const fontInfo = displayFont;
    if (!fontInfo || fontLoading) return;
    try {
      setIsBlurring(true);
      setFontLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const cachedFont = await loadFontIntoApp(fontInfo.name);
      if (cachedFont) {
        await addFont(cachedFont);
        setCurrentFont(cachedFont.id);
        const { v4: uuidv4 } = await import("uuid");
        const tabId = uuidv4();
        const axisValues: Record<string, number> = {};
        if (cachedFont.isVariable && cachedFont.axes) {
          cachedFont.axes.forEach((axis) => {
            axisValues[axis.tag] = axis.default;
          });
        }
        const newTabSettings = getNewTabSettings(axisValues);
        if (newTabSettings.text && cachedFont) {
          const { filterToAvailableGlyphs } = await import("../../../utils/glyphUtils");
          newTabSettings.text = filterToAvailableGlyphs(newTabSettings.text, cachedFont);
        }
        addTab({
          id: tabId,
          fontId: cachedFont.id,
          fontName: cachedFont.name,
          isVariable: cachedFont.isVariable ?? false,
          settings: newTabSettings,
        });
      }
    } catch (error) {
      console.error("[EmptyState] Failed to load font into app:", error);
    } finally {
      setFontLoading(false);
    }
  }, [displayFont, fontLoading, addFont, setCurrentFont, addTab, getNewTabSettings]);

  const handleRestoreSession = useCallback(async () => {
    setIsRestoring(true);
    try {
      const success = await restoreSession();
      if (!success) {
        toast.error("No previous session found or fonts are no longer cached.");
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      toast.error("Failed to restore session. Please try opening a font manually.");
    } finally {
      setIsRestoring(false);
    }
  }, [restoreSession]);

  return (
    <div className={styles.emptyState} data-empty-state="true">
      <input
        ref={fileInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,application/font-woff,font/woff2"
        onChange={handleFileChange}
        className={shared.visuallyHidden}
        disabled={loading}
      />

      <HeroTitle
        displayFont={displayFont}
        loaded={fontLoaded}
        loading={fontLoading}
        isBlurring={isBlurring}
        onLoadClick={handleHeroClick}
        onMouseEnter={handleHeroMouseEnter}
        onMouseLeave={handleHeroMouseLeave}
      />

      <div className={styles.footerActions}>
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleOpenFont}
            disabled={loading}
          >
            <FileUp size={18} aria-hidden />
            {loading ? "Loading…" : "Open Font File"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleRestoreSession}
            disabled={isRestoring}
          >
            <History size={18} aria-hidden />
            {isRestoring ? "Restoring…" : "Restore Session"}
          </button>
        </div>
        <p className={styles.dragHint}>or drop a font file anywhere</p>
      </div>
    </div>
  );
}
