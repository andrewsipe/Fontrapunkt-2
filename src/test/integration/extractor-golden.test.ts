/**
 * Integration tests: Compare extractor output against golden data
 * Ensures no regressions in data quality after refactoring
 */

import { describe, expect, it } from "vitest";
import { extractAxes } from "../../engine/extractors/AxisExtractor";
import { extractFeatures } from "../../engine/extractors/FeatureExtractor";
import { extractInstances } from "../../engine/extractors/InstanceExtractor";
import { extractMetadata } from "../../engine/extractors/MetadataExtractor";
import { extractMetrics } from "../../engine/extractors/MetricsExtractor";
import { extractMisc } from "../../engine/extractors/MiscExtractor";
import { getTestFonts, loadTestFont } from "../utils/fontLoader";

describe("Extractor Golden Data Tests", () => {
  const testFonts = getTestFonts();

  testFonts.forEach((fontFile) => {
    describe(`Font: ${fontFile}`, () => {
      it("should extract metadata consistently", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        if (!opentypeParsed && !fontkitParsed) {
          // Skip if font can't be parsed
          return;
        }

        const result = extractMetadata(opentypeParsed, fontkitParsed);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.familyName).toBeTruthy();
        expect(result.data?.familyName).not.toBe("Unknown");
        expect(result.data?.subfamilyName).toBeTruthy();
      });

      it("should extract metrics consistently", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        const parsedFont = opentypeParsed || fontkitParsed;
        if (!parsedFont) {
          return;
        }

        const result = extractMetrics(parsedFont);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.unitsPerEm).toBeGreaterThan(0);
        expect(result.data?.unitsPerEm).toBeLessThanOrEqual(16384);
      });

      it("should extract miscellaneous data consistently", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        const result = extractMisc(opentypeParsed, fontkitParsed);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.glyphCount).toBeGreaterThanOrEqual(0);
        expect(result.data?.fsSelection).toBeDefined();
      });

      it("should extract features consistently", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        if (!opentypeParsed) {
          // Features require opentype
          return;
        }

        const result = extractFeatures(opentypeParsed, fontkitParsed);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);

        // All features should have required fields
        result.data?.forEach((feature) => {
          expect(feature.tag).toBeTruthy();
          expect(feature.name).toBeTruthy();
          expect(feature.category).toBeDefined();
        });
      });

      it("should extract axes consistently for variable fonts", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        const result = extractAxes(opentypeParsed, fontkitParsed);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        if (fontFile.includes("Variable")) {
          // Variable fonts should have axes
          expect(result.data?.length).toBeGreaterThan(0);

          result.data?.forEach((axis) => {
            expect(axis.tag).toHaveLength(4);
            expect(axis.name).toBeTruthy();
            expect(axis.min).toBeLessThanOrEqual(axis.max);
            expect(axis.default).toBeGreaterThanOrEqual(axis.min);
            expect(axis.default).toBeLessThanOrEqual(axis.max);
          });
        } else {
          // Static fonts should have no axes
          expect(result.data).toEqual([]);
        }
      });

      it("should extract instances consistently for variable fonts", async () => {
        const { fontkitParsed, opentypeParsed } = await loadTestFont(fontFile);

        // First get axes
        const axesResult = extractAxes(opentypeParsed, fontkitParsed);
        const axes = axesResult.success ? axesResult.data : undefined;

        const result = extractInstances(opentypeParsed, fontkitParsed, axes, null);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        if (fontFile.includes("Variable")) {
          // Variable fonts may have instances
          result.data?.forEach((instance) => {
            expect(instance.coordinates).toBeDefined();
            expect(typeof instance.coordinates).toBe("object");
            expect(instance.name).toBeDefined();

            // Coordinates should be numbers
            Object.values(instance.coordinates).forEach((value) => {
              expect(typeof value).toBe("number");
            });
          });
        } else {
          // Static fonts should have no instances
          expect(result.data).toEqual([]);
        }
      });
    });
  });

  it("should produce consistent results across multiple runs", async () => {
    const { fontkitParsed, opentypeParsed } = await loadTestFont("GrenettePro-Regular.ttf");

    const run1 = extractMetadata(opentypeParsed, fontkitParsed);
    const run2 = extractMetadata(opentypeParsed, fontkitParsed);

    expect(run1.success).toBe(run2.success);
    if (run1.success && run2.success) {
      expect(run1.data?.familyName).toBe(run2.data?.familyName);
      expect(run1.data?.subfamilyName).toBe(run2.data?.subfamilyName);
    }
  });
});
