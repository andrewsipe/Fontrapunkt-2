/**
 * Fontrapunkt 2.0 — Floating Command Bar
 * Size, Weight, Alignment, Orientation, Case, SwatchBook (OKLCH), CSS Copy, Screenshot.
 */

import * as Toggle from "@base-ui/react/toggle";
import * as ToggleGroup from "@base-ui/react/toggle-group";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useFontStore } from "../../../stores/fontStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/shared.module.css";
import { oklchToHex } from "../../../utils/colorUtils";
import { copyToClipboard, generateCSS } from "../../../utils/exportUtils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Camera,
  FileBraces,
  SwatchBook,
  VerticalCenterAlignNeue,
} from "../../../utils/icons";
import { updateSliderFill } from "../../../utils/sliderFill";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../../../utils/themeUtils";
import { Popover } from "../../components/Popover";
import { OKLCHPickerPanel } from "../../features/OKLCHPicker/OKLCHPickerPanel";
import { Icon } from "../../primitives/Icon/Icon";
import styles from "./FloatingCommandBar.module.css";

const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 512;

export function FloatingCommandBar() {
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const openModal = useUIStore((state) => state.openModal);
  const setScreenshotData = useUIStore((state) => state.setScreenshotData);
  const [isCapturing, setIsCapturing] = useState(false);

  const fontId = useFontStore((state) => state.currentFontId);
  const axes = useFontStore((state) => state.getFontAxes());
  const updateAxisValue = useFontStore((state) => state.updateAxisValue);
  const getCurrentFont = useFontStore((state) => state.getCurrentFont);

  const settings = activeTab?.settings;
  const fontSize = settings?.fontSize ?? 72;
  const alignment = settings?.alignment ?? "left";
  const verticalAlignment =
    settings?.verticalAlignment === "top" ||
    settings?.verticalAlignment === "center" ||
    settings?.verticalAlignment === "bottom"
      ? settings.verticalAlignment
      : "top";
  const textTransform = settings?.textTransform ?? "none";

  const wghtAxis = axes?.find((a) => a.tag === "wght");
  const weightValue = wghtAxis?.current ?? 400;
  const weightMin = wghtAxis?.min ?? 100;
  const weightMax = wghtAxis?.max ?? 900;

  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const canvasTheme = useSettingsStore((s) => s.canvasTheme);
  const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
  const { color: defaultColor } = getDefaultCanvasColors(isDark);
  const currentColor = activeTab?.settings.color ?? defaultColor;

  const handleColorChange = useCallback(
    (color: { l: number; c: number; h: number }) => {
      if (!activeTab) return;
      updateTabSettings(activeTab.id, { color });
    },
    [activeTab, updateTabSettings]
  );

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeTab) return;
      const v = Math.round(Number(e.target.value));
      updateSliderFill(e.target, v, FONT_SIZE_MIN, FONT_SIZE_MAX);
      updateTabSettings(activeTab.id, { fontSize: v, zoomToFit: false });
    },
    [activeTab, updateTabSettings]
  );

  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fontId || !activeTab || !wghtAxis) return;
      const v = Number(e.target.value);
      updateSliderFill(e.target, v, weightMin, weightMax);
      updateAxisValue(fontId, "wght", v);
    },
    [fontId, activeTab, wghtAxis, weightMin, weightMax, updateAxisValue]
  );

  const sizeSliderRef = useRef<HTMLInputElement>(null);
  const weightSliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = sizeSliderRef.current;
    if (!el) return;
    updateSliderFill(el, fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX);
  }, [fontSize]);

  useEffect(() => {
    const el = weightSliderRef.current;
    if (!el || !wghtAxis) return;
    updateSliderFill(el, weightValue, weightMin, weightMax);
  }, [weightValue, weightMin, weightMax, wghtAxis]);

  const handleCopyCSS = useCallback(async () => {
    const font = getCurrentFont();
    if (!font || !activeTab) return;
    const variations: Record<string, number> = {};
    if (font.isVariable && font.axes?.length) {
      font.axes.forEach((axis) => {
        variations[axis.tag] = axis.current ?? axis.default;
      });
    }
    const features = Object.entries(activeTab.settings.otFeatures || {})
      .filter(([, en]) => en)
      .map(([tag]) => tag);
    const css = generateCSS(font, {
      variations,
      features,
      fontSize: activeTab.settings.fontSize,
      lineHeight: activeTab.settings.lineHeight,
      letterSpacing: activeTab.settings.letterSpacing,
    });
    const success = await copyToClipboard(css);
    if (success) toast.success("CSS copied to clipboard");
    else toast.error("Failed to copy CSS");
  }, [getCurrentFont, activeTab]);

  const handleScreenshot = useCallback(async () => {
    if (!activeTab) return;
    setIsCapturing(true);
    const canvasElement =
      (window as Window & { __fontCanvasRef?: HTMLElement }).__fontCanvasRef ??
      (document.querySelector('[data-font-canvas="true"]') as HTMLElement | null);
    if (!canvasElement) {
      toast.error("Could not find canvas to capture");
      setIsCapturing(false);
      return;
    }
    try {
      const { captureScreenshot, generateScreenshotFilename } = await import(
        "../../../utils/exportUtils"
      );
      const backgroundColor = oklchToHex(activeTab.settings.backgroundColor);
      const result = await captureScreenshot(canvasElement, backgroundColor);
      if (!result) {
        toast.error("Failed to capture screenshot");
        setIsCapturing(false);
        return;
      }
      const filename = generateScreenshotFilename(getCurrentFont()?.name);
      const objectURL = URL.createObjectURL(result.blob);
      setScreenshotData({ blob: result.blob, objectURL, filename });
      openModal("screenshotPreview");
    } catch (error) {
      console.error("[Screenshot]", error);
      toast.error("Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  }, [activeTab, getCurrentFont, openModal, setScreenshotData]);

  if (!activeTab) return null;

  return (
    <div className={styles.bar} role="toolbar" aria-label="Text and font controls">
      {/* Size */}
      <div className={styles.section}>
        <div className={styles.sliderWrap}>
          <div className={styles.sliderLabelRow}>
            <span className={styles.label}>Size</span>
            <span className={styles.sliderValue} aria-hidden>
              {fontSize}
            </span>
          </div>
          <input
            ref={sizeSliderRef}
            type="range"
            className={styles.slider}
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            value={fontSize}
            onChange={handleSizeChange}
            aria-label="Font size"
          />
        </div>
      </div>

      {/* Weight (only if variable with wght) */}
      {wghtAxis && (
        <div className={styles.section}>
          <div className={styles.sliderWrap}>
            <div className={styles.sliderLabelRow}>
              <span className={styles.label}>Weight</span>
              <span className={styles.sliderValue} aria-hidden>
                {Math.round(weightValue)}
              </span>
            </div>
            <input
              ref={weightSliderRef}
              type="range"
              className={styles.slider}
              min={weightMin}
              max={weightMax}
              step={1}
              value={weightValue}
              onChange={handleWeightChange}
              aria-label="Font weight"
            />
          </div>
        </div>
      )}

      <div className={styles.sectionDivider} aria-hidden />

      {/* Alignment */}
      <fieldset className={styles.section} aria-label="Text alignment">
        <legend className={shared.visuallyHidden}>Text alignment</legend>
        <ToggleGroup.ToggleGroup
          value={[alignment]}
          onValueChange={(v) => {
            const next = v[0] as "left" | "center" | "right" | undefined;
            if (next) updateTabSettings(activeTab.id, { alignment: next });
          }}
          multiple={false}
          className={styles.toggleGroup}
        >
          <Toggle.Toggle value="left" className={styles.toggleBtn} aria-label="Align left">
            <Icon icon={AlignLeft} />
          </Toggle.Toggle>
          <Toggle.Toggle value="center" className={styles.toggleBtn} aria-label="Align center">
            <Icon icon={AlignCenter} />
          </Toggle.Toggle>
          <Toggle.Toggle value="right" className={styles.toggleBtn} aria-label="Align right">
            <Icon icon={AlignRight} />
          </Toggle.Toggle>
        </ToggleGroup.ToggleGroup>
      </fieldset>

      {/* Orientation */}
      <fieldset className={styles.section} aria-label="Vertical alignment">
        <legend className={shared.visuallyHidden}>Vertical alignment</legend>
        <ToggleGroup.ToggleGroup
          value={[verticalAlignment]}
          onValueChange={(v) => {
            const next = v[0] as "top" | "center" | "bottom" | undefined;
            if (next) updateTabSettings(activeTab.id, { verticalAlignment: next });
          }}
          multiple={false}
          className={styles.toggleGroup}
        >
          <Toggle.Toggle value="top" className={styles.toggleBtn} aria-label="Align to top">
            <Icon icon={ArrowUpToLine} />
          </Toggle.Toggle>
          <Toggle.Toggle value="center" className={styles.toggleBtn} aria-label="Align center">
            <Icon icon={VerticalCenterAlignNeue} />
          </Toggle.Toggle>
          <Toggle.Toggle value="bottom" className={styles.toggleBtn} aria-label="Align to bottom">
            <Icon icon={ArrowDownToLine} />
          </Toggle.Toggle>
        </ToggleGroup.ToggleGroup>
      </fieldset>

      {/* Case */}
      <fieldset className={styles.section} aria-label="Text case">
        <legend className={shared.visuallyHidden}>Text case</legend>
        <ToggleGroup.ToggleGroup
          value={[
            textTransform === "uppercase"
              ? "uppercase"
              : textTransform === "lowercase"
                ? "lowercase"
                : "none",
          ]}
          onValueChange={(v) => {
            const next = v[0] as "none" | "uppercase" | "lowercase" | undefined;
            if (next !== undefined)
              updateTabSettings(activeTab.id, {
                textTransform:
                  next === "none" ? "none" : next === "uppercase" ? "uppercase" : "lowercase",
              });
          }}
          multiple={false}
          className={styles.toggleGroup}
        >
          <Toggle.Toggle
            value="uppercase"
            className={`${styles.toggleBtn} ${styles.toggleBtnDark}`}
            aria-label="Uppercase"
          >
            AB
          </Toggle.Toggle>
          <Toggle.Toggle
            value="none"
            className={`${styles.toggleBtn} ${styles.toggleBtnDark}`}
            aria-label="Default case"
          >
            Aa
          </Toggle.Toggle>
          <Toggle.Toggle
            value="lowercase"
            className={`${styles.toggleBtn} ${styles.toggleBtnDark}`}
            aria-label="Lowercase"
          >
            ab
          </Toggle.Toggle>
        </ToggleGroup.ToggleGroup>
      </fieldset>

      <div className={styles.sectionDivider} aria-hidden />

      {/* Color Picker — OKLCH in Popover */}
      <Popover.Root modal={false}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Canvas text color"
            title="Canvas text color"
          >
            <Icon icon={SwatchBook} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={8}
            className={styles.colorPickerPopup}
          >
            <div className={styles.colorPickerContent}>
              <OKLCHPickerPanel
                color={currentColor}
                onChange={handleColorChange}
                showHex
                showPreview
                idPrefix="commandbar-oklch"
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* CSS Copy */}
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="Copy CSS to clipboard"
        onClick={handleCopyCSS}
        title="Copy CSS"
      >
        <Icon icon={FileBraces} />
      </button>

      {/* Screenshot */}
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={isCapturing ? "Capturing screenshot" : "Capture screenshot"}
        onClick={handleScreenshot}
        disabled={isCapturing}
        title="Screenshot"
      >
        <Icon icon={Camera} />
      </button>
    </div>
  );
}
