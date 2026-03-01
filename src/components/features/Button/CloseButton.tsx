/**
 * CloseButton - Feature component for close/dismiss actions.
 * IconContainer + X icon + close semantics. Use in modals, popovers, or any dismissible UI.
 *
 * Forwards ref so it works with Dialog.Close asChild (e.g. in Modal).
 *
 * @example
 * <Dialog.Close asChild><CloseButton className={styles.closeButton} /></Dialog.Close>
 * <CloseButton tooltip="Close font" onClick={handleClose} className={styles.closeButton} />
 */

import type React from "react";
import { forwardRef } from "react";
import { X } from "../../../utils/icons";
import type { IconContainerFontSize } from "../../components/IconContainer/IconContainer";
import { IconContainer } from "../../components/IconContainer/IconContainer";

export interface CloseButtonProps {
  /** Tooltip text. Default "Close". Omit or set to empty to render plain button (e.g. for Dialog.Close asChild). */
  tooltip?: string;
  /** Accessible label. Default "Close". */
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Override when parent context does not set font-size (e.g. modal header). */
  fontSize?: IconContainerFontSize;
  className?: string;
}

export const CloseButton = forwardRef<HTMLButtonElement | HTMLSpanElement, CloseButtonProps>(
  function CloseButton(
    { tooltip = "Close", ariaLabel = "Close", onClick, disabled, fontSize, className },
    ref
  ) {
    return (
      <IconContainer
        ref={ref}
        icon={X}
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
);
