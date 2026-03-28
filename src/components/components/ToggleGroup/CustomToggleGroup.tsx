/**
 * Toggle Group using Base UI ToggleGroup + Toggle
 * Tooltips use shared Tooltip (global tooltip.global.css).
 */

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type React from "react";
import { Tooltip } from "../Tooltip";
import styles from "./CustomToggleGroup.module.css";

export type ToggleGroupVariant = "segmented" | "discrete";

type ToggleGroupRootPropsBase = {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  rovingFocus?: boolean;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  variant?: ToggleGroupVariant;
  className?: string;
  children?: React.ReactNode;
};

function toArray(v: string | string[] | undefined): readonly string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : v === "" ? [] : [v];
}

function fromArray(arr: readonly string[], type: "single" | "multiple"): string | string[] {
  if (type === "single") return arr[0] ?? "";
  return [...arr];
}

type ToggleGroupRootProps = ToggleGroupRootPropsBase;

function ToggleGroupRoot({
  variant = "discrete",
  className = "",
  children,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  disabled,
  orientation,
  dir,
  ...htmlProps
}: ToggleGroupRootProps) {
  const variantStyle = styles[variant] ?? "";
  const multiple = type === "multiple";
  const valueArray = toArray(value);
  const defaultValueArray = toArray(defaultValue);

  const handleValueChange = (groupValue: string[]) => {
    onValueChange?.(fromArray(groupValue, type));
  };

  const isControlled = value !== undefined;
  return (
    <BaseToggleGroup
      value={isControlled ? valueArray : undefined}
      defaultValue={
        !isControlled && (defaultValue !== undefined || defaultValueArray.length > 0)
          ? defaultValueArray
          : undefined
      }
      onValueChange={handleValueChange}
      disabled={disabled}
      orientation={orientation}
      multiple={multiple}
      {...htmlProps}
      className={`${styles.root} ${variantStyle} ${className}`.trim()}
      data-variant={variant}
      dir={dir}
    >
      {children}
    </BaseToggleGroup>
  );
}

type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof BaseToggle> & {
  tooltip?: string;
  value: string;
  className?: string;
};

function ToggleGroupItem({
  tooltip,
  className = "",
  children,
  value,
  ...props
}: ToggleGroupItemProps) {
  const item = (
    <BaseToggle value={value} {...props} className={`${styles.item} ${className}`.trim()}>
      {children}
    </BaseToggle>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} delay={300} side="top">
        <div className={styles.tooltipWrapper}>{item}</div>
      </Tooltip>
    );
  }

  return item;
}

export const CustomToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
};
