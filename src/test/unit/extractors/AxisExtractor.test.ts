/**
 * Unit tests for AxisExtractor
 */

import { describe, expect, it } from "vitest";
import { extractAxes } from "../../../engine/extractors/AxisExtractor";
import { createMockParsedFont, createMockVariableFont } from "../../utils/mockParsedFont";

describe("AxisExtractor", () => {
  it("should extract axes from variable font", () => {
    const fontkitFont = createMockVariableFont("fontkit");

    const result = extractAxes(null, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBe(2);
    expect(result.data?.[0]?.tag).toBe("wght");
    expect(result.data?.[0]?.min).toBe(100);
    expect(result.data?.[0]?.max).toBe(900);
    expect(result.data?.[0]?.default).toBe(400);
    expect(result.data?.[1]?.tag).toBe("wdth");
  });

  it("should normalize axis names to strings", () => {
    const fontkitFont = createMockParsedFont("fontkit", {
      variationAxes: [
        {
          tag: "wght",
          name: { en: "Weight" }, // Object format
          min: 100,
          max: 900,
          default: 400,
        },
      ],
    });

    const result = extractAxes(null, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data?.[0]?.name).toBe("Weight"); // Normalized to string
  });

  it("should use tag as fallback when name is missing", () => {
    const fontkitFont = createMockParsedFont("fontkit", {
      variationAxes: [
        {
          tag: "wght",
          name: null,
          min: 100,
          max: 900,
          default: 400,
        },
      ],
    });

    const result = extractAxes(null, fontkitFont);

    expect(result.success).toBe(true);
    expect(result.data?.[0]?.name).toBe("wght"); // Tag as fallback
  });

  it("should return empty array for non-variable fonts", () => {
    const staticFont = createMockParsedFont("opentype", {
      variationAxes: null,
    });

    const result = extractAxes(staticFont, null);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("should prefer fontkit over opentype", () => {
    const fontkitFont = createMockVariableFont("fontkit");
    const opentypeFont = createMockParsedFont("opentype", {
      variationAxes: [
        {
          tag: "slnt",
          name: "Slant",
          min: -12,
          max: 0,
          default: 0,
        },
      ],
    });

    const result = extractAxes(opentypeFont, fontkitFont);

    expect(result.success).toBe(true);
    // Should use fontkit axes (wght, wdth) not opentype (slnt)
    expect(result.data?.length).toBe(2);
    expect(result.data?.[0]?.tag).toBe("wght");
  });
});
