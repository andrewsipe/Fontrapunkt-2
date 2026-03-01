/**
 * Category Section component
 * Collapsible section for a Unicode category using Base UI Accordion
 */

import { forwardRef, useEffect, useRef, useState } from "react";
import { Accordion } from "../../../../components/components/Accordion";
import type { GlyphInfo } from "../../../../utils/glyphCategorizer";
import { ChevronDown } from "../../../../utils/icons";
import styles from "./CategorySection.module.css";
import { GlyphCard } from "./GlyphCard";
import { VirtualizedGlyphGrid } from "./VirtualizedGlyphGrid";

const VIRTUALIZATION_THRESHOLD = 100;

interface CategorySectionProps {
  categoryName: string;
  glyphs: GlyphInfo[];
  cardSize: number;
  gap: number;
  fontSize: number;
  featureSettings: string;
  variationSettings?: string;
  textTransform: string;
  fontFamily: string;
  copiedGlyph: string | null;
  onGlyphDoubleClick: (glyph: GlyphInfo) => void;
}

export const CategorySection = forwardRef<HTMLDivElement, CategorySectionProps>((props, ref) => {
  const { categoryName, glyphs } = props;
  const [containerWidth, setContainerWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = glyphs.length > VIRTUALIZATION_THRESHOLD;

  // Measure width when the accordion opens to setup virtualization
  useEffect(() => {
    if (!contentRef.current) return;

    const updateWidth = () => {
      if (contentRef.current) {
        setContainerWidth(contentRef.current.clientWidth);
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (glyphs.length === 0) return null;

  return (
    <Accordion.Item
      value={categoryName}
      className={styles.categorySection}
      ref={ref}
      data-category={categoryName}
    >
      <Accordion.Header className={styles.headerReset}>
        <Accordion.Trigger className={styles.categoryHeader}>
          <div className={styles.categoryHeaderContent}>
            <ChevronDown size={16} className={styles.chevron} />
            <span className={styles.categoryTitle}>{categoryName}</span>
            <span className={styles.categoryCount}>({glyphs.length})</span>
          </div>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className={styles.accordionContent}>
        <div ref={contentRef} className={styles.categoryGridContainer}>
          {shouldVirtualize && containerWidth > 0 ? (
            <VirtualizedGlyphGrid
              glyphs={glyphs}
              cardSize={props.cardSize}
              gap={props.gap}
              fontSize={props.fontSize}
              featureSettings={props.featureSettings}
              variationSettings={props.variationSettings}
              textTransform={props.textTransform}
              fontFamily={props.fontFamily}
              copiedGlyph={props.copiedGlyph}
              onGlyphDoubleClick={props.onGlyphDoubleClick}
              containerWidth={containerWidth}
            />
          ) : (
            <div
              className={styles.categoryGrid}
              style={{
                ["--category-card-size" as string]: `${props.cardSize}px`,
                ["--category-gap" as string]: `${props.gap}px`,
              }}
            >
              {glyphs.map((glyph) => (
                <GlyphCard
                  key={glyph.unicode || `${glyph.char}-${glyph.name}`}
                  glyph={glyph}
                  fontSize={props.fontSize}
                  featureSettings={props.featureSettings}
                  variationSettings={props.variationSettings}
                  textTransform={props.textTransform}
                  fontFamily={props.fontFamily}
                  isCopied={props.copiedGlyph === glyph.char}
                  onDoubleClick={props.onGlyphDoubleClick}
                />
              ))}
            </div>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
});

CategorySection.displayName = "CategorySection";
