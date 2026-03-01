/**
 * Font store - manages loaded fonts and font metadata
 * DEBUG VERSION with logging
 */

import { create } from "zustand";
import { getCachedFont, getLastCachedFont } from "../engine/FontLoader";
import type { CachedFont, NamedVariation, VariableAxis } from "../types/font.types";
import { debug } from "../utils/debug";
import { loadFontGlobally } from "../utils/fontUtils";

interface SessionState {
  lastFontId: string | null;
  timestamp: number;
}

function isSessionState(value: unknown): value is SessionState {
  return (
    typeof value === "object" &&
    value !== null &&
    "lastFontId" in value &&
    "timestamp" in value &&
    (typeof (value as SessionState).lastFontId === "string" ||
      (value as SessionState).lastFontId === null) &&
    typeof (value as SessionState).timestamp === "number"
  );
}

// Module-level cache for localStorage reads to avoid repeated disk I/O
let sessionCache: SessionState | null = null;
let sessionCacheTimestamp: number = 0;
const SESSION_CACHE_TTL = 1000; // Cache for 1 second to handle rapid reads

function getCachedSession(): SessionState | null {
  const now = Date.now();
  // Return cached value if still valid
  if (sessionCache && now - sessionCacheTimestamp < SESSION_CACHE_TTL) {
    return sessionCache;
  }

  // Cache miss or expired - read from localStorage
  try {
    const sessionStr = localStorage.getItem("app-session");
    if (!sessionStr) {
      sessionCache = null;
      sessionCacheTimestamp = now;
      return null;
    }

    const parsed: unknown = JSON.parse(sessionStr);
    if (!isSessionState(parsed)) {
      sessionCache = null;
      sessionCacheTimestamp = now;
      return null;
    }
    sessionCache = parsed;
    sessionCacheTimestamp = now;
    return parsed;
  } catch (error: unknown) {
    debug.error(
      "[fontStore] Failed to read cached session:",
      error instanceof Error ? error.message : String(error)
    );
    sessionCache = null;
    sessionCacheTimestamp = now;
    return null;
  }
}

function invalidateSessionCache(): void {
  sessionCache = null;
  sessionCacheTimestamp = 0;
}

interface FontState {
  fonts: Map<string, CachedFont>;
  fontsByFileName: Map<string, string>; // fileName -> fontId mapping for smart overwrite
  currentFontId: string | null;
  addFont: (font: CachedFont, fileName?: string) => Promise<void>;
  removeFont: (fontId: string) => void;
  setCurrentFont: (fontId: string | null) => void;
  getCurrentFont: () => CachedFont | null;
  getFontName: () => string | null;
  getFontFileName: () => string | null;
  getFontAxes: () => VariableAxis[] | undefined;
  getFontFeatures: () => string[] | undefined;
  getFontFeatureDetails: () => CachedFont["featureDetails"];
  getFontIsVariable: () => boolean;
  getFontGlyphCount: () => number;
  getFontMetadata: () => CachedFont["metadata"];
  getFontNamedVariations: () => NamedVariation[] | undefined;
  updateAxisValue: (fontId: string, axisTag: string, value: number) => void;
  resetAxes: (fontId: string) => void;
  saveSession: () => void;
  restoreSession: () => Promise<boolean>;
  replaceFontWithCached: (fontId: string) => Promise<void>;
  glyphCount: number;
  setGlyphCount: (count: number) => void;
}

export const useFontStore = create<FontState>((set, get) => ({
  fonts: new Map(),
  fontsByFileName: new Map(),
  currentFontId: null,

  addFont: async (font, fileName) => {
    debug.log("[fontStore] Adding font:", {
      id: font.id,
      name: font.name,
      format: font.format,
      isVariable: font.isVariable,
      hasOriginalFileData: !!font.originalFileData,
      originalFileDataSize: font.originalFileData?.byteLength || "N/A",
      fileDataSize: font.fileData.byteLength,
    });

    // Load font globally when added
    try {
      debug.log("[fontStore] Calling loadFontGlobally...");
      await loadFontGlobally(font);
      debug.log("[fontStore] loadFontGlobally completed successfully");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      debug.error("[fontStore] Failed to load font globally:", err.message);
      debug.error("[fontStore] Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      // Don't throw - allow font to be added even if loading fails
      // User can still see metadata even if font doesn't render
    }

    set((state) => {
      const newFonts = new Map(state.fonts);
      const newFontsByFileName = new Map(state.fontsByFileName);

      // Smart overwrite: If fileName is provided and we have an existing font with that name,
      // preserve the current font ID and axis values, then update the font data
      if (fileName) {
        const existingFontId = newFontsByFileName.get(fileName);
        if (existingFontId && existingFontId !== font.id) {
          debug.log(`[fontStore] Replacing existing font with same filename: ${fileName}`);
          const existingFont = newFonts.get(existingFontId);

          // If this is a reload (same filename), preserve the font ID and axis values
          if (existingFont) {
            // Preserve axis values if both fonts are variable
            if (existingFont.isVariable && font.isVariable && existingFont.axes && font.axes) {
              // Optimize: Use Map for O(1) lookups instead of O(n) .find() in loop
              const existingAxesMap = new Map(existingFont.axes.map((axis) => [axis.tag, axis]));

              const preservedAxes = font.axes.map((newAxis) => {
                const existingAxis = existingAxesMap.get(newAxis.tag);
                if (existingAxis && existingAxis.current !== undefined) {
                  // Use existing current value if it's still valid for the new axis
                  const preservedValue = existingAxis.current;
                  if (preservedValue >= newAxis.min && preservedValue <= newAxis.max) {
                    return { ...newAxis, current: preservedValue };
                  }
                }
                return newAxis;
              });

              font = { ...font, axes: preservedAxes };
            }

            // Use existing font ID to maintain continuity
            newFonts.delete(existingFontId);
            font = { ...font, id: existingFontId };
          } else {
            newFonts.delete(existingFontId);
          }
        }
        newFontsByFileName.set(fileName, font.id);
      }

      newFonts.set(font.id, font);
      const effectiveCurrentFontId = state.currentFontId || font.id;
      const glyphCount = newFonts.get(effectiveCurrentFontId)?.misc?.glyphCount ?? 0;
      return {
        fonts: newFonts,
        fontsByFileName: newFontsByFileName,
        currentFontId: effectiveCurrentFontId,
        glyphCount,
      };
    });

    debug.log("[fontStore] Font added to store successfully");
  },

  removeFont: (fontId) => {
    set((state) => {
      const newFonts = new Map(state.fonts);
      const newFontsByFileName = new Map(state.fontsByFileName);

      // Remove from fileName mapping
      for (const [fileName, mappedFontId] of newFontsByFileName.entries()) {
        if (mappedFontId === fontId) {
          newFontsByFileName.delete(fileName);
          break;
        }
      }

      newFonts.delete(fontId);
      const newCurrentFontId =
        state.currentFontId === fontId
          ? Array.from(newFonts.keys())[0] || null
          : state.currentFontId;
      const glyphCount = newCurrentFontId
        ? (newFonts.get(newCurrentFontId)?.misc?.glyphCount ?? 0)
        : 0;
      return {
        fonts: newFonts,
        fontsByFileName: newFontsByFileName,
        currentFontId: newCurrentFontId,
        glyphCount,
      };
    });
  },

  setCurrentFont: (fontId) => {
    const glyphCount = fontId ? (get().fonts.get(fontId)?.misc?.glyphCount ?? 0) : 0;
    set({ currentFontId: fontId, glyphCount });
  },

  getCurrentFont: () => {
    const state = get();
    if (!state.currentFontId) return null;
    return state.fonts.get(state.currentFontId) || null;
  },

  getFontName: () => {
    const font = get().getCurrentFont();
    return font ? font.name : null;
  },
  getFontFileName: () => {
    const font = get().getCurrentFont();
    return font ? font.fileName : null;
  },
  getFontAxes: () => get().getCurrentFont()?.axes,
  getFontFeatures: () => get().getCurrentFont()?.features,
  getFontFeatureDetails: () => get().getCurrentFont()?.featureDetails,
  getFontIsVariable: () => get().getCurrentFont()?.isVariable ?? false,
  getFontGlyphCount: () => {
    const font = get().getCurrentFont();
    if (!font) return 0;
    return (
      font.misc?.glyphCount ??
      ("glyphCount" in font ? (font as CachedFont & { glyphCount: number }).glyphCount : 0)
    );
  },
  getFontMetadata: () => get().getCurrentFont()?.metadata,
  getFontNamedVariations: () => get().getCurrentFont()?.namedVariations,

  updateAxisValue: (fontId, axisTag, value) => {
    set((state) => {
      const font = state.fonts.get(fontId);
      if (!font || !font.axes) return state;

      const updatedAxes = font.axes.map((axis) =>
        axis.tag === axisTag ? { ...axis, current: value } : axis
      );

      const updatedFont: CachedFont = {
        ...font,
        axes: updatedAxes,
      };

      const newFonts = new Map(state.fonts);
      newFonts.set(fontId, updatedFont);

      // Sync to TabSettings.axisValues for active tab
      // Use dynamic import to avoid circular dependency
      import("../stores/uiStore").then(({ useUIStore }) => {
        const uiState = useUIStore.getState();
        const activeTab = uiState.getActiveTab();
        if (activeTab && activeTab.fontId === fontId) {
          const currentAxisValues = activeTab.settings.axisValues || {};
          uiState.updateTabSettings(activeTab.id, {
            axisValues: {
              ...currentAxisValues,
              [axisTag]: value,
            },
          });
        }
      });

      return { fonts: newFonts };
    });
  },

  resetAxes: (fontId) => {
    set((state) => {
      const font = state.fonts.get(fontId);
      if (!font || !font.axes) return state;

      const resetAxes = font.axes.map((axis) => ({
        ...axis,
        current: axis.default,
      }));

      const updatedFont: CachedFont = {
        ...font,
        axes: resetAxes,
      };

      const newFonts = new Map(state.fonts);
      newFonts.set(fontId, updatedFont);

      // Sync to TabSettings.axisValues for active tab
      import("../stores/uiStore").then(({ useUIStore }) => {
        const uiState = useUIStore.getState();
        const activeTab = uiState.getActiveTab();
        if (activeTab && activeTab.fontId === fontId) {
          const resetAxisValues: Record<string, number> = {};
          resetAxes.forEach((axis) => {
            resetAxisValues[axis.tag] = axis.default;
          });
          uiState.updateTabSettings(activeTab.id, {
            axisValues: resetAxisValues,
          });
        }
      });

      return { fonts: newFonts };
    });
  },

  saveSession: () => {
    const state = get();
    const session: SessionState = {
      lastFontId: state.currentFontId,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem("app-session", JSON.stringify(session));
      // Update cache immediately to avoid stale reads
      sessionCache = session;
      sessionCacheTimestamp = Date.now();
      debug.log("[fontStore] Session saved:", session);
    } catch (error: unknown) {
      debug.error(
        "[fontStore] Failed to save session:",
        error instanceof Error ? error.message : String(error)
      );
      invalidateSessionCache();
    }
  },

  restoreSession: async () => {
    try {
      // Use cached session to avoid repeated localStorage reads
      const session = getCachedSession();
      if (!session) {
        debug.log("[fontStore] No session to restore");
        return false;
      }

      debug.log("[fontStore] Restoring session:", session);

      // Load last cached font (single-font model)
      const cachedFont = await getLastCachedFont();

      if (!cachedFont) {
        debug.log("[fontStore] No cached font found");
        return false;
      }

      // If session has a specific lastFontId, verify it matches
      if (session.lastFontId && cachedFont.id !== session.lastFontId) {
        debug.log("[fontStore] Cached font ID doesn't match session, using cached font");
      }

      // Load font globally
      await loadFontGlobally(cachedFont);

      // Set state
      const newFonts = new Map<string, CachedFont>();
      newFonts.set(cachedFont.id, cachedFont);

      const glyphCount = cachedFont.misc?.glyphCount ?? 0;
      set({
        fonts: newFonts,
        currentFontId: cachedFont.id,
        glyphCount,
      });

      debug.log("[fontStore] Session restored successfully:", {
        fontId: cachedFont.id,
        fontName: cachedFont.name,
      });

      return true;
    } catch (error: unknown) {
      debug.error(
        "[fontStore] Failed to restore session:",
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  },

  replaceFontWithCached: async (fontId) => {
    const fullFont = await getCachedFont(fontId);
    if (!fullFont) return;

    // Reload font globally with full metadata
    // This ensures the font stays registered in document.fonts after enhancement
    try {
      await loadFontGlobally(fullFont);
      debug.log("[fontStore] Reloaded enhanced font globally:", fullFont.name);
      debug.log("[fontStore] Enhanced font details:", {
        isVariable: fullFont.isVariable,
        axesCount: fullFont.axes?.length ?? 0,
        namedVariationsCount: fullFont.namedVariations?.length ?? 0,
        namedVariations: fullFont.namedVariations?.map((v) => v.name) ?? [],
      });
    } catch (error: unknown) {
      debug.error(
        "[fontStore] Failed to reload enhanced font:",
        error instanceof Error ? error.message : String(error)
      );
    }

    set((state) => {
      if (!state.fonts.has(fontId)) return state;
      const newFonts = new Map(state.fonts);
      newFonts.set(fontId, { ...fullFont, _quickLoad: false });
      const glyphCount =
        state.currentFontId === fontId ? (fullFont.misc?.glyphCount ?? 0) : state.glyphCount;
      return { fonts: newFonts, glyphCount };
    });
  },

  glyphCount: 0,
  setGlyphCount: (count) => set({ glyphCount: count }),
}));

// Auto-save session when fonts change
useFontStore.subscribe((state) => {
  if (state.fonts.size > 0) {
    state.saveSession();
  }
});
