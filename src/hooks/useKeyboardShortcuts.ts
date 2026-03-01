/**
 * Keyboard shortcuts hook
 * Handles global keyboard shortcuts
 */

import { useEffect } from "react";
import { useFontStore } from "../stores/fontStore";
import { useUIStore } from "../stores/uiStore";
import { copyToClipboard, generateCSS } from "../utils/exportUtils";

export function useKeyboardShortcuts() {
  const closeAllModals = useUIStore((state) => state.closeAllModals);
  const activeTab = useUIStore((state) => state.getActiveTab());
  const removeTab = useUIStore((state) => state.removeTab);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const setBottomBarVisible = useUIStore((state) => state.setBottomBarVisible);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const currentFont = useFontStore((state) => state.getCurrentFont());
  const resetAxes = useFontStore((state) => state.resetAxes);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + O: Open font
      if (modKey && e.key === "o") {
        e.preventDefault();
        // Trigger file input click - look for hidden file input in FontSelector or EmptyState
        const fileInput = document.querySelector<HTMLInputElement>(
          'input[type="file"][accept*=".ttf"]'
        );
        if (fileInput && !fileInput.disabled) {
          fileInput.click();
        }
        return;
      }

      // Cmd/Ctrl + W: Close tab
      if (modKey && e.key === "w" && activeTab) {
        e.preventDefault();
        removeTab(activeTab.id);
        return;
      }

      // Cmd/Ctrl + T: New tab
      if (modKey && e.key === "t") {
        e.preventDefault();
        // TODO: Create new tab with default font
        return;
      }

      // Cmd/Ctrl + C: Copy CSS (when not selecting text)
      if (modKey && e.key === "c" && !window.getSelection()?.toString()) {
        e.preventDefault();
        if (currentFont) {
          const css = generateCSS(currentFont);
          await copyToClipboard(css);
        }
        return;
      }

      // R: Reset axes to defaults
      // Check if Select is focused/open to prevent type-ahead conflicts (Base UI)
      if (e.key === "r" && e.target === document.body) {
        const isSelectFocused = document.activeElement?.closest(
          "[data-popup-open], [data-select-content]"
        );
        const isSelectOpen = document.querySelector("[data-select-content][data-open]");

        if (isSelectFocused || isSelectOpen) {
          return;
        }

        e.preventDefault();
        if (currentFont) {
          resetAxes(currentFont.id);
        }
        return;
      }

      // F: Toggle fullscreen (Present mode)
      if (e.key === "f" && e.target === document.body) {
        e.preventDefault();
        if (sidebarOpen) {
          setViewMode("present");
        } else {
          setViewMode("plain");
          setSidebarOpen(true);
        }
        return;
      }

      // Esc: Exit Present mode or close modals
      // If a Base UI dialog or Select is open, let it handle ESC
      if (e.key === "Escape") {
        const hasOpenDialog = document.querySelector("[data-modal-popup][data-open]");
        const hasOpenSelect = document.querySelector("[data-select-content][data-open]");

        if (hasOpenDialog || hasOpenSelect) {
          return;
        }

        // Base UI Dialog/Select handle ESC; handle normally here
        const viewMode = useUIStore.getState().viewMode;
        if (!sidebarOpen || viewMode === "present") {
          setSidebarOpen(true);
          setBottomBarVisible(true);
          setViewMode("plain");
        } else {
          closeAllModals();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeTab,
    removeTab,
    setViewMode,
    sidebarOpen,
    setSidebarOpen,
    setBottomBarVisible,
    currentFont,
    resetAxes,
    closeAllModals,
  ]);
}
