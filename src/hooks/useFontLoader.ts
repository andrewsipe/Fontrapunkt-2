/**
 * Hook for loading and parsing font files
 */

import { useCallback, useState } from "react";
import { loadFontFile, loadFonts as loadFontsBatch } from "../engine/FontLoader";
import type { CachedFont } from "../types/font.types";
import { isValidFontFile, validateFontFile } from "../utils/fontUtils";

interface UseFontLoaderReturn {
  loading: boolean;
  error: string | null;
  loadFont: (file: File) => Promise<CachedFont | null>;
  loadFonts: (
    files: File[],
    onProgress?: (current: number, total: number) => void
  ) => Promise<CachedFont[]>;
  clearError: () => void;
}

export function useFontLoader(): UseFontLoaderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFont = useCallback(async (file: File): Promise<CachedFont | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      if (!isValidFontFile(file)) {
        throw new Error("Invalid font file format. Supported: .ttf, .otf, .woff, .woff2");
      }

      // Check file size
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("Font file too large. Maximum size: 50MB");
      }

      // Validate magic numbers
      const isValid = await validateFontFile(file);
      if (!isValid) {
        throw new Error("File does not appear to be a valid font file");
      }

      // Load and parse font (FontCache handles everything)
      console.log("[useFontLoader] Loading font file...");
      const cachedFont = await loadFontFile(file);
      console.log("[useFontLoader] Font loaded:", {
        id: `${cachedFont.id.slice(0, 8)}...`,
        name: cachedFont.name,
        format: cachedFont.format,
        isVariable: cachedFont.isVariable,
        namedVariations: cachedFont.namedVariations?.length || 0,
        fileDataSize: cachedFont.fileData.byteLength,
        hasOriginalFileData: !!cachedFont.originalFileData,
      });

      setLoading(false);
      return cachedFont;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load font";
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  const loadFonts = useCallback(
    async (
      files: File[],
      onProgress?: (current: number, total: number) => void
    ): Promise<CachedFont[]> => {
      setLoading(true);
      setError(null);

      try {
        // Use FontLoader's batch processing (which delegates to FontCache)
        const results = await loadFontsBatch(files, onProgress);

        if (results.length === 0 && files.length > 0) {
          setError("Failed to load any fonts");
        } else if (results.length < files.length) {
          console.warn(`[useFontLoader] ${files.length - results.length} font(s) failed to load`);
        }

        setLoading(false);
        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load fonts";
        setError(errorMessage);
        setLoading(false);
        return []; // Return empty array on error
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    loadFont,
    loadFonts,
    clearError,
  };
}
