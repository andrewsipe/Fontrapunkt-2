/**
 * Adobe NotDef fallback font loader (OFL-1.1).
 * Registers the NotDef font so missing glyphs render as a consistent .notdef
 * square instead of the browser's default grid pattern.
 */

import notDefFontUrl from "../assets/fonts/AND-Regular.otf";

export const NOTDEF_FAMILY = "Adobe NotDef";

let loadPromise: Promise<void> | null = null;

/**
 * Load Adobe NotDef into document.fonts. Idempotent.
 */
export async function loadNotDefFallback(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;

  const alreadyLoaded = Array.from(document.fonts).some(
    (f) => f.family === NOTDEF_FAMILY && f.status === "loaded"
  );
  if (alreadyLoaded) return;

  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const fontFace = new FontFace(NOTDEF_FAMILY, `url(${notDefFontUrl}) format("opentype")`, {
      display: "block",
    });
    await fontFace.load();
    document.fonts.add(fontFace);
  })();

  return loadPromise;
}

/**
 * Build CSS font-family stack: current font, then Adobe NotDef, then sans-serif.
 * Quote font name when it contains spaces (per PlainView/fontUtils pattern).
 */
export function getCanvasFontStack(fontName: string): string {
  const quoted = fontName.includes(" ") ? `"${fontName}"` : fontName;
  return `${quoted}, "${NOTDEF_FAMILY}", sans-serif`;
}
