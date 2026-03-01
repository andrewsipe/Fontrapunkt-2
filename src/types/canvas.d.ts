/**
 * Canvas type extensions
 * Extends CanvasRenderingContext2D with fontVariationSettings property
 * which is supported in browsers but not in TypeScript's default types
 */

interface CanvasRenderingContext2D {
  /**
   * CSS font-variation-settings property for variable fonts
   * Supported in modern browsers but not in TypeScript's default type definitions
   */
  fontVariationSettings?: string;
}
