/**
 * Glyph utilities
 * Functions for filtering and extracting glyphs from fonts
 */

import opentype from "opentype.js";
import type { CachedFont } from "../types/font.types";

/**
 * Get all available glyphs from a font
 */
export function getAvailableGlyphs(font: CachedFont): string[] {
  const glyphs: string[] = [];

  try {
    // Use opentype.js for glyph extraction
    const opentypeFont = opentype.parse(font.fileData as ArrayBuffer) as opentype.Font;

    // opentype.js uses a GlyphSet - iterate through glyphs by index
    if (opentypeFont.glyphs && opentypeFont.numGlyphs) {
      for (let i = 0; i < opentypeFont.numGlyphs; i++) {
        try {
          const glyph = opentypeFont.glyphs.get(i);
          if (glyph && glyph.unicode !== undefined && glyph.unicode !== null) {
            try {
              const char = String.fromCodePoint(glyph.unicode);
              if (char && !glyphs.includes(char)) {
                glyphs.push(char);
              }
            } catch {
              // Skip invalid unicode
            }
          }
        } catch {
          // Skip invalid glyph index
        }
      }
    }
  } catch (error) {
    console.error("Failed to extract glyphs from font:", error);
  }

  return glyphs.sort();
}

/**
 * Filter text to only include glyphs available in the font
 */
export function filterToAvailableGlyphs(text: string, font: CachedFont): string {
  const availableGlyphs = getAvailableGlyphs(font);
  const availableSet = new Set(availableGlyphs);

  return Array.from(text)
    .filter((char) => availableSet.has(char))
    .join("");
}

/**
 * Check if a character exists in the font
 */
export function hasGlyph(char: string, font: CachedFont): boolean {
  const availableGlyphs = getAvailableGlyphs(font);
  return availableGlyphs.includes(char);
}
