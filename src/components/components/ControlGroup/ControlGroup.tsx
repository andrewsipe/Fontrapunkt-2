/**
 * ControlGroup – Structural component: label (with optional popover) + control slot.
 * Use for consistent "label above control" layout (e.g. in TextControls).
 */

import type { ReactNode } from "react";
import { LabelWithPopover } from "../LabelWithPopover";
import styles from "./ControlGroup.module.css";

export interface ControlGroupProps {
  /** Label text (rendered via LabelWithPopover when sectionKey is set). */
  label: string;
  /** Section key for popover content (e.g. "alignment", "orientation", "case"). */
  sectionKey: string;
  /** Optional class for the root. */
  className?: string;
  /** Optional class for the label (LabelWithPopover). */
  labelClassName?: string;
  /** Optional aria-label for the control group. */
  "aria-label"?: string;
  /** The control(s) below the label. */
  children: ReactNode;
}

export function ControlGroup({
  label,
  sectionKey,
  className = "",
  labelClassName = "",
  "aria-label": ariaLabel,
  children,
}: ControlGroupProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const labelClass = [styles.label, labelClassName].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role="group" aria-label={ariaLabel}>
      <LabelWithPopover sectionKey={sectionKey} className={labelClass}>
        {label}
      </LabelWithPopover>
      {children}
    </div>
  );
}
