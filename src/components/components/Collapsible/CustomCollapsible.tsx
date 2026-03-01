/**
 * Reusable Collapsible component using Base UI Collapsible
 * Same API as before (Root, Trigger, Content). Integrates with design system.
 * https://base-ui.com/react/components/collapsible
 */

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import React from "react";
import { ChevronRight } from "../../../utils/icons";
import styles from "./CustomCollapsible.module.css";

export type CollapsibleVariant = "ghost" | "card";

interface CollapsibleRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  variant?: CollapsibleVariant;
  className?: string;
  children: React.ReactNode;
}

const CollapsibleRoot = React.forwardRef<HTMLDivElement, CollapsibleRootProps>(
  ({ variant = "ghost", className, children, ...props }, ref) => {
    return (
      <BaseCollapsible.Root
        {...props}
        ref={ref}
        className={`${styles.root} ${styles[variant]} ${className ?? ""}`.trim()}
        data-variant={variant}
      >
        {children}
      </BaseCollapsible.Root>
    );
  }
);

CollapsibleRoot.displayName = "CustomCollapsible.Root";

interface CollapsibleTriggerProps {
  label?: string;
  renderHeader?: () => React.ReactNode;
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ label, renderHeader, className, asChild, children, disabled }, ref) => {
    if (asChild && children != null) {
      const child = React.Children.only(children) as React.ReactElement;
      const isNativeButton = typeof child.type === "string" && child.type === "button";
      return (
        <BaseCollapsible.Trigger
          ref={ref}
          nativeButton={isNativeButton}
          disabled={disabled}
          render={(triggerProps) => React.cloneElement(child, { ...triggerProps, ref })}
        />
      );
    }

    let headerContent: React.ReactNode;
    if (renderHeader) {
      headerContent = renderHeader();
    } else if (label) {
      headerContent = <span>{label}</span>;
    } else {
      headerContent = children;
    }

    return (
      <BaseCollapsible.Trigger
        ref={ref}
        disabled={disabled}
        className={`${styles.trigger} ${className ?? ""}`.trim()}
      >
        <ChevronRight size={14} className={styles.chevron} aria-hidden="true" />
        {headerContent}
      </BaseCollapsible.Trigger>
    );
  }
);

CollapsibleTrigger.displayName = "CustomCollapsible.Trigger";

interface CollapsibleContentProps {
  className?: string;
  children: React.ReactNode;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children }, ref) => {
    return (
      <BaseCollapsible.Panel ref={ref} className={`${styles.content} ${className ?? ""}`.trim()}>
        <div className={styles.contentWrapper}>{children}</div>
      </BaseCollapsible.Panel>
    );
  }
);

CollapsibleContent.displayName = "CustomCollapsible.Content";

export const CustomCollapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
};
