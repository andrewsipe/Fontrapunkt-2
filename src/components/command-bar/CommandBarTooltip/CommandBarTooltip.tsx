/**
 * Command bar tooltip — shared Tooltip with delay=0 (instant).
 * Uses global tooltip.global.css. Bar/drawer overrides in FloatingCommandBar.module.css if needed.
 */

import type React from "react";
import { Tooltip } from "../../components/Tooltip";

export interface CommandBarTooltipProps {
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "center" | "start" | "end";
  /** ms before show; 0 = instant (default for command bar). */
  delay?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

export function CommandBarTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delay = 0,
  disabled = false,
}: CommandBarTooltipProps) {
  return (
    <Tooltip content={content} side={side} align={align} delay={delay} disabled={disabled}>
      {children}
    </Tooltip>
  );
}
