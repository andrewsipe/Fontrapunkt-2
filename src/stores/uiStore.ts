/**
 * UI store - manages UI state (tabs, modals, view mode)
 */

import { create } from "zustand";
import type { ViewMode } from "../types/font.types";
import type { FontTab, TabSettings } from "../types/ui.types";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../utils/themeUtils";
import { useSettingsStore } from "./settingsStore";

const SIDEBAR_WIDTH_STORAGE_KEY = "fontrapunkt.sidebarWidth";
export const SIDEBAR_WIDTH_MIN = 200;
export const SIDEBAR_WIDTH_MAX = 300;

function getStoredSidebarWidth(): number | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const v = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (v === null) return null;
    const n = Number(v);
    if (Number.isFinite(n) && n >= SIDEBAR_WIDTH_MIN && n <= SIDEBAR_WIDTH_MAX) return n;
  } catch {
    /* ignore */
  }
  return null;
}

interface UIState {
  tabs: FontTab[];
  activeTabId: string | null;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  /** User-resized sidebar width in px; null = use default (responsive clamp). */
  sidebarWidthPx: number | null;
  /** Scroll position to restore when sidebar opens; cleared after restore. */
  sidebarScrollTop: number | null;
  bottomBarVisible: boolean;
  modals: {
    settings: boolean;
    newFeatures: boolean;
    fontInfo: boolean;
    fontDetails: boolean;
    sampleText: boolean;
    screenshotPreview: boolean;
  };

  /** When set before openModal("settings"), SettingsModal scrolls this section into view (e.g. "appearance") */
  openSettingsScrollTo: string | null;

  // Screenshot preview data
  screenshotData: {
    blob: Blob;
    objectURL: string;
    filename: string;
  } | null;

  // Drawers: Variable Axes (left), OpenType (right)
  openVariableAxesDrawer: boolean;
  openOpenTypeDrawer: boolean;
  setOpenVariableAxesDrawer: (open: boolean) => void;
  setOpenOpenTypeDrawer: (open: boolean) => void;

  // Tab management
  addTab: (tab: FontTab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabSettings: (tabId: string, settings: Partial<TabSettings>) => void;
  getActiveTab: () => FontTab | null;
  getNewTabSettings: (axisValues: Record<string, number>) => TabSettings;

  // View management
  setViewMode: (mode: ViewMode) => void;

  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidthPx: (value: number | null) => void;
  setSidebarScrollTop: (value: number | null) => void;

  // Bottom bar
  toggleBottomBar: () => void;
  setBottomBarVisible: (visible: boolean) => void;

  // Modals
  openModal: (modal: keyof UIState["modals"]) => void;
  closeModal: (modal: keyof UIState["modals"]) => void;
  closeAllModals: () => void;
  setOpenSettingsScrollTo: (value: string | null) => void;
  setScreenshotData: (data: { blob: Blob; objectURL: string; filename: string } | null) => void;
}

/** Default tab settings; color/backgroundColor respect effective canvas theme. */
export function getDefaultTabSettings(): TabSettings {
  const { defaultText, colorScheme, canvasTheme } = useSettingsStore.getState();
  const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
  const { color, backgroundColor } = getDefaultCanvasColors(isDark);
  return {
    text: defaultText,
    fontSize: 72,
    letterSpacing: 0,
    lineHeight: 1.2,
    alignment: "left",
    direction: "ltr",
    textTransform: "none",
    verticalAlignment: "top",
    lastSelectedOrientation: "top",
    zoomToFit: false,
    verticalTrim: false,
    color,
    backgroundColor,
    axisValues: {},
    otFeatures: {},
    currentView: "plain",
  };
}

export const useUIStore = create<UIState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  viewMode: "plain",
  sidebarOpen: true,
  sidebarWidthPx: getStoredSidebarWidth(),
  sidebarScrollTop: null,
  bottomBarVisible: true,
  modals: {
    settings: false,
    newFeatures: false,
    upload: false,
    fontInfo: false,
    fontDetails: false,
    sampleText: false,
    sourceManager: false,
    screenshotPreview: false,
  },
  openSettingsScrollTo: null,
  screenshotData: null,
  openVariableAxesDrawer: false,
  openOpenTypeDrawer: false,

  addTab: (tab) => {
    // Ensure tab has default settings if not provided
    const defaultSettings = getDefaultTabSettings();
    const tabWithDefaults: FontTab = {
      ...tab,
      settings: {
        ...defaultSettings,
        ...tab.settings,
      },
    };
    set((state) => ({
      tabs: [...state.tabs, tabWithDefaults],
      activeTabId: tabWithDefaults.id,
    }));

    // Sync initial axis values from TabSettings to fontStore when tab is created and activated
    // This ensures fontStore.axes[].current matches TabSettings.axisValues
    if (
      tabWithDefaults.settings.axisValues &&
      Object.keys(tabWithDefaults.settings.axisValues).length > 0
    ) {
      import("./fontStore").then(({ useFontStore }) => {
        const fontStore = useFontStore.getState();
        const font = fontStore.fonts.get(tabWithDefaults.fontId);

        if (font?.isVariable && font.axes) {
          font.axes.forEach((axis) => {
            const tabValue = tabWithDefaults.settings.axisValues[axis.tag];
            if (tabValue !== undefined && tabValue >= axis.min && tabValue <= axis.max) {
              fontStore.updateAxisValue(tabWithDefaults.fontId, axis.tag, tabValue);
            }
          });
        }
      });
    }
  },

  removeTab: (tabId) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const newActiveTabId =
        state.activeTabId === tabId
          ? newTabs.length > 0
            ? newTabs[0].id
            : null
          : state.activeTabId;
      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });

    // Restore axis values from TabSettings to fontStore when switching tabs
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);
    if (tab?.settings.axisValues && Object.keys(tab.settings.axisValues).length > 0) {
      // Use dynamic import to avoid circular dependency
      import("./fontStore").then(({ useFontStore }) => {
        const fontStore = useFontStore.getState();
        const font = fontStore.fonts.get(tab.fontId);

        if (font?.isVariable && font.axes) {
          // Restore each axis value using updateAxisValue (proper Zustand pattern)
          font.axes.forEach((axis) => {
            const tabValue = tab.settings.axisValues[axis.tag];
            // Use tab value if it exists and is valid
            if (tabValue !== undefined && tabValue >= axis.min && tabValue <= axis.max) {
              fontStore.updateAxisValue(tab.fontId, axis.tag, tabValue);
            }
          });
        }
      });
    }
  },

  updateTabSettings: (tabId, settings) => {
    set((state) => {
      const updatedTabs = state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              settings: {
                ...tab.settings,
                ...settings,
              },
            }
          : tab
      );
      return { tabs: updatedTabs };
    });
  },

  getActiveTab: () => {
    const state = get();
    if (!state.activeTabId) return null;
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  },

  getNewTabSettings: (axisValues) => {
    const state = get();
    const activeTab = state.activeTabId ? state.tabs.find((t) => t.id === state.activeTabId) : null;

    // Always use canvas-aware color/backgroundColor so new tabs are readable in current canvas theme.
    const { colorScheme, canvasTheme } = useSettingsStore.getState();
    const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
    const { color, backgroundColor } = getDefaultCanvasColors(isDark);

    if (activeTab) {
      // Preserve settings from active tab, new axis values, and canvas-aware color/backgroundColor
      return {
        ...activeTab.settings,
        axisValues,
        color,
        backgroundColor,
      };
    }

    // No active tab, use defaults (getDefaultTabSettings already has canvas-aware color/backgroundColor)
    const defaultSettings = getDefaultTabSettings();
    return { ...defaultSettings, axisValues };
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setSidebarWidthPx: (value) => {
    set({ sidebarWidthPx: value });
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        if (value === null) {
          window.localStorage.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
        } else {
          window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(value));
        }
      } catch {
        /* ignore */
      }
    }
  },

  setSidebarScrollTop: (value) => {
    set({ sidebarScrollTop: value });
  },

  toggleBottomBar: () => {
    set((state) => ({ bottomBarVisible: !state.bottomBarVisible }));
  },

  setBottomBarVisible: (visible) => {
    set({ bottomBarVisible: visible });
  },

  openModal: (modal) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: true,
      },
    }));
  },

  closeModal: (modal) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: false,
      },
    }));
  },

  closeAllModals: () => {
    set({
      modals: {
        settings: false,
        newFeatures: false,
        fontInfo: false,
        fontDetails: false,
        sampleText: false,
        screenshotPreview: false,
      },
    });
  },

  setOpenSettingsScrollTo: (value) => set({ openSettingsScrollTo: value }),
  setScreenshotData: (data) => set({ screenshotData: data }),

  setOpenVariableAxesDrawer: (open) => set({ openVariableAxesDrawer: open }),
  setOpenOpenTypeDrawer: (open) => set({ openOpenTypeDrawer: open }),
}));
