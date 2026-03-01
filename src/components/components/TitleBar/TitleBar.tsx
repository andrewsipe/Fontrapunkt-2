/**
 * TitleBar - Structural title row with variants.
 *
 * **Panel (variant="panel"):** The canonical PanelHeader for sidebar panels.
 * Icon + title (Label or LabelWithPopover) + optional ResetButton.
 * Use in VariableAxesPanel, TextControls, SampleTextPanel, ColorPanel, OpenTypeFeaturesPanel.
 *
 * **Section (variant="section"):** Heading with Label + optional border.
 * Use via SectionHeader for modal/section titles (e.g. Settings, Font Info).
 *
 * Composes Label and IconContainer primitives.
 */

import type React from "react";
import { ResetButton } from "../../features/Button/ResetButton";
import { Label } from "../../primitives/Label/Label";
import { IconContainer } from "../IconContainer/IconContainer";
import styles from "./TitleBar.module.css";

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>;

export type TitleBarVariant = "panel" | "section";

interface TitleBarPanelProps {
  variant: "panel";
  /** Title: ReactNode (e.g. string with Label, or LabelWithPopover). */
  title: React.ReactNode;
  /** When true, wrap title in interactive style (underline, hover). Use with LabelWithPopover. */
  useInteractiveTitleStyle?: boolean;
  /** Optional leading icon (Lucide component or ReactNode e.g. custom text icon). */
  icon?: LucideIconComponent | React.ReactNode;
  onReset?: () => void;
  resetTooltip?: string;
  resetAriaLabel?: string;
  resetDisabled?: boolean;
  className?: string;
}

interface TitleBarSectionProps {
  variant: "section";
  /** Title content. */
  children: React.ReactNode;
  level?: "h2" | "h3" | "h4";
  border?: boolean;
  className?: string;
}

export type TitleBarProps = TitleBarPanelProps | TitleBarSectionProps;

export function TitleBar(props: TitleBarProps) {
  if (props.variant === "section") {
    const { level: Level = "h3", children, border = true, className = "" } = props;
    const rootClass = [styles.sectionRoot, border && styles.sectionBorder, className]
      .filter(Boolean)
      .join(" ");
    return (
      <Level className={rootClass}>
        <Label as="span" variant="section">
          {children}
        </Label>
      </Level>
    );
  }

  const {
    title,
    useInteractiveTitleStyle,
    icon,
    onReset,
    resetTooltip,
    resetAriaLabel,
    resetDisabled,
    className = "",
  } = props;

  const headerClass = [styles.panelHeader, className].filter(Boolean).join(" ");
  const titleContent =
    useInteractiveTitleStyle === true ? (
      <span className={styles.panelTitleText}>{title}</span>
    ) : (
      title
    );

  return (
    <div className={headerClass}>
      <h3 className={styles.panelTitle}>
        {icon != null && <IconContainer icon={icon} variant="static" fontSize="inherit" />}
        {titleContent}
      </h3>
      {onReset != null && (
        <ResetButton
          tooltip={resetTooltip ?? "Reset to defaults"}
          onClick={onReset}
          aria-label={resetAriaLabel ?? resetTooltip ?? "Reset to defaults"}
          disabled={resetDisabled}
        />
      )}
    </div>
  );
}
