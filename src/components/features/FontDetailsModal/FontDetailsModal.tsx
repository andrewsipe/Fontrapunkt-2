/**
 * Font Details Modal component
 * Displays font metadata in two tabs: Font Info and Font Source
 */

import { useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import { Modal } from "../../components/Modal";
import { Tabs } from "../../components/Tabs";
import styles from "../FontInfoModal/FontInfoModal.module.css";
import { FontInfoTab } from "./FontInfoTab";
import { FontSourceTab } from "./FontSourceTab";

export function FontDetailsModal() {
  const isOpen = useUIStore((state) => state.modals.fontDetails);
  const closeModal = useUIStore((state) => state.closeModal);
  const currentFont = useFontStore((state) => state.getCurrentFont());
  const [activeTab, setActiveTab] = useState<"info" | "source">("info");

  if (!currentFont) {
    return null;
  }

  const tabItems = [
    { value: "info", label: "Font Info" },
    { value: "source", label: "Font Source" },
  ];

  const contentItems = [
    { value: "info", content: <FontInfoTab font={currentFont} /> },
    { value: "source", content: <FontSourceTab font={currentFont} /> },
  ];

  // Focus active tab when modal opens
  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    // Find the active tab trigger within the modal
    const modalContent = (event.target as HTMLElement).closest('[role="dialog"]');
    const activeTrigger = modalContent?.querySelector(
      `button[role="tab"][data-active]`
    ) as HTMLElement;
    activeTrigger?.focus();
  };

  const handleValueChange = (value: string) => {
    if (value === "info" || value === "source") {
      setActiveTab(value);
    }
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={handleValueChange}>
      <Modal
        isOpen={isOpen}
        onClose={() => closeModal("fontDetails")}
        title="Font Details"
        header={
          <Tabs.List
            items={tabItems}
            className={styles.tabs}
            variant="underline"
            aria-label="Font details tabs"
          />
        }
        onOpenAutoFocus={handleOpenAutoFocus}
        size="wide"
      >
        <Tabs.Content items={contentItems} />
      </Modal>
    </Tabs.Root>
  );
}
