/**
 * Unicode data loader with lazy loading and IndexedDB caching
 * Loads split category files on demand and caches in IndexedDB
 */

import type { UnicodeCharData } from "../data/unicode/types";

export interface UnicodeCategory {
  name: string;
  range: [number, number];
  characters: Record<string, UnicodeCharData>;
}

interface UnicodeCache {
  version: string;
  timestamp: number;
  categories: Record<string, UnicodeCategory>;
}

const CACHE_VERSION = "1.0.0";
const CACHE_NAME = "unicode-data-cache";
const DB_NAME = "unicode-db";
const STORE_NAME = "unicode-store";

const CATEGORY_FILES: Record<string, string> = {
  "basic-latin": "basic-latin.json",
  "latin-extended": "latin-extended.json",
  symbols: "symbols.json",
  emoji: "emoji.json",
  cjk: "cjk.json",
  math: "math.json",
  other: "other-ranges.json",
};

let dbInstance: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getCachedData(): Promise<UnicodeCache | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(CACHE_NAME);

      request.onsuccess = () => {
        const data = request.result as UnicodeCache | undefined;
        if (data && data.version === CACHE_VERSION) {
          resolve(data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[UnicodeLoader] Cache read failed:", error);
    return null;
  }
}

async function setCachedData(data: UnicodeCache): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(data, CACHE_NAME);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[UnicodeLoader] Cache write failed:", error);
  }
}

/**
 * Detect which categories are needed based on font's character set
 */
export function detectRequiredCategories(font: { characterSet?: number[] }): string[] {
  const categories = new Set<string>();

  const charCodes = font.characterSet ?? [];

  for (const code of charCodes) {
    if (code <= 0x007f) categories.add("basic-latin");
    else if (code <= 0x024f) categories.add("latin-extended");
    else if (code >= 0x2000 && code <= 0x2bff) categories.add("symbols");
    else if (code >= 0x1f300 && code <= 0x1f9ff) categories.add("emoji");
    else if (code >= 0x4e00 && code <= 0x9fff) categories.add("cjk");
    else if (code >= 0x2200 && code <= 0x22ff) categories.add("math");
    else categories.add("other");
  }

  return Array.from(categories);
}

type CategoryModule = { default: UnicodeCategory };

const categoryModules = import.meta.glob<CategoryModule>("../data/unicode/categories/*.json");

function getCategoryPath(filename: string): string {
  return `../data/unicode/categories/${filename}`;
}

/**
 * Load unicode data for specific categories
 */
export async function loadUnicodeData(
  requiredCategories?: string[]
): Promise<Record<string, UnicodeCategory>> {
  const cached = await getCachedData();
  if (cached) {
    console.log("[UnicodeLoader] Using cached data");
    return cached.categories;
  }

  console.log("[UnicodeLoader] Loading unicode data...");

  const categoriesToLoad =
    requiredCategories && requiredCategories.length > 0
      ? requiredCategories
      : Object.keys(CATEGORY_FILES);

  const loadPromises = categoriesToLoad.map(async (category) => {
    const filename = CATEGORY_FILES[category];
    if (!filename) return null;

    const fullPath = getCategoryPath(filename);
    const loader = categoryModules[fullPath];
    if (!loader) {
      console.warn(`[UnicodeLoader] No loader for ${category}`);
      return null;
    }

    try {
      const module = await loader();
      return [category, module.default] as [string, UnicodeCategory];
    } catch (error) {
      console.warn(`[UnicodeLoader] Failed to load ${category}:`, error);
      return null;
    }
  });

  const results = await Promise.all(loadPromises);
  const categories: Record<string, UnicodeCategory> = {};

  for (const result of results) {
    if (result) {
      const [category, data] = result;
      categories[category] = data;
    }
  }

  const cacheData: UnicodeCache = {
    version: CACHE_VERSION,
    timestamp: Date.now(),
    categories,
  };

  await setCachedData(cacheData);

  console.log("[UnicodeLoader] Loaded and cached", Object.keys(categories).length, "categories");
  return categories;
}

/**
 * Clear unicode cache (for debugging or version updates)
 */
export async function clearUnicodeCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(CACHE_NAME);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[UnicodeLoader] Cache clear failed:", error);
  }
}
