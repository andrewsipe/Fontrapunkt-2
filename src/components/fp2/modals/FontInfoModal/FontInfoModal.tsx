/**
 * Font Info Modal component
 * Displays copyright, changelog, and readme information
 */

import { useState } from "react";
import { useUIStore } from "../../../../stores/uiStore";
import { Modal } from "../../../components/Modal";
import { Tabs } from "../../../components/Tabs";
import styles from "./FontInfoModal.module.css";

export function FontInfoModal() {
  const isOpen = useUIStore((state) => state.modals.fontInfo);
  const closeModal = useUIStore((state) => state.closeModal);
  const [activeTab, setActiveTab] = useState<"copyright" | "changelog" | "readme">("copyright");

  const tabItems = [
    { value: "copyright", label: "Copyright" },
    { value: "changelog", label: "Changelog" },
    { value: "readme", label: "Readme" },
  ];

  const contentItems = [
    {
      value: "copyright",
      content: (
        <div className={styles.tabContent}>
          <h3>Copyright</h3>
          <p>Fontrapunkt - A browser-based variable font testing and animation tool.</p>
          <p>Built as a privacy-first single-page application.</p>
          <p>
            All font processing happens client-side. Fonts are cached locally in your browser only.
          </p>
        </div>
      ),
    },
    {
      value: "changelog",
      content: (
        <div className={styles.tabContent}>
          <h3>Changelog</h3>
          <p>
            Changelog and release notes will appear here. See the project repository for the latest
            updates.
          </p>
        </div>
      ),
    },
    {
      value: "readme",
      content: (
        <div className={styles.tabContent}>
          <h3>Readme / Instructions</h3>
          <p>Fontrapunkt is a browser-based variable font testing and animation tool.</p>
          <h4>Features:</h4>
          <ul>
            <li>
              Font Upload & Caching: Upload fonts (TTF, OTF, WOFF, WOFF2) with IndexedDB caching
            </li>
            <li>
              Variable Font Animation: Animate all axes simultaneously with customizable easing
            </li>
            <li>Multiple View Modes: Plain, Waterfall, Styles, Glyphs, and Present modes</li>
            <li>OKLCH Color System: Modern color picker with OKLCH color space</li>
            <li>OpenType Features: Toggle OpenType features on/off</li>
            <li>Export Tools: Copy CSS, take screenshots, record animations</li>
            <li>Multi-Tab Support: Open and compare multiple fonts</li>
            <li>Keyboard Shortcuts: Full keyboard navigation support</li>
            <li>Privacy-First: All font processing happens client-side</li>
          </ul>
          <h4>Keyboard Shortcuts:</h4>
          <ul>
            <li>Cmd/Ctrl + O: Open font</li>
            <li>Cmd/Ctrl + W: Close tab</li>
            <li>Cmd/Ctrl + T: New tab</li>
            <li>Cmd/Ctrl + C: Copy CSS (when not selecting text)</li>
            <li>Space: Play/Pause animation</li>
            <li>R: Reset axes</li>
            <li>F: Toggle fullscreen (Present mode)</li>
            <li>Esc: Exit Present mode or close modals</li>
          </ul>
        </div>
      ),
    },
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
    if (value === "copyright" || value === "changelog" || value === "readme") {
      setActiveTab(value);
    }
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={handleValueChange}>
      <Modal
        isOpen={isOpen}
        onClose={() => closeModal("fontInfo")}
        title="Font Information"
        header={
          <Tabs.List
            items={tabItems}
            className={styles.tabs}
            variant="underline"
            aria-label="Font information tabs"
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
