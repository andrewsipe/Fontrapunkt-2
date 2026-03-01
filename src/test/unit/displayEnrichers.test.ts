/**
 * Unit tests for displayEnrichers (getDisplayData) — variable table enrichers.
 * Spot-checks that fvar, avar, MVAR, STAT, HVAR, VVAR, cvar, gvar receive a
 * summary and that _note is preserved.
 */

import { describe, expect, it } from "vitest";
import { getDisplayData } from "../../engine/parsers/tables/displayEnrichers";

const emptyContext = {};

describe("getDisplayData — variable enrichers", () => {
  it("adds summary for fvar", () => {
    const parsed = { axisCount: 2, instanceCount: 5 };
    const out = getDisplayData("fvar", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("2 axes, 5 instances");
    expect(out.axisCount).toBe(2);
  });

  it("adds summary for avar", () => {
    const parsed = {
      axisCount: 3,
      axisSegmentMaps: [{ positionMapCount: 2 }, { positionMapCount: 4 }],
    };
    const out = getDisplayData("avar", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("3 axes with segment maps");
  });

  it("adds summary for HVAR with itemVariationStore and regionCount", () => {
    const parsed = { itemVariationStore: { regionCount: 8 } };
    const out = getDisplayData("HVAR", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toContain("Metrics variation (advance, LSB, RSB)");
    expect(out.summary).toContain("8 regions");
  });

  it("adds summary for HVAR with itemVariationStore, no regionCount", () => {
    const parsed = { itemVariationStore: {} };
    const out = getDisplayData("HVAR", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toContain("ItemVariationStore present");
  });

  it("adds summary for VVAR with itemVariationStore", () => {
    const parsed = { itemVariationStore: { regionCount: 4 } };
    const out = getDisplayData("VVAR", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toContain("Vertical metrics variation (advance, TSB, BSB, VOrg)");
    expect(out.summary).toContain("4 regions");
  });

  it("adds summary for MVAR with valueRecordCount and itemVariationStore", () => {
    const parsed = {
      valueRecordCount: 14,
      itemVariationStore: { regionCount: 2 },
    };
    const out = getDisplayData("MVAR", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("14 value records; ItemVariationStore present");
  });

  it("adds summary for STAT with designAxisCount and elidedFallbackName", () => {
    const parsed = { designAxisCount: 2, elidedFallbackName: "Regular" };
    const out = getDisplayData("STAT", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toContain("2 design axes");
    expect(out.summary).toContain("elided fallback: Regular");
  });

  it("adds summary for STAT with axisValueCount", () => {
    const parsed = {
      designAxisCount: 4,
      axisValueCount: 19,
      elidedFallbackName: "Regular",
    };
    const out = getDisplayData("STAT", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toContain("4 design axes");
    expect(out.summary).toContain("19 axis values");
    expect(out.summary).toContain("elided fallback: Regular");
  });

  it("adds summary for cvar with tupleVariationCount", () => {
    const parsed = { tupleVariationCount: 6 };
    const out = getDisplayData("cvar", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("CVT variations (6 tuple variation records)");
  });

  it("adds summary for cvar without tupleVariationCount", () => {
    const parsed = {};
    const out = getDisplayData("cvar", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("CVT variations");
  });

  it("adds summary for gvar", () => {
    const parsed = { glyphCount: 100, sharedTupleCount: 5 };
    const out = getDisplayData("gvar", parsed, emptyContext) as Record<string, unknown>;
    expect(out.summary).toBe("100 glyphs with variation data; 5 shared tuples");
  });

  it("preserves _note from variable parsers", () => {
    const parsed = {
      axisCount: 1,
      instanceCount: 2,
      _note: "Custom parser note",
    };
    const out = getDisplayData("fvar", parsed, emptyContext) as Record<string, unknown>;
    expect(out._note).toBe("Custom parser note");
    expect(out.summary).toBe("1 axes, 2 instances");
  });

  it("returns parsed unchanged for null", () => {
    expect(getDisplayData("fvar", null, emptyContext)).toBe(null);
  });

  it("variable tags go through enrichVariable, not default", () => {
    const tags = ["fvar", "avar", "MVAR", "STAT", "HVAR", "VVAR", "cvar", "gvar"];
    for (const tag of tags) {
      const parsed = tag === "fvar" ? { axisCount: 1, instanceCount: 1 } : {};
      const out = getDisplayData(tag, parsed, emptyContext) as {
        summary: string;
      };
      expect(out).toBeDefined();
      expect(typeof out.summary).toBe("string");
      expect(out.summary.length).toBeGreaterThan(0);
    }
  });
});
