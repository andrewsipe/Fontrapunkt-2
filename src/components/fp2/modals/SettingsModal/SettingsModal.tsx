/**
 * Settings Modal component
 */

import { useEffect, useState } from "react";
import { clearFontCache, getCacheStatus } from "../../../../engine/FontLoader";
import { useUIStore } from "../../../../stores/uiStore";
import { Modal } from "../../../components/Modal";
import { ClearCacheButton } from "../../../features/Button/ClearCacheButton";
import styles from "./SettingsModal.module.css";
import { AppearanceSettings } from "./sections/AppearanceSettings";
import { CacheManagement } from "./sections/CacheManagement";
import { GeneralSettings } from "./sections/GeneralSettings";
import { KeyboardShortcuts } from "./sections/KeyboardShortcuts";
import { RenderingSettings } from "./sections/RenderingSettings";

export function SettingsModal() {
  const isOpen = useUIStore((state) => state.modals.settings);
  const closeModal = useUIStore((state) => state.closeModal);
  const openSettingsScrollTo = useUIStore((state) => state.openSettingsScrollTo);
  const setOpenSettingsScrollTo = useUIStore((state) => state.setOpenSettingsScrollTo);

  const [cacheCleared, setCacheCleared] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{ count: number } | null>(null);

  useEffect(() => {
    getCacheStatus().then((status) => setCacheStatus(status));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const target = openSettingsScrollTo;
    if (!target) return;
    setOpenSettingsScrollTo(null);
    const el = document.getElementById(`settings-${target}`);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [isOpen, openSettingsScrollTo, setOpenSettingsScrollTo]);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearFontCache();
      const status = await getCacheStatus();
      setCacheStatus(status);
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleModalClose = () => closeModal("settings");

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Settings" size="standard">
      <div className={styles.quickCacheButtonWrapper}>
        <ClearCacheButton
          tooltip={
            cacheStatus != null ? `Clear cache (${cacheStatus.count} fonts)` : "Clear font cache"
          }
          onClick={handleClearCache}
          disabled={isClearingCache}
          loading={isClearingCache}
          className={styles.quickCacheButton}
          fontSize="sm"
        />
      </div>

      <GeneralSettings />
      <AppearanceSettings />
      <RenderingSettings />
      <CacheManagement
        cacheStatus={cacheStatus}
        isClearingCache={isClearingCache}
        cacheCleared={cacheCleared}
        onClearCache={handleClearCache}
      />
      <KeyboardShortcuts />
    </Modal>
  );
}
