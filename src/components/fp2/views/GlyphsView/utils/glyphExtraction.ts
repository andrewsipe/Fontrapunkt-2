/**
 * Glyph extraction from font file (GSUB-aware).
 * Extracts glyphs with unicode and optional OpenType feature associations.
 */

import opentype from "opentype.js";
import type { GlyphInfo } from "../../../../../utils/glyphCategorizer";

export interface FontForExtraction {
  fileData: ArrayBuffer;
  featureDetails?: { tag: string }[];
}

// Types for opentype.js internal GSUB table structures
interface GsubFeature {
  tag: string;
  lookupListIndexes?: number[];
  lookupListIndices?: number[];
  feature?: { lookupListIndices?: number[] };
}

interface CoverageRange {
  start: number;
  end: number;
}

interface CoverageTable {
  glyphs?: number[];
  ranges?: CoverageRange[];
}

interface GsubSubtable {
  coverage?: CoverageTable | number[];
  sequences?: number[][];
  alternateSets?: number[][];
  ligatureSets?: LigatureSet[];
}

interface Ligature {
  ligGlyph?: number;
  components?: number[];
}

type LigatureSet = Ligature[];

function getCoverageGlyphs(coverage: CoverageTable | number[] | undefined): number[] {
  if (!coverage) return [];
  if (Array.isArray(coverage)) return coverage;
  if (coverage.glyphs && Array.isArray(coverage.glyphs)) return coverage.glyphs;
  if (coverage.ranges) {
    const glyphs: number[] = [];
    coverage.ranges.forEach((range) => {
      for (let i = range.start; i <= range.end; i++) glyphs.push(i);
    });
    return glyphs;
  }
  return [];
}

/**
 * Extracts glyphs with unicode from a font, including GSUB feature associations.
 */
export async function extractGlyphsFromFont(currentFont: FontForExtraction): Promise<GlyphInfo[]> {
  const opentypeFont = opentype.parse(currentFont.fileData) as opentype.Font;
  const extractedGlyphs: GlyphInfo[] = [];
  const seenUnicodes = new Set<number>();

  const unicodeToFeatures = new Map<number, Set<string>>();
  const glyphIndexToFeatures = new Map<number, Set<string>>();

  const fontFeatures = currentFont.featureDetails ?? [];
  const featureTags: string[] =
    fontFeatures.length > 0
      ? fontFeatures.map((f) => f.tag)
      : ((opentypeFont.tables?.gsub?.features as GsubFeature[] | undefined)?.map((f) => f.tag) ??
        []);

  if (featureTags.length > 0 && opentypeFont.tables?.gsub) {
    try {
      const gsub = opentypeFont.tables.gsub;

      for (const featureTag of featureTags) {
        const addFeatureToGlyph = (glyphIndex: number, hasUnicode: boolean, unicode?: number) => {
          if (!glyphIndexToFeatures.has(glyphIndex))
            glyphIndexToFeatures.set(glyphIndex, new Set());
          glyphIndexToFeatures.get(glyphIndex)?.add(featureTag);
          if (hasUnicode && unicode != null) {
            if (!unicodeToFeatures.has(unicode)) unicodeToFeatures.set(unicode, new Set());
            unicodeToFeatures.get(unicode)?.add(featureTag);
          }
        };
        const feature = (gsub.features as GsubFeature[] | undefined)?.find(
          (f) => f.tag === featureTag
        );
        if (!feature) continue;

        const lookupIndices: number[] =
          feature.lookupListIndexes && Array.isArray(feature.lookupListIndexes)
            ? feature.lookupListIndexes
            : feature.feature?.lookupListIndices && Array.isArray(feature.feature.lookupListIndices)
              ? feature.feature.lookupListIndices
              : feature.lookupListIndices && Array.isArray(feature.lookupListIndices)
                ? feature.lookupListIndices
                : [];

        if (lookupIndices.length === 0) continue;

        for (const lookupIndex of lookupIndices) {
          const lookup = gsub.lookups?.[lookupIndex];
          if (!lookup?.subtables) continue;

          for (const subtable of lookup.subtables as GsubSubtable[]) {
            const coverageGlyphs = getCoverageGlyphs(subtable.coverage);
            if (coverageGlyphs.length === 0) continue;

            if (lookup.lookupType === 1) {
              for (const glyphIndex of coverageGlyphs) {
                try {
                  const glyph = opentypeFont.glyphs.get(glyphIndex);
                  const hasUnicode =
                    glyph != null && glyph.unicode != null && glyph.unicode !== undefined;
                  addFeatureToGlyph(glyphIndex, hasUnicode, glyph?.unicode);
                } catch {
                  /* ignore */
                }
              }
            } else if (lookup.lookupType === 2 && subtable.sequences) {
              coverageGlyphs.forEach((glyphIndex, i) => {
                try {
                  const baseGlyph = opentypeFont.glyphs.get(glyphIndex);
                  const hasUnicode =
                    baseGlyph != null &&
                    baseGlyph.unicode != null &&
                    baseGlyph.unicode !== undefined;
                  addFeatureToGlyph(glyphIndex, hasUnicode, baseGlyph?.unicode);
                  const sequence = subtable.sequences?.[i];
                  if (Array.isArray(sequence)) {
                    for (const seqGlyphIndex of sequence) {
                      try {
                        const seqGlyph = opentypeFont.glyphs.get(seqGlyphIndex);
                        const hasU =
                          seqGlyph != null &&
                          seqGlyph.unicode != null &&
                          seqGlyph.unicode !== undefined;
                        addFeatureToGlyph(seqGlyphIndex, hasU, seqGlyph?.unicode);
                      } catch {
                        /* ignore */
                      }
                    }
                  }
                } catch {
                  /* ignore */
                }
              });
            } else if (lookup.lookupType === 3 && subtable.alternateSets) {
              coverageGlyphs.forEach((glyphIndex, i) => {
                try {
                  const baseGlyph = opentypeFont.glyphs.get(glyphIndex);
                  const hasUnicode =
                    baseGlyph != null &&
                    baseGlyph.unicode != null &&
                    baseGlyph.unicode !== undefined;
                  addFeatureToGlyph(glyphIndex, hasUnicode, baseGlyph?.unicode);
                  const altSet = subtable.alternateSets?.[i];
                  if (Array.isArray(altSet)) {
                    for (const altGlyphIndex of altSet) {
                      try {
                        const altGlyph = opentypeFont.glyphs.get(altGlyphIndex);
                        const hasU =
                          altGlyph != null &&
                          altGlyph.unicode != null &&
                          altGlyph.unicode !== undefined;
                        addFeatureToGlyph(altGlyphIndex, hasU, altGlyph?.unicode);
                      } catch {
                        /* ignore */
                      }
                    }
                  }
                } catch {
                  /* ignore */
                }
              });
            } else if (lookup.lookupType === 4 && subtable.ligatureSets) {
              coverageGlyphs.forEach((firstGlyphIndex, i) => {
                try {
                  const firstGlyph = opentypeFont.glyphs.get(firstGlyphIndex);
                  const hasUnicode =
                    firstGlyph != null &&
                    firstGlyph.unicode != null &&
                    firstGlyph.unicode !== undefined;
                  addFeatureToGlyph(firstGlyphIndex, hasUnicode, firstGlyph?.unicode);
                  const ligSet = subtable.ligatureSets?.[i];
                  if (Array.isArray(ligSet)) {
                    for (const lig of ligSet) {
                      if (lig.ligGlyph !== undefined) {
                        try {
                          const ligGlyph = opentypeFont.glyphs.get(lig.ligGlyph);
                          const hasU =
                            ligGlyph != null &&
                            ligGlyph.unicode != null &&
                            ligGlyph.unicode !== undefined;
                          addFeatureToGlyph(lig.ligGlyph, hasU, ligGlyph?.unicode);
                        } catch {
                          /* ignore */
                        }
                      }
                      if (lig.components && Array.isArray(lig.components)) {
                        for (const componentIndex of lig.components) {
                          try {
                            const compGlyph = opentypeFont.glyphs.get(componentIndex);
                            const hasU =
                              compGlyph != null &&
                              compGlyph.unicode != null &&
                              compGlyph.unicode !== undefined;
                            addFeatureToGlyph(componentIndex, hasU, compGlyph?.unicode);
                          } catch {
                            /* ignore */
                          }
                        }
                      }
                    }
                  }
                } catch {
                  /* ignore */
                }
              });
            }
          }
        }
      }
    } catch (gsubError) {
      console.error("[glyphExtraction] Error parsing GSUB table:", gsubError);
    }
  }

  if (opentypeFont.glyphs && opentypeFont.numGlyphs) {
    for (let i = 0; i < opentypeFont.numGlyphs; i++) {
      try {
        const glyph = opentypeFont.glyphs.get(i);
        if (
          glyph == null ||
          glyph.unicode == null ||
          glyph.unicode === undefined ||
          seenUnicodes.has(glyph.unicode)
        )
          continue;

        seenUnicodes.add(glyph.unicode);
        const char = String.fromCodePoint(glyph.unicode);
        const unicodeHex = glyph.unicode.toString(16).toUpperCase().padStart(4, "0");
        const glyphName = glyph.name ?? "unnamed";
        const unicodeFeatures = Array.from(unicodeToFeatures.get(glyph.unicode) ?? []);
        const indexFeatures = Array.from(glyphIndexToFeatures.get(i) ?? []);
        const allFeatures = Array.from(new Set([...unicodeFeatures, ...indexFeatures]));

        extractedGlyphs.push({
          char,
          unicode: `U+${unicodeHex}`,
          name: glyphName,
          unicodeNumber: glyph.unicode,
          features: allFeatures,
          glyphIndex: i,
        });
      } catch {
        /* ignore malformed glyphs */
      }
    }
  }

  extractedGlyphs.sort((a, b) => {
    if (a.unicodeNumber != null && b.unicodeNumber != null)
      return a.unicodeNumber - b.unicodeNumber;
    return a.unicodeNumber == null ? 1 : -1;
  });

  return extractedGlyphs;
}
