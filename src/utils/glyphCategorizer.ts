/**
 * Glyph categorization utility
 * Organizes glyphs by Unicode categories and blocks
 */

export interface GlyphInfo {
  char: string;
  unicode: string;
  name: string;
  unicodeNumber: number | null;
  features: string[];
  glyphIndex: number;
}

interface CategoryRange {
  range: number[][];
  priority: number;
}

interface UnicodeBlock {
  name: string;
  start: number;
  end: number;
}

// Custom Latin-focused categories that designers typically care about
const CUSTOM_CATEGORIES: Record<string, CategoryRange> = {
  Uppercase: { range: [[65, 90]], priority: 1 },
  Lowercase: { range: [[97, 122]], priority: 2 },
  Numerals: { range: [[48, 57]], priority: 3 },
  "Basic Punctuation": {
    range: [
      [33, 47],
      [58, 64],
      [91, 96],
      [123, 126],
    ],
    priority: 4,
  },
  "Latin Uppercase Accented": {
    range: [
      [192, 214],
      [216, 222],
    ],
    priority: 5,
  },
  "Latin Lowercase Accented": {
    range: [
      [223, 246],
      [248, 255],
    ],
    priority: 6,
  },
  "Currency Symbols": {
    range: [
      [36, 36],
      [162, 165],
      [8352, 8378],
    ],
    priority: 7,
  },
  "Math Operators": {
    range: [
      [43, 43],
      [60, 62],
      [126, 126],
      [177, 177],
      [215, 215],
      [247, 247],
      [8704, 8959],
    ],
    priority: 8,
  },
};

// Unicode block data - comprehensive list
const UNICODE_BLOCKS: UnicodeBlock[] = [
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
  { name: "Armenian", start: 0x0530, end: 0x058f },
  { name: "Hebrew", start: 0x0590, end: 0x05ff },
  { name: "Arabic", start: 0x0600, end: 0x06ff },
  { name: "Syriac", start: 0x0700, end: 0x074f },
  { name: "Arabic Supplement", start: 0x0750, end: 0x077f },
  { name: "Thaana", start: 0x0780, end: 0x07bf },
  { name: "Devanagari", start: 0x0900, end: 0x097f },
  { name: "Bengali", start: 0x0980, end: 0x09ff },
  { name: "Gurmukhi", start: 0x0a00, end: 0x0a7f },
  { name: "Gujarati", start: 0x0a80, end: 0x0aff },
  { name: "Oriya", start: 0x0b00, end: 0x0b7f },
  { name: "Tamil", start: 0x0b80, end: 0x0bff },
  { name: "Telugu", start: 0x0c00, end: 0x0c7f },
  { name: "Kannada", start: 0x0c80, end: 0x0cff },
  { name: "Malayalam", start: 0x0d00, end: 0x0d7f },
  { name: "Sinhala", start: 0x0d80, end: 0x0dff },
  { name: "Thai", start: 0x0e00, end: 0x0e7f },
  { name: "Lao", start: 0x0e80, end: 0x0eff },
  { name: "Tibetan", start: 0x0f00, end: 0x0fff },
  { name: "Myanmar", start: 0x1000, end: 0x109f },
  { name: "Georgian", start: 0x10a0, end: 0x10ff },
  { name: "Hangul Jamo", start: 0x1100, end: 0x11ff },
  { name: "Ethiopic", start: 0x1200, end: 0x137f },
  { name: "Cherokee", start: 0x13a0, end: 0x13ff },
  {
    name: "Unified Canadian Aboriginal Syllabics",
    start: 0x1400,
    end: 0x167f,
  },
  { name: "Ogham", start: 0x1680, end: 0x169f },
  { name: "Runic", start: 0x16a0, end: 0x16ff },
  { name: "Tagalog", start: 0x1700, end: 0x171f },
  { name: "Khmer", start: 0x1780, end: 0x17ff },
  { name: "Mongolian", start: 0x1800, end: 0x18af },
  { name: "Latin Extended Additional", start: 0x1e00, end: 0x1eff },
  { name: "Greek Extended", start: 0x1f00, end: 0x1fff },
  { name: "General Punctuation", start: 0x2000, end: 0x206f },
  { name: "Superscripts and Subscripts", start: 0x2070, end: 0x209f },
  { name: "Currency Symbols", start: 0x20a0, end: 0x20cf },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214f },
  { name: "Number Forms", start: 0x2150, end: 0x218f },
  { name: "Arrows", start: 0x2190, end: 0x21ff },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22ff },
  { name: "Miscellaneous Technical", start: 0x2300, end: 0x23ff },
  { name: "Control Pictures", start: 0x2400, end: 0x243f },
  { name: "Optical Character Recognition", start: 0x2440, end: 0x245f },
  { name: "Enclosed Alphanumerics", start: 0x2460, end: 0x24ff },
  { name: "Box Drawing", start: 0x2500, end: 0x257f },
  { name: "Block Elements", start: 0x2580, end: 0x259f },
  { name: "Geometric Shapes", start: 0x25a0, end: 0x25ff },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26ff },
  { name: "Dingbats", start: 0x2700, end: 0x27bf },
  { name: "Braille Patterns", start: 0x2800, end: 0x28ff },
  { name: "CJK Radicals Supplement", start: 0x2e80, end: 0x2eff },
  { name: "CJK Symbols and Punctuation", start: 0x3000, end: 0x303f },
  { name: "Hiragana", start: 0x3040, end: 0x309f },
  { name: "Katakana", start: 0x30a0, end: 0x30ff },
  { name: "Bopomofo", start: 0x3100, end: 0x312f },
  { name: "Hangul Compatibility Jamo", start: 0x3130, end: 0x318f },
  { name: "Enclosed CJK Letters and Months", start: 0x3200, end: 0x32ff },
  { name: "CJK Compatibility", start: 0x3300, end: 0x33ff },
  {
    name: "CJK Unified Ideographs Extension A",
    start: 0x3400,
    end: 0x4dbf,
  },
  { name: "CJK Unified Ideographs", start: 0x4e00, end: 0x9fff },
  { name: "Hangul Syllables", start: 0xac00, end: 0xd7af },
  { name: "Private Use Area", start: 0xe000, end: 0xf8ff },
  { name: "CJK Compatibility Ideographs", start: 0xf900, end: 0xfaff },
  { name: "Alphabetic Presentation Forms", start: 0xfb00, end: 0xfb4f },
  { name: "Arabic Presentation Forms-A", start: 0xfb50, end: 0xfdff },
  { name: "Variation Selectors", start: 0xfe00, end: 0xfe0f },
  { name: "Combining Half Marks", start: 0xfe20, end: 0xfe2f },
  { name: "CJK Compatibility Forms", start: 0xfe30, end: 0xfe4f },
  { name: "Small Form Variants", start: 0xfe50, end: 0xfe6f },
  { name: "Arabic Presentation Forms-B", start: 0xfe70, end: 0xfeff },
  { name: "Halfwidth and Fullwidth Forms", start: 0xff00, end: 0xffef },
  { name: "Specials", start: 0xfff0, end: 0xffff },
];

/**
 * Check if a codepoint is in a custom category
 */
function isInCustomCategory(codepoint: number, categoryRanges: number[][]): boolean {
  return categoryRanges.some(([start, end]) => codepoint >= start && codepoint <= end);
}

/**
 * Find Unicode block for a codepoint
 */
function getUnicodeBlock(codepoint: number): string {
  const block = UNICODE_BLOCKS.find((block) => codepoint >= block.start && codepoint <= block.end);
  return block ? block.name : "Unknown";
}

/**
 * Categorize glyphs by Unicode categories and blocks
 * Returns an object mapping category names to arrays of glyphs
 */
export function categorizeGlyphs(glyphs: GlyphInfo[]): Record<string, GlyphInfo[]> {
  const categories: Record<string, { glyphs: GlyphInfo[]; priority: number }> = {};

  glyphs.forEach((glyph) => {
    // Get codepoint from glyph
    const codepoint =
      glyph.unicodeNumber !== null ? glyph.unicodeNumber : glyph.char.codePointAt(0) || 0;

    let categoryName: string | null = null;
    let priority = 999;

    // Check custom categories first
    for (const [name, { range, priority: p }] of Object.entries(CUSTOM_CATEGORIES)) {
      if (isInCustomCategory(codepoint, range)) {
        categoryName = name;
        priority = p;
        break;
      }
    }

    // Fallback to Unicode block
    if (!categoryName) {
      categoryName = getUnicodeBlock(codepoint);
      priority = 100; // Custom categories come first
    }

    if (!categories[categoryName]) {
      categories[categoryName] = {
        glyphs: [],
        priority,
      };
    }

    categories[categoryName].glyphs.push(glyph);
  });

  // Sort categories by priority, then by name
  const sortedEntries = Object.entries(categories)
    .filter(([, data]) => data.glyphs.length > 0) // Remove empty categories
    .sort(([nameA, dataA], [nameB, dataB]) => {
      // First sort by priority
      if (dataA.priority !== dataB.priority) {
        return dataA.priority - dataB.priority;
      }
      // Then alphabetically
      return nameA.localeCompare(nameB);
    });

  // Return as simple Record<string, GlyphInfo[]>
  const result: Record<string, GlyphInfo[]> = {};
  sortedEntries.forEach(([name, data]) => {
    result[name] = data.glyphs;
  });

  return result;
}
