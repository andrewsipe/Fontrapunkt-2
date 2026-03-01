/**
 * View Selector component
 * Switches between different view modes
 */

import { useUIStore } from "../../../stores/uiStore";
import { CustomToggleGroup } from "../../components/ToggleGroup/CustomToggleGroup";
import { Label } from "../../primitives/Label/Label";
import styles from "./ViewSelector.module.css";

const VIEW_MODES = [
  { id: "plain", label: "Plain" },
  { id: "waterfall", label: "Waterfall" },
  { id: "styles", label: "Styles" },
  { id: "glyphs", label: "Glyphs" },
  { id: "present", label: "Present" },
] as const;

export function ViewSelector() {
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  return (
    <div className={styles.viewSelector}>
      <Label as="span" variant="small" className={styles.label}>
        View:
      </Label>
      <CustomToggleGroup.Root
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) {
            setViewMode(value as (typeof VIEW_MODES)[number]["id"]);
          }
        }}
        variant="discrete"
        className={styles.buttons}
        aria-label="View mode selector"
      >
        {VIEW_MODES.map((mode) => (
          <CustomToggleGroup.Item
            key={mode.id}
            value={mode.id}
            aria-label={`Switch to ${mode.label} view`}
          >
            {mode.label}
          </CustomToggleGroup.Item>
        ))}
      </CustomToggleGroup.Root>
    </div>
  );
}
