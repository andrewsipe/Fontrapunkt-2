/**
 * Variable Axes Panel
 * Displays and controls variable font axes
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import { ScrollText, VariableAxesNeue } from "../../../utils/icons";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import { LabelWithPopover } from "../../components/LabelWithPopover";
import { Select } from "../../components/Select";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { Icon } from "../../primitives/Icon/Icon";
import { Label } from "../../primitives/Label/Label";
import panelStyles from "../../sidebar/Panel.module.css";
import { AxisSlider } from "./AxisSlider";
import styles from "./VariableAxesPanel.module.css";

function VariableAxesPanelComponent() {
  const axes = useFontStore((state) => state.getFontAxes());
  const namedVariations = useFontStore((state) => state.getFontNamedVariations()) ?? [];
  const fontId = useFontStore((state) => state.currentFontId);
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const updateAxisValue = useFontStore((state) => state.updateAxisValue);
  const resetAxes = useFontStore((state) => state.resetAxes);
  const firstPresetName = namedVariations.length > 0 ? namedVariations[0]?.name : "";
  const [selectedPreset, setSelectedPreset] = useState<string>(firstPresetName);
  const [isOpen, setIsOpen] = useState(false);
  const previousFontIdRef = useRef<string | undefined>(fontId ?? undefined);

  // Use refs to access latest values without causing re-renders
  const namedVariationsRef = useRef(namedVariations);
  namedVariationsRef.current = namedVariations;

  // Combined effect: Reset preset selection when font changes and validate preset
  useEffect(() => {
    if (fontId !== previousFontIdRef.current) {
      // Font changed - reset to first preset
      previousFontIdRef.current = fontId ?? undefined;
      const timeoutId = setTimeout(() => {
        const firstPreset = namedVariations[0]?.name ?? "";
        setSelectedPreset(firstPreset);
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    } else if (namedVariations.length > 0) {
      // Variations changed - validate current preset
      setSelectedPreset((current) => {
        const isValid = current && namedVariations.some((v) => v.name === current);
        return !isValid ? (namedVariations[0]?.name ?? "") : current;
      });
    }
  }, [fontId, namedVariations]);

  // Performance: Memoize options array (Pillar 6.2)
  // Must be called before early return to maintain hook order
  const selectOptions = useMemo(() => {
    // Instances are in fvar table order by default
    // To apply custom sorting, import from utils/instanceSortUtils.ts:
    //
    // import { sortByWeight, sortMultiLevel, applyCustomSort } from "../../utils/instanceSortUtils";
    //
    // Then apply before mapping:
    // const sorted = sortByWeight(namedVariations);
    // or
    // const sorted = sortMultiLevel(namedVariations, currentFont?.axes);
    // or
    // const sorted = applyCustomSort(namedVariations, (instances) => {
    //   // Your custom sort logic here
    //   return instances.sort((a, b) => /* your comparison */);
    // });

    return namedVariations
      .filter((v) => v.name && v.name !== "Unknown" && v.name !== "undefined")
      .map((v) => ({
        value: v.name,
        label: v.name,
      }));
  }, [namedVariations]);

  // Pillar 6.3: Handle deferred state updates with setTimeout pattern
  // Use refs to avoid recreating callback on every render
  // MUST be before early return to maintain hook order
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);

  const handlePresetChange = useCallback(
    (presetName: string) => {
      setSelectedPreset(presetName);
      setTimeout(() => {
        const font = useFontStore.getState().getCurrentFont();
        const variations = namedVariationsRef.current;
        if (!font?.axes || !fontId) return;
        const preset = variations.find((v) => v.name === presetName);
        if (preset) {
          Object.entries(preset.coordinates).forEach(([tag, value]) => {
            updateAxisValue(fontId, tag, value);
          });
          const activeTabState = useUIStore.getState().getActiveTab();
          if (activeTabState?.fontId === fontId) {
            updateTabSettings(activeTabState.id, {
              axisValues: preset.coordinates,
            });
          }
        } else {
          const firstPreset = variations[0]?.name ?? "";
          if (firstPreset) setSelectedPreset(firstPreset);
        }
      }, 0);
    },
    [fontId, updateAxisValue, updateTabSettings]
  );

  const handleReset = useCallback(() => {
    if (!fontId || !axes?.length) return;
    resetAxes(fontId);
    const activeTabState = useUIStore.getState().getActiveTab();
    if (activeTabState?.fontId === fontId) {
      const resetAxisValues: Record<string, number> = {};
      axes.forEach((axis) => {
        resetAxisValues[axis.tag] = axis.default;
      });
      updateTabSettings(activeTabState.id, { axisValues: resetAxisValues });
    }
    const firstPreset = namedVariations[0]?.name ?? "";
    if (firstPreset) setSelectedPreset(firstPreset);
  }, [fontId, axes, namedVariations, resetAxes, updateTabSettings]);

  // Show panel even without font, but disable controls
  if (!fontId || !isVariable || !axes?.length) {
    return (
      <div id="variable-axes-panel" className={`${panelStyles.sidebarPanel} ${styles.axesPanel}`}>
        <TitleBar
          variant="panel"
          title={
            <LabelWithPopover sectionKey="variable axes" as="span" variant="section">
              Variable Axes
            </LabelWithPopover>
          }
          useInteractiveTitleStyle
          icon={<Icon icon={VariableAxesNeue} />}
        />
        <div className={styles.noFontMessage}>
          <p>Load a variable font to see axes controls</p>
        </div>
      </div>
    );
  }

  const hasPresets = namedVariations.length > 0;

  return (
    <div id="variable-axes-panel" className={`${panelStyles.sidebarPanel} ${styles.axesPanel}`}>
      <TitleBar
        variant="panel"
        title={
          <LabelWithPopover sectionKey="variable axes" as="span" variant="section">
            Variable Axes
          </LabelWithPopover>
        }
        useInteractiveTitleStyle
        icon={<Icon icon={VariableAxesNeue} />}
        onReset={handleReset}
        resetTooltip="Reset axes to defaults"
        resetAriaLabel="Reset axes to defaults"
      />

      <div className={styles.axesList}>
        {axes.map((axis) => {
          const snapValuesForAxis = [
            ...new Set(
              namedVariations
                .map((v) => v.coordinates[axis.tag])
                .filter((val): val is number => val != null)
            ),
          ].sort((a, b) => a - b);
          return (
            <AxisSlider
              key={axis.tag}
              axis={axis}
              fontId={fontId}
              snapValues={snapValuesForAxis.length > 0 ? snapValuesForAxis : undefined}
            />
          );
        })}
      </div>

      <div className={styles.presetSection}>
        {hasPresets ? (
          <Select.Root
            variant="sidebar"
            value={selectedPreset || firstPresetName}
            onValueChange={handlePresetChange}
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <div className={styles.presetLabel}>
              <IconContainer icon={ScrollText} variant="static" fontSize="sm" />
              <Select.Label variant="section" htmlFor="preset-styles-select">
                Preset Styles
              </Select.Label>
            </div>
            <Select.Trigger
              id="preset-styles-select"
              variant="default"
              className={styles.presetSelect}
            />
            <Select.Portal>
              <Select.Content variant="sidebar">
                <Select.Viewport>
                  {selectOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        ) : (
          <>
            <div className={styles.presetLabel}>
              <IconContainer icon={ScrollText} variant="static" fontSize="sm" />
              <Label as="span" variant="section">
                Preset Styles
              </Label>
            </div>
            <div className={styles.noPresetsMessage}>No presets available</div>
          </>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent re-renders when parent updates but props haven't changed
// Note: React 19 Compiler may optimize this automatically, but explicit memoization
// provides additional protection for this complex component with many child components
export const VariableAxesPanel = memo(VariableAxesPanelComponent);
