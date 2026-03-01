/**
 * LabelRow - Structural component: one row with optional icon + label + suffix on the left,
 * optional ResetButton (or custom right slot) on the right.
 * Used by TwoLayerSliderWithLayout and FormField (form mode via htmlFor).
 */

import type { ComponentType } from "react";
import { ResetButton } from "../../features/Button/ResetButton";
import type { LabelVariant } from "../../primitives/Label/Label";
import { Label } from "../../primitives/Label/Label";
import { LabelGroup } from "../LabelGroup/LabelGroup";
import styles from "./LabelRow.module.css";

type IconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;

export interface LabelRowProps {
  label: string;
  icon?: IconComponent | React.ReactNode;
  suffixLabel?: React.ReactNode;
  onReset?: () => void;
  resetTooltip?: string;
  resetAriaLabel?: string;
  disabled?: boolean;
  labelVariant?: LabelVariant;
  /** Custom right content instead of ResetButton (e.g. link, badge, required asterisk). */
  right?: React.ReactNode;
  /** Rendered after label/suffix, before reset (e.g. compact action button). Kept with reset in right group. */
  trailing?: React.ReactNode;
  /** When set, renders as form label row: Label as "label" with htmlFor (no icon/suffix/reset). Use in FormField. */
  htmlFor?: string;
  className?: string;
  /** LabelRow is the row only; parent puts control below. */
  children?: never;
}

export function LabelRow({
  label,
  icon,
  suffixLabel,
  onReset,
  resetTooltip,
  resetAriaLabel,
  disabled = false,
  labelVariant = "default",
  right,
  trailing,
  htmlFor,
  className = "",
}: LabelRowProps) {
  const rowClass = [styles.labelRow, className].filter(Boolean).join(" ");
  const defaultResetTooltip = `Reset ${label.toLowerCase()} to default`;

  if (htmlFor != null) {
    return (
      <div className={rowClass}>
        <Label as="label" htmlFor={htmlFor} variant={labelVariant ?? "form"} disabled={disabled}>
          {label}
        </Label>
        {right}
      </div>
    );
  }

  const hasRight = onReset != null || right != null || trailing != null;
  const rightContent =
    onReset != null ? (
      <ResetButton
        tooltip={resetTooltip ?? defaultResetTooltip}
        ariaLabel={resetAriaLabel ?? resetTooltip ?? defaultResetTooltip}
        onClick={onReset}
        disabled={disabled}
      />
    ) : (
      right
    );

  return (
    <div className={rowClass}>
      <LabelGroup icon={icon}>
        <Label as="span" variant={labelVariant} disabled={disabled}>
          {label}
        </Label>
        {suffixLabel != null && suffixLabel !== "" && (
          <span className={styles.suffixLabel}>{suffixLabel}</span>
        )}
      </LabelGroup>
      {hasRight && (
        <div className={styles.rightGroup}>
          {trailing}
          {rightContent}
        </div>
      )}
    </div>
  );
}
