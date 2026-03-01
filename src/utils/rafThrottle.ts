export type RafThrottled<T extends (...args: any[]) => void> = ((
  ...args: Parameters<T>
) => void) & { cancel: () => void };

/**
 * RAF-based throttle for smooth animations
 * Optimized for real-time UI updates like sliders
 *
 * Features:
 * - First call executes immediately (no perceived lag)
 * - Subsequent calls throttled to requestAnimationFrame (~60fps)
 * - Last value always applied (trailing edge)
 * - cancel() for cleanup when axis changes or component unmounts
 */
export function rafThrottle<T extends (...args: any[]) => void>(fn: T): RafThrottled<T> {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let isFirstCall = true;

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args;

    // First call: execute immediately for instant feedback
    if (isFirstCall) {
      isFirstCall = false;
      fn(...args);
      return;
    }

    // Subsequent calls: throttle to RAF
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };

  // Expose cancel method for cleanup
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastArgs = null;
    }
    isFirstCall = true; // Reset for next use
  };

  return throttled;
}
