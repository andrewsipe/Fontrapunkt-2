/**
 * Extracts glyphs from current font and loads Unicode metadata.
 */

import { useEffect, useState } from "react";
import type { GlyphInfo } from "../../../../../utils/glyphCategorizer";
import { loadUnicodeMetadata } from "../../../../../utils/glyphSearchUtils";
import type { FontForExtraction } from "../utils/glyphExtraction";
import { extractGlyphsFromFont } from "../utils/glyphExtraction";

export function useGlyphExtraction(
  currentFont: FontForExtraction | null,
  setGlyphCount: (count: number) => void
): { glyphs: GlyphInfo[]; loading: boolean } {
  const [glyphs, setGlyphs] = useState<GlyphInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentFont) {
      setLoading(false);
      setGlyphCount(0);
      setGlyphs([]);
      return;
    }

    setLoading(true);
    extractGlyphsFromFont(currentFont)
      .then((extracted) => {
        setGlyphs(extracted);
        setGlyphCount(extracted.length);
        loadUnicodeMetadata(extracted).then((success) => {
          if (success) {
            console.log(
              "[GlyphsView] Unicode metadata loaded with API fallback for unnamed glyphs"
            );
          }
        });
      })
      .catch((error) => {
        console.error("Error extracting glyphs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentFont, setGlyphCount]);

  return { glyphs, loading };
}
