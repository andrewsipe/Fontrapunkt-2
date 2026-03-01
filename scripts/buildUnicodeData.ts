/**
 * Build script to generate Unicode data JSON files from Unicode.org UCD files
 * Downloads and parses UnicodeData.txt, NameAliases.txt, and Blocks.txt
 * Generates category-specific JSON files for lazy loading
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const Filename = fileURLToPath(import.meta.url);
const Dirname = path.dirname(Filename);

const UNICODE_VERSION = "17.0.0";
const UCD_BASE_URL = `https://www.unicode.org/Public/${UNICODE_VERSION}/ucd/`;

interface UnicodeCharData {
  name?: string;
  category?: string;
  keywords?: string[];
  aliases?: string[];
}

interface UnicodeDataFile {
  category: string;
  blocks: string[];
  characters: Record<string, UnicodeCharData>;
}

// Map Unicode blocks to category JSON files
const BLOCK_TO_CATEGORY: Record<string, string> = {
  // Latin
  "Basic Latin": "latin",
  "Latin-1 Supplement": "latin",
  "Latin Extended-A": "latin",
  "Latin Extended-B": "latin",
  "Latin Extended Additional": "latin",
  "Latin Extended-C": "latin",
  "Latin Extended-D": "latin",
  "Latin Extended-E": "latin",
  "Latin Extended-F": "latin",
  "Latin Extended-G": "latin",
  "IPA Extensions": "latin",

  // Cyrillic
  Cyrillic: "cyrillic",
  "Cyrillic Supplement": "cyrillic",
  "Cyrillic Extended-A": "cyrillic",
  "Cyrillic Extended-B": "cyrillic",
  "Cyrillic Extended-C": "cyrillic",

  // Greek
  "Greek and Coptic": "greek",
  "Greek Extended": "greek",

  // Punctuation
  "General Punctuation": "punctuation",
  "Supplemental Punctuation": "punctuation",
  "CJK Symbols and Punctuation": "punctuation",
  "CJK Compatibility Forms": "punctuation",
  "Small Form Variants": "punctuation",
  "Vertical Forms": "punctuation",
  "Halfwidth and Fullwidth Forms": "punctuation",

  // Symbols
  "Currency Symbols": "symbols",
  "Mathematical Operators": "symbols",
  "Supplemental Mathematical Operators": "symbols",
  "Miscellaneous Mathematical Symbols-A": "symbols",
  "Miscellaneous Mathematical Symbols-B": "symbols",
  "Mathematical Alphanumeric Symbols": "symbols",
  Arrows: "symbols",
  "Supplemental Arrows-A": "symbols",
  "Supplemental Arrows-B": "symbols",
  "Supplemental Arrows-C": "symbols",
  "Miscellaneous Symbols": "symbols",
  "Miscellaneous Symbols and Pictographs": "symbols",
  "Miscellaneous Symbols and Arrows": "symbols",
  Dingbats: "symbols",
  "Geometric Shapes": "symbols",
  "Geometric Shapes Extended": "symbols",
  "Letterlike Symbols": "symbols",
  "Box Drawing": "symbols",
  "Block Elements": "symbols",
  "Miscellaneous Technical": "symbols",

  // Diacritics
  "Combining Diacritical Marks": "diacritics",
  "Combining Diacritical Marks Extended": "diacritics",
  "Combining Diacritical Marks Supplement": "diacritics",
  "Combining Half Marks": "diacritics",
  "Spacing Modifier Letters": "diacritics",

  // Numbers
  "Superscripts and Subscripts": "numbers",
  "Number Forms": "numbers",
  "Enclosed Alphanumerics": "numbers",
  "Enclosed Alphanumeric Supplement": "numbers",
  "Enclosed CJK Letters and Months": "numbers",
  "Enclosed Ideographic Supplement": "numbers",
};

// Common name aliases for semantic search
const COMMON_NAME_ALIASES: Record<string, string[]> = {
  "LEFT PARENTHESIS": ["parenthesis", "paren", "bracket", "open"],
  "RIGHT PARENTHESIS": ["parenthesis", "paren", "bracket", "close"],
  "LEFT SQUARE BRACKET": ["bracket", "square", "open"],
  "RIGHT SQUARE BRACKET": ["bracket", "square", "close"],
  "LEFT CURLY BRACKET": ["brace", "curly", "open"],
  "RIGHT CURLY BRACKET": ["brace", "curly", "close"],
  "FULL STOP": ["period", "dot"],
  COMMA: ["comma"],
  COLON: ["colon"],
  SEMICOLON: ["semicolon"],
  "QUOTATION MARK": ["quote", "quotation"],
  APOSTROPHE: ["apostrophe", "quote"],
  "HYPHEN-MINUS": ["hyphen", "dash", "minus"],
  SOLIDUS: ["slash", "forward slash"],
  "REVERSE SOLIDUS": ["backslash", "backward slash"],
  ASTERISK: ["asterisk", "star"],
  AMPERSAND: ["ampersand", "and"],
  "AT SIGN": ["at", "commercial at"],
  "NUMBER SIGN": ["hash", "pound", "sharp"],
  "PERCENT SIGN": ["percent"],
  "PLUS SIGN": ["plus"],
  "EQUALS SIGN": ["equals", "equal"],
  "LESS-THAN SIGN": ["less than", "less"],
  "GREATER-THAN SIGN": ["greater than", "greater"],
  "QUESTION MARK": ["question"],
  "EXCLAMATION MARK": ["exclamation"],
};

/**
 * Generate keywords from Unicode name
 */
function generateKeywords(name: string, blockName?: string): string[] {
  const keywords = new Set<string>();
  const lower = name.toLowerCase();

  // Add block keywords
  if (blockName) {
    blockName
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 2) keywords.add(word);
      });
  }

  // Split name into parts
  lower.split(/[\s-]+/).forEach((part) => {
    if (part.length > 2) keywords.add(part);
  });

  // Add common aliases
  if (COMMON_NAME_ALIASES[name]) {
    COMMON_NAME_ALIASES[name].forEach((alias) => keywords.add(alias));
  }

  // Semantic patterns
  const patterns: [RegExp, string[]][] = [
    [/latin/i, ["latin", "roman", "alphabet"]],
    [/cyrillic/i, ["cyrillic", "russian", "slavic"]],
    [/greek/i, ["greek", "alpha", "beta"]],
    [/arrow/i, ["arrow", "direction"]],
    [/math|mathematical/i, ["math", "mathematical"]],
    [/currency/i, ["currency", "money"]],
    [/punctuation/i, ["punctuation"]],
    [/symbol/i, ["symbol"]],
    [/bracket|parenthesis/i, ["bracket", "parenthesis", "paren"]],
    [/slash/i, ["slash"]],
    [/dash|hyphen/i, ["dash", "hyphen"]],
  ];

  patterns.forEach(([pattern, aliases]) => {
    if (pattern.test(name)) {
      aliases.forEach((a) => keywords.add(a));
    }
  });

  return Array.from(keywords);
}

/**
 * Get Unicode category from general category code
 */
function getUnicodeCategory(generalCategory: string): string {
  const categoryMap: Record<string, string> = {
    Lu: "Letter",
    Ll: "Letter",
    Lt: "Letter",
    Lm: "Letter",
    Lo: "Letter",
    Nd: "Number",
    Nl: "Number",
    No: "Number",
    Pc: "Punctuation",
    Pd: "Punctuation",
    Ps: "Punctuation",
    Pe: "Punctuation",
    Pi: "Punctuation",
    Pf: "Punctuation",
    Po: "Punctuation",
    Sm: "Symbol",
    Sc: "Symbol",
    Sk: "Symbol",
    So: "Symbol",
    Zs: "Separator",
    Zl: "Separator",
    Zp: "Separator",
    Cc: "Other",
    Cf: "Other",
    Cs: "Other",
    Co: "Other",
    Cn: "Other",
    Mc: "Mark",
    Me: "Mark",
    Mn: "Mark",
  };
  return categoryMap[generalCategory] || "Other";
}

/**
 * Download a file from URL
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const text = await response.text();
  fs.writeFileSync(outputPath, text, "utf-8");
  console.log(`Saved to ${outputPath}`);
}

/**
 * Parse UnicodeData.txt
 */
function parseUnicodeData(content: string): Map<number, { name: string; category: string }> {
  const data = new Map<number, { name: string; category: string }>();
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;

    const parts = line.split(";");
    if (parts.length < 2) continue;

    const codepoint = parseInt(parts[0].trim(), 16);
    const name = parts[1].trim();
    const category = parts[2]?.trim() || "";

    if (name && name !== "<control>" && !name.startsWith("<")) {
      data.set(codepoint, {
        name,
        category: getUnicodeCategory(category),
      });
    }
  }

  return data;
}

/**
 * Parse NameAliases.txt
 */
function parseNameAliases(content: string): Map<number, string[]> {
  const aliases = new Map<number, string[]>();
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;

    const parts = line.split(";");
    if (parts.length < 3) continue;

    const codepoint = parseInt(parts[0].trim(), 16);
    const alias = parts[1]?.trim();
    const type = parts[2]?.trim();

    // Only include certain alias types (abbreviation, alternate, etc.)
    if (alias && (type === "abbreviation" || type === "alternate" || type === "correction")) {
      if (!aliases.has(codepoint)) {
        aliases.set(codepoint, []);
      }
      aliases.get(codepoint)!.push(alias);
    }
  }

  return aliases;
}

/**
 * Parse Blocks.txt
 */
function parseBlocks(content: string): Map<number, string> {
  const blocks = new Map<number, string>();
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;

    const parts = line.split(";");
    if (parts.length < 2) continue;

    const range = parts[0].trim();
    const blockName = parts[1].trim();

    if (range.includes("..")) {
      const [start, end] = range.split("..").map((s) => parseInt(s.trim(), 16));
      for (let cp = start; cp <= end; cp++) {
        blocks.set(cp, blockName);
      }
    } else {
      const cp = parseInt(range, 16);
      blocks.set(cp, blockName);
    }
  }

  return blocks;
}

/**
 * Main function to build Unicode data
 */
async function main() {
  const outputDir = path.join(Dirname, "../src/data/unicode");
  const tempDir = path.join(Dirname, "../temp/ucd");

  // Create directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log("Downloading UCD files...");

  // Download UCD files
  const unicodeDataPath = path.join(tempDir, "UnicodeData.txt");
  const nameAliasesPath = path.join(tempDir, "NameAliases.txt");
  const blocksPath = path.join(tempDir, "Blocks.txt");

  try {
    await downloadFile(`${UCD_BASE_URL}UnicodeData.txt`, unicodeDataPath);
    await downloadFile(`${UCD_BASE_URL}NameAliases.txt`, nameAliasesPath);
    await downloadFile(`${UCD_BASE_URL}Blocks.txt`, blocksPath);
  } catch (error) {
    console.error("Error downloading UCD files:", error);
    process.exit(1);
  }

  console.log("Parsing UCD files...");

  // Parse UCD files
  const unicodeDataContent = fs.readFileSync(unicodeDataPath, "utf-8");
  const nameAliasesContent = fs.readFileSync(nameAliasesPath, "utf-8");
  const blocksContent = fs.readFileSync(blocksPath, "utf-8");

  const charData = parseUnicodeData(unicodeDataContent);
  const aliases = parseNameAliases(nameAliasesContent);
  const blocks = parseBlocks(blocksContent);

  console.log(
    `Parsed ${charData.size} characters, ${aliases.size} with aliases, ${blocks.size} block mappings`
  );

  // Group characters by category
  const categoryData = new Map<string, UnicodeDataFile>();

  for (const [codepoint, data] of charData.entries()) {
    const blockName = blocks.get(codepoint);
    if (!blockName) continue;

    const category = BLOCK_TO_CATEGORY[blockName] || "other";
    const hexCode = codepoint.toString(16).toUpperCase().padStart(4, "0");

    if (!categoryData.has(category)) {
      categoryData.set(category, {
        category,
        blocks: [],
        characters: {},
      });
    }

    const file = categoryData.get(category)!;
    if (!file.blocks.includes(blockName)) {
      file.blocks.push(blockName);
    }

    const charAliases = aliases.get(codepoint) || [];
    const allAliases = [
      data.name.toLowerCase().replace(/\s+/g, "-"),
      ...charAliases.map((a) => a.toLowerCase().replace(/\s+/g, "-")),
    ];

    file.characters[hexCode] = {
      name: data.name,
      category: data.category,
      keywords: generateKeywords(data.name, blockName),
      aliases: allAliases,
    };
  }

  // Sort blocks within each category
  for (const file of categoryData.values()) {
    file.blocks.sort();
  }

  // Write JSON files
  console.log("Writing JSON files...");
  for (const [category, data] of categoryData.entries()) {
    const outputPath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Generated ${outputPath} (${Object.keys(data.characters).length} characters)`);
  }

  console.log("Done! Generated", categoryData.size, "category files");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
