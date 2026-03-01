/**
 * Export utility functions
 * CSS generation, screenshot, video recording
 */

import type { CachedFont } from "../types/font.types";
import { getCanvasFontStack } from "./notDefFontLoader";

/**
 * Generate CSS code for current font settings
 * Includes font-family, variations, features, and text properties
 */
export function generateCSS(
  font: CachedFont,
  options?: {
    variations?: Record<string, number>;
    features?: string[];
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
  }
): string {
  const css: string[] = [];

  // Font family (includes Adobe NotDef fallback for missing glyphs)
  css.push(`font-family: ${getCanvasFontStack(font.name)};`);

  // Font variations (if variable font)
  if (font.isVariable && font.axes) {
    const axisValues = options?.variations || {};
    font.axes.forEach((axis) => {
      if (axis.current !== undefined) {
        axisValues[axis.tag] = axis.current;
      }
    });

    if (Object.keys(axisValues).length > 0) {
      const variationSettings = Object.entries(axisValues)
        .map(([tag, value]) => `"${tag}" ${parseFloat(Number(value).toFixed(4))}`)
        .join(", ");
      css.push(`font-variation-settings: ${variationSettings};`);
    }
  }

  // OpenType features
  if (options?.features && options.features.length > 0) {
    const featureSettings = options.features.map((tag) => `"${tag}" 1`).join(", ");
    css.push(`font-feature-settings: ${featureSettings};`);
  }

  // Text properties
  if (options?.fontSize) {
    css.push(`font-size: ${options.fontSize}px;`);
  }
  if (options?.lineHeight) {
    css.push(`line-height: ${options.lineHeight};`);
  }
  if (options?.letterSpacing !== undefined) {
    css.push(`letter-spacing: ${options.letterSpacing / 1000}em;`);
  }
  if (options?.color) {
    css.push(`color: ${options.color};`);
  }

  return `.my-text {\n\t${css.join("\n\t")}\n}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate screenshot filename with font name and timestamp
 * @param fontName - Font name (can be undefined/null/empty)
 * @returns Sanitized filename: {fontName}-{YYYY-MM-DD}-{HHMMSS}.png
 */
export function generateScreenshotFilename(fontName: string | undefined | null): string {
  // Handle edge cases
  const safeName = fontName?.trim() || "font";

  // Sanitize: remove invalid filename characters
  const sanitized = safeName
    .replace(/[/\\:*?"<>|]/g, "-") // Replace invalid chars with hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Format date: YYYY-MM-DD-HHMMSS
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  // Combine: sanitizedName-YYYY-MM-DD-HHMMSS.png
  const baseFilename = `${sanitized}-${dateStr}-${timeStr}.png`;

  // Limit total length to 100 chars (keep date/time, truncate name if needed)
  if (baseFilename.length > 100) {
    const maxNameLength = 100 - (dateStr.length + timeStr.length + 3); // 3 for hyphens and .png
    const truncatedName = sanitized.slice(0, Math.max(1, maxNameLength));
    return `${truncatedName}-${dateStr}-${timeStr}.png`;
  }

  return baseFilename;
}

/**
 * Capture canvas as screenshot using html2canvas-pro
 * Supports OKLCH and other modern color functions
 * @param element - Element to capture
 * @param backgroundColor - Optional background color (hex string). Defaults to white if not provided.
 * @returns Promise with blob and dataUrl, or null on error
 */
export async function captureScreenshot(
  element: HTMLElement,
  backgroundColor?: string
): Promise<{ blob: Blob; dataUrl: string } | null> {
  try {
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(element, {
      backgroundColor: backgroundColor || "#ffffff",
      scale: window.devicePixelRatio || 2,
      useCORS: true,
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL("image/png");
          resolve({ blob, dataUrl });
        } else {
          resolve(null);
        }
      }, "image/png");
    });
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
}

/**
 * Record animation as video
 */
export async function recordAnimation(
  canvas: HTMLCanvasElement,
  duration: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const stream = canvas.captureStream(60); // 60fps
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000, // 8Mbps
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(blob);
      };

      recorder.onerror = (error) => {
        reject(error);
      };

      recorder.start();

      // Animation loop with progress tracking
      const startTime = performance.now();

      function drawFrame() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (onProgress) {
          onProgress(progress * 100);
        }

        if (progress < 1) {
          requestAnimationFrame(drawFrame);
        } else {
          recorder.stop();
        }
      }

      requestAnimationFrame(drawFrame);
    } catch (error) {
      reject(error);
    }
  });
}
