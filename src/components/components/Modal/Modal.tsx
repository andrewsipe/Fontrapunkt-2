/**
 * Modal component using Base UI Dialog
 * https://base-ui.com/react/components/dialog
 */

import { Dialog } from "@base-ui/react/dialog";
import React, { useCallback, useEffect, useId } from "react";
import { CloseButton } from "../../features/Button/CloseButton";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: React.ReactNode;
  description?: string;
  hideDescription?: boolean;
  children: React.ReactNode;
  size?: "standard" | "wide" | "full";
  showCloseButton?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: React.ReactNode;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  preventCloseOnOutsideClick?: boolean;
  modal?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  titleIcon,
  description,
  hideDescription = false,
  children,
  size = "standard",
  showCloseButton = true,
  header,
  footer,
  closeButton,
  preventCloseOnOutsideClick = false,
  modal = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      modal={modal}
      disablePointerDismissal={preventCloseOnOutsideClick}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.overlay} />
        <Dialog.Popup
          className={`${styles.content} ${styles[size]}`}
          data-modal-popup
          aria-describedby={description ? descriptionId : undefined}
        >
          {title?.trim() ? (
            <Dialog.Title id={titleId} className={styles.title}>
              {titleIcon && <span className={styles.titleIcon}>{titleIcon}</span>}
              {title}
            </Dialog.Title>
          ) : (
            <Dialog.Title id={titleId} className={styles.visuallyHidden}>
              {header ? "Settings Panel" : "Modal Dialog"}
            </Dialog.Title>
          )}

          {description ? (
            hideDescription ? (
              <Dialog.Description id={descriptionId} className={styles.visuallyHidden}>
                {description}
              </Dialog.Description>
            ) : (
              <Dialog.Description id={descriptionId} className={styles.description}>
                {description}
              </Dialog.Description>
            )
          ) : null}

          {header && <div className={styles.header}>{header}</div>}

          <div className={styles.body}>{children}</div>

          {footer && <div className={styles.footer}>{footer}</div>}

          {closeButton ? (
            <Dialog.Close
              render={(props) => React.cloneElement(closeButton as React.ReactElement, props)}
            />
          ) : showCloseButton ? (
            <Dialog.Close
              render={(props) => (
                <CloseButton {...props} className={styles.closeButton} fontSize="base" />
              )}
            />
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
