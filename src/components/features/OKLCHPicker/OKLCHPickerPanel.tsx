/**
 * OKLCHPickerPanel – 2D canvas (Lightness × Chroma) + Hue slider.
 * Used by Sidebar OKLCHPicker and SettingsModal; design tokens and Label/NativeRangeSlider.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OKLCHColor } from "../../../utils/colorUtils";
import {
  clampOklch,
  hexToOklch,
  isValidHex,
  oklchToCss,
  oklchToHex,
} from "../../../utils/colorUtils";
import { Label } from "../../primitives/Label/Label";
import { NativeRangeSliderWithLayout } from "../../primitives/NativeRangeSlider";
import styles from "./OKLCHPickerPanel.module.css";

const CHROMA_MAX = 0.4;
const CANVAS_W = 60;
const CANVAS_H = 45;

export interface OKLCHPickerPanelProps {
  color: OKLCHColor;
  onChange: (color: OKLCHColor) => void;
  showHex?: boolean;
  showPreview?: boolean;
  compactSliders?: boolean;
  idPrefix?: string;
}

const DEFAULT_ID_PREFIX = "oklch";

export function OKLCHPickerPanel({
  color,
  onChange,
  showHex = true,
  showPreview = true,
  compactSliders = false,
  idPrefix = DEFAULT_ID_PREFIX,
}: OKLCHPickerPanelProps) {
  const calculatedHex = useMemo(() => oklchToHex(color), [color]);
  const [hexInput, setHexInput] = useState("");
  const [isHexValid, setIsHexValid] = useState(true);
  const [hexFocused, setHexFocused] = useState(false);
  const [oklchInput, setOklchInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingColorRef = useRef<OKLCHColor | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const colorRef = useRef(color);
  colorRef.current = color;

  const commitPending = useCallback(() => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (pendingColorRef.current != null) {
      onChange(pendingColorRef.current);
      pendingColorRef.current = null;
    }
  }, [onChange]);

  const scheduleCommit = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingColorRef.current != null) {
        onChange(pendingColorRef.current);
        pendingColorRef.current = null;
      }
    });
  }, [onChange]);

  useEffect(() => {
    setOklchInput(
      `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(3)} ${Math.round(color.h)})`
    );
  }, [color]);

  useEffect(() => {
    if (!hexFocused && !isDragging) {
      setHexInput(calculatedHex.replace(/^#/, "").toUpperCase());
      setIsHexValid(true);
    }
  }, [calculatedHex, hexFocused, isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerUp = () => {
      commitPending();
      setIsDragging(false);
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging, commitPending]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const h = color.h;
    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < CANVAS_W; x++) {
        const l = x / (CANVAS_W - 1);
        const c = (y / (CANVAS_H - 1)) * CHROMA_MAX;
        ctx.fillStyle = `oklch(${l * 100}% ${c} ${h})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [color.h]);

  const updateFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));
      const next = clampOklch({
        ...colorRef.current,
        l: x,
        c: y * CHROMA_MAX,
      });
      pendingColorRef.current = next;
      scheduleCommit();
    },
    [scheduleCommit]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      updateFromCoords(e.clientX, e.clientY);
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [updateFromCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging) updateFromCoords(e.clientX, e.clientY);
    },
    [isDragging, updateFromCoords]
  );

  const handleHueChange = useCallback(
    (value: number) => {
      const base = pendingColorRef.current ?? colorRef.current;
      const newColor = { ...base, h: value };
      if (base.c < 0.08 || base.l > 0.85 || base.l < 0.25) {
        newColor.l = 0.75;
        newColor.c = 0.3;
      }
      pendingColorRef.current = clampOklch(newColor);
      scheduleCommit();
    },
    [scheduleCommit]
  );

  const handleOklchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setOklchInput(val);
      const match = val.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/i);
      if (match) {
        const newL = Math.max(0, Math.min(100, parseFloat(match[1]))) / 100;
        const newC = Math.max(0, Math.min(CHROMA_MAX, parseFloat(match[2])));
        const newH = Math.max(0, Math.min(360, parseFloat(match[3])));
        onChange(clampOklch({ l: newL, c: newC, h: newH }));
      }
    },
    [onChange]
  );

  const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    setHexInput(raw.toUpperCase());
    setIsHexValid(raw.length === 6 && /^[0-9A-Fa-f]{6}$/.test(raw));
  }, []);

  const handleHexBlur = useCallback(() => {
    setHexFocused(false);
    const withHash = hexInput.length === 6 ? `#${hexInput}` : hexInput;
    if (isValidHex(withHash)) {
      try {
        onChange(clampOklch(hexToOklch(withHash)));
        setIsHexValid(true);
      } catch {
        setIsHexValid(false);
        setHexInput(oklchToHex(color).replace(/^#/, "").toUpperCase());
      }
    } else {
      setIsHexValid(false);
      setHexInput(oklchToHex(color).replace(/^#/, "").toUpperCase());
    }
  }, [hexInput, color, onChange]);

  const cssColor = oklchToCss(color);
  const isDark = color.l < 0.55;
  const hexId = `${idPrefix}-hex`;
  const hueId = `${idPrefix}-hue`;

  return (
    <div className={styles.root}>
      <div
        className={styles.canvasContainer}
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDragging(false)}
      >
        <canvas ref={canvasRef} />
        <div
          className={styles.reticle}
          style={{
            left: `${color.l * 100}%`,
            top: `${(color.c / CHROMA_MAX) * 100}%`,
          }}
        />
      </div>

      <NativeRangeSliderWithLayout
        id={hueId}
        label="Hue"
        valueDisplay={`${Math.round(color.h)}°`}
        min={0}
        max={359}
        step={0.1}
        value={Math.min(359, Math.max(0, color.h >= 360 ? 0 : color.h))}
        onChange={handleHueChange}
        onPointerDown={() => setIsDragging(true)}
        trackVariant="hue"
        compact={compactSliders}
        className={styles.hueControl}
      />

      {showPreview && (
        <div
          className={styles.previewSwatch}
          style={{
            backgroundColor: cssColor,
            color: isDark ? "white" : "black",
          }}
        >
          <div className={styles.swatchBorder} />
          <input
            type="text"
            className={styles.oklchField}
            value={oklchInput}
            onChange={handleOklchInputChange}
            spellCheck={false}
            aria-label="OKLCH color value"
          />
        </div>
      )}

      {showHex && (
        <div className={styles.hexWrap}>
          <Label as="label" htmlFor={hexId} variant="small">
            HEX
          </Label>
          <div className={styles.hexInputWrapper}>
            <span className={styles.hexHash}>#</span>
            <input
              id={hexId}
              type="text"
              className={`${styles.hexInputField} ${!isHexValid ? styles.invalid : ""}`}
              value={hexInput}
              onChange={handleHexInputChange}
              onFocus={() => setHexFocused(true)}
              onBlur={handleHexBlur}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder="000000"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
