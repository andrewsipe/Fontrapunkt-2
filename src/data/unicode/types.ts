/**
 * Type definitions for Unicode data JSON files
 */

export interface UnicodeCharData {
  name?: string;
  category?: string;
  keywords?: string[];
  aliases?: string[];
}

export interface UnicodeDataFile {
  category: string; // e.g., "latin", "cyrillic"
  blocks: string[]; // Block names covered
  characters: Record<string, UnicodeCharData>; // Key: hex codepoint (e.g., "0041")
}
