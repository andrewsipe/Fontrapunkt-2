/**
 * Screenshot Preview Modal (Base UI Dialog)
 * Shows captured screenshot (via html2canvas-pro) before download; options: download, copy, cancel.
 */

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUIStore } from "../../../stores/uiStore";
import { downloadBlob } from "../../../utils/exportUtils";
import { ArrowDownToLine, Camera, Copy } from "../../../utils/icons";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import { Modal } from "../../components/Modal";
import styles from "./ScreenshotPreviewModal.module.css";

export function ScreenshotPreviewModal() {
  const isOpen = useUIStore((state) => state.modals.screenshotPreview);
  const closeModal = useUIStore((state) => state.closeModal);
  const screenshotData = useUIStore((state) => state.screenshotData);
  const setScreenshotData = useUIStore((state) => state.setScreenshotData);

  const handleClose = () => {
    if (screenshotData?.objectURL) {
      URL.revokeObjectURL(screenshotData.objectURL);
    }
    setScreenshotData(null);
    closeModal("screenshotPreview");
  };

  // Cleanup ObjectURL when modal closes or data changes
  useEffect(() => {
    return () => {
      if (screenshotData?.objectURL) {
        URL.revokeObjectURL(screenshotData.objectURL);
      }
    };
  }, [screenshotData?.objectURL]);

  const handleDownload = () => {
    if (!screenshotData) return;

    try {
      downloadBlob(screenshotData.blob, screenshotData.filename);
      toast.success("Screenshot downloaded");
      handleClose();
    } catch (error) {
      console.error("Failed to download screenshot:", error);
      toast.error("Failed to download screenshot");
    }
  };

  const handleCopyToClipboard = async () => {
    if (!screenshotData) return;

    try {
      // Use ClipboardItem API for images
      const item = new ClipboardItem({
        "image/png": screenshotData.blob,
      });
      await navigator.clipboard.write([item]);
      toast.success("Screenshot copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const footer = (
    <div className={styles.footer}>
      <div className={styles.filename}>{screenshotData?.filename || ""}</div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={handleDownload}
          disabled={!screenshotData}
          aria-label="Download screenshot"
        >
          <IconContainer icon={ArrowDownToLine} variant="static" fontSize="base" />
          Download
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleCopyToClipboard}
          disabled={!screenshotData}
          aria-label="Copy screenshot to clipboard"
        >
          <IconContainer icon={Copy} variant="static" fontSize="base" />
          Copy
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={handleClose}
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Screenshot Preview"
      titleIcon={<IconContainer icon={Camera} variant="static" fontSize="base" />}
      description="Review your screenshot before downloading"
      footer={footer}
      size="wide"
    >
      <div className={styles.previewContainer}>
        {screenshotData ? (
          <img
            src={screenshotData.objectURL}
            alt="Screenshot preview"
            className={styles.previewImage}
          />
        ) : (
          <div className={styles.loading}>Capturing screenshot...</div>
        )}
      </div>
    </Modal>
  );
}
