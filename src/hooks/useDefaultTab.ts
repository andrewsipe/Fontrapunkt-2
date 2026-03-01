/**
 * Hook to ensure a default tab exists on app initialization
 */

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getDefaultTabSettings, useUIStore } from "../stores/uiStore";

export function useDefaultTab() {
  const addTab = useUIStore((state) => state.addTab);
  const tabs = useUIStore((state) => state.tabs);

  useEffect(() => {
    // Create default tab if none exists
    if (tabs.length === 0) {
      const tabId = uuidv4();
      addTab({
        id: tabId,
        fontId: "",
        fontName: "",
        isVariable: false,
        settings: getDefaultTabSettings(),
      });
    }
  }, [tabs.length, addTab]);
}
