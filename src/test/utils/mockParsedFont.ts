/**
 * Mock ParsedFont factory for unit tests
 * Creates mock ParsedFont objects that match the ParsedFont interface
 */

import type {
  AxisData,
  FvarTableData,
  MetricsTableData,
  NameTableData,
  ParsedFont,
} from "../../types/extractors.types";

/**
 * Create a mock ParsedFont with specified data
 */
export function createMockParsedFont(
  source: "fontkit" | "opentype",
  overrides?: {
    nameTable?: NameTableData | null;
    metricsTable?: MetricsTableData | null;
    variationAxes?: AxisData[] | null;
    fvarTable?: FvarTableData | null;
    raw?: unknown;
  }
): ParsedFont {
  const defaultNameTable: NameTableData = {
    1: "Test Family",
    2: "Regular",
    4: "Test Family Regular",
    6: "TestFamily-Regular",
  };

  const defaultMetricsTable: MetricsTableData = {
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
  };

  return {
    source,
    getNameTable: () => overrides?.nameTable ?? defaultNameTable,
    getMetricsTable: () => overrides?.metricsTable ?? defaultMetricsTable,
    getVariationAxes: () => overrides?.variationAxes ?? null,
    getFvarTable: () => overrides?.fvarTable ?? null,
    getGsubTable: () => null,
    getGposTable: () => null,
    raw: overrides?.raw ?? {},
  };
}

/**
 * Create a mock variable font ParsedFont
 */
export function createMockVariableFont(source: "fontkit" | "opentype" = "fontkit"): ParsedFont {
  const axes: AxisData[] = [
    {
      tag: "wght",
      name: "Weight",
      min: 100,
      max: 900,
      default: 400,
    },
    {
      tag: "wdth",
      name: "Width",
      min: 75,
      max: 100,
      default: 100,
    },
  ];

  return createMockParsedFont(source, {
    variationAxes: axes,
    fvarTable: {
      axes,
      instances: [
        {
          coordinates: { wght: 400, wdth: 100 },
          subfamilyNameID: 2,
        },
        {
          coordinates: { wght: 700, wdth: 100 },
          subfamilyNameID: 3,
        },
      ],
    },
  });
}
