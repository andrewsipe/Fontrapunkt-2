/**
 * ResetButton - Feature component for reset actions.
 * IconContainer + RotateCcw + reset semantics. Size from context or optional fontSize.
 *
 * @example
 * <ResetButton tooltip="Reset to defaults" onClick={handleReset} />
 * <ResetButton tooltip="Reset value" onClick={onReset} disabled={disabled} />
 */

import { RotateCcw } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

interface ResetButtonProps {
  tooltip: string;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Override when parent context does not set font-size (e.g. header bar) */
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function ResetButton({
  tooltip,
  onClick,
  ariaLabel,
  disabled,
  fontSize,
  className,
}: ResetButtonProps) {
  return (
    <IconContainer
      icon={RotateCcw}
      variant="interactive"
      tooltip={tooltip}
      onClick={onClick}
      ariaLabel={ariaLabel ?? tooltip}
      disabled={disabled}
      fontSize={fontSize}
      className={className}
    />
  );
}
