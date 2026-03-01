/**
 * Flexible Tooltip wrapper using Base UI Tooltip
 * Can wrap any element (buttons, divs, links, etc.) with a tooltip.
 * Use TooltipButton for buttons, use this for other elements.
 */

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type React from "react";
import { Children, cloneElement, isValidElement } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  tooltip: string;
  children: React.ReactNode;
  /**
   * Optional delay before showing tooltip (ms)
   * @default 300
   */
  delayDuration?: number;
  /**
   * Optional side for tooltip placement
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Optional offset from trigger (px)
   * @default 5
   */
  sideOffset?: number;
  /**
   * Whether tooltip is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Tooltip - Wraps any element with Base UI Tooltip
 */
export function TooltipWrapper({
  tooltip,
  children,
  delayDuration = 300,
  side = "top",
  sideOffset = 5,
  disabled = false,
}: TooltipProps) {
  if (disabled || !tooltip) {
    return <>{children}</>;
  }

  const child = Children.only(children);
  if (!isValidElement(child)) return <>{children}</>;

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={delayDuration} render={(props) => cloneElement(child, props)} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup className={styles.content}>{tooltip}</BaseTooltip.Popup>
          <BaseTooltip.Arrow className={styles.arrow} />
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
