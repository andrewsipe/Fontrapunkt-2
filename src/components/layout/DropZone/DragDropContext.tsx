/**
 * Context for drag-over state so EmptyState can show accent + "Release to open font"
 * when a font file is dragged over the viewport (DropZone does not show overlay when no font).
 */

import { createContext, useContext } from "react";

export interface DragDropContextValue {
  isDragActive: boolean;
}

export const DragDropContext = createContext<DragDropContextValue>({ isDragActive: false });

export function useDragDrop() {
  return useContext(DragDropContext);
}
