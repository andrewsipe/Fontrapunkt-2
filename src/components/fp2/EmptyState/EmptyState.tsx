/**
 * EmptyState — fp2
 * Landing page shown when no font is loaded.
 * Token-based styling, uses react-hot-toast.
 */

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useFontLoader } from "../../../hooks/useFontLoader";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/shared.module.css";
import toastStyles from "../../../styles/toasts.module.css";
import {
  type FontInfo,
  loadFontForDisplay,
  loadFontIntoApp,
} from "../../../utils/dynamicFontLoader";
import { InfoButton } from "../../features/Button/InfoButton";
import { SettingsButton } from "../../features/Button/SettingsButton";
import styles from "./EmptyState.module.css";
import { HeroTitle } from "./HeroTitle";

export function EmptyState() {
  const openModal = useUIStore((state) => state.openModal);
  const restoreSession = useFontStore((state) => state.restoreSession);
  const addFont = useFontStore((state) => state.addFont);
  const setCurrentFont = useFontStore((state) => state.setCurrentFont);
  const addTab = useUIStore((state) => state.addTab);
  const getNewTabSettings = useUIStore((state) => state.getNewTabSettings);
  const { loading, loadFont } = useFontLoader();
  const [isRestoring, setIsRestoring] = useState(false);
  const [characterFonts, setCharacterFonts] = useState<(FontInfo | null)[]>([]);
  const [fontLoading, setFontLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const charRefs = useRef<(HTMLSpanElement | HTMLButtonElement | null)[]>([]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentToastIdRef = useRef<string | null>(null);

  const handleOpenFont = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        isVariable: cachedFont.isVariable || false,
        settings: newTabSettings,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenSettings = () => {
    openModal("settings");
  };

  const handleOpenInfo = () => {
    openModal("fontInfo");
  };

  const handleCharacterHover = (charIndex: number) => {
    const fontInfo = characterFonts[charIndex];
    if (!fontInfo || fontLoading) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
      }

      const toastId = toast(
        <div className={shared.standardToast}>
          <div className={toastStyles.toastTitle}>{fontInfo.name}</div>
          <div className={toastStyles.toastSubtext}>via {fontInfo.provider}</div>
        </div>,
        {
          duration: 2000,
          id: `font-${charIndex}`,
        }
      );

      currentToastIdRef.current = toastId as string;
    }, 300);
  };

  const handleCharacterHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadRandomFonts() {
      try {
        setFontLoading(true);

        const titleText = "Fontrapunkt";
        const characters = titleText.split("");
        const nonSpaceIndices: number[] = [];
        characters.forEach((char, index) => {
          if (char !== " ") {
            nonSpaceIndices.push(index);
          }
        });

        const { getRandomFont } = await import("../../../utils/dynamicFontLoader");
        const randomFontName = await getRandomFont();

        if (!randomFontName || !mounted) {
          return;
        }

        const result = await loadFontForDisplay(randomFontName);

        if (!mounted) return;

        const fonts: (FontInfo | null)[] = new Array(characters.length).fill(null);

        if (result.success && result.fontInfo) {
          nonSpaceIndices.forEach((charIndex) => {
            fonts[charIndex] = result.fontInfo;
          });
        }

        setCharacterFonts(fonts);
        setFontsLoaded(true);
      } catch (error) {
        console.error("[EmptyState] Error loading random fonts:", error);
        if (mounted) {
          const titleText = "Fontrapunkt";
          setCharacterFonts(new Array(titleText.length).fill(null));
          setFontsLoaded(true);
        }
      } finally {
        if (mounted) {
          setFontLoading(false);
        }
      }
    }

    loadRandomFonts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCharacterClick = async (charIndex: number) => {
    const fontInfo = characterFonts[charIndex];
    if (!fontInfo || fontLoading) return;

    try {
      setIsBlurring(true);
      setFontLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1200));

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
          isVariable: cachedFont.isVariable || false,
          settings: newTabSettings,
        });
      }
    } catch (error) {
      console.error("[EmptyState] Failed to load font into app:", error);
    } finally {
      setFontLoading(false);
    }
  };

  const handleRestoreSession = async () => {
    setIsRestoring(true);
    try {
      const success = await restoreSession();
      if (success) {
        console.log("Session restored successfully");
      } else {
        toast.error("No previous session found or fonts are no longer cached.");
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      toast.error("Failed to restore session. Please try opening a font manually.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={styles.emptyState}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,application/font-woff,font/woff2"
        onChange={handleFileChange}
        className={shared.visuallyHidden}
        disabled={loading}
      />

      <HeroTitle
        characterFonts={characterFonts}
        fontsLoaded={fontsLoaded}
        fontLoading={fontLoading}
        isBlurring={isBlurring}
        charRefs={charRefs}
        titleRef={titleRef}
        onCharacterClick={handleCharacterClick}
        onCharacterHover={handleCharacterHover}
        onCharacterHoverEnd={handleCharacterHoverEnd}
        titleText="Fontrapunkt"
      />

      <div className={styles.footerActions}>
        <div className={styles.actionsSection}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleOpenFont}
            disabled={loading}
          >
            {loading ? "Loading..." : "Open Font File"}
          </button>
          <p className={styles.dragHint}>or drag and drop a font file anywhere</p>
          <button
            type="button"
            className={styles.secondaryLink}
            onClick={handleRestoreSession}
            disabled={isRestoring}
          >
            {isRestoring ? "Restoring..." : "Restore Session"}
          </button>
        </div>
        <div className={styles.iconButtons}>
          <SettingsButton
            onClick={handleOpenSettings}
            className={styles.iconButton}
            fontSize="base"
          />
          <InfoButton onClick={handleOpenInfo} className={styles.iconButton} fontSize="base" />
        </div>
      </div>
    </div>
  );
}
