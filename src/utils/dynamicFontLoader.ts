/**
 * Dynamic Font Loader Utility
 * Uses unifont to load fonts from providers (Fontsource, Google Fonts, etc.)
 * for dynamic title display and click-to-load functionality
 */

import type { Unifont } from "unifont";
import { createUnifont, providers } from "unifont";
import { loadFontFile } from "../engine/FontLoader";
import type { CachedFont } from "../types/font.types";

// System fonts to exclude from random selection
const SYSTEM_FONTS = new Set([
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact",
  "Tahoma",
  "Lucida Console",
  "Lucida Sans Unicode",
  "MS Sans Serif",
  "MS Serif",
  "Symbol",
  "Webdings",
  "Wingdings",
  "System",
  "System UI",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  "Fira Sans",
  "Droid Sans",
  "Helvetica Neue",
  "sans-serif",
  "serif",
  "monospace",
]);

// Font name keywords to EXCLUDE from hero randomization.
// These roughly correspond to "handwriting", "display", "icons", and other wild styles.
const EXCLUDED_KEYWORDS = [
  "script",
  "hand",
  "brush",
  "marker",
  "chalk",
  "graffiti",
  "comic",
  "emoji",
  "icons",
  "symbol",
  "shadow",
  "stencil",
  "outline",
  "inline",
  "decorative",
  "display",
  "black", // ultra‑heavy
  "ultra",
  "extra",
  "condensed",
  "narrow",
  "compressed",
  "expanded",
];

// Curated set of workhorse families that tend to look good as hero fonts.
// We prefer these when available, then fall back to the broader filtered pool.
const CURATED_FAMILIES = new Set([
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Source Sans 3",
  "Source Sans Pro",
  "Nunito",
  "Poppins",
  "Work Sans",
  "Raleway",
  "Manrope",
  "IBM Plex Sans",
  "DM Sans",
  "Space Grotesk",
  "Montserrat",
  "Noto Sans",
  "Noto Serif",
  "Merriweather",
  "Libre Baskerville",
  "Crimson Text",
  "Spectral",
  "PT Sans",
  "PT Serif",
  "Fira Sans",
  "Fira Code",
  "Source Code Pro",
  "JetBrains Mono",
  "IBM Plex Mono",
]);

let unifontInstance: Awaited<ReturnType<typeof createUnifont>> | null = null;
let availableFonts: string[] | null = null;

/**
 * Initialize unifont with Fontsource provider
 * Fontsource includes Google Fonts, so this gives us access to both
 */
export async function initializeUnifont(): Promise<Unifont<any>> {
  if (unifontInstance) {
    return unifontInstance;
  }

  try {
    // Type assertion: createUnifont returns provider-specific generic; we use any for storage
    unifontInstance = (await createUnifont([providers.fontsource()])) as Unifont<any>;
    console.log("[dynamicFontLoader] Unifont initialized with Fontsource provider");
    return unifontInstance;
  } catch (error) {
    console.error("[dynamicFontLoader] Failed to initialize unifont:", error);
    throw error;
  }
}

/**
 * Get list of available fonts from all providers
 * Filters out system fonts
 */
export async function getAvailableFonts(): Promise<string[]> {
  if (availableFonts) {
    return availableFonts;
  }

  try {
    const unifont = await initializeUnifont();
    const allFonts = await unifont.listFonts();

    if (!allFonts || allFonts.length === 0) {
      console.warn("[dynamicFontLoader] No fonts available from providers");
      return [];
    }

    // Step 1: strip out obvious system fonts
    const nonSystemFonts = allFonts.filter(
      (font: string) => !SYSTEM_FONTS.has(font) && !font.toLowerCase().includes("system")
    );

    // Step 2: exclude categories we don't want (handwriting, display, icons, etc.)
    const keywordFiltered = nonSystemFonts.filter((font: string) => {
      const lower = font.toLowerCase();
      return !EXCLUDED_KEYWORDS.some((kw) => lower.includes(kw));
    });

    // Step 3: prefer curated workhorse families when present
    const curatedFonts = keywordFiltered.filter((font: string) => CURATED_FAMILIES.has(font));

    const finalPool =
      curatedFonts.length > 0
        ? curatedFonts
        : keywordFiltered.length > 0
          ? keywordFiltered
          : nonSystemFonts;

    availableFonts = finalPool;
    console.log(
      `[dynamicFontLoader] Found ${finalPool.length} curated/filtered fonts (from ${allFonts.length} total)`
    );
    return finalPool;
  } catch (error) {
    console.error("[dynamicFontLoader] Failed to get available fonts:", error);
    return [];
  }
}

/**
 * Get a random font from available fonts
 */
export async function getRandomFont(): Promise<string | null> {
  const fonts = await getAvailableFonts();
  if (fonts.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * fonts.length);
  const selectedFont = fonts[randomIndex];
  console.log(`[dynamicFontLoader] Selected random font: ${selectedFont}`);
  return selectedFont;
}

/**
 * Get multiple unique random fonts from available fonts
 * @param count Number of unique fonts to return
 * @returns Array of unique font names
 */
export async function getRandomFonts(count: number): Promise<string[]> {
  const fonts = await getAvailableFonts();
  if (fonts.length === 0) {
    return [];
  }

  // If we need more fonts than available, just return all fonts
  if (count >= fonts.length) {
    // Shuffle and return all fonts
    const shuffled = [...fonts].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  // Get unique random fonts
  const selectedFonts: string[] = [];
  const usedIndices = new Set<number>();

  while (selectedFonts.length < count) {
    const randomIndex = Math.floor(Math.random() * fonts.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedFonts.push(fonts[randomIndex]);
    }
  }

  console.log(`[dynamicFontLoader] Selected ${selectedFonts.length} unique random fonts`);
  return selectedFonts;
}

/**
 * Font information for display
 */
export interface FontInfo {
  name: string;
  provider: string;
}

/**
 * Load font for display in title
 * Uses CSS Font Loading API to load font via @font-face
 */
export async function loadFontForDisplay(
  fontName: string
): Promise<{ success: boolean; fontInfo: FontInfo | null }> {
  try {
    const unifont = await initializeUnifont();

    // Resolve font to get font URLs
    const result = await unifont.resolveFont(fontName, {
      weights: ["400"], // Regular weight for display
      styles: ["normal"],
      subsets: ["latin"], // Latin subset for title
      formats: ["woff2"], // Prefer WOFF2
    });

    if (!result || !result.fonts || result.fonts.length === 0) {
      console.warn(`[dynamicFontLoader] No font data found for: ${fontName}`);
      return { success: false, fontInfo: null };
    }

    // Get the first font variant (regular weight, normal style)
    const fontData = result.fonts[0];
    const provider = result.provider || "fontsource";

    // Extract URL from src array (should be RemoteFontSource)
    const remoteSource = fontData.src.find(
      (source): source is { url: string; format?: string } =>
        typeof source === "object" && "url" in source
    );

    if (!remoteSource || !remoteSource.url) {
      console.warn(`[dynamicFontLoader] No valid font URL found for: ${fontName}`);
      return { success: false, fontInfo: null };
    }

    const fontUrl = remoteSource.url;
    const format = remoteSource.format || "woff2";

    // Create FontFace for display
    const fontFace = new FontFace(fontName, `url(${fontUrl}) format("${format}")`, {
      display: "swap", // Show fallback until loaded
      weight: String(fontData.weight ?? "400"),
      style: String(fontData.style ?? "normal"),
    });

    // Add to document fonts
    document.fonts.add(fontFace);

    // Load the font
    await fontFace.load();

    console.log(`[dynamicFontLoader] Font loaded for display: ${fontName}`);

    return {
      success: true,
      fontInfo: {
        name: fontName,
        provider: typeof provider === "string" ? provider : "fontsource",
      },
    };
  } catch (error) {
    console.error(`[dynamicFontLoader] Failed to load font for display: ${fontName}`, error);
    return { success: false, fontInfo: null };
  }
}

/**
 * Fetch font file from URL and convert to File object
 */
async function fetchFontFileFromURL(url: string, fileName: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type });
  return file;
}

/**
 * Load font into app (for click-to-load functionality)
 * Fetches font file, converts to File, and uses existing loadFontFile()
 */
export async function loadFontIntoApp(fontName: string): Promise<CachedFont | null> {
  try {
    const unifont = await initializeUnifont();

    // Resolve font to get font URLs
    const result = await unifont.resolveFont(fontName, {
      weights: ["400"],
      styles: ["normal"],
      subsets: ["latin"],
      formats: ["woff2", "woff", "ttf"], // Try multiple formats, prefer WOFF2
    });

    if (!result || !result.fonts || result.fonts.length === 0) {
      console.warn(`[dynamicFontLoader] No font data found for: ${fontName}`);
      return null;
    }

    // Get the first font variant
    const fontData = result.fonts[0];

    // Extract URL from src array (should be RemoteFontSource)
    const remoteSource = fontData.src.find(
      (source: unknown): source is { url: string; format?: string } =>
        typeof source === "object" && source !== null && "url" in source
    );

    if (!remoteSource || !remoteSource.url) {
      console.warn(`[dynamicFontLoader] No valid font URL found for: ${fontName}`);
      return null;
    }

    const fontUrl = remoteSource.url;
    const format = remoteSource.format || "woff2";

    // Determine file extension from format
    const extension = format === "woff2" ? "woff2" : format === "woff" ? "woff" : "ttf";
    const fileName = `${fontName.replace(/\s+/g, "-")}-Regular.${extension}`;

    // Fetch font file
    console.log(`[dynamicFontLoader] Fetching font file: ${fontUrl}`);
    const fontFile = await fetchFontFileFromURL(fontUrl, fileName);

    // Load font using existing FontLoader
    console.log(`[dynamicFontLoader] Loading font into app: ${fontName}`);
    const cachedFont = await loadFontFile(fontFile);

    return cachedFont;
  } catch (error) {
    console.error(`[dynamicFontLoader] Failed to load font into app: ${fontName}`, error);
    return null;
  }
}
