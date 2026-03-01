/**
 * Glyphs View - Grid of all available glyphs organized by Unicode categories
 */

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Accordion } from "../../../../components/components/Accordion";
import { CustomToggleGroup } from "../../../../components/components/ToggleGroup/CustomToggleGroup";
import { Icon } from "../../../../components/primitives/Icon/Icon";
import { Label } from "../../../../components/primitives/Label/Label";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { useFontStore } from "../../../../stores/fontStore";
import { useUIStore } from "../../../../stores/uiStore";
import { buildFeatureSettings } from "../../../../utils/fontFeatureUtils";
import { categorizeGlyphs, type GlyphInfo } from "../../../../utils/glyphCategorizer";
import { getUnicodeData, searchByCategory } from "../../../../utils/glyphSearchUtils";
import { ArrowBigDown, ArrowBigUp, Search } from "../../../../utils/icons";
import { getCanvasFontStack } from "../../../../utils/notDefFontLoader";
import { LoadingSpinner } from "../../LoadingSpinner/LoadingSpinner";
import { CategorySection } from "./CategorySection";
import styles from "./GlyphsView.module.css";
import { useGlyphExtraction } from "./hooks/useGlyphExtraction";
import { useScrollSpy } from "./hooks/useScrollSpy";

const STICKY_OFFSET = 80;

function GlyphsViewComponent() {
  const fontId = useFontStore((state) => state.currentFontId);
  const fontName = useFontStore((state) => state.getFontName());
  const axes = useFontStore((state) => state.getFontAxes());
  const isVariable = useFontStore((state) => state.getFontIsVariable());
  const setGlyphCount = useFontStore((state) => state.setGlyphCount);
  const activeTab = useUIStore((state) => state.getActiveTab());
  const currentFont = useFontStore((state) => state.getCurrentFont());

  const { glyphs, loading } = useGlyphExtraction(currentFont, setGlyphCount);

  const [unicodeDataReady, setUnicodeDataReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 150);
  const [includeCategoryNames, setIncludeCategoryNames] = useState(true);
  const [includeName, setIncludeName] = useState(true);
  const [includeUnicode, setIncludeUnicode] = useState(true);
  const [copiedGlyph, setCopiedGlyph] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const allCategorizedGlyphs = useMemo(() => categorizeGlyphs(glyphs), [glyphs]);
  const searchResults = useMemo(
    () =>
      searchByCategory(
        allCategorizedGlyphs,
        debouncedSearchQuery,
        includeCategoryNames,
        includeName,
        includeUnicode
      ),
    [allCategorizedGlyphs, debouncedSearchQuery, includeCategoryNames, includeName, includeUnicode]
  );
  const categorizedGlyphs = debouncedSearchQuery ? searchResults.results : allCategorizedGlyphs;

  const [currentCategory, setCurrentCategory] = useScrollSpy(
    containerRef,
    categoryRefs,
    categorizedGlyphs,
    searchQuery,
    STICKY_OFFSET
  );

  // Memoize feature settings string
  const otFeatures = activeTab?.settings?.otFeatures;
  const featureSettings = useMemo(() => {
    return buildFeatureSettings(otFeatures);
  }, [otFeatures]);

  const variationSettings = useMemo(() => {
    if (!isVariable || !axes?.length) return "";
    const axisValues: Record<string, number> = {};
    axes.forEach((axis) => {
      axisValues[axis.tag] = axis.current;
    });
    if (Object.keys(axisValues).length === 0) return "";
    return Object.entries(axisValues)
      .map(([tag, value]) => `"${tag}" ${value}`)
      .join(", ");
  }, [isVariable, axes]);

  // Calculate card size and gap based on font size
  const rawFontSize = activeTab?.settings?.fontSize || 72;
  const fontSize = Math.max(rawFontSize, 16);
  const textTransform = activeTab?.settings?.textTransform || "none";

  const cardSize = useMemo(() => {
    let multiplier: number;
    if (fontSize <= 50) {
      multiplier = 2.5;
    } else if (fontSize <= 72) {
      multiplier = 2.0;
    } else {
      multiplier = 1.5;
    }
    return Math.max(fontSize * multiplier, 80);
  }, [fontSize]);

  const gap = useMemo(() => Math.max(cardSize * 0.08, 8), [cardSize]);

  useEffect(() => {
    if (!fontId) {
      setUnicodeDataReady(false);
      return;
    }
    getUnicodeData()
      .then(() => setUnicodeDataReady(true))
      .catch((error) => {
        console.error("[GlyphsView] Unicode data load failed:", error);
        setUnicodeDataReady(true);
      });
  }, [fontId]);

  const allCategoryNames = useMemo(() => Object.keys(categorizedGlyphs), [categorizedGlyphs]);
  const [prevCategoryNames, setPrevCategoryNames] = useState(allCategoryNames);
  const [openItems, setOpenItems] = useState<string[]>(allCategoryNames);

  if (prevCategoryNames !== allCategoryNames) {
    setPrevCategoryNames(allCategoryNames);
    setOpenItems(allCategoryNames);
  }

  const handleDoubleClick = async (glyph: GlyphInfo) => {
    try {
      await navigator.clipboard.writeText(glyph.char);
      setCopiedGlyph(glyph.char);
      setTimeout(() => setCopiedGlyph(null), 1500);
    } catch (error) {
      console.error("Failed to copy glyph:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = glyph.char;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedGlyph(glyph.char);
        setTimeout(() => setCopiedGlyph(null), 1500);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // ----------------------------------------------------------------------
  // FIX 2: Robust Jump Navigation - Containment Logic
  // ----------------------------------------------------------------------
  const scrollToElement = (el: HTMLElement) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: el.offsetTop - (STICKY_OFFSET - 10),
      behavior: "smooth",
    });
  };

  const navigateCategory = (direction: "prev" | "next") => {
    if (!containerRef.current || searchQuery) return;

    const categoryNames = Object.keys(categorizedGlyphs);
    if (categoryNames.length === 0) return;

    const currentIndex = categoryNames.indexOf(currentCategory || "");
    if (currentIndex === -1 && categoryNames.length > 0) {
      // If no current category, start at first
      const firstCategory = categoryNames[0];
      const firstEl = categoryRefs.current.get(firstCategory);
      if (firstEl) {
        if (!openItems.includes(firstCategory)) {
          setOpenItems((prev) => [...prev, firstCategory]);
          setTimeout(() => scrollToElement(firstEl), 50);
        } else {
          scrollToElement(firstEl);
        }
        setCurrentCategory(firstCategory);
      }
      return;
    }

    let targetIndex: number;
    if (direction === "next") {
      targetIndex = currentIndex < categoryNames.length - 1 ? currentIndex + 1 : 0;
    } else {
      // Previous: check if we should just scroll to top of CURRENT section
      const currentEl = categoryRefs.current.get(currentCategory || "");
      const scrollTop = containerRef.current?.scrollTop || 0;
      // If we are deep down in the section (>100px from header), just go to header
      if (currentEl && scrollTop + STICKY_OFFSET - currentEl.offsetTop > 100) {
        targetIndex = currentIndex;
      } else {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : categoryNames.length - 1;
      }
    }

    const targetName = categoryNames[targetIndex];
    const targetEl = categoryRefs.current.get(targetName);

    if (targetEl && containerRef.current) {
      // Ensure the target is expanded before scrolling to it
      if (!openItems.includes(targetName)) {
        setOpenItems((prev) => [...prev, targetName]);
        // Give React a frame to render the expansion before scrolling
        setTimeout(() => scrollToElement(targetEl), 50);
      } else {
        scrollToElement(targetEl);
      }
      setCurrentCategory(targetName);
    }
  };

  if (!activeTab || !currentFont) {
    return (
      <div className={styles.emptyState}>
        <p>No font loaded</p>
      </div>
    );
  }

  if (!unicodeDataReady) {
    return (
      <div className={styles.emptyState}>
        <LoadingSpinner size="lg" label="Loading glyph data…" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p>Loading glyphs...</p>
      </div>
    );
  }

  const categoryEntries = Object.entries(categorizedGlyphs);

  const categoryNames = Object.keys(categorizedGlyphs);
  const currentIndex = currentCategory ? categoryNames.indexOf(currentCategory) : -1;
  // Show disabled state at boundaries, but still allow wrapping for better UX
  const isAtFirst = currentIndex === 0;
  const isAtLast = currentIndex === categoryNames.length - 1;
  const hasMultipleCategories = categoryNames.length > 1;

  return (
    <div ref={containerRef} className={styles.glyphsView}>
      <div className={styles.glyphToolbar}>
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by character, name, unicode, feature, or keyword (e.g., 'arrow', 'heart')..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {debouncedSearchQuery && (
            <div className={styles.searchResultsInline}>
              Found <strong>{searchResults.totalMatches}</strong> glyphs in{" "}
              <strong>{searchResults.matchedCategories.length}</strong> categories
            </div>
          )}

          {currentCategory && !searchQuery && categoryEntries.length > 0 && (
            <div className={styles.toolbarGroupNav}>
              <div className={styles.currentCategory}>{currentCategory}</div>
              <CustomToggleGroup.Root
                type="single"
                variant="segmented"
                className={styles.navToggleGroup}
              >
                <CustomToggleGroup.Item
                  value="prev"
                  onClick={() => navigateCategory("prev")}
                  disabled={isAtFirst && !hasMultipleCategories}
                  tooltip={
                    isAtFirst && hasMultipleCategories
                      ? "Previous category (wraps to last)"
                      : "Previous category"
                  }
                  aria-label="Previous category"
                >
                  <Icon icon={ArrowBigUp} />
                </CustomToggleGroup.Item>
                <CustomToggleGroup.Item
                  value="next"
                  onClick={() => navigateCategory("next")}
                  disabled={isAtLast && !hasMultipleCategories}
                  tooltip={
                    isAtLast && hasMultipleCategories
                      ? "Next category (wraps to first)"
                      : "Next category"
                  }
                  aria-label="Next category"
                >
                  <Icon icon={ArrowBigDown} />
                </CustomToggleGroup.Item>
              </CustomToggleGroup.Root>
            </div>
          )}
        </div>

        {debouncedSearchQuery && (
          <div className={styles.searchFilters}>
            <Label as="span" variant="default" className={styles.filtersLabel}>
              Filter
            </Label>
            <label className={styles.filterToggle}>
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
              />
              <span>name</span>
            </label>
            <label className={styles.filterToggle}>
              <input
                type="checkbox"
                checked={includeUnicode}
                onChange={(e) => setIncludeUnicode(e.target.checked)}
              />
              <span>unicode</span>
            </label>
            <label className={styles.filterToggle}>
              <input
                type="checkbox"
                checked={includeCategoryNames}
                onChange={(e) => setIncludeCategoryNames(e.target.checked)}
              />
              <span>category</span>
            </label>
          </div>
        )}
      </div>

      <div ref={categoriesContainerRef} className={styles.categoriesContainer}>
        {categoryEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No glyphs found</p>
          </div>
        ) : (
          <Accordion.Root
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className={styles.accordionRoot}
          >
            {categoryEntries.map(([categoryName, categoryGlyphs]) => (
              <CategorySection
                key={categoryName}
                ref={(el) => {
                  if (el) {
                    categoryRefs.current.set(categoryName, el);
                  } else {
                    categoryRefs.current.delete(categoryName);
                  }
                }}
                categoryName={categoryName}
                glyphs={categoryGlyphs}
                cardSize={cardSize}
                gap={gap}
                fontSize={fontSize}
                featureSettings={featureSettings}
                variationSettings={variationSettings}
                textTransform={textTransform}
                fontFamily={getCanvasFontStack(fontName ?? "")}
                copiedGlyph={copiedGlyph}
                onGlyphDoubleClick={handleDoubleClick}
              />
            ))}
          </Accordion.Root>
        )}
      </div>
    </div>
  );
}

export const GlyphsView = memo(GlyphsViewComponent);
