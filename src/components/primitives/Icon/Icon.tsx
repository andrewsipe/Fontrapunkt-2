/**
 * Icon - Primitive for rendering a single icon at 1em.
 * Scales with parent font-size. No container, no padding, no interaction.
 */

import { createElement, isValidElement, type ReactNode } from "react";
import styles from "./Icon.module.css";

const DEFAULT_ICON_SIZE = 24;

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface IconProps {
  /** Lucide icon component (e.g. RotateCcw) or ReactNode */
  icon: LucideIconComponent | ReactNode;
  className?: string;
}

function isComponentType(value: unknown): value is LucideIconComponent {
  if (typeof value === "function") return true;
  if (typeof value !== "object" || value === null || isValidElement(value) || Array.isArray(value))
    return false;
  return "$$typeof" in value;
}

export function Icon({ icon, className }: IconProps) {
  const classNames = [styles.root, className].filter(Boolean).join(" ");

  const content = isValidElement(icon)
    ? icon
    : isComponentType(icon)
      ? createElement(icon as LucideIconComponent, { size: DEFAULT_ICON_SIZE })
      : icon;

  return (
    <span className={classNames} aria-hidden data-icon>
      {content}
    </span>
  );
}
