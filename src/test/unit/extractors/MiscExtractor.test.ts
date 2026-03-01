/**
 * Unit tests for MiscExtractor
 */

import { describe, expect, it } from "vitest";
import { extractMisc } from "../../../engine/extractors/MiscExtractor";
import { createMockParsedFont } from "../../utils/mockParsedFont";

describe("MiscExtractor", () => {
  it("should extract miscellaneous data", () => {
    const opentypeFont = createMockParsedFont("opentype");
    const fontkitFont = createMockParsedFont("fontkit", {
      raw: {
        numGlyphs: 500,
        italicAngle: -12.5,
        underlinePosition: -100,
        underlineThickness: 50,
      },
    });

    const result = extractMisc(opentypeFont, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.glyphCount).toBeGreaterThan(0);
    expect(result.data?.fsSelection).toBeDefined();
    expect(result.data?.availableTables).toBeInstanceOf(Array);
  });

  it("should extract weight and width classes", () => {
    const fontkitFont = createMockParsedFont("fontkit", {
      raw: {
        "OS/2": {
          usWeightClass: 700,
          usWidthClass: 5,
        },
      },
    });

    const result = extractMisc(null, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data?.weightClass).toBe(700);
    expect(result.data?.widthClass).toBe(5);
  });

  it("should extract fsSelection flags", () => {
    const fontkitFont = createMockParsedFont("fontkit", {
      raw: {
        "OS/2": {
          fsSelection: 0x0001, // Italic bit
        },
      },
    });

    const result = extractMisc(null, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data?.fsSelection?.isItalic).toBe(true);
  });

  it("should handle missing data gracefully", () => {
    const result = extractMisc(null, null);

    expect(result.success).toBe(true);
    expect(result.data?.glyphCount).toBe(0);
    expect(result.data?.weightClass).toBeNull();
    expect(result.data?.fsSelection).toBeDefined();
  });
});
