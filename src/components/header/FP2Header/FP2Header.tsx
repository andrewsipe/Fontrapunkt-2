/**
 * Fontrapunkt 2.0 — Header
 * Font name, VF/OT badges, FileUp, BookA, Settings, glyph count, views strip.
 */

import * as Toggle from "@base-ui/react/toggle";
import * as ToggleGroup from "@base-ui/react/toggle-group";
import { useRef } from "react";
import { useFontLoader } from "../../../hooks/useFontLoader";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/shared.module.css";
import type { ViewMode } from "../../../types/font.types";
import { BookOpen, FileText, Settings, Upload } from "../../../utils/icons";
import { Icon } from "../../primitives/Icon/Icon";
import styles from "./FP2Header.module.css";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "plain", label: "Plain" },
  { id: "waterfall", label: "Waterfall" },
  { id: "styles", label: "Styles" },
  { id: "glyphs", label: "Glyphs" },
  { id: "present", label: "Present" },
];

export function FP2Header() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadFont } = useFontLoader();

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const openModal = useUIStore((state) => state.openModal);
  const setOpenVariableAxesDrawer = useUIStore((state) => state.setOpenVariableAxesDrawer);
  const setOpenOpenTypeDrawer = useUIStore((state) => state.setOpenOpenTypeDrawer);
  const openVariableAxesDrawer = useUIStore((state) => state.openVariableAxesDrawer);
  const openOpenTypeDrawer = useUIStore((state) => state.openOpenTypeDrawer);
  const addTab = useUIStore((state) => state.addTab);
  const getNewTabSettings = useUIStore((state) => state.getNewTabSettings);

  const fontName = useFontStore((state) => state.getFontName());
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const hasFeatures = useFontStore((state) => {
    const features = state.getFontFeatures();
    return features != null && features.length > 0;
  });
  const glyphCount = useFontStore((state) => state.getFontGlyphCount());
  const addFont = useFontStore((state) => state.addFont);
  const setCurrentFont = useFontStore((state) => state.setCurrentFont);

  const handleFileUp = () => fileInputRef.current?.click();

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
        isVariable: cachedFont.isVariable ?? false,
        settings: newTabSettings,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <header className={styles.header}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        className={styles.hiddenInput}
        aria-hidden
        onChange={handleFileChange}
      />

      <div className={styles.left}>
        <div className={fontName ? styles.fontName : `${styles.fontName} ${styles.fontNameEmpty}`}>
          {fontName || "No font loaded"}
        </div>

        {isVariable && (
          <button
            type="button"
            className={
              openVariableAxesDrawer ? `${styles.badge} ${styles.badgeActive}` : styles.badge
            }
            onClick={() => setOpenVariableAxesDrawer(!openVariableAxesDrawer)}
            aria-pressed={openVariableAxesDrawer}
            aria-label="Variable font — toggle Variable Axes drawer"
          >
            VF
          </button>
        )}
        {hasFeatures && (
          <button
            type="button"
            className={openOpenTypeDrawer ? `${styles.badge} ${styles.badgeActive}` : styles.badge}
            onClick={() => setOpenOpenTypeDrawer(!openOpenTypeDrawer)}
            aria-pressed={openOpenTypeDrawer}
            aria-label="OpenType features — toggle OpenType drawer"
          >
            OT
          </button>
        )}

        <fieldset className={styles.iconGroup} aria-label="Header actions">
          <legend className={shared.visuallyHidden}>Header actions</legend>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleFileUp}
            aria-label="Upload font"
            title="Upload font"
          >
            <Icon icon={Upload} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => openModal("sampleText")}
            aria-label="Sample text"
            title="Sample text"
          >
            <Icon icon={FileText} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => openModal("fontDetails")}
            aria-label="Font metadata"
            title="Font metadata"
          >
            <Icon icon={BookOpen} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => openModal("settings")}
            aria-label="Settings"
            title="Settings"
          >
            <Icon icon={Settings} />
          </button>
        </fieldset>

        {fontName && (
          <span className={styles.glyphCount}>{glyphCount.toLocaleString()} glyphs</span>
        )}
      </div>

      <fieldset className={styles.viewsStrip} aria-label="View mode">
        <legend className={shared.visuallyHidden}>View mode</legend>
        <ToggleGroup.ToggleGroup
          value={[viewMode]}
          onValueChange={(value) => {
            const next = value[0] as ViewMode | undefined;
            if (next) setViewMode(next);
          }}
          orientation="horizontal"
          multiple={false}
          className={styles.viewsStripGroup}
        >
          {VIEW_MODES.map((mode) => (
            <Toggle.Toggle
              key={mode.id}
              value={mode.id}
              className={styles.viewButton}
              aria-label={`Switch to ${mode.label} view`}
            >
              {mode.label}
            </Toggle.Toggle>
          ))}
        </ToggleGroup.ToggleGroup>
      </fieldset>
    </header>
  );
}
