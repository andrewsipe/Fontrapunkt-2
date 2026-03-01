/**
 * InfoButton - Feature component for opening font info / about.
 * IconContainer + Info icon. Use in EmptyState footer, Sidebar footer, etc.
 */

import type React from "react";
import { Info } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

export interface InfoButtonProps {
  tooltip?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function InfoButton({
  tooltip = "Information",
  ariaLabel = "Information",
  onClick,
  disabled,
  fontSize,
  className,
}: InfoButtonProps) {
  return (
    <IconContainer
      icon={Info}
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
