/**
 * Separator component using Base UI Separator
 * Same API: orientation, decorative (ignored; Base UI Separator is accessible by default).
 * https://base-ui.com/react/components/separator
 */

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import styles from "./Separator.module.css";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}

/**
 * Separator - Semantic separator (Base UI).
 * Base UI Separator is accessible to screen readers by default.
 */
export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      className={`${styles.separator} ${styles[orientation]} ${className ?? ""}`.trim()}
    />
  );
}

export default Separator;
