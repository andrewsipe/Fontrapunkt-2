/**
 * Proofing Modal — fp2
 * Sample text, glyph sets, and proof sets. Header: Proofing + icon; no label row.
 */

import { useUIStore } from "../../../../stores/uiStore";
import { FileText } from "../../../../utils/icons";
import { Modal } from "../../../components/Modal";
import { SampleTextPanel } from "../../../features/SampleTextPanel";
import { Icon } from "../../../primitives/Icon/Icon";
import styles from "./SampleTextModal.module.css";

export function SampleTextModal() {
  const isOpen = useUIStore((state) => state.modals.sampleText);
  const closeModal = useUIStore((state) => state.closeModal);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal("sampleText")}
      title="Proofing"
      titleIcon={<Icon icon={FileText} />}
      size="wide"
    >
      <div className={styles.content}>
        <SampleTextPanel />
      </div>
    </Modal>
  );
}
