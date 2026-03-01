/**
 * useFontDrop - Hook: font file drop, handle capture, load font, add tab, live watch.
 * Keeps DropZone container thin (layout + overlay only). Domain logic lives here.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DropEvent, FileRejection } from "react-dropzone";
import { useFontStore } from "../stores/fontStore";
import { useUIStore } from "../stores/uiStore";

export function useFontDrop() {
  const addFont = useFontStore((state) => state.addFont);
  const setCurrentFont = useFontStore((state) => state.setCurrentFont);
  const addTab = useUIStore((state) => state.addTab);
  const getNewTabSettings = useUIStore((state) => state.getNewTabSettings);

  const [loading, setLoading] = useState(false);
  const [showHotReloadPrompt, setShowHotReloadPrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], _fileRejections: FileRejection[], event: DropEvent) => {
      if (acceptedFiles.length === 0 || loading) return;
      setLoading(true);

      let fileHandle: FileSystemFileHandle | undefined;
      let handleCaptureFailed = false;

      try {
        console.log("[DropZone] Attempting handle capture...");

        fileHandle = (window as Window & { __capturedFileHandle?: FileSystemFileHandle })
          .__capturedFileHandle;
        if (!fileHandle) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          fileHandle = (window as Window & { __capturedFileHandle?: FileSystemFileHandle })
            .__capturedFileHandle;
        }

        if (fileHandle) {
          console.log(`[DropZone] ✓ Using handle from native interceptor: ${fileHandle.name}`);
          delete (window as Window & { __capturedFileHandle?: FileSystemFileHandle })
            .__capturedFileHandle;
        } else {
          console.log("[DropZone] No handle from native interceptor, trying dataTransfer.items...");
          const dataTransfer = (event as DragEvent)?.dataTransfer;

          if (dataTransfer?.items) {
            const items = dataTransfer.items;
            let foundFileItem = false;
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.kind === "file") {
                foundFileItem = true;
                if (typeof item.getAsFileSystemHandle === "function") {
                  try {
                    const handle = await item.getAsFileSystemHandle();
                    if (handle instanceof FileSystemFileHandle) {
                      fileHandle = handle;
                      console.log(`[DropZone] ✓ Captured handle from event: ${handle.name}`);
                      break;
                    }
                    handleCaptureFailed = true;
                  } catch (e) {
                    console.warn("[DropZone] ✗ Could not capture file handle:", e);
                    handleCaptureFailed = true;
                  }
                }
              }
            }
            if (!fileHandle && foundFileItem) handleCaptureFailed = true;
            else if (!foundFileItem) handleCaptureFailed = true;
          } else {
            handleCaptureFailed = true;
          }
        }

        if (fileHandle) {
          console.log("[DropZone] ✓ Handle capture successful - hot reload will be enabled");
        } else if (handleCaptureFailed) {
          console.log(
            "[DropZone] ✗ Handle capture failed - fallback picker will be offered after font loads"
          );
        }

        const file = acceptedFiles[0];
        const { loadFontFile, setWatchedFile, startLiveWatch } = await import(
          "../engine/FontLoader"
        );
        const cachedFont = await loadFontFile(file, fileHandle);

        if (cachedFont) {
          await addFont(cachedFont, file.name);
          setCurrentFont(cachedFont.id);

          if (fileHandle) {
            console.log(`[DropZone] Setting up hot reload for: ${file.name}`);
            setWatchedFile(fileHandle, file.name);
            startLiveWatch((reloadedFont) => {
              console.log(`[DropZone] Font reloaded via hot reload: ${reloadedFont.name}`);
              addFont(reloadedFont, file.name);
            });
            console.log("[DropZone] ✓ Hot reload enabled successfully");
            setShowHotReloadPrompt(true);
          }

          const { v4: uuidv4 } = await import("uuid");
          const tabId = uuidv4();
          const axisValues: Record<string, number> = {};
          if (cachedFont.isVariable && cachedFont.axes) {
            cachedFont.axes.forEach((axis) => {
              axisValues[axis.tag] = axis.default;
            });
          }
          const newTabSettings = getNewTabSettings(axisValues);
          if (newTabSettings.text && cachedFont) {
            const { filterToAvailableGlyphs } = await import("../utils/glyphUtils");
            newTabSettings.text = filterToAvailableGlyphs(newTabSettings.text, cachedFont);
          }
          addTab({
            id: tabId,
            fontId: cachedFont.id,
            fontName: cachedFont.name,
            isVariable: cachedFont.isVariable || false,
            settings: newTabSettings,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [addFont, setCurrentFont, addTab, getNewTabSettings, loading]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeDrop = async (event: DragEvent) => {
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer?.items) return;
      const items = dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && typeof item.getAsFileSystemHandle === "function") {
          try {
            const handle = await item.getAsFileSystemHandle();
            if (handle instanceof FileSystemFileHandle) {
              (
                window as Window & { __capturedFileHandle?: FileSystemFileHandle }
              ).__capturedFileHandle = handle;
              console.log(`[DropZone] ✓ Native interceptor captured handle: ${handle.name}`);
              break;
            }
          } catch (e) {
            console.warn("[DropZone] Native interceptor failed to capture handle:", e);
          }
        }
      }
    };

    container.addEventListener("drop", handleNativeDrop, true);
    return () => container.removeEventListener("drop", handleNativeDrop, true);
  }, []);

  return {
    onDrop,
    loading,
    showHotReloadPrompt,
    setShowHotReloadPrompt,
    containerRef,
  };
}
