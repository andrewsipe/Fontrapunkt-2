/**
 * Unit tests for MetricsExtractor
 */

import { describe, expect, it } from "vitest";
import { extractMetrics } from "../../../engine/extractors/MetricsExtractor";
import { createMockParsedFont } from "../../utils/mockParsedFont";

describe("MetricsExtractor", () => {
  it("should extract all metrics from metrics table", () => {
    const parsedFont = createMockParsedFont("opentype", {
      metricsTable: {
        unitsPerEm: 1000,
        capHeight: 700,
        xHeight: 500,
        typoAscender: 800,
        typoDescender: -200,
        typoLineGap: 200,
        winAscent: 800,
        winDescent: 200,
        hheaAscender: 800,
        hheaDescender: -200,
        hheaLineGap: 200,
      },
    });

    const result = extractMetrics(parsedFont);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.unitsPerEm).toBe(1000);
    expect(result.data?.capHeight).toBe(700);
    expect(result.data?.xHeight).toBe(500);
    expect(result.data?.typoAscender).toBe(800);
    expect(result.data?.typoDescender).toBe(-200);
  });

  it("should handle missing optional metrics", () => {
    const parsedFont = createMockParsedFont("opentype", {
      metricsTable: {
        unitsPerEm: 1000,
        // Missing optional metrics
      },
    });

    const result = extractMetrics(parsedFont);

    expect(result.success).toBe(true);
    expect(result.data?.unitsPerEm).toBe(1000);
    expect(result.data?.capHeight).toBeNull();
    expect(result.data?.xHeight).toBeNull();
  });

  it("should fail when metrics table is missing", () => {
    const parsedFont = createMockParsedFont("opentype", {
      metricsTable: null,
    });

    const result = extractMetrics(parsedFont);

    // MetricsExtractor returns success: false when table is missing
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Metrics table");
  });

  it("should fail when unitsPerEm is zero", () => {
    const parsedFont = createMockParsedFont("opentype", {
      metricsTable: {
        unitsPerEm: 0,
      },
    });

    const result = extractMetrics(parsedFont);

    expect(result.success).toBe(false);
    expect(result.error).toContain("unitsPerEm is zero");
    expect(result.data).toBeDefined(); // Still returns partial data
  });

  it("should fail when no parsed font is provided", () => {
    const result = extractMetrics(null);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No parsed font provided");
  });
});
