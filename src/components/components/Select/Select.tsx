/**
 * Select wrapper using Base UI Select
 * Same API as before (Root, Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText, etc.) for drop-in replacement.
 */

import { Select as BaseSelect } from "@base-ui/react/select";
import { Children, cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "../../../utils/icons";
import type { LabelVariant } from "../../primitives/Label/Label";
import { Label } from "../../primitives/Label/Label";
import styles from "./Select.module.css";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SelectVariant = "default" | "compact" | "sidebar" | "modal";
export type SelectSize = "sm" | "md" | "lg";
export type SelectSide = "top" | "right" | "bottom" | "left";
export type SelectAlign = "start" | "center" | "end";

// ============================================================================
// ROOT COMPONENT
// ============================================================================

interface SelectRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  variant?: SelectVariant;
  preventScroll?: boolean;
  children: React.ReactNode;
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  disabled,
  name,
  required,
  variant = "default",
  preventScroll = variant !== "sidebar",
  children,
}: SelectRootProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const previousValueRef = useRef(value);
  const isControlledOpen = controlledOpen !== undefined;
  const isControlledValue = value !== undefined;

  useEffect(() => {
    if (previousValueRef.current !== value && value !== undefined && isControlledValue) {
      if (isControlledOpen) {
        onOpenChange?.(false);
      } else {
        setInternalOpen(false);
      }
    }
    previousValueRef.current = value;
  }, [value, isControlledOpen, isControlledValue, onOpenChange]);

  const open = isControlledOpen ? controlledOpen : internalOpen;
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (isControlledOpen) {
        onOpenChange?.(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isControlledOpen, onOpenChange]
  );

  return (
    <BaseSelect.Root
      value={value ?? undefined}
      defaultValue={defaultValue ?? undefined}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}
      disabled={disabled}
      name={name}
      required={required}
    >
      {children}
      {name && <input type="hidden" name={name} value={value ?? defaultValue ?? ""} />}
    </BaseSelect.Root>
  );
}

// ============================================================================
// TRIGGER COMPONENT
// ============================================================================

interface SelectTriggerProps {
  asChild?: boolean;
  variant?: SelectVariant;
  size?: SelectSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties & {
    "--select-trigger-padding"?: string;
    "--select-trigger-font-size"?: string;
  };
  id?: string;
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

function SelectTrigger({
  asChild,
  variant = "default",
  size = "md",
  children,
  className,
  style,
  id,
  onClick,
  onKeyDown,
  ...props
}: SelectTriggerProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(e);
    },
    [onClick]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  if (asChild && children != null) {
    const child = Children.only(children);
    if (typeof child === "object" && "type" in child && child !== null) {
      const el = child as React.ReactElement;
      const isNativeButton = typeof el.type === "string" && el.type === "button";
      return (
        <BaseSelect.Trigger
          id={id}
          nativeButton={isNativeButton}
          render={(triggerProps) =>
            cloneElement(el, {
              ...triggerProps,
              ...props,
              onClick: (e: React.MouseEvent) => {
                handleClick(e);
                triggerProps.onClick?.(e);
                (el.props as { onClick?: React.MouseEventHandler })?.onClick?.(e);
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                handleKeyDown(e);
                triggerProps.onKeyDown?.(e);
                (el.props as { onKeyDown?: React.KeyboardEventHandler })?.onKeyDown?.(e);
              },
            })
          }
        />
      );
    }
  }

  return (
    <BaseSelect.Trigger
      id={id}
      className={`${styles.trigger} ${className ?? ""}`}
      data-variant={variant}
      data-size={size}
      style={style}
      render={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          {...props}
          onClick={(e) => {
            handleClick(e);
            triggerProps.onClick?.(e);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e);
            triggerProps.onKeyDown?.(e);
          }}
        >
          <BaseSelect.Value className={styles.value} placeholder="Select..." />
          <BaseSelect.Icon
            className={styles.icon}
            render={(iconProps) => (
              <span {...iconProps}>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            )}
          />
        </button>
      )}
    />
  );
}

// ============================================================================
// VALUE COMPONENT
// ============================================================================

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({
  placeholder = "Select an option...",
  className,
  ...props
}: SelectValueProps) {
  return (
    <BaseSelect.Value
      placeholder={placeholder}
      className={`${styles.value} ${className ?? ""}`}
      {...props}
    />
  );
}

// ============================================================================
// ICON COMPONENT
// ============================================================================

interface SelectIconProps {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

function SelectIcon({ className, asChild, children, ...props }: SelectIconProps) {
  if (asChild && children != null) {
    const child = Children.only(children) as React.ReactElement;
    return (
      <BaseSelect.Icon
        className={className}
        render={(iconProps) => cloneElement(child, iconProps)}
      />
    );
  }
  return (
    <BaseSelect.Icon
      className={`${styles.icon} ${className ?? ""}`}
      render={(iconProps) => (
        <span {...iconProps}>
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      )}
    />
  );
}

// ============================================================================
// PORTAL COMPONENT
// ============================================================================

interface SelectPortalProps {
  container?: HTMLElement;
  children: React.ReactNode;
  preventScroll?: boolean;
}

function SelectPortal({ container, children, preventScroll = true }: SelectPortalProps) {
  const portalContainer = preventScroll === false && container ? container : undefined;
  return <BaseSelect.Portal container={portalContainer}>{children}</BaseSelect.Portal>;
}

// ============================================================================
// CONTENT COMPONENT (Positioner + Popup, with Viewport + List inside)
// ============================================================================

const SIDEBAR_POSITIONING = {
  side: "top" as const,
  align: "start" as const,
  sideOffset: 4,
  collisionPadding: 8,
  sticky: "partial" as const,
};

interface SelectContentProps {
  side?: SelectSide;
  align?: SelectAlign;
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  collisionBoundary?: Element | null;
  sticky?: "always" | "partial" | "none";
  position?: "popper" | "item-aligned";
  variant?: SelectVariant;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
  children: React.ReactNode;
}

function SelectContent({
  side,
  align,
  sideOffset,
  alignOffset,
  collisionPadding,
  collisionBoundary,
  sticky,
  position = "popper",
  variant = "default",
  className,
  onKeyDown,
  onPointerDownOutside,
  children,
}: SelectContentProps) {
  const isSidebar = variant === "sidebar";
  const positioning =
    isSidebar && side == null
      ? SIDEBAR_POSITIONING
      : {
          side,
          align,
          sideOffset,
          alignOffset,
          collisionPadding: typeof collisionPadding === "number" ? collisionPadding : undefined,
          sticky: sticky === "none" ? undefined : sticky,
        };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  return (
    <BaseSelect.Positioner
      {...positioning}
      collisionBoundary={collisionBoundary}
      alignItemWithTrigger={position === "item-aligned"}
    >
      <BaseSelect.Popup
        data-select-content
        className={`${styles.content} ${className ?? ""}`}
        data-variant={variant}
        data-sidebar-context={isSidebar}
        onKeyDown={handleKeyDown}
      >
        {children}
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  );
}

// ============================================================================
// VIEWPORT COMPONENT (wrapper around List for scroll/padding)
// ============================================================================

interface SelectViewportProps {
  className?: string;
  children: React.ReactNode;
}

function SelectViewport({ className, children }: SelectViewportProps) {
  return (
    <div className={`${styles.viewport} ${className ?? ""}`}>
      <BaseSelect.List>{children}</BaseSelect.List>
    </div>
  );
}

// ============================================================================
// ITEM COMPONENTS
// ============================================================================

interface SelectItemProps {
  value: string;
  disabled?: boolean;
  textValue?: string;
  className?: string;
  children: React.ReactNode;
}

function SelectItem({
  value,
  disabled,
  textValue,
  className,
  children,
  ...props
}: SelectItemProps) {
  return (
    <BaseSelect.Item
      value={value}
      disabled={disabled}
      label={textValue}
      className={`${styles.item} ${className ?? ""}`}
      {...props}
    >
      {children}
    </BaseSelect.Item>
  );
}

interface SelectItemTextProps {
  className?: string;
  children: React.ReactNode;
}

function SelectItemText({ className, children, ...props }: SelectItemTextProps) {
  return (
    <BaseSelect.ItemText className={`${styles.itemText} ${className ?? ""}`} {...props}>
      {children}
    </BaseSelect.ItemText>
  );
}

interface SelectItemIndicatorProps {
  className?: string;
  children?: React.ReactNode;
}

function SelectItemIndicator({ className, children, ...props }: SelectItemIndicatorProps) {
  return (
    <BaseSelect.ItemIndicator className={`${styles.itemIndicator} ${className ?? ""}`} {...props}>
      {children ?? "✓"}
    </BaseSelect.ItemIndicator>
  );
}

// ============================================================================
// SEPARATOR (Base UI Select exports Separator from shared)
// ============================================================================

interface SelectSeparatorProps {
  className?: string;
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <BaseSelect.Separator className={`${styles.separator} ${className ?? ""}`} {...props} />;
}

// ============================================================================
// GROUP COMPONENTS
// ============================================================================

interface SelectGroupProps {
  className?: string;
  children: React.ReactNode;
}

function SelectGroup({ className, children, ...props }: SelectGroupProps) {
  return (
    <BaseSelect.Group className={`${styles.group} ${className ?? ""}`} {...props}>
      {children}
    </BaseSelect.Group>
  );
}

interface SelectLabelProps {
  variant?: LabelVariant;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

function SelectLabel({ variant = "default", htmlFor, className, children }: SelectLabelProps) {
  return (
    <Label as="label" variant={variant} htmlFor={htmlFor} className={className}>
      {children}
    </Label>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Separator: SelectSeparator,
  Group: SelectGroup,
  Label: SelectLabel,
};

export default Select;
