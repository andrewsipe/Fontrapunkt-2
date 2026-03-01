/**
 * Unit tests for MetadataExtractor
 */

import { describe, expect, it } from "vitest";
import { extractMetadata } from "../../../engine/extractors/MetadataExtractor";
import { createMockParsedFont } from "../../utils/mockParsedFont";

describe("MetadataExtractor", () => {
  it("should extract metadata from name table", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      nameTable: {
        1: "Test Family",
        2: "Regular",
        4: "Test Family Regular",
        6: "TestFamily-Regular",
        5: "Version 1.0",
        0: "Copyright Test",
      },
    });

    const result = extractMetadata(opentypeFont, null);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.familyName).toBe("Test Family");
    expect(result.data?.subfamilyName).toBe("Regular");
    expect(result.data?.postscriptName).toBe("TestFamily-Regular");
    expect(result.data?.fullName).toBe("Test Family Regular");
    expect(result.data?.version).toBe("Version 1.0");
    expect(result.data?.copyright).toBe("Copyright Test");
  });

  it("should prefer preferred family/subfamily over standard names", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      nameTable: {
        1: "Test Family",
        2: "Regular",
        16: "Preferred Family",
        17: "Preferred Subfamily",
      },
    });

    const result = extractMetadata(opentypeFont, null);

    expect(result.success).toBe(true);
    expect(result.data?.familyName).toBe("Test Family"); // Still uses nameID 1
    expect(result.data?.preferredFamily).toBe("Preferred Family");
    expect(result.data?.preferredSubfamily).toBe("Preferred Subfamily");
  });

  it("should use fallback values when nameIDs are missing", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      nameTable: {
        1: "Test Family",
        // Missing subfamily name
      },
    });

    const result = extractMetadata(opentypeFont, null);

    expect(result.success).toBe(true);
    expect(result.data?.familyName).toBe("Test Family");
    expect(result.data?.subfamilyName).toBe("Regular"); // Fallback
    expect(result.data?.postscriptName).toBe(""); // Empty string fallback
  });

  it('should use "Unknown" when family name is missing (LENIENT mode)', () => {
    const opentypeFont = createMockParsedFont("opentype", {
      nameTable: {
        // No nameID 1 or 16
        2: "Regular",
      },
    });

    const result = extractMetadata(opentypeFont, null);

    // LENIENT mode: Always returns success, uses "Unknown" as fallback
    expect(result.success).toBe(true);
    expect(result.data?.familyName).toBe("Unknown");
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some((w) => w.includes("Family name not found"))).toBe(true);
  });

  it("should merge data from both fontkit and opentype", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      nameTable: {
        1: "Opentype Family",
        2: "Regular",
      },
    });

    const fontkitFont = createMockParsedFont("fontkit", {
      nameTable: {
        1: "Fontkit Family",
        4: "Fontkit Full Name",
      },
    });

    const result = extractMetadata(opentypeFont, fontkitFont);

    expect(result.success).toBe(true);
    // Should prefer opentype (as per NameExtractor logic)
    expect(result.data?.familyName).toBe("Opentype Family");
  });
});
