/**
 * NativeRangeSlider – presentational native range input with optional label, value display, and snap points.
 * Shared by OKLCHPicker and SettingsModal for consistent styling (solid, hue, tone tracks).
 */

import type { ReactNode } from "react";
import { useCallback } from "react";
import styles from "./NativeRangeSlider.module.css";

export type TrackVariant = "solid" | "hue" | "tone";

/** If value is within threshold of a snap point, return that point; else return value. */
function applySnap(value: number, snapPoints: number[], threshold: number): number {
  if (snapPoints.length === 0) return value;
  const nearest = snapPoints.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  return Math.abs(value - nearest) <= threshold ? nearest : value;
}

export interface NativeRangeSliderProps {
  id: string;
  /** Label content (e.g. "L", "Hue"). Omit for input-only (e.g. tone slider with external label). */
  label?: ReactNode;
  /** Displayed value (e.g. "50%", "180°"). Omit when label is omitted. */
  valueDisplay?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  trackVariant: TrackVariant;
  /** If true, use compact track/thumb (8px track, smaller thumb). */
  compact?: boolean;
  /** Optional snap points; when value is within snapThreshold of a point, it snaps. */
  snapPoints?: number[];
  /** Distance within which value snaps to a snap point. Default 0.02. */
  snapThreshold?: number;
  className?: string;
  inputClassName?: string;
  /** Optional; used by OKLCHPicker to detect drag start/end for hex-on-stop. */
  onPointerDown?: React.PointerEventHandler<HTMLInputElement>;
  /** Optional; used by OKLCHPicker to detect drag start/end for hex-on-stop. */
  onPointerUp?: React.PointerEventHandler<HTMLInputElement>;
  "aria-label"?: string;
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
}

export function NativeRangeSlider({
  id,
  label,
  valueDisplay,
  min,
  max,
  step,
  value,
  onChange,
  trackVariant,
  compact = false,
  snapPoints,
  snapThreshold = 0.02,
  className,
  inputClassName,
  onPointerDown,
  onPointerUp,
  "aria-label": ariaLabel,
  "aria-valuemin": ariaValuemin,
  "aria-valuemax": ariaValuemax,
  "aria-valuenow": ariaValuenow,
  "aria-valuetext": ariaValuetext,
}: NativeRangeSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value);
      const next =
        snapPoints != null && snapPoints.length > 0
          ? applySnap(raw, snapPoints, snapThreshold)
          : raw;
      onChange(next);
    },
    [onChange, snapPoints, snapThreshold]
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const raw = parseFloat((e.target as HTMLInputElement).value);
      const next =
        snapPoints != null && snapPoints.length > 0
          ? applySnap(raw, snapPoints, snapThreshold)
          : raw;
      onChange(next);
    },
    [onChange, snapPoints, snapThreshold]
  );

  const sliderClass = [
    styles.slider,
    trackVariant === "solid" && styles.slider_solid,
    trackVariant === "hue" && styles.slider_hue,
    trackVariant === "tone" && styles.slider_tone,
    compact && styles.slider_compact,
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const showLabelRow = label != null;

  return (
    <div className={className ?? styles.wrapper}>
      {showLabelRow && (
        <label htmlFor={id} className={styles.labelRow}>
          {label}
          {valueDisplay != null && <span className={styles.valueText}>{valueDisplay}</span>}
        </label>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={sliderClass}
        aria-label={ariaLabel}
        aria-valuemin={ariaValuemin ?? min}
        aria-valuemax={ariaValuemax ?? max}
        aria-valuenow={ariaValuenow ?? value}
        aria-valuetext={ariaValuetext}
      />
    </div>
  );
}
