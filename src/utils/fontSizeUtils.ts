/**
 * Font Size Calculation Utilities
 * Calculates the font size needed to fit text within a container
 * while respecting word wrapping and container boundaries.
 */

/**
 * Calculates the maximum font size that allows the text to fit
 * completely within the container width and height.
 * Uses a Binary Search approach on a hidden DOM element to accurately
 * simulate browser text wrapping behavior.
 *
 * @param containerWidth - Width of the available space
 * @param containerHeight - Height of the available space
 * @param textContent - The string to measure
 * @param font - The font family name
 * @param lineHeight - The current line-height multiplier
 * @param letterSpacing - The current letter-spacing value (tracking in 1/1000em)
 * @param fillFactor - Fill factor (0.0 to 1.0) controlling how much of container to use (default: 0.95)
 * @param useTextBoxTrim - When true, apply text-box trim (cap alphabetic) so measured height is trimmed; allows larger font when Vertical Trim is on
 * @param textWrap - Match live view (e.g. "balance" | "stable" | "pretty" | "auto"); clone must wrap like the canvas or fit is wrong
 * @returns The calculated font size in pixels
 */
export function calculateAutoFitFontSize(
  containerWidth: number,
  containerHeight: number,
  textContent: string,
  font: string,
  lineHeight: number,
  letterSpacing: number,
  fillFactor: number = 1.0,
  useTextBoxTrim: boolean = false,
  textWrap: string = "auto"
): number {
  if (!textContent || containerWidth <= 0 || containerHeight <= 0) return 10;

  // Apply fill factor to effective container height
  const effectiveHeight = containerHeight * fillFactor;

  // 1. Create a hidden clone element to simulate layout
  const el = document.createElement("div");
  el.style.visibility = "hidden";
  el.style.position = "absolute";
  el.style.top = "-9999px";
  el.style.left = "-9999px";

  // 2. Mirror the essential text styles (must match PlainView or fit will be wrong)
  el.style.width = `${containerWidth}px`; // Force fixed width to simulate wrapping
  el.style.fontFamily = font;
  el.style.lineHeight = lineHeight.toString();
  el.style.letterSpacing = `${letterSpacing / 1000}em`;
  el.style.whiteSpace = "pre-wrap"; // Preserve newlines but allow wrapping
  el.style.wordBreak = "break-word"; // Ensure long words don't overflow horizontally
  el.style.textWrap = textWrap; // Same as canvas so line breaks match (balance/stable/pretty/auto)
  if (useTextBoxTrim) {
    // Trim to cap height and baseline so scrollHeight reflects trimmed block; allows slightly larger font when Vertical Trim is on
    el.style.setProperty("text-box", "trim-both cap alphabetic");
  }
  el.innerText = textContent;

  document.body.appendChild(el);

  // 3. Binary Search for the best fit
  // We look for the largest size where the text fits both width and height.
  // Use 1px tolerance on height so the clone (in body) doesn't reject a size that would fit in the live container (rounding/context can differ).
  const VERTICAL_TOLERANCE_PX = 1;
  let min = 1;
  let max = effectiveHeight; // Optimization: Font size rarely exceeds effective height
  let bestFit = min;

  // Iterate to find optimal size (logarithmic complexity is fast)
  while (min <= max) {
    const mid = Math.floor((min + max) / 2);
    el.style.fontSize = `${mid}px`;

    // Check dimensions
    // scrollHeight is the total height of the content
    // scrollWidth is the total width (important if a single word is very long)
    const fitsVertical = el.scrollHeight <= effectiveHeight + VERTICAL_TOLERANCE_PX;
    const fitsHorizontal = el.scrollWidth <= containerWidth;

    if (fitsVertical && fitsHorizontal) {
      bestFit = mid;
      min = mid + 1; // Try a larger font
    } else {
      max = mid - 1; // Too big, try smaller
    }
  }

  // 4. Widow detection: avoid single-word last lines (only for short, prose-like content)
  // Skip for long/specimen content so we don't over-shrink (e.g. 3000 chars → was 22px manual, 10px auto)
  const spaceCount = (textContent.match(/\s/g) ?? []).length;
  const runWidowDetection = textContent.length < 800 && spaceCount >= 5;

  if (runWidowDetection) {
    const checkForWidows = (fontSize: number): boolean => {
      if (fontSize <= 10) return false;

      el.style.fontSize = `${fontSize}px`;
      const currentHeight = el.scrollHeight;
      el.style.fontSize = `${fontSize - 1}px`;
      const reducedHeight = el.scrollHeight;
      el.style.fontSize = `${fontSize}px`;

      const lineHeightPx = fontSize * lineHeight;
      const heightReduction = currentHeight - reducedHeight;
      if (heightReduction >= lineHeightPx * 0.8) {
        const text = el.innerText.trim();
        const lastWord = text.split(/\s+/).pop() || "";
        return lastWord.length < 8;
      }
      return false;
    };

    while (checkForWidows(bestFit) && bestFit > 10) {
      bestFit--;
      if (bestFit < 10) break;
    }
  }

  // 5. Cleanup
  document.body.removeChild(el);

  return bestFit;
}
