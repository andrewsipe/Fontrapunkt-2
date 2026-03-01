/**
 * SwatchBookButton - Feature: open theme/settings (SwatchBook).
 * IconContainer + SwatchBook. Size from context or optional fontSize.
 */

import { SwatchBook } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

interface SwatchBookButtonProps {
  tooltip?: string;
  onClick: () => void;
  ariaLabel?: string;
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function SwatchBookButton({
  tooltip = "Open SwatchBook (Theme Settings)",
  onClick,
  ariaLabel = "Open SwatchBook (Theme Settings)",
  fontSize,
  className,
}: SwatchBookButtonProps) {
  return (
    <IconContainer
      icon={SwatchBook}
      variant="interactive"
      tooltip={tooltip}
      onClick={onClick}
      ariaLabel={ariaLabel}
      fontSize={fontSize}
      className={className}
    />
  );
}
