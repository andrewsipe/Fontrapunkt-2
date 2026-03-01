/**
 * ClearCacheButton - Feature: clear font cache (Trash2 / loading state).
 * IconContainer + Trash2, or LoadingSpinner when clearing.
 */

import { Trash2 } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";

interface ClearCacheButtonProps {
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  /** When true, shows LoadingSpinner instead of Trash2 */
  loading?: boolean;
  fontSize?: IconContainerFontSize;
  className?: string;
}

export function ClearCacheButton({
  tooltip,
  onClick,
  disabled = false,
  loading = false,
  fontSize,
  className,
}: ClearCacheButtonProps) {
  const icon = loading ? <LoadingSpinner size="sm" /> : Trash2;

  return (
    <IconContainer
      icon={icon}
      variant="interactive"
      tooltip={tooltip}
      onClick={onClick}
      ariaLabel={tooltip}
      disabled={disabled}
      fontSize={fontSize}
      className={className}
    />
  );
}
