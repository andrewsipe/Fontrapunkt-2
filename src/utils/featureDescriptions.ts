/**
 * OpenType Feature Descriptions
 * Provides human-readable descriptions for common OpenType features
 * Used in Popover components for contextual help
 */

export interface FeatureDescription {
  description: string;
  reference?: string;
}

/**
 * Feature descriptions map
 * Source: Microsoft OpenType Specification
 * https://learn.microsoft.com/en-us/typography/opentype/spec/featurelist
 */
export const FEATURE_DESCRIPTIONS: Record<string, FeatureDescription> = {
  // Ligature features
  liga: {
    description:
      "Standard ligatures replace sequences of characters with a single glyph for better typography. Common examples include 'fi', 'fl', and 'ff' ligatures.",
    reference: "OpenType Feature: liga",
  },
  dlig: {
    description:
      "Discretionary ligatures are decorative ligatures that may not be appropriate for all contexts. Use sparingly for special typographic effects.",
    reference: "OpenType Feature: dlig",
  },
  hlig: {
    description:
      "Historical ligatures are ligatures that were used in historical typography but are not commonly used in modern text.",
    reference: "OpenType Feature: hlig",
  },
  clig: {
    description:
      "Contextual ligatures are ligatures that are applied based on surrounding characters for optimal typography.",
    reference: "OpenType Feature: clig",
  },

  // Stylistic sets
  ss01: {
    description:
      "Stylistic Set 1 provides an alternate set of glyphs with a specific stylistic treatment. Each font may define stylistic sets differently.",
    reference: "OpenType Feature: ss01",
  },
  ss02: {
    description:
      "Stylistic Set 2 provides an alternate set of glyphs with a specific stylistic treatment.",
    reference: "OpenType Feature: ss02",
  },

  // Case features
  case: {
    description:
      "Case-sensitive forms provide alternate glyphs for uppercase letters when used in mixed-case contexts, improving visual consistency.",
    reference: "OpenType Feature: case",
  },
  smcp: {
    description:
      "Small capitals are uppercase letters drawn at lowercase size. They provide a subtle emphasis alternative to full capitals.",
    reference: "OpenType Feature: smcp",
  },
  c2sc: {
    description:
      "Small capitals from capitals converts uppercase letters to small capitals, useful for acronyms and abbreviations.",
    reference: "OpenType Feature: c2sc",
  },
  pcap: {
    description:
      "Petite capitals are smaller than small capitals, providing another level of typographic refinement.",
    reference: "OpenType Feature: pcap",
  },
  c2pc: {
    description: "Petite capitals from capitals converts uppercase letters to petite capitals.",
    reference: "OpenType Feature: c2pc",
  },
  titl: {
    description:
      "Titling alternates are uppercase letters designed specifically for use at large sizes, with adjusted proportions for better readability.",
    reference: "OpenType Feature: titl",
  },

  // Figure features
  onum: {
    description:
      "Oldstyle figures have varying heights (ascenders and descenders) and blend better with lowercase text.",
    reference: "OpenType Feature: onum",
  },
  lnum: {
    description:
      "Lining figures are uniform in height and align with uppercase letters, ideal for tables and technical documents.",
    reference: "OpenType Feature: lnum",
  },
  tnum: {
    description:
      "Tabular figures have uniform width, making them ideal for tables where numbers need to align in columns.",
    reference: "OpenType Feature: tnum",
  },
  pnum: {
    description: "Proportional figures have varying widths optimized for reading in body text.",
    reference: "OpenType Feature: pnum",
  },
  frac: {
    description:
      "Fractions replaces number sequences (like '1/2') with proper fraction glyphs for better typography.",
    reference: "OpenType Feature: frac",
  },
  afrc: {
    description:
      "Alternative fractions provides additional fraction formatting options beyond the standard fraction feature.",
    reference: "OpenType Feature: afrc",
  },
  sups: {
    description:
      "Superscripts raises characters above the baseline, commonly used for mathematical notation and footnotes.",
    reference: "OpenType Feature: sups",
  },
  subs: {
    description:
      "Subscripts lowers characters below the baseline, commonly used for chemical formulas and mathematical notation.",
    reference: "OpenType Feature: subs",
  },
  ordn: {
    description:
      "Ordinals formats numbers with ordinal indicators (1st, 2nd, 3rd) using proper typographic forms.",
    reference: "OpenType Feature: ordn",
  },
  numr: {
    description:
      "Numerators are the top numbers in fractions, designed to work with the fraction feature.",
    reference: "OpenType Feature: numr",
  },
  dnom: {
    description:
      "Denominators are the bottom numbers in fractions, designed to work with the fraction feature.",
    reference: "OpenType Feature: dnom",
  },

  // Positional features
  sinf: {
    description:
      "Scientific inferiors are smaller characters positioned below the baseline, used in scientific notation.",
    reference: "OpenType Feature: sinf",
  },
  hist: {
    description:
      "Historical forms provides alternate glyphs based on historical typographic conventions.",
    reference: "OpenType Feature: hist",
  },

  // Contextual alternates
  calt: {
    description:
      "Contextual alternates automatically selects alternate glyphs based on surrounding characters for optimal typography.",
    reference: "OpenType Feature: calt",
  },
  salt: {
    description:
      "Stylistic alternates provides alternate glyphs for individual characters, offering stylistic variety.",
    reference: "OpenType Feature: salt",
  },
  swsh: {
    description:
      "Swash alternates provides decorative swash glyphs, typically for initial letters or special emphasis.",
    reference: "OpenType Feature: swsh",
  },
  cswh: {
    description:
      "Contextual swash applies swash alternates based on context, ensuring proper typography.",
    reference: "OpenType Feature: cswh",
  },

  // Kerning and spacing
  kern: {
    description:
      "Kerning adjusts spacing between specific character pairs for better visual balance and readability.",
    reference: "OpenType Feature: kern",
  },
  cpsp: {
    description:
      "Capital spacing adds extra space around capital letters when used with lowercase text for better readability.",
    reference: "OpenType Feature: cpsp",
  },

  // Character variants
  cv01: {
    description:
      "Character Variant 1 provides an alternate design for specific characters. Each font defines variants differently.",
    reference: "OpenType Feature: cv01",
  },
  cv02: {
    description: "Character Variant 2 provides an alternate design for specific characters.",
    reference: "OpenType Feature: cv02",
  },
};

/**
 * Get description for a feature tag
 */
export function getFeatureDescription(tag: string): FeatureDescription | null {
  return FEATURE_DESCRIPTIONS[tag.toLowerCase()] || null;
}

/**
 * Get a generic description for stylistic sets
 */
export function getStylisticSetDescription(setNumber: number): FeatureDescription {
  return {
    description: `Stylistic Set ${setNumber} provides an alternate set of glyphs with a specific stylistic treatment. The exact alternates depend on the font designer's implementation.`,
    reference: `OpenType Feature: ss${String(setNumber).padStart(2, "0")}`,
  };
}

/**
 * Get a generic description for character variants
 */
export function getCharacterVariantDescription(variantNumber: number): FeatureDescription {
  return {
    description: `Character Variant ${variantNumber} provides an alternate design for specific characters. The exact characters affected depend on the font designer's implementation.`,
    reference: `OpenType Feature: cv${String(variantNumber).padStart(2, "0")}`,
  };
}
