/**
 * SettingsButton - Feature component for opening settings.
 * IconContainer + Settings icon. Use in EmptyState footer, Sidebar footer, etc.
 */

import type React from "react";
import { Settings } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

export interface SettingsButtonProps {
  tooltip?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function SettingsButton({
  tooltip = "Settings",
  ariaLabel = "Settings",
  onClick,
  disabled,
  fontSize,
  className,
}: SettingsButtonProps) {
  return (
    <IconContainer
      icon={Settings}
      variant="interactive"
      tooltip={tooltip}
      onClick={onClick}
      ariaLabel={ariaLabel}
      disabled={disabled}
      fontSize={fontSize}
      className={className}
    />
  );
}
