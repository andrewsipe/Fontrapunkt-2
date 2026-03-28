/**
 * TooltipButton — button wrapped with shared Tooltip (global tooltip.global.css).
 */

import type React from "react";
import { forwardRef } from "react";
import { Button } from "../Button";
import { Tooltip } from "./Tooltip";

interface TooltipButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  tooltip: string;
  children: React.ReactNode;
  /** Optional delay before showing tooltip (ms). Default 300. */
  delayDuration?: number;
  /** Optional side for tooltip placement. Default "top". */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional offset from trigger (px). Not used by shared Tooltip; kept for API compat. */
  sideOffset?: number;
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  function TooltipButton(
    {
      tooltip,
      children,
      delayDuration = 300,
      side = "top",
      sideOffset: _sideOffset,
      ...buttonProps
    },
    ref
  ) {
    return (
      <Tooltip content={tooltip} delay={delayDuration} side={side}>
        <Button ref={ref} {...buttonProps}>
          {children}
        </Button>
      </Tooltip>
    );
  }
);
