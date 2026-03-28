/**
 * TwoLayerSlider – Coarse snap + expandable precision (optional)
 * Layer 1: Drag thumb or track → snaps to step. Release → thumb expands (if enablePrecision=true).
 * Layer 2: Drag dot for fine (±PRECISION_HALF). Drag body to reposition at coarse step.
 * Styling from tokens (motion: --ease-expand, --duration-expand, etc.; color: accent, bg, border; spacing).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./TwoLayerSlider.module.css";

// ---------------------------------------------------------------------------
// Helpers for magnetic snap (snapValues)
// ---------------------------------------------------------------------------
function nearestInList(value: number, list: number[]): number {
  if (list.length === 0) return value;
  return list.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function applySnapIfClose(
  value: number,
  snapValues: number[],
  min: number,
  max: number,
  thresholdRatio: number
): number {
  if (snapValues.length === 0) return value;
  const nearest = nearestInList(value, snapValues);
  const dist = Math.abs(value - nearest);
  const threshold = (max - min) * thresholdRatio;
  return dist <= threshold ? nearest : value;
}

const MAGNETIC_THRESHOLD_RATIO = 0.015;

// ---------------------------------------------------------------------------
// Constants – must match tokens.spacing.css and tokens.motion.css
// ---------------------------------------------------------------------------
const TRACK_PADDING = 4; /* --slider-track-inset (--spacing-gap-tight) */
const THUMB_NORMAL_W = 45; /* --slider-thumb-width */
const THUMB_EXPANDED_W = 105; /* --slider-thumb-expanded-width */
const THUMB_NORMAL_H = 18; /* --slider-thumb-height */
const THUMB_EXPANDED_H = 34; /* --slider-thumb-expanded-height */
const PRECISION_DOT_W = 14; /* --slider-precision-dot-size */
const MINI_INSET = 8; /* --slider-mini-inset (--space-xs) */
const PRECISION_HALF = 50;
const DISMISS_IDLE_MS = 1200;
const EXPAND_MS = 280; /* --duration-expand */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TwoLayerSliderProps {
  min: number;
  max: number;
  /** Step for coarse snapping. Preferred over `coarseStep` for API consistency. */
  step?: number;
  /**
   * @deprecated Use `step` instead. Coarse step for snapping; kept for backward compatibility.
   */
  coarseStep?: number;
  value: number;
  onChange: (value: number) => void;
  /** Optional debug log (layer + value) */
  onLog?: (entry: { layer: 1 | 2; value: number }) => void;
  /** Enable precision mode (2L). If false, acts like a single-layer slider with step snapping. Default: true */
  enablePrecision?: boolean;
  /** When set, enable 2L only when range > (ratio × track width in px). Overridden by explicit enablePrecision. E.g. 2 = "range > 2× track width". */
  enablePrecisionWhenRangeAboveTrackRatio?: number;
  /** When true, display value with one decimal (e.g. 50.0). Default: false */
  showDecimals?: boolean;
  /** Optional preset values for magnetic snap (e.g. axis values from named variations). */
  snapValues?: number[] | null;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Two-layer slider
// ---------------------------------------------------------------------------
export function TwoLayerSlider({
  min,
  max,
  step: stepProp,
  coarseStep: coarseStepProp,
  value,
  onChange,
  onLog,
  enablePrecision: enablePrecisionProp,
  enablePrecisionWhenRangeAboveTrackRatio,
  showDecimals = false,
  snapValues,
  disabled = false,
}: TwoLayerSliderProps) {
  const step = stepProp ?? coarseStepProp ?? 1;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const trackWidthPx = containerWidth - TRACK_PADDING * 2;
  const effectivePrecision =
    enablePrecisionProp !== undefined
      ? enablePrecisionProp
      : enablePrecisionWhenRangeAboveTrackRatio != null
        ? trackWidthPx <= 0
          ? true
          : max - min > enablePrecisionWhenRangeAboveTrackRatio * trackWidthPx
        : true;

  const [isDraggingCoarse, setIsDraggingCoarse] = useState(false);
  const coarseValueRef = useRef(Math.round(value / step) * step);
  const lastRawValueRef = useRef<number>(value);
  const lastClientXRef = useRef<number>(0);
  const hasSnapValues = snapValues != null && snapValues.length > 0;

  const [precisionOpen, setPrecisionOpen] = useState(false);
  const [expandPhase, setExpandPhase] = useState<"idle" | "container" | "content">("idle");
  const [contentAnimateIn, setContentAnimateIn] = useState(false);
  const [containerWidthAnim, setContainerWidthAnim] = useState(THUMB_NORMAL_W);
  const [isDraggingPrecision, setIsDraggingPrecision] = useState(false);
  const [isDraggingBody, setIsDraggingBody] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(() => value.toString());
  const precisionAnchorRef = useRef(coarseValueRef.current);
  const expandedThumbLeftRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Which target (body vs dot) started the 300ms timer; used when timer fires to start the right drag. */
  const firstClickTargetRef = useRef<"body" | "dot" | null>(null);

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DOUBLE_CLICK_MS = 300;

  const clearClickTimer = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    firstClickTargetRef.current = null;
  }, []);

  const openEditFrom2L = useCallback((valueToEdit: string) => {
    setIsDraggingBody(false);
    setIsDraggingPrecision(false);
    setPrecisionOpen(false);
    setIsEditing(true);
    setEditValue(valueToEdit);
  }, []);

  const resetDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setPrecisionOpen(false);
    }, DISMISS_IDLE_MS);
  }, []);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (precisionOpen && effectivePrecision) {
      resetDismissTimer();
    } else {
      clearDismissTimer();
    }
    return () => clearDismissTimer();
  }, [precisionOpen, effectivePrecision, resetDismissTimer, clearDismissTimer]);

  useEffect(() => {
    if (!precisionOpen) {
      setExpandPhase("idle");
      setContentAnimateIn(false);
      setContainerWidthAnim(THUMB_NORMAL_W);
      return;
    }
  }, [precisionOpen]);

  // Content phase: start with dot/fill at center/zero, then transition to final
  useEffect(() => {
    if (expandPhase !== "content") return;
    setContentAnimateIn(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setContentAnimateIn(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [expandPhase]);

  useEffect(() => {
    if (expandPhase !== "container") return;
    const raf = requestAnimationFrame(() => {
      setContainerWidthAnim(THUMB_EXPANDED_W);
    });
    const timeoutId = setTimeout(() => {
      setExpandPhase("content");
    }, EXPAND_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeoutId);
    };
  }, [expandPhase]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isDraggingCoarse && !isDraggingPrecision && !isDraggingBody) {
      const snapped = Math.max(min, Math.min(max, Math.round(value / step) * step));
      coarseValueRef.current = snapped;
      precisionAnchorRef.current = snapped;
      lastRawValueRef.current = value;
    }
  }, [value, min, max, step, isDraggingCoarse, isDraggingPrecision, isDraggingBody]);

  const getCoarseValueFromX = useCallback(
    (clientX: number): number => {
      if (!containerRef.current) return coarseValueRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      const usable = rect.width - TRACK_PADDING * 2;
      const relX = clientX - rect.left - TRACK_PADDING;
      const pct = Math.max(0, Math.min(1, relX / usable));
      const raw = min + pct * (max - min);
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, step]
  );

  const getRawValueFromX = useCallback(
    (clientX: number): number => {
      if (!containerRef.current) return value;
      const rect = containerRef.current.getBoundingClientRect();
      const trackWidth = rect.width - TRACK_PADDING * 2;
      const relativeX = clientX - rect.left - TRACK_PADDING;
      const percent = Math.max(0, Math.min(1, relativeX / trackWidth));
      const rawValue = min + percent * (max - min);
      return Math.max(min, Math.min(max, rawValue));
    },
    [min, max, value]
  );

  const displayValue = useMemo(
    () => (showDecimals ? value.toFixed(1) : Math.round(value).toString()),
    [value, showDecimals]
  );

  useEffect(() => {
    if (!isDraggingCoarse) return;
    const onMove = (e: MouseEvent) => {
      if (hasSnapValues && snapValues && containerWidth > 0) {
        const usable = containerWidth - TRACK_PADDING * 2;
        if (usable <= 0) return;
        const deltaPx = e.clientX - lastClientXRef.current;
        const unitsPerPx = (max - min) / usable;
        const deltaValue = deltaPx * unitsPerPx;
        const rawValue = lastRawValueRef.current + deltaValue;
        const clampedRaw = Math.max(min, Math.min(max, rawValue));
        lastRawValueRef.current = clampedRaw;
        lastClientXRef.current = e.clientX;
        const snappedValue = applySnapIfClose(
          clampedRaw,
          snapValues,
          min,
          max,
          MAGNETIC_THRESHOLD_RATIO
        );
        coarseValueRef.current = snappedValue;
        onChange(snappedValue);
        onLog?.({ layer: 1, value: snappedValue });
      } else {
        const v = getCoarseValueFromX(e.clientX);
        coarseValueRef.current = v;
        onChange(v);
        onLog?.({ layer: 1, value: v });
      }
    };
    const onUp = () => {
      setIsDraggingCoarse(false);
      if (effectivePrecision) {
        precisionAnchorRef.current = coarseValueRef.current;
        setExpandPhase("container");
        setContainerWidthAnim(THUMB_NORMAL_W);
        setPrecisionOpen(true);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    isDraggingCoarse,
    effectivePrecision,
    hasSnapValues,
    snapValues,
    min,
    max,
    containerWidth,
    getCoarseValueFromX,
    onChange,
    onLog,
  ]);

  const handleTrackDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPrecisionOpen(false);
    clearDismissTimer();
    setIsDraggingCoarse(true);
    if (hasSnapValues && snapValues) {
      const raw = getRawValueFromX(e.clientX);
      lastRawValueRef.current = raw;
      lastClientXRef.current = e.clientX;
      const snappedValue = applySnapIfClose(raw, snapValues, min, max, MAGNETIC_THRESHOLD_RATIO);
      coarseValueRef.current = snappedValue;
      onChange(snappedValue);
      onLog?.({ layer: 1, value: snappedValue });
    } else {
      const v = getCoarseValueFromX(e.clientX);
      coarseValueRef.current = v;
      onChange(v);
      onLog?.({ layer: 1, value: v });
    }
  };

  const handleThumbExpandedDown = (e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current++;

    if (clickCountRef.current === 2) {
      // Second click within 300ms: enter edit mode (Option C: double-click opens edit)
      clearClickTimer();
      clickCountRef.current = 0;
      openEditFrom2L(displayValue);
    } else if (clickCountRef.current === 1) {
      // First click: start body drag only after delay so double-click can open edit (Option C)
      clearClickTimer();
      firstClickTargetRef.current = "body";
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        if (firstClickTargetRef.current === "body") {
          setIsDraggingBody(true);
        }
        firstClickTargetRef.current = null;
        clickTimerRef.current = null;
      }, DOUBLE_CLICK_MS);
    }
  };

  const handlePrecisionDotDown = (e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current++;

    if (clickCountRef.current === 2) {
      // Second click within 300ms: double-click on dot opens edit
      clearClickTimer();
      clickCountRef.current = 0;
      openEditFrom2L(displayValue);
    } else if (clickCountRef.current === 1) {
      // First click: start precision drag only after delay so double-click can open edit
      clearClickTimer();
      firstClickTargetRef.current = "dot";
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        if (firstClickTargetRef.current === "dot") {
          setIsDraggingPrecision(true);
        }
        firstClickTargetRef.current = null;
        clickTimerRef.current = null;
      }, DOUBLE_CLICK_MS);
    }
  };

  const handleThumbCoarseDown = (e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current++;

    if (clickCountRef.current === 1) {
      // First click: start drag after brief delay (300ms)
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, DOUBLE_CLICK_MS);
      if (hasSnapValues) {
        lastRawValueRef.current = value;
        lastClientXRef.current = e.clientX;
      }
      setIsDraggingCoarse(true);
    } else if (clickCountRef.current === 2) {
      // Second click within 300ms: enter edit mode, cancel drag
      clearClickTimer();
      clickCountRef.current = 0;
      setIsDraggingCoarse(false);
      setIsEditing(true);
      setEditValue(displayValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (!showDecimals) {
      newValue = newValue.replace(/[^0-9-]/g, "");
    } else {
      newValue = newValue.replace(/[^0-9.-]/g, "");
    }
    setEditValue(newValue);
  };

  const commitEdit = () => {
    const num = showDecimals
      ? Number.parseFloat(editValue)
      : Math.round(Number.parseFloat(editValue));
    if (!Number.isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      const valueToEmit =
        hasSnapValues && snapValues
          ? applySnapIfClose(clamped, snapValues, min, max, MAGNETIC_THRESHOLD_RATIO)
          : clamped;
      onChange(valueToEmit);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditValue(displayValue);
      setIsEditing(false);
    }
  };

  const precisionMin = Math.max(min, precisionAnchorRef.current - PRECISION_HALF);
  const precisionMax = Math.min(max, precisionAnchorRef.current + PRECISION_HALF);
  const precisionRange = precisionMax - precisionMin;
  // Mini track now spans full width minus insets
  const miniTrackWidth = THUMB_EXPANDED_W - MINI_INSET * 2;

  const getPrecisionValueFromX = useCallback(
    (clientX: number): number => {
      if (containerWidth === 0 || !containerRef.current) return precisionAnchorRef.current;
      const thumbEl = containerRef.current.querySelector(`.${styles.thumb}`) as HTMLElement | null;
      if (!thumbEl) return precisionAnchorRef.current;
      const thumbRect = thumbEl.getBoundingClientRect();
      const relX = clientX - thumbRect.left - MINI_INSET;
      const pct = Math.max(0, Math.min(1, relX / miniTrackWidth));
      const v = precisionMin + pct * precisionRange;
      return Math.max(precisionMin, Math.min(precisionMax, v));
    },
    [containerWidth, precisionMin, precisionMax, precisionRange, miniTrackWidth]
  );

  useEffect(() => {
    if (!isDraggingPrecision) return;
    clearDismissTimer();
    const onMove = (e: MouseEvent) => {
      const v = getPrecisionValueFromX(e.clientX);
      onChange(v);
      onLog?.({ layer: 2, value: v });
    };
    const onUp = () => {
      setIsDraggingPrecision(false);
      resetDismissTimer();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    isDraggingPrecision,
    getPrecisionValueFromX,
    onChange,
    onLog,
    clearDismissTimer,
    resetDismissTimer,
  ]);

  useEffect(() => {
    if (!isDraggingBody) return;
    clearDismissTimer();
    const onMove = (e: MouseEvent) => {
      const v = getCoarseValueFromX(e.clientX);
      coarseValueRef.current = v;
      precisionAnchorRef.current = v;
      onChange(v);
      onLog?.({ layer: 1, value: v });
    };
    const onUp = () => {
      setIsDraggingBody(false);
      resetDismissTimer();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingBody, getCoarseValueFromX, onChange, onLog, clearDismissTimer, resetDismissTimer]);

  useEffect(() => {
    if (!precisionOpen) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPrecisionOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [precisionOpen]);

  const getPercent = useCallback(
    (val: number): number => {
      if (max === min) return 0;
      return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    },
    [min, max]
  );

  const thumbPct = getPercent(value);

  const normalThumbLeft = useMemo(() => {
    if (containerWidth === 0) return TRACK_PADDING;
    const usable = containerWidth - TRACK_PADDING * 2;
    return TRACK_PADDING + (thumbPct / 100) * (usable - THUMB_NORMAL_W);
  }, [containerWidth, thumbPct]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: precisionOpen/value trigger recalc to read ref
  const expandedThumbLeft = useMemo(() => {
    if (containerWidth === 0) return TRACK_PADDING;
    const usable = containerWidth - TRACK_PADDING * 2;
    const anchorPct = getPercent(precisionAnchorRef.current);
    // Center-aligned in the middle; clamp so at min left edge = track left, at max right edge = track right
    const anchorCenterPx = TRACK_PADDING + (anchorPct / 100) * usable;
    let left = anchorCenterPx - THUMB_EXPANDED_W / 2;
    left = Math.max(
      TRACK_PADDING,
      Math.min(containerWidth - TRACK_PADDING - THUMB_EXPANDED_W, left)
    );
    return left;
  }, [containerWidth, precisionOpen, getPercent, value]);

  useEffect(() => {
    expandedThumbLeftRef.current = expandedThumbLeft;
  }, [expandedThumbLeft]);

  // Dot is center-positioned (translate -50%); position along full mini track
  const precisionDotLeft = useMemo(() => {
    if (precisionRange === 0) return MINI_INSET + miniTrackWidth / 2;
    const pct = (value - precisionMin) / precisionRange;
    // Min position: left edge at MINI_INSET + half dot width
    const minCenter = MINI_INSET + PRECISION_DOT_W / 2;
    // Max position: right edge at THUMB_EXPANDED_W - MINI_INSET - half dot width
    const maxCenter = THUMB_EXPANDED_W - MINI_INSET - PRECISION_DOT_W / 2;
    return minCenter + pct * (maxCenter - minCenter);
  }, [value, precisionMin, precisionRange, miniTrackWidth]);

  const expandStartCenterPx =
    containerWidth > 0 ? normalThumbLeft + THUMB_NORMAL_W / 2 : TRACK_PADDING + THUMB_NORMAL_W / 2;
  const containerPhaseLeft =
    containerWidth > 0
      ? Math.max(
          TRACK_PADDING,
          Math.min(
            containerWidth - TRACK_PADDING - containerWidthAnim,
            expandStartCenterPx - containerWidthAnim / 2
          )
        )
      : TRACK_PADDING;

  const thumbLeft =
    precisionOpen && expandPhase === "container"
      ? containerPhaseLeft
      : precisionOpen && expandPhase === "content"
        ? expandedThumbLeft
        : normalThumbLeft;
  const thumbW =
    precisionOpen && expandPhase === "container"
      ? containerWidthAnim
      : precisionOpen
        ? THUMB_EXPANDED_W
        : THUMB_NORMAL_W;
  const thumbH =
    precisionOpen && expandPhase === "container"
      ? THUMB_NORMAL_H +
        ((THUMB_EXPANDED_H - THUMB_NORMAL_H) * (containerWidthAnim - THUMB_NORMAL_W)) /
          (THUMB_EXPANDED_W - THUMB_NORMAL_W)
      : precisionOpen
        ? THUMB_EXPANDED_H
        : THUMB_NORMAL_H;

  const thumbCursor = precisionOpen
    ? isDraggingBody
      ? styles.cursorGrabbing
      : styles.cursorGrab
    : isDraggingCoarse
      ? styles.cursorGrabbing
      : styles.cursorGrab;

  let precisionRangeLoX = 0;
  let precisionRangeWidth = 0;
  if (precisionOpen && expandPhase === "content" && containerWidth > 0) {
    const usable = containerWidth - TRACK_PADDING * 2;
    precisionRangeLoX = TRACK_PADDING + ((precisionMin - min) / (max - min)) * usable;
    const hiX = TRACK_PADDING + ((precisionMax - min) / (max - min)) * usable;
    precisionRangeWidth = hiX - precisionRangeLoX;
  }

  const fillLeft = MINI_INSET;
  const fillWidth = contentAnimateIn ? Math.max(0, precisionDotLeft - MINI_INSET) : 0;
  const dotLeft = contentAnimateIn ? precisionDotLeft : MINI_INSET + miniTrackWidth / 2;

  return (
    <div ref={containerRef} className={styles.root} data-disabled={disabled || undefined}>
      <button
        type="button"
        onMouseDown={handleTrackDown}
        className={styles.track}
        aria-label="Slider track"
        disabled={disabled}
      />
      <div
        className={styles.trackFill}
        style={{
          width:
            containerWidth > 0
              ? `${Math.max(0, Math.min(100, ((thumbLeft - TRACK_PADDING) / containerWidth) * 100))}%`
              : "0%",
        }}
        aria-hidden
      />

      {precisionOpen && expandPhase === "content" && containerWidth > 0 && (
        <div
          className={styles.precisionRangeHighlight}
          style={{
            left: precisionRangeLoX,
            width: precisionRangeWidth,
          }}
          aria-hidden
        />
      )}

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Two-layer slider"
        aria-disabled={disabled || undefined}
        className={`${styles.thumb} ${precisionOpen ? styles.thumbExpanded : styles.thumbCoarse} ${expandPhase === "container" ? styles.thumbExpandContainer : ""} ${isDraggingBody ? styles.thumbDraggingBody : ""} ${thumbCursor}`}
        style={{
          left: thumbLeft,
          width: thumbW,
          height: thumbH,
        }}
        onMouseDown={precisionOpen ? handleThumbExpandedDown : handleThumbCoarseDown}
        onMouseEnter={precisionOpen ? resetDismissTimer : undefined}
        onMouseLeave={precisionOpen ? resetDismissTimer : undefined}
      >
        {precisionOpen && expandPhase === "content" ? (
          <div className={styles.thumbInner}>
            <div className={styles.miniTrack} aria-hidden />
            <div
              className={styles.miniTrackFill}
              style={{
                left: fillLeft,
                width: fillWidth,
              }}
              aria-hidden
            />
            <div
              onMouseDown={handlePrecisionDotDown}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={precisionMin}
              aria-valuemax={precisionMax}
              aria-valuenow={value}
              aria-label="Precision adjustment"
              aria-disabled={disabled || undefined}
              className={`${styles.precisionDot} ${isDraggingPrecision ? styles.precisionDotDragging : ""}`}
              style={{ left: dotLeft }}
            >
              {/* Value inside precision dot - identical to 1L thumb */}
              <span className={styles.precisionDotValue}>{displayValue}</span>
            </div>
          </div>
        ) : precisionOpen && expandPhase === "container" ? null : isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode={showDecimals ? "decimal" : "numeric"}
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={commitEdit}
            onMouseDown={(e) => e.stopPropagation()}
            className={styles.thumbInput}
            disabled={disabled}
          />
        ) : (
          <span className={styles.valueLabelCoarse}>{displayValue}</span>
        )}
      </div>
    </div>
  );
}
