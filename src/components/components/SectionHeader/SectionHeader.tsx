/**
 * SectionHeader - Section title (TitleBar variant section).
 * Use for modal/section headings (Settings, Font Info). Forwards to TitleBar.
 */

import { TitleBar } from "../TitleBar/TitleBar";

export type SectionHeaderLevel = "h2" | "h3" | "h4";

export interface SectionHeaderProps {
  /** Heading level. Default "h3". */
  level?: SectionHeaderLevel;
  /** Title content. */
  children: React.ReactNode;
  /** Show bottom border. Default true. */
  border?: boolean;
  /** Optional class name. */
  className?: string;
}

export function SectionHeader({
  level = "h3",
  children,
  border = true,
  className = "",
}: SectionHeaderProps) {
  return (
    <TitleBar variant="section" level={level} border={border} className={className}>
      {children}
    </TitleBar>
  );
}
