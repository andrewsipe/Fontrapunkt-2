/**
 * Axis Slider component
 * Individual slider for a variable font axis
 * Uses RAF (requestAnimationFrame) throttling for smooth 60fps updates.
 */

import { useCallback, useEffect, useRef } from "react";
import { useFontStore } from "../../../stores/fontStore";
import type { VariableAxis } from "../../../types/font.types";
import type { RafThrottled } from "../../../utils/rafThrottle";
import { rafThrottle } from "../../../utils/rafThrottle";
import { TwoLayerSlider } from "../../components/TwoLayerSlider";
import { Label } from "../../primitives/Label/Label";
import styles from "./AxisSlider.module.css";

interface AxisSliderProps {
  axis: VariableAxis;
  fontId: string;
  /** Optional preset values for magnetic snap (from named variations). */
  snapValues?: number[];
}

export function AxisSlider({ axis, fontId, snapValues }: AxisSliderProps) {
  const updateAxisValue = useFontStore((state) => state.updateAxisValue);

  // Create stable throttled function with cleanup
  const throttledUpdateRef = useRef<RafThrottled<
    (id: string, tag: string, value: number) => void
  > | null>(null);

  if (!throttledUpdateRef.current) {
    throttledUpdateRef.current = rafThrottle((id: string, tag: string, value: number) => {
      updateAxisValue(id, tag, value);
    });
  }

  const handleChange = useCallback(
    (value: number) => {
      throttledUpdateRef.current?.(fontId, axis.tag, value);
    },
    [fontId, axis.tag]
  );

  // Cleanup: cancel pending RAF when axis changes (axis.tag in deps so cleanup runs on axis switch)
  // biome-ignore lint/correctness/useExhaustiveDependencies: axis.tag intentionally triggers cleanup
  useEffect(() => {
    return () => {
      if (throttledUpdateRef.current?.cancel) {
        throttledUpdateRef.current.cancel();
      }
    };
  }, [axis.tag]);

  // Recreate throttle when updateAxisValue changes
  useEffect(() => {
    throttledUpdateRef.current = rafThrottle((id: string, tag: string, value: number) => {
      updateAxisValue(id, tag, value);
    });
  }, [updateAxisValue]);

  return (
    <div className={styles.axisSlider}>
      <div className={styles.axisHeader}>
        <div className={styles.axisNameGroup}>
          <Label as="span" variant="small" className={styles.axisName}>
            {axis.name}
          </Label>
          <span className={styles.axisTag}>({axis.tag})</span>
        </div>
      </div>

      <TwoLayerSlider
        value={axis.current}
        min={axis.min}
        max={axis.max}
        step={axis.tag === "wght" ? 1 : 0.1}
        onChange={handleChange}
        showDecimals={true}
        snapValues={snapValues}
        enablePrecisionWhenRangeAboveTrackRatio={2}
      />
    </div>
  );
}
