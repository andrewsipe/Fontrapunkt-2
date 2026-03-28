/**
 * Color Panel component
 * OKLCH color picker for foreground and background
 */

import React from "react";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useUIStore } from "../../../stores/uiStore";
import { Palette } from "../../../utils/icons";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../../../utils/themeUtils";
import { LabelWithPopover } from "../../components/LabelWithPopover";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { CustomToggleGroup } from "../../components/ToggleGroup/CustomToggleGroup";
import sidebarStyles from "../../sidebar/Panel.module.css";
import { OKLCHPickerPanel } from "../OKLCHPicker/OKLCHPickerPanel";
import styles from "./ColorPanel.module.css";

export function ColorPanel() {
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const viewMode = useUIStore((state) => state.viewMode);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const canvasTheme = useSettingsStore((state) => state.canvasTheme);
  const [colorMode, setColorMode] = React.useState<"foreground" | "background">("foreground");

  const isGlyphsView = viewMode === "glyphs";

  const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
  const { color: defaultColor, backgroundColor: defaultBgColor } = getDefaultCanvasColors(isDark);

  const currentColor =
    colorMode === "foreground"
      ? activeTab?.settings.color || defaultColor
      : activeTab?.settings.backgroundColor || defaultBgColor;

  const handleColorChange = (color: { l: number; c: number; h: number }) => {
    if (!activeTab) return;
    if (colorMode === "foreground") {
      updateTabSettings(activeTab.id, { color });
    } else {
      updateTabSettings(activeTab.id, { backgroundColor: color });
    }
  };

  const handlePanelReset = () => {
    if (!activeTab) return;
    setColorMode("foreground");
    updateTabSettings(activeTab.id, {
      color: defaultColor,
      backgroundColor: defaultBgColor,
    });
  };

  return (
    <div
      className={`${sidebarStyles.sidebarPanel} ${styles.colorPanel} ${isGlyphsView ? sidebarStyles.panelCollapsed : ""}`}
    >
      <TitleBar
        variant="panel"
        title={
          <LabelWithPopover sectionKey="color" as="span" variant="section">
            Color
          </LabelWithPopover>
        }
        useInteractiveTitleStyle
        icon={Palette}
        onReset={handlePanelReset}
        resetTooltip="Reset colors to defaults"
        resetAriaLabel="Reset colors to defaults"
        resetDisabled={!activeTab || isGlyphsView}
      />
      {!isGlyphsView && (
        <div className={styles.colorControls}>
          <CustomToggleGroup.Root
            type="single"
            value={colorMode}
            onValueChange={(value) => {
              if (value) {
                setColorMode(value as "foreground" | "background");
              }
            }}
            variant="segmented"
            className={styles.colorModeButtons}
            aria-label="Color mode selector"
          >
            <CustomToggleGroup.Item value="foreground">Foreground</CustomToggleGroup.Item>
            <CustomToggleGroup.Item value="background">Background</CustomToggleGroup.Item>
          </CustomToggleGroup.Root>
          <OKLCHPickerPanel
            color={currentColor}
            onChange={handleColorChange}
            showHex
            showPreview
            idPrefix="sidebar-oklch"
          />
        </div>
      )}
    </div>
  );
}
