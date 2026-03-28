/**
 * Shared Tooltip — data-attribute pattern, global CSS (tooltip.global.css).
 * Wraps any element. Use TooltipButton for buttons. API matches CommandBarTooltip.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface TooltipProps {
  /** Tooltip content (string or ReactNode). */
  content?: React.ReactNode;
  /** Alias for content — backward compat with existing tooltip prop. */
  tooltip?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "center" | "start" | "end";
  /** ms before show; 0 = instant. Default 300 for general UI. */
  delay?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Tooltip({
  children,
  content,
  tooltip,
  side = "top",
  align = "center",
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const resolvedContent = content ?? tooltip;
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (disabled || resolvedContent == null) return;
    if (delay > 0) {
      timerRef.current = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(true);
    }
  }, [disabled, resolvedContent, delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setVisible(false);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  if (resolvedContent == null || disabled) return <>{children}</>;

  return (
    <div data-tooltip-wrap="" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <div
        data-tooltip=""
        data-side={side}
        data-align={align}
        data-visible={visible ? "true" : "false"}
        role="tooltip"
        aria-hidden={!visible}
      >
        {resolvedContent}
      </div>
    </div>
  );
}
