/**
 * SliderTooltip — wraps a slider thumb (or any child) with shared Tooltip.
 */

import type React from "react";
import { Tooltip } from "./Tooltip";

interface SliderTooltipProps {
  description: string;
  children: React.ReactNode;
  /** Optional delay before showing tooltip (ms). Default 300. */
  delayDuration?: number;
  /** Optional side for tooltip placement. Default "top". */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional offset from trigger (px). Not used by shared Tooltip; kept for API compat. */
  sideOffset?: number;
}

export function SliderTooltip({
  description,
  children,
  delayDuration = 300,
  side = "top",
  sideOffset: _sideOffset,
}: SliderTooltipProps) {
  return (
    <Tooltip content={description} delay={delayDuration} side={side}>
      {children}
    </Tooltip>
  );
}
