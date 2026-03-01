/**
 * Reusable Tabs component using Base UI Tabs
 * Same API as before (Root, List with items, Content with items) for drop-in replacement.
 */

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useCallback } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  content?: React.ReactNode;
}

interface TabsRootProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  children: React.ReactNode;
  className?: string;
}

function TabsRoot({
  value,
  onValueChange,
  defaultValue,
  orientation = "horizontal",
  children,
  className,
}: TabsRootProps) {
  const isControlled = value !== undefined;

  if (isControlled) {
    return (
      <BaseTabs.Root
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={className}
      >
        {children}
      </BaseTabs.Root>
    );
  }

  return (
    <BaseTabs.Root
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation={orientation}
      className={className}
    >
      {children}
    </BaseTabs.Root>
  );
}

interface TabsListProps {
  items: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
  variant?: "underline" | "pill" | "ghost";
  "aria-label"?: string;
}

function TabsList({
  items,
  className,
  variant = "underline",
  "aria-label": ariaLabel = "Tabs",
}: TabsListProps) {
  return (
    <BaseTabs.List
      className={`${styles.list} ${className ?? ""}`}
      aria-label={ariaLabel}
      data-variant={variant}
    >
      {items.map((item) => (
        <BaseTabs.Tab
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={styles.trigger}
          data-variant={variant}
        >
          {item.label}
        </BaseTabs.Tab>
      ))}
    </BaseTabs.List>
  );
}

interface TabsContentProps {
  items: Array<{ value: string; content: React.ReactNode }>;
  className?: string;
}

function TabsContent({ items, className }: TabsContentProps) {
  return (
    <div className={styles.contentContainer}>
      {items.map((item) => (
        <BaseTabs.Panel
          key={item.value}
          value={item.value}
          className={`${styles.content} ${className ?? ""}`}
        >
          {item.content}
        </BaseTabs.Panel>
      ))}
    </div>
  );
}

interface TabsProps {
  items: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  variant?: "underline" | "pill" | "ghost";
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  "aria-label"?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  defaultValue,
  orientation = "horizontal",
  activationMode = "automatic",
  variant = "underline",
  className,
  listClassName,
  contentClassName,
  "aria-label": ariaLabel,
}: TabsProps) {
  const isControlled = value !== undefined;
  const initialValue = !isControlled ? (defaultValue ?? items[0]?.value) : undefined;

  const handleValueChange = useCallback(
    (newValue: string) => {
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  if (isControlled) {
    return (
      <TabsRoot
        value={value}
        onValueChange={handleValueChange}
        orientation={orientation}
        activationMode={activationMode}
        className={className}
      >
        <TabsList
          items={items.map(({ value: v, label, disabled }) => ({ value: v, label, disabled }))}
          className={listClassName}
          variant={variant}
          aria-label={ariaLabel}
        />
        <TabsContent
          items={items.map(({ value: v, content }) => ({ value: v, content: content! }))}
          className={contentClassName}
        />
      </TabsRoot>
    );
  }

  return (
    <TabsRoot
      defaultValue={initialValue}
      onValueChange={handleValueChange}
      orientation={orientation}
      activationMode={activationMode}
      className={className}
    >
      <TabsList
        items={items.map(({ value: v, label, disabled }) => ({ value: v, label, disabled }))}
        className={listClassName}
        variant={variant}
        aria-label={ariaLabel}
      />
      <TabsContent
        items={items.map(({ value: v, content }) => ({ value: v, content: content! }))}
        className={contentClassName}
      />
    </TabsRoot>
  );
}

Tabs.Root = TabsRoot;
Tabs.List = TabsList;
Tabs.Content = TabsContent;
