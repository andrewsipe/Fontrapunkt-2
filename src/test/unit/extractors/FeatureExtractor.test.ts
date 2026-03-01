/**
 * Unit tests for FeatureExtractor
 */

import { describe, expect, it } from "vitest";
import { extractFeatures } from "../../../engine/extractors/FeatureExtractor";
import { createMockParsedFont } from "../../utils/mockParsedFont";

describe("FeatureExtractor", () => {
  it("should extract features from opentype font", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      raw: {
        tables: {
          gsub: {
            features: {
              liga: {
                tag: "liga",
                feature: {
                  params: {
                    UINameID: 256,
                  },
                },
              },
              ss01: {
                tag: "ss01",
                feature: {
                  params: {
                    UINameID: 257,
                  },
                },
              },
            },
          },
        },
        names: {
          fontFamily: { en: "Test Font" },
        },
      },
    });

    const result = extractFeatures(opentypeFont, null);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBeGreaterThan(0);

    const ligaFeature = result.data?.find((f) => f.tag === "liga");
    expect(ligaFeature).toBeDefined();
    expect(ligaFeature?.name).toBeDefined();
    expect(ligaFeature?.category).toBeDefined();
  });

  it("should calculate UINameID for stylistic sets", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      raw: {
        tables: {
          gsub: {
            features: {
              ss01: {
                tag: "ss01",
                feature: {
                  // No UINameID in params
                },
              },
            },
          },
        },
        names: {
          fontFamily: { en: "Test Font" },
        },
      },
    });

    const result = extractFeatures(opentypeFont, null);

    expect(result.success).toBe(true);
    const ss01Feature = result.data?.find((f) => f.tag === "ss01");
    expect(ss01Feature).toBeDefined();
    // Should calculate UINameID as 256 (256 + 0 for ss01)
    expect(ss01Feature?.uinameid).toBe(256);
  });

  it("should fail when opentype font is missing", () => {
    const result = extractFeatures(null, null);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Opentype font required");
  });

  it("should handle fonts with no features", () => {
    const opentypeFont = createMockParsedFont("opentype", {
      raw: {
        tables: {
          gsub: null,
          gpos: null,
        },
        names: {
          fontFamily: { en: "Test Font" },
        },
      },
    });

    const result = extractFeatures(opentypeFont, null);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});
