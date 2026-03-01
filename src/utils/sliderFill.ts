/**
 * Slider Fill Utility
 * Updates slider fill based on current value for visual feedback
 */

import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Updates the slider's fill percentage as a CSS custom property
 * @param sliderElement - The range input element
 * @param value - Current value
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function updateSliderFill(
  sliderElement: HTMLInputElement,
  value: number,
  min: number,
  max: number
): void {
  const percent = ((value - min) / (max - min)) * 100;
  sliderElement.style.setProperty("--slider-percent", `${percent}%`);
}

/**
 * Initialize slider with fill on mount
 * @param sliderElement - The range input element
 */
export function initializeSliderFill(sliderElement: HTMLInputElement): void {
  const value = parseFloat(sliderElement.value);
  const min = parseFloat(sliderElement.min);
  const max = parseFloat(sliderElement.max);
  updateSliderFill(sliderElement, value, min, max);
}

/**
 * React hook for managing slider fill
 * @param sliderRef - Reference to the slider element
 * @param value - Current slider value
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function useSliderFill(
  sliderRef: RefObject<HTMLInputElement>,
  value: number,
  min: number,
  max: number
): void {
  useEffect(() => {
    if (sliderRef.current) {
      updateSliderFill(sliderRef.current, value, min, max);
    }
  }, [sliderRef, value, min, max]);
}
