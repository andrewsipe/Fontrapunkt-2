/**
 * SliderTooltip using Base UI Tooltip
 * Wraps the thumb element with a tooltip (e.g. for slider value).
 */

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type React from "react";
import { Children, cloneElement, isValidElement } from "react";
import styles from "./Tooltip.module.css";

interface SliderTooltipProps {
  description: string;
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
   * @default 8
   */
  sideOffset?: number;
}

export function SliderTooltip({
  description,
  children,
  delayDuration = 300,
  side = "top",
  sideOffset = 8,
}: SliderTooltipProps) {
  const child = Children.only(children);
  if (!isValidElement(child)) return <>{children}</>;

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={delayDuration} render={(props) => cloneElement(child, props)} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup className={styles.content}>{description}</BaseTooltip.Popup>
          <BaseTooltip.Arrow className={styles.arrow} />
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
