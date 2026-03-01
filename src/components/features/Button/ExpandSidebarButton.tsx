/**
 * ExpandSidebarButton - Feature: open/collapse sidebar (ChevronRight).
 * IconContainer + ChevronRight. Used in BottomBar (inline and floating).
 */

import { ChevronRight } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

interface ExpandSidebarButtonProps {
  tooltip?: string;
  onClick: () => void;
  ariaLabel?: string;
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function ExpandSidebarButton({
  tooltip = "Open sidebar",
  onClick,
  ariaLabel = "Open sidebar",
  fontSize,
  className,
}: ExpandSidebarButtonProps) {
  return (
    <IconContainer
      icon={ChevronRight}
      variant="interactive"
      tooltip={tooltip}
      onClick={onClick}
      ariaLabel={ariaLabel}
      fontSize={fontSize}
      className={className}
    />
  );
}
