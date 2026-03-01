/**
 * Slider Badge Positioning Utilities
 * Functions for calculating and updating badge positions on sliders
 */

/**
 * Calculate percentage position of value between min and max
 * @param value - Current slider value
 * @param min - Minimum slider value
 * @param max - Maximum slider value
 * @returns Percentage (0-100)
 */
export function calculatePercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Update value badge position to follow slider thumb
 * @param sliderElement - The range input element
 * @param badgeElement - The badge element to position
 * @param value - Current slider value
 * @param min - Minimum slider value
 * @param max - Maximum slider value
 */
export function updateValueBadgePosition(
  sliderElement: HTMLInputElement | null,
  badgeElement: HTMLElement | null,
  value: number,
  min: number,
  max: number
): void {
  if (!badgeElement || !sliderElement) return;

  const percent = calculatePercent(value, min, max);
  badgeElement.style.left = `${percent}%`;
}

/**
 * Update track dot position (for variable axes)
 * @param sliderElement - The range input element
 * @param dotElement - The track dot element to position
 * @param value - Current slider value
 * @param min - Minimum slider value
 * @param max - Maximum slider value
 */
export function updateTrackDotPosition(
  sliderElement: HTMLInputElement | null,
  dotElement: HTMLElement | null,
  value: number,
  min: number,
  max: number
): void {
  if (!dotElement || !sliderElement) return;

  const percent = calculatePercent(value, min, max);
  dotElement.style.left = `${percent}%`;
}
