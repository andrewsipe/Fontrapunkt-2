/**
 * LabelGroup - Layout component for icon + label content.
 * Composes Label primitive; use for control labels with optional leading icon.
 */

import { type ComponentType, isValidElement, type ReactNode } from "react";
import styles from "./LabelGroup.module.css";

type IconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;

export interface LabelGroupProps {
  /** Optional icon: Lucide (or similar) component or ReactNode (e.g. custom font-icon). Rendered at 14px when component. */
  icon?: IconComponent | ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function LabelGroup({ icon, className = "", children }: LabelGroupProps) {
  const classNames = [styles.root, className].filter(Boolean).join(" ");

  const iconContent =
    icon == null ? null : isValidElement(icon) ? (
      <span className={styles.icon}>{icon}</span>
    ) : typeof icon === "function" ? (
      (() => {
        const Icon = icon as IconComponent;
        return <Icon size={14} className={styles.icon} />;
      })()
    ) : (
      <span className={styles.icon}>{icon}</span>
    );

  return (
    <div className={classNames}>
      {iconContent}
      {children}
    </div>
  );
}
