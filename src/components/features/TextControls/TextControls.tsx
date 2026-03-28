/**
 * Text Controls component
 * Controls for font size, letter spacing, line height, alignment, etc.
 * variant="sidebar" (default): vertical panel with TitleBar. variant="toolbar": horizontal strip with sliders in popovers.
 */

import { useRef } from "react";
import { useUIStore } from "../../../stores/uiStore";
import {
  ALargeSmall,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  AutoFitOffNeue,
  CaseLower,
  CaseSensitive,
  CaseUpper,
  LetterSpacingNeue,
  LineHeightNeue,
  Maximize,
  SlidersHorizontal,
  VerticalCenterAlignNeue,
  VerticalTrimOff,
  VerticalTrimOn,
} from "../../../utils/icons";
import { rafThrottle } from "../../../utils/rafThrottle";
import { ControlGroup } from "../../components/ControlGroup/ControlGroup";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import { LabelWithPopover } from "../../components/LabelWithPopover";
import { Popover } from "../../components/Popover";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { CustomToggleGroup } from "../../components/ToggleGroup/CustomToggleGroup";
import { TwoLayerSliderWithLayout } from "../../components/TwoLayerSlider";
import { Icon } from "../../primitives/Icon/Icon";
import sidebarStyles from "../../sidebar/Panel.module.css";
import styles from "./TextControls.module.css";

export interface TextControlsProps {
  /** "sidebar" = vertical panel (default). "toolbar" = horizontal strip with sliders in popovers. */
  variant?: "sidebar" | "toolbar";
}

export function TextControls({ variant = "sidebar" }: TextControlsProps) {
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const viewMode = useUIStore((state) => state.viewMode);

  // Use default settings if no active tab
  const settings = activeTab?.settings || {
    fontSize: 72,
    letterSpacing: 0,
    lineHeight: 1.2,
    alignment: "left",
    direction: "ltr",
    textTransform: "none",
    verticalAlignment: "top",
    zoomToFit: false,
    verticalTrim: false,
  };

  // RAF-throttled update handlers for smooth slider performance
  const throttledFontSizeUpdate = useRef(
    rafThrottle((tabId: string, value: number) => {
      updateTabSettings(tabId, {
        fontSize: Math.round(value),
        zoomToFit: false,
      });
    })
  );

  const throttledLetterSpacingUpdate = useRef(
    rafThrottle((tabId: string, value: number) => {
      updateTabSettings(tabId, { letterSpacing: Math.round(value) });
    })
  );

  const throttledLineHeightUpdate = useRef(
    rafThrottle((tabId: string, value: number) => {
      const rounded = Math.round(value * 10) / 10;
      updateTabSettings(tabId, { lineHeight: rounded });
    })
  );

  const {
    fontSize,
    letterSpacing,
    lineHeight,
    alignment,
    textTransform,
    verticalAlignment,
    zoomToFit,
    verticalTrim,
  } = settings;
  const isGlyphsView = viewMode === "glyphs";

  // Orientation: normalize legacy "trim"|"stretch" to "top"
  const orientationValue: "top" | "center" | "bottom" =
    verticalAlignment === "top" || verticalAlignment === "center" || verticalAlignment === "bottom"
      ? verticalAlignment
      : "top";

  const handlePanelReset = () => {
    if (!activeTab) return;
    updateTabSettings(activeTab.id, {
      fontSize: 72,
      letterSpacing: 0,
      lineHeight: 1.2,
      alignment: "left",
      direction: "ltr",
      textTransform: "none",
      verticalAlignment: "top",
      zoomToFit: false,
      verticalTrim: false,
    });
  };

  /* Toolbar variant: horizontal strip, sliders in popovers, toggle groups in one row */
  if (variant === "toolbar") {
    return (
      <div
        className={`${styles.textControls} ${styles.toolbarVariant}`}
        role="toolbar"
        aria-label="Text controls"
      >
        {/* Font size popover + Auto-Fit button */}
        <div className={styles.sliderRowWithAction}>
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconContainer
                icon={<Icon icon={ALargeSmall} />}
                variant="interactive"
                tooltip="Font size"
                ariaLabel="Font size"
                disabled={isGlyphsView}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="start"
                sideOffset={8}
                className={styles.toolbarSliderPopover}
              >
                <TwoLayerSliderWithLayout
                  icon={<Icon icon={ALargeSmall} />}
                  label="Font Size"
                  value={fontSize}
                  min={isGlyphsView ? 32 : 1}
                  max={isGlyphsView ? 400 : 5000}
                  step={isGlyphsView ? 1 : 25}
                  onChange={(value) => {
                    if (activeTab) {
                      throttledFontSizeUpdate.current(activeTab.id, value);
                    }
                  }}
                  onReset={() => {
                    if (activeTab) {
                      updateTabSettings(activeTab.id, {
                        fontSize: 72,
                        zoomToFit: false,
                      });
                    }
                  }}
                  showDecimals={false}
                  disabled={isGlyphsView}
                  enablePrecision={!isGlyphsView}
                  hideLabelRow
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <IconContainer
            icon={<Icon icon={zoomToFit ? Maximize : AutoFitOffNeue} />}
            variant="interactive"
            tooltip={zoomToFit ? "Auto Fit to container (on)" : "Auto Fit to container"}
            ariaLabel={zoomToFit ? "Auto Fit on" : "Auto Fit off"}
            disabled={isGlyphsView}
            className={zoomToFit ? styles.togglePressed : undefined}
            onClick={() => {
              if (activeTab) {
                updateTabSettings(activeTab.id, { zoomToFit: !zoomToFit });
              }
            }}
          />
        </div>

        {/* Letter spacing popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <IconContainer
              icon={<Icon icon={LetterSpacingNeue} />}
              variant="interactive"
              tooltip="Letter spacing"
              ariaLabel="Letter spacing"
              disabled={isGlyphsView}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={8}
              className={styles.toolbarSliderPopover}
            >
              <TwoLayerSliderWithLayout
                icon={<Icon icon={LetterSpacingNeue} />}
                label="Letter Spacing"
                value={letterSpacing}
                min={-100}
                max={100}
                step={1}
                onChange={(value) => {
                  if (activeTab) {
                    throttledLetterSpacingUpdate.current(activeTab.id, value);
                  }
                }}
                onReset={() => {
                  if (activeTab) {
                    updateTabSettings(activeTab.id, { letterSpacing: 0 });
                  }
                }}
                showDecimals={false}
                disabled={isGlyphsView}
                enablePrecision={false}
                hideLabelRow
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Line height popover + Vertical Trim button */}
        <div className={styles.sliderRowWithAction}>
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconContainer
                icon={<Icon icon={LineHeightNeue} />}
                variant="interactive"
                tooltip="Line height"
                ariaLabel="Line height"
                disabled={isGlyphsView}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="start"
                sideOffset={8}
                className={styles.toolbarSliderPopover}
              >
                <TwoLayerSliderWithLayout
                  icon={<Icon icon={LineHeightNeue} />}
                  label="Line Height"
                  value={lineHeight}
                  min={0.7}
                  max={1.7}
                  step={0.1}
                  onChange={(value) => {
                    if (activeTab) {
                      throttledLineHeightUpdate.current(activeTab.id, value);
                    }
                  }}
                  onReset={() => {
                    if (activeTab) {
                      updateTabSettings(activeTab.id, {
                        lineHeight: 1.2,
                        verticalTrim: false,
                      });
                    }
                  }}
                  showDecimals={true}
                  disabled={isGlyphsView}
                  enablePrecision={false}
                  hideLabelRow
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <IconContainer
            icon={<Icon icon={verticalTrim ? VerticalTrimOn : VerticalTrimOff} />}
            variant="interactive"
            tooltip={verticalTrim ? "Vertical Trim (on)" : "Vertical Trim (text-box-trim)"}
            ariaLabel={verticalTrim ? "Vertical Trim on" : "Vertical Trim off"}
            disabled={isGlyphsView}
            className={verticalTrim ? styles.togglePressed : undefined}
            onClick={() => {
              if (activeTab) {
                updateTabSettings(activeTab.id, {
                  verticalTrim: !verticalTrim,
                });
              }
            }}
          />
        </div>

        <div className={styles.toolbarDivider} aria-hidden />

        {/* Alignment */}
        <CustomToggleGroup.Root
          type="single"
          value={alignment}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                alignment: value as "left" | "center" | "right",
              });
            }
          }}
          variant="segmented"
          className={styles.toolbarButtonGroup}
          aria-label="Alignment"
        >
          <CustomToggleGroup.Item value="left" tooltip="Align Left" disabled={isGlyphsView}>
            <Icon icon={AlignLeft} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="center" tooltip="Align Center" disabled={isGlyphsView}>
            <Icon icon={AlignCenter} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="right" tooltip="Align Right" disabled={isGlyphsView}>
            <Icon icon={AlignRight} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>

        {/* Orientation */}
        <CustomToggleGroup.Root
          type="single"
          value={orientationValue}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                verticalAlignment: value as "top" | "center" | "bottom",
              });
            }
          }}
          variant="segmented"
          className={styles.toolbarButtonGroup}
          aria-label="Vertical alignment"
        >
          <CustomToggleGroup.Item value="top" tooltip="Top" disabled={isGlyphsView}>
            <Icon icon={ArrowUpToLine} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="center" tooltip="Center" disabled={isGlyphsView}>
            <Icon icon={VerticalCenterAlignNeue} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="bottom" tooltip="Bottom" disabled={isGlyphsView}>
            <Icon icon={ArrowDownToLine} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>

        {/* Case */}
        <CustomToggleGroup.Root
          type="single"
          value={textTransform}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                textTransform: value as "none" | "uppercase" | "lowercase",
              });
            }
          }}
          variant="segmented"
          className={styles.toolbarButtonGroup}
          aria-label="Text case"
        >
          <CustomToggleGroup.Item value="uppercase" aria-label="All Caps" tooltip="All Caps">
            <Icon icon={CaseUpper} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item
            value="none"
            aria-label="Uppercase/Lowercase"
            tooltip="Uppercase/Lowercase"
          >
            <Icon icon={CaseSensitive} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="lowercase" aria-label="Lowercase" tooltip="Lowercase">
            <Icon icon={CaseLower} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </div>
    );
  }

  return (
    <div className={`${sidebarStyles.sidebarPanel} ${styles.textControls}`}>
      <TitleBar
        variant="panel"
        title={
          <LabelWithPopover sectionKey="text controls" as="span" variant="section">
            Text Controls
          </LabelWithPopover>
        }
        useInteractiveTitleStyle
        icon={<Icon icon={SlidersHorizontal} />}
        onReset={handlePanelReset}
        resetTooltip="Reset text controls to defaults"
        resetAriaLabel="Reset text controls to defaults"
        resetDisabled={!activeTab}
      />
      {/* Font Size — Auto-Fit in label row */}
      <TwoLayerSliderWithLayout
        icon={<Icon icon={ALargeSmall} />}
        label="Font Size"
        value={fontSize}
        min={isGlyphsView ? 32 : 1}
        max={isGlyphsView ? 400 : 5000}
        step={isGlyphsView ? 1 : 25}
        onChange={(value) => {
          if (activeTab) {
            throttledFontSizeUpdate.current(activeTab.id, value);
          }
        }}
        onReset={() => {
          if (activeTab) {
            updateTabSettings(activeTab.id, { fontSize: 72, zoomToFit: false });
          }
        }}
        showDecimals={false}
        disabled={isGlyphsView}
        enablePrecision={!isGlyphsView}
        labelTrailing={
          <IconContainer
            icon={<Icon icon={zoomToFit ? Maximize : AutoFitOffNeue} />}
            variant="interactive"
            tooltip={zoomToFit ? "Auto Fit to container (on)" : "Auto Fit to container"}
            ariaLabel={zoomToFit ? "Auto Fit on" : "Auto Fit off"}
            disabled={isGlyphsView}
            fontSize="xs"
            className={zoomToFit ? styles.togglePressed : undefined}
            onClick={() => {
              if (activeTab) {
                updateTabSettings(activeTab.id, { zoomToFit: !zoomToFit });
              }
            }}
          />
        }
      />

      <TwoLayerSliderWithLayout
        icon={<Icon icon={LetterSpacingNeue} />}
        label="Letter Spacing"
        value={letterSpacing}
        min={-100}
        max={100}
        step={1}
        onChange={(value) => {
          if (activeTab) {
            throttledLetterSpacingUpdate.current(activeTab.id, value);
          }
        }}
        onReset={() => {
          if (activeTab) {
            updateTabSettings(activeTab.id, { letterSpacing: 0 });
          }
        }}
        showDecimals={false}
        disabled={isGlyphsView}
        enablePrecision={false}
      />

      {/* Line Height — Vertical Trim in label row */}
      <TwoLayerSliderWithLayout
        icon={<Icon icon={LineHeightNeue} />}
        label="Line Height"
        value={lineHeight}
        min={0.7}
        max={1.7}
        step={0.1}
        onChange={(value) => {
          if (activeTab) {
            throttledLineHeightUpdate.current(activeTab.id, value);
          }
        }}
        onReset={() => {
          if (activeTab) {
            updateTabSettings(activeTab.id, {
              lineHeight: 1.2,
              verticalTrim: false,
            });
          }
        }}
        showDecimals={true}
        disabled={isGlyphsView}
        enablePrecision={false}
        labelTrailing={
          <IconContainer
            icon={<Icon icon={verticalTrim ? VerticalTrimOn : VerticalTrimOff} />}
            variant="interactive"
            tooltip={verticalTrim ? "Vertical Trim (on)" : "Vertical Trim (text-box-trim)"}
            ariaLabel={verticalTrim ? "Vertical Trim on" : "Vertical Trim off"}
            disabled={isGlyphsView}
            fontSize="xs"
            className={verticalTrim ? styles.togglePressed : undefined}
            onClick={() => {
              if (activeTab) {
                updateTabSettings(activeTab.id, {
                  verticalTrim: !verticalTrim,
                });
              }
            }}
          />
        }
      />

      {/* Alignment Section: horizontal alignment only */}
      <ControlGroup label="Alignment" sectionKey="alignment">
        <CustomToggleGroup.Root
          type="single"
          value={alignment}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                alignment: value as "left" | "center" | "right",
              });
            }
          }}
          variant="segmented"
          className={styles.buttonGroup}
        >
          <CustomToggleGroup.Item value="left" tooltip="Align Left" disabled={isGlyphsView}>
            <Icon icon={AlignLeft} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="center" tooltip="Align Center" disabled={isGlyphsView}>
            <Icon icon={AlignCenter} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="right" tooltip="Align Right" disabled={isGlyphsView}>
            <Icon icon={AlignRight} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </ControlGroup>

      {/* Orientation Group */}
      <ControlGroup label="Orientation" sectionKey="orientation">
        <CustomToggleGroup.Root
          type="single"
          value={orientationValue}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                verticalAlignment: value as "top" | "center" | "bottom",
              });
            }
          }}
          variant="segmented"
          className={styles.buttonGroup}
        >
          <CustomToggleGroup.Item value="top" tooltip="Top" disabled={isGlyphsView}>
            <Icon icon={ArrowUpToLine} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="center" tooltip="Center" disabled={isGlyphsView}>
            <Icon icon={VerticalCenterAlignNeue} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="bottom" tooltip="Bottom" disabled={isGlyphsView}>
            <Icon icon={ArrowDownToLine} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </ControlGroup>

      {/* Case Control Group */}
      <ControlGroup label="Case" sectionKey="case" aria-label="Text case">
        <CustomToggleGroup.Root
          type="single"
          value={textTransform}
          onValueChange={(value: string) => {
            if (value && activeTab) {
              updateTabSettings(activeTab.id, {
                textTransform: value as "none" | "uppercase" | "lowercase",
              });
            }
          }}
          variant="segmented"
          className={styles.buttonGroup}
          aria-label="Text case"
        >
          <CustomToggleGroup.Item value="uppercase" aria-label="All Caps" tooltip="All Caps">
            <Icon icon={CaseUpper} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item
            value="none"
            aria-label="Uppercase/Lowercase"
            tooltip="Uppercase/Lowercase"
          >
            <Icon icon={CaseSensitive} />
          </CustomToggleGroup.Item>
          <CustomToggleGroup.Item value="lowercase" aria-label="Lowercase" tooltip="Lowercase">
            <Icon icon={CaseLower} />
          </CustomToggleGroup.Item>
        </CustomToggleGroup.Root>
      </ControlGroup>
    </div>
  );
}
