/**
 * Fontrapunkt 2.0 — Shell layout
 * When no font loaded: canvas only (EmptyState). When font loaded: FP2Header + FontCanvas + FloatingCommandBar + Drawers + Modals.
 * When isPresentMode, only canvas full-screen + Esc hint.
 */

import { lazy, Suspense } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { FloatingCommandBar } from "../../command-bar/FloatingCommandBar/FloatingCommandBar";
import { OpenTypeDrawer } from "../../drawers/OpenTypeDrawer/OpenTypeDrawer";
import { VariableAxesDrawer } from "../../drawers/VariableAxesDrawer/VariableAxesDrawer";
import { FP2Header } from "../../header/FP2Header/FP2Header";
import { FontCanvas } from "../FontCanvas/FontCanvas";
import styles from "./Fontrapunkt2Layout.module.css";

// Lazy load modals
const SettingsModal = lazy(() =>
  import("../../modals/SettingsModal/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);
const FontInfoModal = lazy(() =>
  import("../../modals/FontInfoModal/FontInfoModal").then((m) => ({ default: m.FontInfoModal }))
);
const FontDetailsModal = lazy(() =>
  import("../../modals/FontDetailsModal/FontDetailsModal").then((m) => ({
    default: m.FontDetailsModal,
  }))
);
const SampleTextModal = lazy(() =>
  import("../../modals/SampleTextModal/SampleTextModal").then((m) => ({
    default: m.SampleTextModal,
  }))
);
const ScreenshotPreviewModal = lazy(() =>
  import("../../features/ScreenshotPreviewModal/ScreenshotPreviewModal").then((m) => ({
    default: m.ScreenshotPreviewModal,
  }))
);

interface Fontrapunkt2LayoutProps {
  isPresentMode: boolean;
}

export function Fontrapunkt2Layout({ isPresentMode }: Fontrapunkt2LayoutProps) {
  const currentFontId = useFontStore((state) => state.currentFontId);

  if (isPresentMode) {
    return (
      <div className={styles.presentWrap}>
        <div className={styles.presentCanvas}>
          <FontCanvas />
        </div>
        <span className={styles.exitHint} aria-hidden="true">
          Esc to exit
        </span>
      </div>
    );
  }

  if (!currentFontId) {
    return (
      <>
        <div className={styles.appEmpty}>
          <main className={styles.canvasRegion}>
            <FontCanvas />
          </main>
        </div>
        <VariableAxesDrawer />
        <OpenTypeDrawer />
        <Suspense fallback={null}>
          <SettingsModal />
          <FontInfoModal />
          <FontDetailsModal />
          <SampleTextModal />
          <ScreenshotPreviewModal />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <div className={styles.app}>
        <FP2Header />
        <main className={styles.canvasRegion}>
          <FontCanvas />
        </main>
        <footer className={styles.barSlot}>
          <FloatingCommandBar />
        </footer>
      </div>

      {/* Drawers */}
      <VariableAxesDrawer />
      <OpenTypeDrawer />

      {/* Modals */}
      <Suspense fallback={null}>
        <SettingsModal />
        <FontInfoModal />
        <FontDetailsModal />
        <SampleTextModal />
        <ScreenshotPreviewModal />
      </Suspense>
    </>
  );
}
