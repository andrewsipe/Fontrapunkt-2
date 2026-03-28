/**
 * Tracks which category is in view (scroll spy) for glyph category navigation.
 * Returns [currentCategory, setCurrentCategory] so the component can update it when navigating.
 */

import { useEffect, useState } from "react";
import type { GlyphInfo } from "../../../../utils/glyphCategorizer";

export function useScrollSpy(
  containerRef: React.RefObject<HTMLDivElement | null>,
  categoryRefs: React.RefObject<Map<string, HTMLDivElement>>,
  categorizedGlyphs: Record<string, GlyphInfo[]>,
  searchQuery: string,
  stickyOffset: number
): [string | null, React.Dispatch<React.SetStateAction<string | null>>] {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || searchQuery) {
      setCurrentCategory(null);
      return;
    }

    const scrollContainer = containerRef.current;
    const categoryNames = Object.keys(categorizedGlyphs);

    const updateCurrentCategory = () => {
      if (categoryNames.length === 0) return;
      const scrollTop = scrollContainer.scrollTop;
      const checkPoint = scrollTop + stickyOffset;
      let activeCategory = categoryNames[0];

      for (let i = 0; i < categoryNames.length; i++) {
        const name = categoryNames[i];
        const element = categoryRefs.current?.get(name);
        if (!element) continue;
        if (element.offsetTop <= checkPoint) {
          activeCategory = name;
        } else {
          break;
        }
      }
      setCurrentCategory(activeCategory);
    };

    updateCurrentCategory();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateCurrentCategory();
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [containerRef, categoryRefs, categorizedGlyphs, searchQuery, stickyOffset]);

  return [currentCategory, setCurrentCategory];
}
