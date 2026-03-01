/**
 * Fontrapunkt 2.0 — Shell layout
 * FP2Header + FontCanvas (fp2) + FloatingCommandBar + Drawers + Modals.
 * When isPresentMode, only canvas full-screen + Esc hint.
 */

import { lazy, Suspense } from "react";
import { FloatingCommandBar } from "../FloatingCommandBar/FloatingCommandBar";
import { FontCanvas } from "../FontCanvas/FontCanvas";
import { FP2Header } from "../FP2Header/FP2Header";
import { OpenTypeDrawer } from "../OpenTypeDrawer/OpenTypeDrawer";
import { VariableAxesDrawer } from "../VariableAxesDrawer/VariableAxesDrawer";
import styles from "./Fontrapunkt2Layout.module.css";

// Lazy load modals
const SettingsModal = lazy(() =>
  import("../modals/SettingsModal/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);
const FontInfoModal = lazy(() =>
  import("../modals/FontInfoModal/FontInfoModal").then((m) => ({ default: m.FontInfoModal }))
);
const FontDetailsModal = lazy(() =>
  import("../modals/FontDetailsModal/FontDetailsModal").then((m) => ({
    default: m.FontDetailsModal,
  }))
);
const SampleTextModal = lazy(() =>
  import("../modals/SampleTextModal/SampleTextModal").then((m) => ({
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
