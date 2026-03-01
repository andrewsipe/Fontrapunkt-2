/**
 * NativeRangeSliderWithLayout – slider with label row using Label primitive.
 * Shared layout for OKLCH panel sliders and tone slider; consistent label + value + slider.
 */

import type { ReactNode } from "react";
import { Label } from "../Label/Label";
import type { NativeRangeSliderProps } from "./NativeRangeSlider";
import { NativeRangeSlider } from "./NativeRangeSlider";
import styles from "./NativeRangeSlider.module.css";

export interface NativeRangeSliderWithLayoutProps
  extends Omit<NativeRangeSliderProps, "label" | "valueDisplay"> {
  /** Semantic label (e.g. "Lightness", "Chroma (Vibrancy)", "Background Tint"). */
  label: string;
  /** Displayed value (e.g. "50%", "180°"). */
  valueDisplay: string;
  /** Optional node after value (e.g. ResetButton for tone). */
  trailing?: ReactNode;
}

export function NativeRangeSliderWithLayout({
  id,
  label,
  valueDisplay,
  trailing,
  className,
  ...sliderProps
}: NativeRangeSliderWithLayoutProps) {
  return (
    <div className={className ?? styles.wrapper}>
      <div className={styles.labelRow}>
        <Label as="label" htmlFor={id} variant="default">
          {label}
        </Label>
        {trailing != null ? (
          <div className={styles.labelRowRight}>
            <span className={styles.valueText}>{valueDisplay}</span>
            {trailing}
          </div>
        ) : (
          <span className={styles.valueText}>{valueDisplay}</span>
        )}
      </div>
      <NativeRangeSlider
        id={id}
        min={sliderProps.min}
        max={sliderProps.max}
        step={sliderProps.step}
        value={sliderProps.value}
        onChange={sliderProps.onChange}
        trackVariant={sliderProps.trackVariant}
        compact={sliderProps.compact}
        snapPoints={sliderProps.snapPoints}
        snapThreshold={sliderProps.snapThreshold}
        inputClassName={sliderProps.inputClassName}
        onPointerDown={sliderProps.onPointerDown}
        onPointerUp={sliderProps.onPointerUp}
        aria-label={sliderProps["aria-label"]}
        aria-valuemin={sliderProps["aria-valuemin"]}
        aria-valuemax={sliderProps["aria-valuemax"]}
        aria-valuenow={sliderProps["aria-valuenow"]}
        aria-valuetext={sliderProps["aria-valuetext"]}
      />
    </div>
  );
}
