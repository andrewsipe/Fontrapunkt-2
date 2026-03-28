/**
 * Virtualized Glyph Grid component
 * Uses react-window for performance with large glyph sets
 */

import type { CellComponentProps } from "react-window";
import { Grid } from "react-window";
import type { GlyphInfo } from "../../../utils/glyphCategorizer";
import { GlyphCard } from "./GlyphCard";
import styles from "./VirtualizedGlyphGrid.module.css";

interface VirtualizedGlyphGridProps {
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
  containerWidth: number;
}

/** Cell props passed via cellProps (columnIndex, rowIndex, style come from Grid) */
interface CellProps {
  glyphs: GlyphInfo[];
  columnCount: number;
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

function Cell({
  columnIndex,
  rowIndex,
  style,
  glyphs,
  columnCount,
  gap,
  fontSize,
  featureSettings,
  variationSettings,
  textTransform,
  fontFamily,
  copiedGlyph,
  onGlyphDoubleClick,
}: CellComponentProps<CellProps>) {
  const index = rowIndex * columnCount + columnIndex;
  const glyph = glyphs[index];

  if (!glyph) {
    return <div style={style} />;
  }

  return (
    <div
      className={styles.cellInner}
      style={{ ...style, ["--cell-padding" as string]: `${gap / 2}px` }}
    >
      <GlyphCard
        glyph={glyph}
        fontSize={fontSize}
        featureSettings={featureSettings}
        variationSettings={variationSettings}
        textTransform={textTransform}
        fontFamily={fontFamily}
        isCopied={copiedGlyph === glyph.char}
        onDoubleClick={onGlyphDoubleClick}
      />
    </div>
  );
}

export function VirtualizedGlyphGrid({
  glyphs,
  cardSize,
  gap,
  fontSize,
  featureSettings,
  variationSettings,
  textTransform,
  fontFamily,
  copiedGlyph,
  onGlyphDoubleClick,
  containerWidth,
}: VirtualizedGlyphGridProps) {
  // Guard against invalid dimensions
  if (!containerWidth || containerWidth <= 0 || glyphs.length === 0) {
    return (
      <div
        className={styles.virtualizedGrid}
        style={{ ["--loading-padding" as string]: `${gap}px` }}
      >
        <div className={styles.loadingMessage}>Loading...</div>
      </div>
    );
  }

  // Calculate column count based on container width and card size
  const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (cardSize + gap)));
  const rowCount = Math.ceil(glyphs.length / columnCount);

  // Calculate grid dimensions
  const itemWidth = cardSize + gap;
  // Use design token for glyph info height (name + unicode display)
  const infoHeight = 50; // Fallback if CSS variable not available
  const itemHeight = cardSize + gap + infoHeight;

  const gridHeight = rowCount * itemHeight;

  // Use the full calculated height - the parent container will handle scrolling
  // This allows the category section to expand naturally
  const finalHeight = Math.max(gridHeight, 100); // Ensure minimum height

  // Ensure all required props are valid numbers
  if (
    !Number.isFinite(columnCount) ||
    !Number.isFinite(rowCount) ||
    !Number.isFinite(itemWidth) ||
    !Number.isFinite(itemHeight) ||
    !Number.isFinite(finalHeight) ||
    !Number.isFinite(containerWidth)
  ) {
    return (
      <div
        className={styles.virtualizedGrid}
        style={{ ["--loading-padding" as string]: `${gap}px` }}
      >
        <div className={styles.loadingMessage}>Calculating dimensions...</div>
      </div>
    );
  }

  const safeCellProps: CellProps = {
    glyphs: glyphs || [],
    columnCount: Number(columnCount) || 1,
    cardSize: Number(cardSize) || 80,
    gap: Number(gap) || 8,
    fontSize: Number(fontSize) || 16,
    featureSettings: featureSettings || "",
    variationSettings: variationSettings || "",
    textTransform: textTransform || "none",
    fontFamily: fontFamily || "",
    copiedGlyph: copiedGlyph || null,
    onGlyphDoubleClick: onGlyphDoubleClick || (() => {}),
  };

  return (
    <div className={styles.virtualizedGrid}>
      <Grid<CellProps>
        style={{
          height: Number(finalHeight) || 100,
          width: Number(containerWidth) || 100,
        }}
        columnCount={Number(columnCount) || 1}
        columnWidth={Number(itemWidth) || 100}
        rowCount={Number(rowCount) || 1}
        rowHeight={Number(itemHeight) || 100}
        cellComponent={Cell}
        cellProps={safeCellProps}
      />
    </div>
  );
}
