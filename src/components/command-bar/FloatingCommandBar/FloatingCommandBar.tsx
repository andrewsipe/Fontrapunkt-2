/**
 * Fontrapunkt 2.0 — Floating Command Bar
 * Slider buttons (font size, letter spacing, line height) with scrub + click-to-open drawer.
 * Alignment, orientation, case segmented groups. More tools: color, copy CSS, screenshot.
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
  ALargeSmall,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  AutoFitOffNeue,
  Camera,
  ChevronRight,
  FileBraces,
  LetterSpacingNeue,
  LineHeightNeue,
  Maximize,
  RotateCcw,
  SwatchBook,
  VerticalCenterAlignNeue,
  VerticalTrimOff,
  VerticalTrimOn,
} from "../../../utils/icons";
import { updateSliderFill } from "../../../utils/sliderFill";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../../../utils/themeUtils";
import { Popover } from "../../components/Popover";
import { OKLCHPickerPanel } from "../../features/OKLCHPicker/OKLCHPickerPanel";
import { Icon } from "../../primitives/Icon/Icon";
import { CommandBarTooltip } from "../CommandBarTooltip";
import styles from "./FloatingCommandBar.module.css";

const FONT_SIZE_MIN = 1;
const FONT_SIZE_MAX = 1600;
const LETTER_SPACING_MIN = -100;
const LETTER_SPACING_MAX = 100;
const LINE_HEIGHT_MIN = 0.7;
const LINE_HEIGHT_MAX = 1.7;

type ActiveSliderKey = "fontSize" | "letterSpacing" | "lineHeight" | "weight" | null;

interface SliderButtonProps {
  icon: React.ReactNode;
  value: number;
  decimals: number;
  label: string;
  active: boolean;
  scrubSpeed: number;
  min: number;
  max: number;
  step: number;
  onOpen: () => void;
  onClose: () => void;
  onChange: (v: number) => void;
}

function SliderButton({
  icon,
  value,
  decimals,
  label,
  active,
  scrubSpeed,
  min,
  max,
  step,
  onOpen,
  onClose,
  onChange,
}: SliderButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({ startX: 0, startVal: 0, moved: false, wasOpen: false });
  const [scrub, setScrub] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const clampVal = (v: number) => Math.min(max, Math.max(min, v));
    const snapVal = (v: number) => parseFloat((Math.round(v / step) * step).toFixed(decimals));
    dragRef.current = {
      startX: e.clientX,
      startVal: value,
      moved: false,
      wasOpen: active,
    };
    setScrub(true);
    onOpen();

    const onMove = (ev: MouseEvent) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      if (ev.clientX < rect.left || ev.clientX > rect.right) return;
      const rawDelta = ev.clientX - dragRef.current.startX;
      if (Math.abs(rawDelta) > 3) dragRef.current.moved = true;
      onChange(clampVal(snapVal(dragRef.current.startVal + rawDelta * step * scrubSpeed)));
    };

    const onUp = () => {
      setScrub(false);
      if (!dragRef.current.moved && dragRef.current.wasOpen) onClose();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const isActive = active || scrub;

  return (
    <CommandBarTooltip content={`${label} · drag to scrub`} side="top" delay={0}>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.sliderBtn} ${isActive ? styles.sliderBtnActive : ""}`}
        onMouseDown={onMouseDown}
        aria-label={label}
        aria-expanded={active}
      >
        <span className={styles.sliderBtnIcon}>{icon}</span>
        <span className={styles.sliderBtnValue}>{Number(value).toFixed(decimals)}</span>
      </button>
    </CommandBarTooltip>
  );
}

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
  const letterSpacing = settings?.letterSpacing ?? 0;
  const lineHeight = settings?.lineHeight ?? 1.2;
  const zoomToFit = settings?.zoomToFit ?? false;
  const verticalTrim = settings?.verticalTrim ?? false;
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

  const [activeSlider, setActiveSlider] = useState<ActiveSliderKey>(null);
  const [utilsOpen, setUtilsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawerSliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActiveSlider(null);
        setUtilsOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const el = drawerSliderRef.current;
    if (!el || !activeSlider) return;
    if (activeSlider === "fontSize") {
      updateSliderFill(el, fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX);
    } else if (activeSlider === "letterSpacing") {
      updateSliderFill(el, letterSpacing, LETTER_SPACING_MIN, LETTER_SPACING_MAX);
    } else if (activeSlider === "lineHeight") {
      updateSliderFill(el, lineHeight, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX);
    } else if (activeSlider === "weight" && wghtAxis) {
      updateSliderFill(el, weightValue, weightMin, weightMax);
    }
  }, [
    activeSlider,
    fontSize,
    letterSpacing,
    lineHeight,
    weightValue,
    wghtAxis,
    weightMin,
    weightMax,
  ]);

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

  const handleDrawerSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeTab) return;
      const v = parseFloat(e.target.value);
      if (activeSlider === "fontSize") {
        updateSliderFill(e.target, v, FONT_SIZE_MIN, FONT_SIZE_MAX);
        updateTabSettings(activeTab.id, { fontSize: Math.round(v), zoomToFit: false });
      } else if (activeSlider === "letterSpacing") {
        updateSliderFill(e.target, v, LETTER_SPACING_MIN, LETTER_SPACING_MAX);
        updateTabSettings(activeTab.id, { letterSpacing: Math.round(v) });
      } else if (activeSlider === "lineHeight") {
        updateSliderFill(e.target, v, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX);
        updateTabSettings(activeTab.id, { lineHeight: parseFloat(v.toFixed(1)) });
      } else if (activeSlider === "weight" && fontId && wghtAxis) {
        updateSliderFill(e.target, v, weightMin, weightMax);
        updateAxisValue(fontId, "wght", v);
      }
    },
    [
      activeTab,
      activeSlider,
      fontId,
      wghtAxis,
      weightMin,
      weightMax,
      updateTabSettings,
      updateAxisValue,
    ]
  );

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

  const handleDrawerReset = useCallback(() => {
    if (!activeTab) return;
    if (activeSlider === "fontSize") {
      updateTabSettings(activeTab.id, { fontSize: 72, zoomToFit: false });
    } else if (activeSlider === "letterSpacing") {
      updateTabSettings(activeTab.id, { letterSpacing: 0 });
    } else if (activeSlider === "lineHeight") {
      updateTabSettings(activeTab.id, { lineHeight: 1.2, verticalTrim: false });
    } else if (activeSlider === "weight" && fontId && wghtAxis) {
      const def = wghtAxis.default ?? 400;
      updateAxisValue(fontId, "wght", def);
    }
  }, [activeTab, activeSlider, fontId, wghtAxis, updateTabSettings, updateAxisValue]);

  if (!activeTab) return null;

  const drawerOpen = !!activeSlider;

  const drawerMin =
    activeSlider === "fontSize"
      ? FONT_SIZE_MIN
      : activeSlider === "letterSpacing"
        ? LETTER_SPACING_MIN
        : activeSlider === "lineHeight"
          ? LINE_HEIGHT_MIN
          : activeSlider === "weight"
            ? weightMin
            : 0;
  const drawerMax =
    activeSlider === "fontSize"
      ? FONT_SIZE_MAX
      : activeSlider === "letterSpacing"
        ? LETTER_SPACING_MAX
        : activeSlider === "lineHeight"
          ? LINE_HEIGHT_MAX
          : activeSlider === "weight"
            ? weightMax
            : 0;
  const drawerValue =
    activeSlider === "fontSize"
      ? fontSize
      : activeSlider === "letterSpacing"
        ? letterSpacing
        : activeSlider === "lineHeight"
          ? lineHeight
          : activeSlider === "weight"
            ? weightValue
            : 0;
  const drawerStep = activeSlider === "lineHeight" ? 0.1 : 1;
  const drawerLabel =
    activeSlider === "fontSize"
      ? "Font Size"
      : activeSlider === "letterSpacing"
        ? "Letter Spacing"
        : activeSlider === "lineHeight"
          ? "Line Height"
          : activeSlider === "weight"
            ? "Weight"
            : "";

  const isFontSizeDefault = fontSize === 72 && !zoomToFit;
  const isLetterSpacingDefault = letterSpacing === 0;
  const isLineHeightDefault = lineHeight === 1.2 && !verticalTrim;
  const isWeightDefault = wghtAxis ? weightValue === (wghtAxis.default ?? 400) : true;

  const drawerResetDisabled =
    activeSlider === "fontSize"
      ? isFontSizeDefault
      : activeSlider === "letterSpacing"
        ? isLetterSpacingDefault
        : activeSlider === "lineHeight"
          ? isLineHeightDefault
          : activeSlider === "weight"
            ? isWeightDefault
            : true;

  return (
    <div ref={wrapRef} className={styles.wrapper}>
      <div
        className={`${styles.bar} ${drawerOpen ? styles.barDrawerOpen : ""}`}
        role="toolbar"
        aria-label="Text and font controls"
      >
        {/* Slider buttons */}
        <SliderButton
          icon={<Icon icon={ALargeSmall} />}
          value={fontSize}
          decimals={0}
          label="Font size"
          active={activeSlider === "fontSize"}
          scrubSpeed={1}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          onOpen={() => setActiveSlider("fontSize")}
          onClose={() => setActiveSlider(null)}
          onChange={(v) => {
            if (activeTab) {
              updateTabSettings(activeTab.id, {
                fontSize: Math.round(v),
                zoomToFit: false,
              });
            }
          }}
        />
        <SliderButton
          icon={<Icon icon={LetterSpacingNeue} />}
          value={letterSpacing}
          decimals={0}
          label="Letter spacing"
          active={activeSlider === "letterSpacing"}
          scrubSpeed={0.25}
          min={LETTER_SPACING_MIN}
          max={LETTER_SPACING_MAX}
          step={1}
          onOpen={() => setActiveSlider("letterSpacing")}
          onClose={() => setActiveSlider(null)}
          onChange={(v) => {
            if (activeTab) {
              updateTabSettings(activeTab.id, { letterSpacing: Math.round(v) });
            }
          }}
        />
        <SliderButton
          icon={<Icon icon={LineHeightNeue} />}
          value={lineHeight}
          decimals={1}
          label="Line height"
          active={activeSlider === "lineHeight"}
          scrubSpeed={0.05}
          min={LINE_HEIGHT_MIN}
          max={LINE_HEIGHT_MAX}
          step={0.1}
          onOpen={() => setActiveSlider("lineHeight")}
          onClose={() => setActiveSlider(null)}
          onChange={(v) => {
            if (activeTab) {
              updateTabSettings(activeTab.id, {
                lineHeight: parseFloat(v.toFixed(1)),
              });
            }
          }}
        />
        {wghtAxis && (
          <SliderButton
            icon={<span className={styles.weightLabel}>W</span>}
            value={weightValue}
            decimals={0}
            label="Weight"
            active={activeSlider === "weight"}
            scrubSpeed={0.2}
            min={weightMin}
            max={weightMax}
            step={100}
            onOpen={() => setActiveSlider("weight")}
            onClose={() => setActiveSlider(null)}
            onChange={(v) => {
              if (fontId) updateAxisValue(fontId, "wght", v);
            }}
          />
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
            <CommandBarTooltip content="Align left" side="top">
              <Toggle.Toggle value="left" className={styles.toggleBtn} aria-label="Align left">
                <Icon icon={AlignLeft} />
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Align center" side="top">
              <Toggle.Toggle value="center" className={styles.toggleBtn} aria-label="Align center">
                <Icon icon={AlignCenter} />
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Align right" side="top">
              <Toggle.Toggle value="right" className={styles.toggleBtn} aria-label="Align right">
                <Icon icon={AlignRight} />
              </Toggle.Toggle>
            </CommandBarTooltip>
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
            <CommandBarTooltip content="Top" side="top">
              <Toggle.Toggle value="top" className={styles.toggleBtn} aria-label="Align to top">
                <Icon icon={ArrowUpToLine} />
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Center" side="top">
              <Toggle.Toggle value="center" className={styles.toggleBtn} aria-label="Align center">
                <Icon icon={VerticalCenterAlignNeue} />
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Bottom" side="top">
              <Toggle.Toggle
                value="bottom"
                className={styles.toggleBtn}
                aria-label="Align to bottom"
              >
                <Icon icon={ArrowDownToLine} />
              </Toggle.Toggle>
            </CommandBarTooltip>
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
            <CommandBarTooltip content="Uppercase" side="top">
              <Toggle.Toggle
                value="uppercase"
                className={`${styles.toggleBtn} ${styles.toggleBtnText}`}
                aria-label="Uppercase"
              >
                AB
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Mixed case" side="top">
              <Toggle.Toggle
                value="none"
                className={`${styles.toggleBtn} ${styles.toggleBtnText}`}
                aria-label="Default case"
              >
                Aa
              </Toggle.Toggle>
            </CommandBarTooltip>
            <CommandBarTooltip content="Lowercase" side="top">
              <Toggle.Toggle
                value="lowercase"
                className={`${styles.toggleBtn} ${styles.toggleBtnText}`}
                aria-label="Lowercase"
              >
                ab
              </Toggle.Toggle>
            </CommandBarTooltip>
          </ToggleGroup.ToggleGroup>
        </fieldset>

        <div className={styles.sectionDivider} aria-hidden />

        {/* More tools expand */}
        <CommandBarTooltip content={utilsOpen ? "Hide tools" : "More tools"} side="top">
          <button
            type="button"
            className={`${styles.iconBtn} ${utilsOpen ? styles.iconBtnActive : ""}`}
            onClick={() => setUtilsOpen((p) => !p)}
            aria-label={utilsOpen ? "Hide tools" : "More tools"}
            aria-expanded={utilsOpen}
          >
            <span className={utilsOpen ? styles.chevronOpen : undefined}>
              <Icon icon={ChevronRight} />
            </span>
          </button>
        </CommandBarTooltip>

        {/* Utility buttons — slide in when expanded */}
        <div className={`${styles.utilsSlot} ${utilsOpen ? styles.utilsSlotOpen : ""}`}>
          <Popover.Root modal={false}>
            <CommandBarTooltip content="Canvas text color" side="top">
              <Popover.Trigger asChild>
                <button type="button" className={styles.iconBtn} aria-label="Canvas text color">
                  <Icon icon={SwatchBook} />
                </button>
              </Popover.Trigger>
            </CommandBarTooltip>
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
          <CommandBarTooltip content="Copy CSS" side="top">
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Copy CSS to clipboard"
              onClick={handleCopyCSS}
            >
              <Icon icon={FileBraces} />
            </button>
          </CommandBarTooltip>
          <CommandBarTooltip content="Screenshot" side="top">
            <button
              type="button"
              className={styles.iconBtn}
              aria-label={isCapturing ? "Capturing screenshot" : "Capture screenshot"}
              onClick={handleScreenshot}
              disabled={isCapturing}
            >
              <Icon icon={Camera} />
            </button>
          </CommandBarTooltip>
        </div>
      </div>

      {/* Drawer — full-range slider when a slider button is active */}
      {activeSlider && (
        <div className={styles.drawer}>
          <span className={styles.drawerLabel}>{drawerLabel.toUpperCase()}</span>
          <span className={styles.drawerMinMax}>{drawerMin}</span>
          <input
            ref={drawerSliderRef}
            type="range"
            className={styles.drawerSlider}
            min={drawerMin}
            max={drawerMax}
            step={drawerStep}
            value={drawerValue}
            onChange={handleDrawerSliderChange}
            aria-label={drawerLabel}
          />
          <span className={styles.drawerMinMax}>{drawerMax}</span>

          {activeSlider === "fontSize" && (
            <CommandBarTooltip
              content={zoomToFit ? "Auto Fit (on)" : "Auto Fit to container"}
              side="bottom"
            >
              <button
                type="button"
                className={`${styles.drawerExtraBtn} ${zoomToFit ? styles.drawerExtraBtnActive : ""}`}
                onClick={() => {
                  if (activeTab) {
                    updateTabSettings(activeTab.id, { zoomToFit: !zoomToFit });
                  }
                }}
                aria-label={zoomToFit ? "Auto Fit on" : "Auto Fit off"}
              >
                <Icon icon={zoomToFit ? Maximize : AutoFitOffNeue} />
              </button>
            </CommandBarTooltip>
          )}
          {activeSlider === "lineHeight" && (
            <CommandBarTooltip
              content={verticalTrim ? "Vertical Trim (on)" : "Vertical Trim"}
              side="bottom"
            >
              <button
                type="button"
                className={`${styles.drawerExtraBtn} ${verticalTrim ? styles.drawerExtraBtnActive : ""}`}
                onClick={() => {
                  if (activeTab) {
                    updateTabSettings(activeTab.id, { verticalTrim: !verticalTrim });
                  }
                }}
                aria-label={verticalTrim ? "Vertical Trim on" : "Vertical Trim off"}
              >
                <Icon icon={verticalTrim ? VerticalTrimOn : VerticalTrimOff} />
              </button>
            </CommandBarTooltip>
          )}

          <CommandBarTooltip content="Reset to default" side="bottom">
            <button
              type="button"
              className={styles.drawerResetBtn}
              onClick={handleDrawerReset}
              disabled={drawerResetDisabled}
              aria-label={`Reset ${drawerLabel.toLowerCase()}`}
            >
              <Icon icon={RotateCcw} />
            </button>
          </CommandBarTooltip>
        </div>
      )}
    </div>
  );
}
