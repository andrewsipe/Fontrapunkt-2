/**
 * Reusable TooltipButton using Base UI Tooltip
 * Wraps a button with a tooltip for consistent UX and accessibility.
 */

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type React from "react";
import { forwardRef } from "react";
import { Button } from "../Button";
import styles from "./Tooltip.module.css";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref != null) (ref as React.MutableRefObject<T>).current = value;
    });
  };
}

interface TooltipButtonProps extends React.ComponentPropsWithoutRef<"button"> {
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
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  function TooltipButton(
    { tooltip, children, delayDuration = 300, side = "top", sideOffset = 5, ...buttonProps },
    ref
  ) {
    return (
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          delay={delayDuration}
          render={(props) => (
            <Button
              ref={mergeRefs(ref, (props as { ref?: React.Ref<HTMLButtonElement> }).ref)}
              {...props}
              {...buttonProps}
            >
              {children}
            </Button>
          )}
        />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
            <BaseTooltip.Popup className={styles.content}>{tooltip}</BaseTooltip.Popup>
            <BaseTooltip.Arrow className={styles.arrow} />
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    );
  }
);
