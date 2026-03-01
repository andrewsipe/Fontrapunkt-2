/**
 * One-time script to split other.json into category chunks by Unicode range.
 * Run: node scripts/splitUnicodeOther.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const otherPath = path.join(rootDir, "src/data/unicode/other.json");
const outDir = path.join(rootDir, "src/data/unicode/categories");

// Unicode ranges per plan (codepoint decimal)
const RANGES = {
  "basic-latin": { start: 0x0000, end: 0x007f, name: "Basic Latin" },
  "latin-extended": { start: 0x0080, end: 0x024f, name: "Latin Extended" },
  symbols: { start: 0x2000, end: 0x2bff, name: "Symbols" },
  emoji: { start: 0x1f300, end: 0x1f9ff, name: "Emoji" },
  cjk: { start: 0x4e00, end: 0x9fff, name: "CJK Unified Ideographs" },
  math: { start: 0x2200, end: 0x22ff, name: "Mathematical Operators" },
};

function getCategory(codepoint) {
  for (const [key, { start, end }] of Object.entries(RANGES)) {
    if (codepoint >= start && codepoint <= end) return key;
  }
  return "other";
}

const raw = fs.readFileSync(otherPath, "utf8");
const data = JSON.parse(raw);
const { characters } = data;

const buckets = {
  "basic-latin": { name: "Basic Latin", range: [0, 127], characters: {} },
  "latin-extended": {
    name: "Latin Extended",
    range: [0x80, 0x24f],
    characters: {},
  },
  symbols: { name: "Symbols", range: [0x2000, 0x2bff], characters: {} },
  emoji: { name: "Emoji", range: [0x1f300, 0x1f9ff], characters: {} },
  cjk: {
    name: "CJK Unified Ideographs",
    range: [0x4e00, 0x9fff],
    characters: {},
  },
  math: {
    name: "Mathematical Operators",
    range: [0x2200, 0x22ff],
    characters: {},
  },
  other: { name: "Other Ranges", range: [0, 0x10ffff], characters: {} },
};

for (const [hexKey, charData] of Object.entries(characters)) {
  const codepoint = parseInt(hexKey, 16);
  const cat = getCategory(codepoint);
  buckets[cat].characters[hexKey] = charData;
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const [filename, obj] of Object.entries(buckets)) {
  const count = Object.keys(obj.characters).length;
  const outPath = path.join(
    outDir,
    filename === "other" ? "other-ranges.json" : `${filename}.json`
  );
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2), "utf8");
  console.log(`${filename}: ${count} characters -> ${path.basename(outPath)}`);
}

console.log("Done.");
