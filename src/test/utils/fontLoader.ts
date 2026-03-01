/**
 * Font loading utilities for integration tests
 * Loads actual font files for golden data comparison
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFontkit } from "../../engine/parsers/FontkitParser";
import { parseOpentype } from "../../engine/parsers/OpentypeParser";
import type { ParsedFont } from "../../types/extractors.types";

const TEST_FONTS_DIR = join(process.cwd(), "test-fonts");

/**
 * Load a font file and parse it with both parsers
 */
export async function loadTestFont(filename: string): Promise<{
  fontkitParsed: ParsedFont | null;
  opentypeParsed: ParsedFont | null;
  buffer: ArrayBuffer;
}> {
  const fontPath = join(TEST_FONTS_DIR, filename);
  const fontBuffer = readFileSync(fontPath);
  const arrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  let fontkitParsed: ParsedFont | null = null;
  let opentypeParsed: ParsedFont | null = null;

  try {
    fontkitParsed = parseFontkit(arrayBuffer);
  } catch (error) {
    console.warn(`Failed to parse ${filename} with fontkit:`, error);
  }

  try {
    opentypeParsed = parseOpentype(arrayBuffer);
  } catch (error) {
    console.warn(`Failed to parse ${filename} with opentype:`, error);
  }

  return {
    fontkitParsed,
    opentypeParsed,
    buffer: arrayBuffer,
  };
}

/**
 * Get list of available test fonts
 */
export function getTestFonts(): string[] {
  return ["GrenettePro-Regular.ttf", "GrenettePro-Bold.ttf", "GrenettePro-Variable.ttf"];
}
