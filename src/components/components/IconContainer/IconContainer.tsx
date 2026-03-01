/**
 * IconContainer - Ghost box around an icon, static or interactive.
 * Uses Icon inside. Single place for padding, border-radius, and interactive states.
 * Forwards ref to the root element (span, button, or TooltipTrigger's button).
 * Layout (header, footer, bottom bar, GlyphsView toolbar) applies --touch-target-min to specific wrappers; IconContainer itself sizes by padding and context.
 */

import type React from "react";
import { forwardRef, type ReactNode } from "react";
import { Icon } from "../../primitives/Icon/Icon";
import { Button } from "../Button";
import { TooltipButton } from "../Tooltip/TooltipButton";
import styles from "./IconContainer.module.css";

export type IconContainerFontSize = "inherit" | "xs" | "sm" | "base" | "lg";

const FONT_SIZE_CLASS: Record<Exclude<IconContainerFontSize, "inherit">, string> = {
  xs: styles.fontSizeXs,
  sm: styles.fontSizeSm,
  base: styles.fontSizeBase,
  lg: styles.fontSizeLg,
};

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>;

export interface IconContainerProps {
  /** Lucide icon component (e.g. RotateCcw) or ReactNode */
  icon: LucideIconComponent | ReactNode;
  variant: "static" | "interactive";
  /** When interactive */
  tooltip?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  disabled?: boolean;
  /** Optional explicit font-size when parent context is not enough */
  fontSize?: IconContainerFontSize;
  className?: string;
}

export const IconContainer = forwardRef<HTMLButtonElement | HTMLSpanElement, IconContainerProps>(
  function IconContainer(
    { icon, variant, tooltip, onClick, ariaLabel, disabled, fontSize, className },
    ref
  ) {
    const fontSizeClass = fontSize && fontSize !== "inherit" ? FONT_SIZE_CLASS[fontSize] : "";
    const rootClasses = [
      styles.root,
      variant === "interactive" && styles.interactive,
      fontSizeClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = <Icon icon={icon} />;

    const dataAttrs = { "data-icon-container": "" };

    if (variant === "static") {
      return (
        <span ref={ref as React.RefObject<HTMLSpanElement>} className={rootClasses} {...dataAttrs}>
          {content}
        </span>
      );
    }

    if (tooltip) {
      return (
        <TooltipButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          tooltip={tooltip}
          onClick={onClick}
          className={rootClasses}
          aria-label={ariaLabel ?? tooltip}
          disabled={disabled}
          {...dataAttrs}
        >
          {content}
        </TooltipButton>
      );
    }

    return (
      <Button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={rootClasses}
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        {...dataAttrs}
      >
        {content}
      </Button>
    );
  }
);
