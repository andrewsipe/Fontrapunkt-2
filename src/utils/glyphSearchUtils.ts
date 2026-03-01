/**
 * Enhanced glyph search utilities with Unicode metadata
 * Uses JSON-based Unicode data files for semantic search
 * Supports Latin, Cyrillic, Pan-European languages, punctuation, and symbols
 */

import cyrillicData from "../data/unicode/cyrillic.json";
import diacriticsData from "../data/unicode/diacritics.json";
import greekData from "../data/unicode/greek.json";
import latinData from "../data/unicode/latin.json";
import numbersData from "../data/unicode/numbers.json";
import punctuationData from "../data/unicode/punctuation.json";
import symbolsData from "../data/unicode/symbols.json";
import type { UnicodeCharData, UnicodeDataFile } from "../data/unicode/types";
import type { GlyphInfo } from "./glyphCategorizer";
import { loadUnicodeData } from "./unicodeLoader";

declare global {
  interface Window {
    unicodeData?: Record<number, UnicodeCharData>;
  }
}

// Common OpenType feature aliases
const FEATURE_ALIASES: Record<string, string[]> = {
  ligature: ["liga", "dlig", "hlig", "clig", "rlig"],
  ligatures: ["liga", "dlig", "hlig", "clig", "rlig"],
  lig: ["liga", "dlig", "hlig", "clig", "rlig"],
  smallcap: ["smcp", "c2sc"],
  smallcaps: ["smcp", "c2sc"],
  ordinal: ["ordn"],
  fraction: ["frac", "afrc"],
  fractions: ["frac", "afrc"],
  swash: ["swsh", "cswh"],
  stylistic: [
    "salt",
    "ss01",
    "ss02",
    "ss03",
    "ss04",
    "ss05",
    "ss06",
    "ss07",
    "ss08",
    "ss09",
    "ss10",
  ],
  alternate: ["salt", "aalt"],
  alternates: ["salt", "aalt"],
  oldstyle: ["onum"],
  lining: ["lnum"],
  tabular: ["tnum"],
  proportional: ["pnum"],
  "stylistic set 1": ["ss01"],
  "stylistic set 2": ["ss02"],
  "stylistic set 3": ["ss03"],
  "stylistic set 4": ["ss04"],
  "stylistic set 5": ["ss05"],
  "stylistic set 6": ["ss06"],
  "stylistic set 7": ["ss07"],
  "stylistic set 8": ["ss08"],
  "stylistic set 9": ["ss09"],
  "stylistic set 10": ["ss10"],
  ss1: ["ss01"],
  ss2: ["ss02"],
  ss3: ["ss03"],
  ss4: ["ss04"],
  ss5: ["ss05"],
  ss6: ["ss06"],
  ss7: ["ss07"],
  ss8: ["ss08"],
  ss9: ["ss09"],
  ss10: ["ss10"],
};

// Map of category name to JSON data file. "other" is populated lazily via getUnicodeData()
let otherDataCache: Record<string, UnicodeCharData> | null = null;

const CATEGORY_DATA_MAP: Record<string, UnicodeDataFile> = {
  latin: latinData as UnicodeDataFile,
  cyrillic: cyrillicData as UnicodeDataFile,
  greek: greekData as UnicodeDataFile,
  punctuation: punctuationData as UnicodeDataFile,
  symbols: symbolsData as UnicodeDataFile,
  diacritics: diacriticsData as UnicodeDataFile,
  numbers: numbersData as UnicodeDataFile,
  other: { category: "other", blocks: [], characters: {} },
};

/**
 * Load "other" unicode data via lazy loader (split categories + IndexedDB cache).
 * Call before using CATEGORY_DATA_MAP["other"] for lookups.
 */
export async function getUnicodeData(): Promise<Record<string, UnicodeCharData>> {
  if (otherDataCache) return otherDataCache;

  const categories = await loadUnicodeData();
  otherDataCache = {};
  for (const category of Object.values(categories)) {
    Object.assign(otherDataCache, category.characters);
  }
  CATEGORY_DATA_MAP.other.characters = otherDataCache;
  return otherDataCache;
}

// Removed loadedCategories - no longer needed since we preload all metadata directly

// Rate limiting for API calls
let lastApiCallTime = 0;
let consecutiveFailures = 0;
const MIN_API_DELAY_MS = 200; // Minimum 200ms between API calls
const MAX_API_DELAY_MS = 2000; // Maximum 2 seconds between calls if rate limited

// Removed getUnicodeCategoryFromBlock and loadUnicodeCategory - no longer needed
// We now check all categories directly during preload for better performance

/**
 * Get Unicode block name for a codepoint
 * Uses a comprehensive block list (can be imported from glyphCategorizer if needed)
 */
function getUnicodeBlockName(codepoint: number): string {
  // Comprehensive block list matching what's in our JSON files
  const block = [
    { name: "Basic Latin", start: 0x0000, end: 0x007f },
    { name: "Latin-1 Supplement", start: 0x0080, end: 0x00ff },
    { name: "Latin Extended-A", start: 0x0100, end: 0x017f },
    { name: "Latin Extended-B", start: 0x0180, end: 0x024f },
    { name: "IPA Extensions", start: 0x0250, end: 0x02af },
    { name: "Spacing Modifier Letters", start: 0x02b0, end: 0x02ff },
    { name: "Combining Diacritical Marks", start: 0x0300, end: 0x036f },
    { name: "Greek and Coptic", start: 0x0370, end: 0x03ff },
    { name: "Cyrillic", start: 0x0400, end: 0x04ff },
    { name: "Cyrillic Supplement", start: 0x0500, end: 0x052f },
    { name: "Latin Extended Additional", start: 0x1e00, end: 0x1eff }, // Added - was missing!
    { name: "Greek Extended", start: 0x1f00, end: 0x1fff },
    { name: "General Punctuation", start: 0x2000, end: 0x206f },
    { name: "Superscripts and Subscripts", start: 0x2070, end: 0x209f },
    { name: "Currency Symbols", start: 0x20a0, end: 0x20cf },
    { name: "Letterlike Symbols", start: 0x2100, end: 0x214f },
    { name: "Number Forms", start: 0x2150, end: 0x218f },
    { name: "Arrows", start: 0x2190, end: 0x21ff },
    { name: "Mathematical Operators", start: 0x2200, end: 0x22ff },
    { name: "Miscellaneous Technical", start: 0x2300, end: 0x23ff },
    { name: "Box Drawing", start: 0x2500, end: 0x257f },
    { name: "Block Elements", start: 0x2580, end: 0x259f },
    { name: "Geometric Shapes", start: 0x25a0, end: 0x25ff },
    { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26ff },
    { name: "Dingbats", start: 0x2700, end: 0x27bf },
    { name: "Private Use Area", start: 0xe000, end: 0xf8ff }, // F8FF is here
  ].find((b) => codepoint >= b.start && codepoint <= b.end);

  return block ? block.name : "Unknown";
}

// Old pattern-based functions removed - now using JSON files

/**
 * Load Unicode metadata on-demand for glyphs in the font
 * Call this once when the app initializes
 * Optionally pass glyphs to preload their metadata
 * For unnamed glyphs, fetches from Unicode API as fallback
 */
export async function loadUnicodeMetadata(glyphs?: GlyphInfo[]): Promise<boolean> {
  if (!window.unicodeData) {
    window.unicodeData = {};
  }

  // Ensure "other" category is loaded (lazy-loaded from split files + IndexedDB cache)
  await getUnicodeData();

  // Load data only for glyphs that exist in the font (lazy loading)
  if (glyphs && glyphs.length > 0) {
    const uniqueCodepoints = new Set<number>();
    const categoriesToLoad = new Set<string>();
    const unnamedGlyphs: Array<{ codepoint: number; name: string }> = [];

    // First pass: collect all codepoints and determine categories
    glyphs.forEach((g) => {
      if (g.unicodeNumber !== null) {
        uniqueCodepoints.add(g.unicodeNumber);
      }
    });

    // Preload ALL metadata from JSON files for all codepoints
    // This makes search instant - everything is in cache
    console.log(`[GlyphSearch] Preloading metadata for ${uniqueCodepoints.size} codepoints...`);
    const startTime = performance.now();

    // Check all categories for each codepoint and preload
    for (const codepoint of uniqueCodepoints) {
      // Try each category JSON file directly (fast lookup)
      for (const [category, dataFile] of Object.entries(CATEGORY_DATA_MAP)) {
        const hexCode = codepoint.toString(16).toUpperCase().padStart(4, "0");
        if (hexCode in dataFile.characters) {
          // Found it! Cache it immediately
          if (!window.unicodeData) {
            window.unicodeData = {};
          }
          window.unicodeData[codepoint] = dataFile.characters[hexCode];
          categoriesToLoad.add(category);
          break; // Found in this category, no need to check others
        }
      }

      // If not found in JSON, check if we need API
      if (!window.unicodeData?.[codepoint]) {
        const glyph = glyphs.find((g) => g.unicodeNumber === codepoint);
        const blockName = getUnicodeBlockName(codepoint);

        // Skip Private Use Area
        if (blockName === "Private Use Area") {
          continue;
        }

        // Mark for API only if truly unnamed
        if (
          glyph &&
          (!glyph.name ||
            glyph.name === "unnamed" ||
            glyph.name.startsWith("uni") ||
            blockName === "Unknown")
        ) {
          unnamedGlyphs.push({ codepoint, name: glyph.name });
        }
      }
    }

    const loadTime = performance.now() - startTime;
    console.log(
      `[GlyphSearch] Preloaded ${Object.keys(window.unicodeData).length} characters in ${loadTime.toFixed(2)}ms`
    );

    // Fetch official names from API for unnamed glyphs (background, non-blocking)
    // Only fetch a limited number to avoid rate limiting
    if (unnamedGlyphs.length > 0) {
      // Limit to first 50 unnamed glyphs to avoid rate limiting
      const maxApiCalls = 50;
      const glyphsToFetch = unnamedGlyphs.slice(0, maxApiCalls);

      if (unnamedGlyphs.length > maxApiCalls) {
        console.log(
          `[GlyphSearch] Limiting API calls to ${maxApiCalls} of ${unnamedGlyphs.length} unnamed glyphs to avoid rate limiting...`
        );
      } else {
        console.log(
          `[GlyphSearch] Fetching official Unicode names for ${glyphsToFetch.length} unnamed glyphs...`
        );
      }

      // Fetch sequentially with rate limiting (not in parallel batches)
      // This is slower but respects API rate limits
      let fetchedCount = 0;
      let skippedCount = 0;

      for (const { codepoint } of glyphsToFetch) {
        // Double-check it's not in JSON before API call (fast direct check)
        const jsonData = getUnicodeMetadataFromJSON(codepoint);
        if (jsonData) {
          // Already in cache from preload, skip API
          skippedCount++;
          continue;
        }

        // Not in JSON - try API (with rate limiting built into fetchUnicodeFromAPI)
        try {
          const apiData = await fetchUnicodeFromAPI(codepoint);

          // If we got null due to rate limiting, stop making more calls
          if (apiData === null && consecutiveFailures > 3) {
            console.warn(`[GlyphSearch] Multiple rate limit errors. Stopping API calls.`);
            break;
          }

          if (apiData?.name) {
            // Only update if we got a better name from API
            const existing = window.unicodeData?.[codepoint];
            if (!existing || !existing.name || existing.name.startsWith("U+")) {
              if (!window.unicodeData) {
                window.unicodeData = {};
              }
              window.unicodeData[codepoint] = apiData;
              fetchedCount++;
            }
          }
        } catch (_error) {
          // Silently fail - errors are handled in fetchUnicodeFromAPI
          // If we have too many consecutive failures, stop
          if (consecutiveFailures > 5) {
            console.warn(`[GlyphSearch] Too many API failures. Stopping API calls.`);
            break;
          }
        }
      }

      const totalLoaded = Object.keys(window.unicodeData).length;
      if (fetchedCount > 0 || skippedCount > 0) {
        console.log(
          `[GlyphSearch] Loaded Unicode metadata for ${totalLoaded} codepoints (${fetchedCount} from API, ${skippedCount} found in JSON)`
        );
      } else {
        console.log(`[GlyphSearch] Loaded Unicode metadata for ${totalLoaded} codepoints`);
      }
    } else {
      console.log(
        `[GlyphSearch] Loaded Unicode metadata for ${Object.keys(window.unicodeData).length} codepoints`
      );
    }
  } else {
    console.log("[GlyphSearch] Unicode metadata system initialized (will load on-demand)");
  }

  return true;
}

/**
 * Check if Unicode metadata is available
 */
export function hasUnicodeMetadata(): boolean {
  return !!window.unicodeData && Object.keys(window.unicodeData).length > 0;
}

/**
 * Fetch Unicode metadata from Unicode API
 * Includes rate limiting and exponential backoff
 */
async function fetchUnicodeFromAPI(codepoint: number): Promise<UnicodeCharData | null> {
  // Rate limiting: ensure minimum delay between calls
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  const currentDelay = Math.min(MIN_API_DELAY_MS * 2 ** consecutiveFailures, MAX_API_DELAY_MS);

  if (timeSinceLastCall < currentDelay) {
    await new Promise((resolve) => setTimeout(resolve, currentDelay - timeSinceLastCall));
  }

  try {
    const hex = codepoint.toString(16).toUpperCase().padStart(4, "0");
    lastApiCallTime = Date.now();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://unicode-api.aaronluna.dev/v1/characters/${hex}?properties=name,block,general_category,script`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Handle rate limiting (429)
    if (response.status === 429) {
      consecutiveFailures++;
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : currentDelay * 2;
      console.warn(`[UnicodeAPI] Rate limited. Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return null; // Don't retry immediately, let the caller handle it
    }

    if (!response.ok) {
      consecutiveFailures++;
      return null;
    }

    // Success - reset failure counter
    consecutiveFailures = 0;

    const apiData = await response.json();
    if (!apiData || apiData.error) {
      return null;
    }

    // Map API response to our UnicodeCharData format
    const keywords: string[] = [];
    const name = apiData.name || "";

    // Generate keywords from name
    name
      .toLowerCase()
      .split(/[\s-]+/)
      .forEach((part: string) => {
        if (part.length > 2) keywords.push(part);
      });

    // Add block and script as keywords for better search
    if (apiData.block) {
      apiData.block
        .toLowerCase()
        .split(/\s+/)
        .forEach((w: string) => {
          if (w.length > 2) keywords.push(w);
        });
    }
    if (apiData.script) {
      keywords.push(apiData.script.toLowerCase());
    }

    const data: UnicodeCharData = {
      name: name || undefined,
      category: apiData.general_category || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      aliases: name ? [name.toLowerCase().replace(/\s+/g, "-")] : [],
    };

    return data;
  } catch (error) {
    // Handle CORS and network errors silently (common and expected)
    if (error instanceof TypeError) {
      // CORS errors, network failures, etc. - silently fail
      // These characters should be in JSON files anyway
      return null;
    }
    // Abort errors (timeout) - silently fail
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    // Other unexpected errors - log for debugging
    console.warn(
      `[UnicodeAPI] Failed to fetch U+${codepoint.toString(16).toUpperCase().padStart(4, "0")}:`,
      error
    );
    return null;
  }
}

// Removed checkCodepointInCategory - no longer needed
// We now check all categories directly using getUnicodeMetadataFromJSON

/**
 * Get Unicode metadata directly from JSON file without loading entire category
 * Optimized: checks all categories directly without block name lookup
 * This is much faster for search operations
 */
function getUnicodeMetadataFromJSON(codepoint: number): UnicodeCharData | null {
  // Fast path: check cache first (should be preloaded during font load)
  if (window.unicodeData?.[codepoint]) {
    return window.unicodeData[codepoint];
  }

  // Check all category JSON files directly (no slow block name lookup)
  const hexCode = codepoint.toString(16).toUpperCase().padStart(4, "0");

  for (const dataFile of Object.values(CATEGORY_DATA_MAP)) {
    if (hexCode in dataFile.characters) {
      const data = dataFile.characters[hexCode];
      // Cache it for future lookups
      if (!window.unicodeData) {
        window.unicodeData = {};
      }
      window.unicodeData[codepoint] = data;
      return data;
    }
  }

  return null;
}

/**
 * Get Unicode metadata for a specific codepoint
 * Loads from JSON files on-demand if not already cached
 * Falls back to API for unnamed/unknown glyphs
 */
function getUnicodeMetadata(codepoint: number): UnicodeCharData | null {
  // Check cache first
  if (window.unicodeData?.[codepoint]) {
    return window.unicodeData[codepoint];
  }

  // Try to get directly from JSON without loading entire category
  // This is faster for search operations
  const jsonData = getUnicodeMetadataFromJSON(codepoint);
  if (jsonData) {
    // Cache it for future lookups
    if (!window.unicodeData) {
      window.unicodeData = {};
    }
    window.unicodeData[codepoint] = jsonData;
    return jsonData;
  }

  // Character not in JSON files - return null (will fall back to API if needed)
  return null;
}

/**
 * Get Unicode metadata with API fallback
 * Use this when you need official names for unnamed glyphs
 */
export async function getUnicodeMetadataWithFallback(
  codepoint: number,
  glyphName?: string
): Promise<UnicodeCharData | null> {
  // Check cache first
  if (window.unicodeData?.[codepoint]) {
    return window.unicodeData[codepoint];
  }

  // If glyph is unnamed or JSON lookup failed, try API
  const blockName = getUnicodeBlockName(codepoint);
  const needsAPI =
    !glyphName || glyphName === "unnamed" || glyphName.startsWith("uni") || blockName === "Unknown";

  if (needsAPI) {
    const apiData = await fetchUnicodeFromAPI(codepoint);
    if (apiData) {
      if (!window.unicodeData) {
        window.unicodeData = {};
      }
      window.unicodeData[codepoint] = apiData;
      return apiData;
    }
  }

  // Fall back to JSON lookup (which may trigger category loading)
  return getUnicodeMetadata(codepoint);
}

/**
 * Match query against Unicode metadata (name, keywords, aliases)
 * Optimized to check cache/JSON directly for faster search
 */
function matchesUnicodeMetadata(codepoint: number, query: string): boolean {
  // Fast path: check cache first
  const cached = window.unicodeData?.[codepoint];
  if (cached) {
    // Check Unicode official name
    if (cached.name?.toLowerCase().includes(query)) {
      return true;
    }
    // Check keywords
    if (cached.keywords?.some((keyword) => keyword.toLowerCase().includes(query))) {
      return true;
    }
    // Check aliases
    if (cached.aliases?.some((alias) => alias.toLowerCase().includes(query))) {
      return true;
    }
    return false;
  }

  // Fallback: try JSON lookup (fast direct access without loading category)
  const jsonData = getUnicodeMetadataFromJSON(codepoint);
  if (jsonData) {
    // Cache it for future lookups
    if (!window.unicodeData) {
      window.unicodeData = {};
    }
    window.unicodeData[codepoint] = jsonData;

    // Check matches
    if (jsonData.name?.toLowerCase().includes(query)) {
      return true;
    }
    if (jsonData.keywords?.some((keyword) => keyword.toLowerCase().includes(query))) {
      return true;
    }
    if (jsonData.aliases?.some((alias) => alias.toLowerCase().includes(query))) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate search relevance score for sorting
 * Higher score = more relevant
 * @param includeName - If true, scores glyph name matches (default: true)
 * @param includeUnicode - If true, scores Unicode matches (default: true)
 */
function calculateRelevanceScore(
  glyph: GlyphInfo,
  query: string,
  isCharSearch: boolean,
  includeName: boolean = true,
  includeUnicode: boolean = true
): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerChar = glyph.char.toLowerCase();

  // Character matching (always scored - highest priority)
  if (isCharSearch) {
    // Exact character match (case-sensitive) - highest priority
    if (glyph.char === query) {
      score += 1000;
    }
    // Exact character match (case-insensitive, different case) - second highest
    else if (lowerChar === lowerQuery) {
      score += 900;
    }
    // Character contains query as substring (multi-char glyphs)
    else if (lowerChar.includes(lowerQuery)) {
      score += 400;
    }
  } else {
    // Multi-character queries: character matches still prioritized
    if (lowerChar === lowerQuery) {
      score += 1000;
    } else if (lowerChar.includes(lowerQuery)) {
      score += 500;
    }
  }

  // Glyph name scoring (only if enabled)
  if (includeName) {
    if (isCharSearch) {
      if (glyph.name.toLowerCase().startsWith(lowerQuery)) {
        score += 250;
      } else if (glyph.name.toLowerCase().includes(lowerQuery)) {
        score += 50;
      }
    } else {
      if (glyph.name.toLowerCase().startsWith(lowerQuery)) {
        score += 300;
      } else if (glyph.name.toLowerCase().includes(lowerQuery)) {
        score += 100;
      }
    }
  }

  // Unicode scoring (only if enabled)
  if (includeUnicode) {
    // Unicode exact match
    if (glyph.unicode.toLowerCase() === `u+${lowerQuery}`) {
      score += 200;
    }

    // Unicode metadata match
    // For single-char searches, this should be lower priority than character matches
    // Only check metadata for queries 2+ chars (performance optimization)
    // Use cache only - should be preloaded during font load
    if (glyph.unicodeNumber !== null && hasUnicodeMetadata() && lowerQuery.length >= 2) {
      // Fast path: check cache only (should be preloaded, no JSON lookup during search)
      const metadata = window.unicodeData?.[glyph.unicodeNumber];

      if (metadata) {
        // Only apply metadata scoring if we haven't already matched the character itself
        // This prevents "parenthes" from outranking "A" when searching for "a"
        const hasCharacterMatch = isCharSearch && lowerChar === lowerQuery;

        if (!hasCharacterMatch) {
          // Official Unicode name match
          if (metadata.name?.toLowerCase().includes(lowerQuery)) {
            const nameScore = metadata.name.toLowerCase().startsWith(lowerQuery) ? 250 : 150;
            // Reduce score for single-char searches to prioritize actual characters
            score += isCharSearch ? Math.floor(nameScore * 0.3) : nameScore;
          }

          // Keyword match (semantic search)
          if (metadata.keywords) {
            const exactKeywordMatch = metadata.keywords.some((k) => k.toLowerCase() === lowerQuery);
            const partialKeywordMatch = metadata.keywords.some((k) =>
              k.toLowerCase().includes(lowerQuery)
            );

            if (exactKeywordMatch) {
              score += isCharSearch ? 60 : 200;
            } else if (partialKeywordMatch) {
              score += isCharSearch ? 25 : 75;
            }
          }

          // Alias match
          if (metadata.aliases) {
            const aliasMatch = metadata.aliases.some((a) => a.toLowerCase().includes(lowerQuery));
            if (aliasMatch) {
              score += isCharSearch ? 30 : 100;
            }
          }
        }
      }
    }
  }

  // OpenType feature match
  if (glyph.features && glyph.features.length > 0) {
    const hasFeatureMatch = glyph.features.some((f) => f.toLowerCase().includes(lowerQuery));
    if (hasFeatureMatch) score += 50;
  }

  return score;
}

/**
 * Build a reverse map: glyph unicode -> category name
 */
export function buildCategoryMap(
  categorizedGlyphs: Record<string, GlyphInfo[]>
): Map<string, string> {
  const map = new Map<string, string>();

  Object.entries(categorizedGlyphs).forEach(([categoryName, glyphs]) => {
    glyphs.forEach((glyph) => {
      map.set(glyph.unicode, categoryName);
    });
  });

  return map;
}

/**
 * Enhanced search with Unicode metadata support
 * Returns filtered glyphs sorted by relevance
 * @param includeCategoryNames - If true, includes category names in search (default: true)
 * @param includeName - If true, includes glyph names in search (default: true)
 * @param includeUnicode - If true, includes Unicode codes in search (default: true)
 */
export function searchGlyphs(
  glyphs: GlyphInfo[],
  query: string,
  categoryMap?: Map<string, string>,
  includeCategoryNames: boolean = true,
  includeName: boolean = true,
  includeUnicode: boolean = true
): GlyphInfo[] {
  if (!query.trim()) {
    return glyphs;
  }

  const lowerQuery = query.toLowerCase().trim();
  const isCharSearch = lowerQuery.length === 1;

  // Get feature tags to search for
  const searchFeatures = FEATURE_ALIASES[lowerQuery] || [lowerQuery];

  const filtered = glyphs
    .filter((g) => {
      // Exact character match
      if (isCharSearch && g.char.toLowerCase() === lowerQuery) {
        return true;
      }

      // Character contains query
      if (g.char.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Glyph name match (only if enabled)
      if (includeName && g.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Unicode match (only if enabled)
      if (includeUnicode && g.unicodeNumber !== null) {
        if (g.unicode.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        const hexCode = g.unicode.replace(/^U\+/i, "").toLowerCase();
        if (hexCode.includes(lowerQuery)) {
          return true;
        }

        // Unicode metadata search (semantic) - only if unicode search is enabled
        // Skip if query is too short (performance optimization)
        if (
          lowerQuery.length >= 2 &&
          hasUnicodeMetadata() &&
          matchesUnicodeMetadata(g.unicodeNumber, lowerQuery)
        ) {
          return true;
        }
      }

      // Category name search (only if enabled)
      if (includeCategoryNames && categoryMap && g.unicode) {
        const categoryName = categoryMap.get(g.unicode);
        if (categoryName?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
      }

      // OpenType feature match
      if (g.features && g.features.length > 0) {
        const hasMatchingFeature = g.features.some((feature) => {
          const lowerFeature = feature.toLowerCase();
          return (
            searchFeatures.includes(lowerFeature) ||
            lowerFeature.includes(lowerQuery) ||
            (lowerQuery.length >= 2 && lowerFeature.includes(lowerQuery))
          );
        });

        if (hasMatchingFeature) {
          return true;
        }
      }

      return false;
    })
    .map((glyph) => ({
      glyph,
      score: calculateRelevanceScore(glyph, lowerQuery, isCharSearch, includeName, includeUnicode),
    }))
    .sort((a, b) => {
      // Sort by relevance score first
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      // If scores equal, maintain Unicode order
      const aUnicode = a.glyph.unicodeNumber;
      const bUnicode = b.glyph.unicodeNumber;

      if (aUnicode !== null && bUnicode !== null) {
        return aUnicode - bUnicode;
      }

      return aUnicode === null ? 1 : -1;
    })
    .map(({ glyph }) => glyph);

  return filtered;
}

/**
 * Search and return results organized by category
 * Useful for "jump to category" navigation
 * Categories are sorted by highest relevance score
 * @param includeCategoryNames - If true, includes category names in search (default: true)
 * @param includeName - If true, includes glyph names in search (default: true)
 * @param includeUnicode - If true, includes Unicode codes in search (default: true)
 */
export function searchByCategory(
  categorizedGlyphs: Record<string, GlyphInfo[]>,
  query: string,
  includeCategoryNames: boolean = true,
  includeName: boolean = true,
  includeUnicode: boolean = true
): {
  results: Record<string, GlyphInfo[]>;
  totalMatches: number;
  matchedCategories: string[];
} {
  if (!query.trim()) {
    return {
      results: categorizedGlyphs,
      totalMatches: Object.values(categorizedGlyphs).flat().length,
      matchedCategories: Object.keys(categorizedGlyphs),
    };
  }

  // Build category map for searching
  const categoryMap = buildCategoryMap(categorizedGlyphs);

  // Get all glyphs
  const allGlyphs = Object.values(categorizedGlyphs).flat();

  // Search all glyphs (returns sorted by relevance)
  const searchResults = searchGlyphs(
    allGlyphs,
    query,
    categoryMap,
    includeCategoryNames,
    includeName,
    includeUnicode
  );

  // Re-categorize the results while preserving sort order
  // Since searchResults is already sorted by score, the first glyph in each category
  // will have the highest score for that category
  const resultsByCategory: Record<string, GlyphInfo[]> = {};
  const categoryScores = new Map<string, number>(); // Track highest score per category
  let totalMatches = 0;

  const lowerQuery = query.toLowerCase().trim();
  const isCharSearch = lowerQuery.length === 1;

  searchResults.forEach((glyph) => {
    const category = categoryMap.get(glyph.unicode);
    if (category) {
      if (!resultsByCategory[category]) {
        // First glyph in this category - calculate its score (highest for this category)
        resultsByCategory[category] = [];
        const score = calculateRelevanceScore(
          glyph,
          lowerQuery,
          isCharSearch,
          includeName,
          includeUnicode
        );
        categoryScores.set(category, score);
      }
      // Since results are pre-sorted, we don't need to recalculate for subsequent glyphs
      resultsByCategory[category].push(glyph);
      totalMatches++;
    }
  });

  // Sort categories by their highest score (descending)
  const sortedCategories = Object.keys(resultsByCategory).sort((a, b) => {
    const scoreA = categoryScores.get(a) || 0;
    const scoreB = categoryScores.get(b) || 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    // If scores equal, maintain alphabetical order
    return a.localeCompare(b);
  });

  // Build sorted results object
  const sortedResults: Record<string, GlyphInfo[]> = {};
  sortedCategories.forEach((category) => {
    sortedResults[category] = resultsByCategory[category];
  });

  return {
    results: sortedResults,
    totalMatches,
    matchedCategories: sortedCategories,
  };
}

/**
 * Get enriched glyph information including Unicode metadata
 * Useful for tooltips and detailed displays
 */
export function getEnrichedGlyphInfo(glyph: GlyphInfo): {
  glyph: GlyphInfo;
  unicodeName?: string;
  keywords?: string[];
  category?: string;
} {
  const enriched: ReturnType<typeof getEnrichedGlyphInfo> = { glyph };

  if (glyph.unicodeNumber !== null && hasUnicodeMetadata()) {
    const metadata = getUnicodeMetadata(glyph.unicodeNumber);
    if (metadata) {
      enriched.unicodeName = metadata.name;
      enriched.keywords = metadata.keywords;
      enriched.category = metadata.category;
    }
  }

  return enriched;
}

/**
 * Get category statistics for navigation
 */
export function getCategoryStats(categorizedGlyphs: Record<string, GlyphInfo[]>): Array<{
  name: string;
  count: number;
  hasFeatures: number;
}> {
  return Object.entries(categorizedGlyphs).map(([name, glyphs]) => ({
    name,
    count: glyphs.length,
    hasFeatures: glyphs.filter((g) => g.features.length > 0).length,
  }));
}
