/**
 * Accordion using Base UI
 * Same API as before (Root, Item, Header, Trigger, Content) for drop-in replacement.
 */

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import React, { Children, cloneElement, isValidElement, useCallback } from "react";
import { ChevronRight } from "../../../utils/icons";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

type AccordionRootProps =
  | ({
      type?: "single";
      value?: string;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
      collapsible?: boolean;
    } & {
      orientation?: "horizontal" | "vertical";
      disabled?: boolean;
      children: React.ReactNode;
      className?: string;
    })
  | ({
      type?: "multiple";
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
      collapsible?: never;
    } & {
      orientation?: "horizontal" | "vertical";
      disabled?: boolean;
      children: React.ReactNode;
      className?: string;
    });

function toArrayValue(v: string | undefined): string[] {
  return v != null && v !== "" ? [v] : [];
}

function fromArrayValue(arr: string[]): string {
  return arr[0] ?? "";
}

function AccordionRoot(props: AccordionRootProps) {
  const {
    value,
    onValueChange,
    defaultValue,
    type = "multiple",
    orientation = "vertical",
    disabled,
    children,
    className,
  } = props;

  const isControlled = value !== undefined;

  const baseValue = useCallback(
    () =>
      type === "single"
        ? isControlled
          ? toArrayValue(value as string)
          : toArrayValue(defaultValue as string)
        : ((isControlled ? value : defaultValue) as string[]),
    [type, isControlled, value, defaultValue]
  );

  const baseOnValueChange = useCallback(
    (newArr: string[]) => {
      if (type === "single") {
        (onValueChange as (v: string) => void)?.(fromArrayValue(newArr));
      } else {
        (onValueChange as (v: string[]) => void)?.(newArr);
      }
    },
    [onValueChange, type]
  );

  const baseDefaultValue =
    type === "single"
      ? toArrayValue(defaultValue as string)
      : (defaultValue as string[] | undefined);

  if (isControlled) {
    return (
      <BaseAccordion.Root
        value={baseValue()}
        onValueChange={baseOnValueChange}
        multiple={type === "multiple"}
        orientation={orientation}
        disabled={disabled}
        className={`${styles.root} ${className || ""}`}
      >
        {children}
      </BaseAccordion.Root>
    );
  }

  return (
    <BaseAccordion.Root
      defaultValue={baseDefaultValue}
      onValueChange={baseOnValueChange}
      multiple={type === "multiple"}
      orientation={orientation}
      disabled={disabled}
      className={`${styles.root} ${className || ""}`}
    >
      {children}
    </BaseAccordion.Root>
  );
}

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, children, className },
  ref
) {
  return (
    <BaseAccordion.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={`${styles.item} ${className || ""}`}
    >
      {children}
    </BaseAccordion.Item>
  );
});

interface AccordionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionHeader({ children, className }: AccordionHeaderProps) {
  return (
    <BaseAccordion.Header className={`${styles.header} ${className || ""}`}>
      {children}
    </BaseAccordion.Header>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  showChevron?: boolean;
  chevronPosition?: "left" | "right";
  asChild?: boolean;
}

function AccordionTrigger({
  children,
  className,
  showChevron = true,
  chevronPosition = "left",
  asChild,
}: AccordionTriggerProps) {
  if (asChild) {
    const child = Children.only(children);
    if (isValidElement(child)) {
      return (
        <BaseAccordion.Trigger
          className={className}
          render={(props) => cloneElement(child, props)}
        />
      );
    }
  }

  return (
    <BaseAccordion.Trigger
      className={`${styles.trigger} ${className || ""}`}
      data-chevron-position={chevronPosition}
    >
      {showChevron && chevronPosition === "left" && (
        <ChevronRight size={14} className={styles.chevron} aria-hidden="true" />
      )}
      <span className={styles.triggerContent}>{children}</span>
      {showChevron && chevronPosition === "right" && (
        <ChevronRight size={14} className={styles.chevron} aria-hidden="true" />
      )}
    </BaseAccordion.Trigger>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <BaseAccordion.Panel className={`${styles.content} ${className || ""}`}>
      <div className={styles.contentInner}>{children}</div>
    </BaseAccordion.Panel>
  );
}

type AccordionSimpleProps =
  | ({
      items: AccordionItem[];
      type?: "single";
      value?: string;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
      collapsible?: boolean;
    } & {
      orientation?: "horizontal" | "vertical";
      className?: string;
      itemClassName?: string;
      triggerClassName?: string;
      contentClassName?: string;
    })
  | ({
      items: AccordionItem[];
      type?: "multiple";
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
      collapsible?: never;
    } & {
      orientation?: "horizontal" | "vertical";
      className?: string;
      itemClassName?: string;
      triggerClassName?: string;
      contentClassName?: string;
    });

function AccordionSimple(props: AccordionSimpleProps) {
  const {
    items,
    value,
    onValueChange,
    defaultValue,
    type = "multiple",
    collapsible,
    orientation = "vertical",
    className,
    itemClassName,
    triggerClassName,
    contentClassName,
  } = props;

  const handleSingleValueChange = useCallback(
    (newValue: string) => {
      if (type === "single") {
        const fn = onValueChange as ((v: string) => void) | undefined;
        fn?.(newValue);
      }
    },
    [onValueChange, type]
  );

  const handleMultipleValueChange = useCallback(
    (newValue: string[]) => {
      if (type === "multiple") {
        const fn = onValueChange as ((v: string[]) => void) | undefined;
        fn?.(newValue);
      }
    },
    [onValueChange, type]
  );

  if (type === "single") {
    return (
      <AccordionRoot
        value={value as string}
        onValueChange={handleSingleValueChange}
        defaultValue={defaultValue as string}
        type="single"
        collapsible={collapsible}
        orientation={orientation}
        className={className}
      >
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={itemClassName}
          >
            <AccordionHeader>
              <AccordionTrigger className={triggerClassName}>{item.trigger}</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className={contentClassName}>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    );
  }

  return (
    <AccordionRoot
      value={value as string[]}
      onValueChange={handleMultipleValueChange}
      defaultValue={defaultValue as string[]}
      type="multiple"
      orientation={orientation}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={itemClassName}
        >
          <AccordionHeader>
            <AccordionTrigger className={triggerClassName}>{item.trigger}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent className={contentClassName}>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
}

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
  Simple: AccordionSimple,
};

export default AccordionSimple;
