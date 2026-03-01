/**
 * Unit tests for InstanceExtractor
 */

import { describe, expect, it } from "vitest";
import { extractInstances } from "../../../engine/extractors/InstanceExtractor";
import { createNameTable } from "../../../engine/extractors/NameExtractor";
import type { VariableAxis } from "../../../types/font.types";
import { createMockParsedFont, createMockVariableFont } from "../../utils/mockParsedFont";

describe("InstanceExtractor", () => {
  const mockAxes: VariableAxis[] = [
    {
      tag: "wght",
      name: "Weight",
      min: 100,
      max: 900,
      default: 400,
      current: 400,
    },
    {
      tag: "wdth",
      name: "Width",
      min: 75,
      max: 100,
      default: 100,
      current: 100,
    },
  ];

  it("should extract instances from fvar table", () => {
    const fontkitFont = createMockVariableFont("fontkit");
    const nameTableData = fontkitFont.getNameTable();
    const nameTable = nameTableData ? createNameTable(nameTableData) : null;

    const result = extractInstances(null, fontkitFont, mockAxes, nameTable);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBeGreaterThan(0);
    expect(result.data?.[0]?.coordinates).toBeDefined();
    expect(result.data?.[0]?.name).toBeDefined();
  });

  it("should normalize coordinates to record format", () => {
    const fontkitFont = createMockVariableFont("fontkit");
    const nameTableData = fontkitFont.getNameTable();
    const nameTable = nameTableData ? createNameTable(nameTableData) : null;

    const result = extractInstances(null, fontkitFont, mockAxes, nameTable);

    expect(result.success).toBe(true);
    const instance = result.data?.[0];
    expect(instance).toBeDefined();
    expect(typeof instance?.coordinates).toBe("object");
    expect(instance?.coordinates?.wght).toBeDefined();
    expect(typeof instance?.coordinates?.wght).toBe("number");
  });

  it("should handle missing axes gracefully", () => {
    const fontkitFont = createMockVariableFont("fontkit");
    const nameTableData = fontkitFont.getNameTable();
    const nameTable = nameTableData ? createNameTable(nameTableData) : null;

    const result = extractInstances(null, fontkitFont, undefined, nameTable);

    // Should still extract instances even without axes
    expect(result.success).toBe(true);
  });

  it("should return empty array for non-variable fonts", () => {
    const staticFont = createMockParsedFont("opentype", {
      variationAxes: null,
      fvarTable: null,
    });
    const nameTableData = staticFont.getNameTable();
    const nameTable = nameTableData ? createNameTable(nameTableData) : null;

    const result = extractInstances(staticFont, null, [], nameTable);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("should handle missing parsed fonts", () => {
    const result = extractInstances(null, null, mockAxes, null);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No parsed font provided|NameTable is required/);
  });
});
