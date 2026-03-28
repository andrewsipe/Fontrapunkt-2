/**
 * Drop zone for loading fonts.
 * Full-page drop target for font files.
 * Overlay shows whenever a file is dragged (empty state or with font), so content stays on canvas and drag UI is a single overlay.
 */

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useFontDrop } from "../../../hooks/useFontDrop";
import { FileTypeCorner } from "../../../utils/icons";
import { LoadingSpinner } from "../../ui/LoadingSpinner/LoadingSpinner";
import { DragDropContext } from "./DragDropContext";
import styles from "./DropZone.module.css";

export function DropZone({ children }: { children: React.ReactNode }) {
  const { onDrop, loading, showHotReloadPrompt, setShowHotReloadPrompt, containerRef } =
    useFontDrop();

  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" && e.target === document.body && e.shiftKey) {
        setForceVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Window & { __toggleDropZone?: () => void }).__toggleDropZone = () => {
        setForceVisible((prev) => {
          const newState = !prev;
          console.log(`[DropZone] Overlay ${newState ? "shown" : "hidden"}`);
          return newState;
        });
      };
      console.log("[DropZone] Debug: __toggleDropZone() - Toggle overlay visibility");
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as Window & { __toggleDropZone?: () => void }).__toggleDropZone;
      }
    };
  }, []);

  useEffect(() => {
    if (showHotReloadPrompt) {
      toast.success("Live sync enabled — font will update automatically when you save changes", {
        duration: 5000,
      });
      setShowHotReloadPrompt(false);
    }
  }, [showHotReloadPrompt, setShowHotReloadPrompt]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "font/ttf": [".ttf"],
      "font/otf": [".otf"],
      "application/font-woff": [".woff"],
      "font/woff2": [".woff2"],
      "application/octet-stream": [".ttf", ".otf", ".woff", ".woff2"],
    },
    maxFiles: 1,
    noClick: true,
    disabled: loading,
  });

  const showOverlay = isDragActive || forceVisible;

  return (
    <DragDropContext.Provider value={{ isDragActive }}>
      <div
        ref={containerRef}
        {...getRootProps()}
        className={`${styles.dropZone} ${showOverlay ? styles.active : ""}`}
      >
        {showOverlay && (
          <div className={styles.dropOverlay}>
            <div className={styles.dropMessage}>
              {loading ? (
                <>
                  <LoadingSpinner size="lg" label="Loading font..." />
                  <p className={styles.dropTitle}>Loading font...</p>
                  <p className={styles.dropSubtitleSecondary}>Processing your font file</p>
                </>
              ) : (
                <>
                  <p className={styles.dropTitle}>Drop font file anywhere to load</p>
                  <p className={styles.dropSubtitle}>supported font files</p>
                  <p className={styles.dropHint}>.ttf, .otf, .woff & .woff2</p>
                </>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </DragDropContext.Provider>
  );
}
