/**
 * Unit tests for tableDefinitions: getTableDefinition, reference flag, and spec.
 * Also tests getGroupForTag and GROUP_ORDER from tables/index.
 */

import { describe, expect, it } from "vitest";
import { GROUP_ORDER, getGroupForTag } from "../../engine/parsers/tables";
import { getTableDefinition } from "../../engine/parsers/tables/tableDefinitions";

describe("tableDefinitions", () => {
  it("returns fallback for unknown tag", () => {
    const def = getTableDefinition("xxxx");
    expect(def.definition).toContain("OpenType specification");
    expect(def.definition).toContain("fonttools");
    expect(def.reference).toBe(false);
  });

  it("marks avar as reference", () => {
    const def = getTableDefinition("avar");
    expect(def.reference).toBe(true);
    expect(def.definition.length).toBeGreaterThan(0);
  });

  it("marks HVAR, VVAR, MVAR, cvar, gvar as reference", () => {
    for (const tag of ["HVAR", "VVAR", "MVAR", "cvar", "gvar"]) {
      const def = getTableDefinition(tag);
      expect(def.reference).toBe(true);
    }
  });

  it("does not mark fvar as reference", () => {
    const def = getTableDefinition("fvar");
    expect(def.reference).not.toBe(true);
  });

  it("returns definition for known tags", () => {
    expect(getTableDefinition("head").definition.length).toBeGreaterThan(0);
    expect(getTableDefinition("name").definition).toContain("family");
  });

  it("returns spec for OpenType core tables", () => {
    expect(getTableDefinition("head").spec).toBe("OpenType");
    expect(getTableDefinition("hmtx").spec).toBe("OpenType");
  });

  it("returns FontForge definitions for PfEd, FFTM, TeX , BDF ", () => {
    const pfEd = getTableDefinition("PfEd");
    expect(pfEd.definition).toContain("FontForge");
    expect(pfEd.spec).toBe("FontForge");

    expect(getTableDefinition("FFTM").spec).toBe("FontForge");
    expect(getTableDefinition("TeX ").spec).toBe("FontForge");
    expect(getTableDefinition("BDF ").spec).toBe("FontForge");
  });
});

describe("getGroupForTag and GROUP_ORDER", () => {
  it("GROUP_ORDER has 6 elements in core, variable, layout, outlines, bitmap, other order", () => {
    expect(GROUP_ORDER).toEqual(["core", "variable", "layout", "outlines", "bitmap", "other"]);
    expect(GROUP_ORDER).toHaveLength(6);
  });

  it("getGroupForTag(hmtx) is core", () => {
    expect(getGroupForTag("hmtx")).toBe("core");
  });

  it("getGroupForTag(PfEd) is other", () => {
    expect(getGroupForTag("PfEd")).toBe("other");
  });

  it("getGroupForTag(unknown) is null", () => {
    expect(getGroupForTag("unknown")).toBeNull();
  });
});
