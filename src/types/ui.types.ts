/**
 * UI-related type definitions
 */

export interface TabSettings {
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  alignment: "left" | "center" | "right";
  direction: "ltr" | "rtl";
  textTransform: "none" | "uppercase" | "lowercase" | "small-caps";
  /** Legacy "trim"|"stretch" normalized to top/center/bottom in UI; verticalTrim holds trim state. */
  verticalAlignment: "top" | "center" | "bottom" | "stretch" | "trim";
  lastSelectedOrientation: "top" | "center" | "bottom" | "off";
  zoomToFit: boolean;
  /** CSS text-box-trim (cap alphabetic) for tighter vertical spacing; works with Auto-Fit. */
  verticalTrim: boolean;
  color: { l: number; c: number; h: number };
  backgroundColor: { l: number; c: number; h: number };
  axisValues: Record<string, number>;
  otFeatures: Record<string, boolean>;
  currentView: import("./font.types").ViewMode;
}

export interface FontTab {
  id: string;
  fontId: string;
  fontName: string;
  isVariable: boolean;
  settings: TabSettings;
}

export interface Language {
  code: string; // 'en', 'de', 'tr', etc.
  name: string;
  hasSpecialFeatures: boolean; // Show ✧ indicator
  samples: {
    title: string;
    pangram: string;
    paragraph: string;
    wikipedia: string;
  };
}
