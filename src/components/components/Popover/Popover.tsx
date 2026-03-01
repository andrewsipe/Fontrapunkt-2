/**
 * Popover wrapper using Base UI Popover
 * Same API as before (Root, Trigger, Portal, Content, Close) for drop-in replacement.
 */

import { Popover as BasePopover } from "@base-ui/react/popover";
import { Children, cloneElement, isValidElement } from "react";
import styles from "./Popover.module.css";

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

interface PopoverRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
  children: React.ReactNode;
}

function PopoverRoot({
  open,
  onOpenChange,
  defaultOpen,
  modal = true,
  children,
}: PopoverRootProps) {
  return (
    <BasePopover.Root
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      modal={modal}
    >
      {children}
    </BasePopover.Root>
  );
}

interface PopoverTriggerProps {
  asChild?: boolean;
  /** Set when the asChild element renders a native <button> (e.g. IconContainer). Omit to infer from child.type. */
  nativeButton?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

function PopoverTrigger({
  asChild,
  nativeButton: nativeButtonProp,
  className,
  children,
  onClick,
}: PopoverTriggerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  if (asChild) {
    const child = Children.only(children);
    if (isValidElement(child)) {
      const inferred = typeof child.type === "string" && child.type === "button";
      const nativeButton = nativeButtonProp ?? inferred;
      return (
        <BasePopover.Trigger
          nativeButton={nativeButton}
          render={(props) =>
            cloneElement(child, {
              ...props,
              onClick: (e: React.MouseEvent) => {
                handleClick(e);
                props.onClick?.(e);
                (child.props as { onClick?: React.MouseEventHandler })?.onClick?.(e);
              },
            })
          }
        />
      );
    }
  }

  return (
    <BasePopover.Trigger
      nativeButton={true}
      className={`${styles.trigger} ${className || ""}`}
      render={(props) => (
        <button type="button" {...props} onClick={handleClick}>
          {children}
        </button>
      )}
    />
  );
}

interface PopoverAnchorProps {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

function PopoverAnchor({ asChild, className, children, ...props }: PopoverAnchorProps) {
  if (asChild && isValidElement(Children.only(children))) {
    const child = Children.only(children) as React.ReactElement;
    const isNativeButton = typeof child.type === "string" && child.type === "button";
    return (
      <BasePopover.Trigger
        nativeButton={isNativeButton}
        render={(triggerProps) => cloneElement(child, { ...triggerProps, ...props })}
      />
    );
  }
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface PopoverPortalProps {
  container?: HTMLElement;
  children: React.ReactNode;
}

function PopoverPortal({ container, children }: PopoverPortalProps) {
  return <BasePopover.Portal container={container}>{children}</BasePopover.Portal>;
}

interface PopoverContentProps {
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  collisionBoundary?: Element | null;
  sticky?: "always" | "partial";
  className?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  children: React.ReactNode;
}

function PopoverContent({
  side = "top",
  align = "center",
  sideOffset = 5,
  alignOffset = 0,
  collisionPadding = 8,
  className,
  children,
}: PopoverContentProps) {
  return (
    <BasePopover.Positioner
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={typeof collisionPadding === "number" ? collisionPadding : undefined}
    >
      <BasePopover.Popup className={`${styles.content} ${className || ""}`}>
        {children}
      </BasePopover.Popup>
    </BasePopover.Positioner>
  );
}

interface PopoverCloseProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function PopoverClose({ asChild, className, children, ...props }: PopoverCloseProps) {
  if (asChild && children != null && isValidElement(Children.only(children))) {
    return (
      <BasePopover.Close
        render={(closeProps) => cloneElement(children as React.ReactElement, closeProps)}
      />
    );
  }
  return (
    <BasePopover.Close className={`${styles.close} ${className || ""}`} {...props}>
      {children}
    </BasePopover.Close>
  );
}

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Portal: PopoverPortal,
  Content: PopoverContent,
  Close: PopoverClose,
};

export default Popover;
