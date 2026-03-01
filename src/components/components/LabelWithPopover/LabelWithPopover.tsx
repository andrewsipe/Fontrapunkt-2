/**
 * Label with Popover component
 * Wraps the Label primitive with a Popover for contextual help.
 * Uses asChild to apply Popover.Trigger to the Label.
 */

import type { UIDescription } from "../../../utils/uiDescriptions";
import { getSectionDescription } from "../../../utils/uiDescriptions";
import { Label, type LabelAs, type LabelVariant } from "../../primitives/Label/Label";
import { Popover } from "../Popover";
import styles from "./LabelWithPopover.module.css";

interface LabelWithPopoverProps {
  sectionKey: string;
  children: React.ReactNode;
  description?: UIDescription;
  className?: string;
  /** HTML element (default: "label"). */
  as?: LabelAs;
  /** Label typography variant (default: "default"; use "section" for panel titles). */
  variant?: LabelVariant;
}

/**
 * LabelWithPopover - Wraps a label with Popover for contextual help
 *
 * @example
 * <LabelWithPopover sectionKey="alignment" className={styles.label}>
 *   Alignment
 * </LabelWithPopover>
 */
export function LabelWithPopover({
  sectionKey,
  children,
  description,
  className = "",
  as = "label",
  variant = "default",
}: LabelWithPopoverProps) {
  const desc = description || getSectionDescription(sectionKey);
  const labelEl = (
    <Label as={as} variant={variant} className={className}>
      {children}
    </Label>
  );

  if (!desc) {
    return labelEl;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{labelEl}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="right" sideOffset={8} align="start">
          <div className={styles.popoverContent}>
            <h4 className={styles.popoverTitle}>{desc.title}</h4>
            <p className={styles.popoverDescription}>{desc.description}</p>
            {desc.details && <p className={styles.popoverDetails}>{desc.details}</p>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
