/**
 * TwoLayerSliderWithLayout – Wraps TwoLayerSlider with optional LabelRow and slider group.
 * When hideLabelRow is true: no label row; reset button is at the left end of the slider row.
 */

import type { LucideIcon } from "lucide-react";
import { ResetButton } from "../../features/Button/ResetButton";
import { LabelRow } from "../LabelRow";
import { TwoLayerSlider, type TwoLayerSliderProps } from "./TwoLayerSlider";
import styles from "./TwoLayerSliderWithLayout.module.css";

export interface TwoLayerSliderWithLayoutProps extends TwoLayerSliderProps {
  label?: string;
  suffixLabel?: string;
  icon?:
    | LucideIcon
    | React.ComponentType<{
        size?: number | string;
        className?: string;
        [key: string]: unknown;
      }>
    | React.ReactNode;
  onReset?: () => void;
  /** When true, omit the label row and place reset at the left end of the slider (same row). */
  hideLabelRow?: boolean;
  /** Rendered in the label row after the label text, before reset (e.g. compact action button). */
  labelTrailing?: React.ReactNode;
}

export function TwoLayerSliderWithLayout({
  label,
  suffixLabel,
  icon,
  onReset,
  disabled,
  hideLabelRow = false,
  labelTrailing,
  ...sliderProps
}: TwoLayerSliderWithLayoutProps) {
  const showLabelRow = !hideLabelRow && label != null && label !== "";
  const defaultResetTooltip = label
    ? `Reset ${label.toLowerCase()} to default`
    : "Reset to default";

  return (
    <div className={styles.container} data-disabled={disabled || undefined}>
      {showLabelRow && label != null && (
        <LabelRow
          label={label}
          icon={icon}
          suffixLabel={suffixLabel}
          onReset={
            onReset != null
              ? () => {
                  if (!disabled) onReset();
                }
              : undefined
          }
          disabled={disabled}
          labelVariant="default"
          trailing={labelTrailing}
        />
      )}

      <div className={styles.sliderGroup}>
        {hideLabelRow && onReset != null && (
          <div className={styles.inlineReset}>
            <ResetButton
              tooltip={defaultResetTooltip}
              ariaLabel={defaultResetTooltip}
              onClick={() => {
                if (!disabled) onReset();
              }}
              disabled={disabled}
            />
          </div>
        )}
        <div className={styles.sliderContainer}>
          <TwoLayerSlider {...sliderProps} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
