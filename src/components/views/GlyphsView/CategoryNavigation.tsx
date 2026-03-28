/**
 * CategoryNavigation Component
 * Provides quick navigation to glyph categories with search result highlighting
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Hash } from "../../../utils/icons";
import styles from "./CategoryNavigation.module.css";

interface CategoryNavigationProps {
  categories: Array<{
    name: string;
    count: number;
    hasFeatures?: number;
  }>;
  activeCategory?: string | null;
  onCategoryClick: (categoryName: string) => void;
  searchQuery?: string;
  matchedCategories?: string[];
  isCompact?: boolean;
}

export function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryClick,
  searchQuery = "",
  matchedCategories = [],
  isCompact = false,
}: CategoryNavigationProps) {
  const [isOpen, setIsOpen] = useState(!isCompact);
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-open when searching
  useEffect(() => {
    if (searchQuery && !isOpen) {
      setIsOpen(true);
    }
  }, [searchQuery, isOpen]);

  // Filter categories if searching
  const displayCategories =
    searchQuery && matchedCategories.length > 0
      ? categories.filter((cat) => matchedCategories.includes(cat.name))
      : categories;

  const totalGlyphs = categories.reduce((sum, cat) => sum + cat.count, 0);
  const matchedGlyphs =
    searchQuery && matchedCategories.length > 0
      ? displayCategories.reduce((sum, cat) => sum + cat.count, 0)
      : totalGlyphs;

  return (
    <div className={styles.navigation} ref={navRef}>
      {isCompact && (
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <Hash size={16} />
          <span>
            Categories ({displayCategories.length}){searchQuery && ` • ${matchedGlyphs} matches`}
          </span>
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          />
        </button>
      )}

      {(!isCompact || isOpen) && (
        <nav className={styles.categoryList} aria-label="Glyph categories">
          {displayCategories.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No categories match your search</p>
            </div>
          ) : (
            displayCategories.map((category) => {
              const isActive = activeCategory === category.name;
              const isMatched = searchQuery && matchedCategories.includes(category.name);

              return (
                <button
                  type="button"
                  key={category.name}
                  className={`${styles.categoryItem} ${
                    isActive ? styles.active : ""
                  } ${isMatched ? styles.matched : ""}`}
                  onClick={() => {
                    onCategoryClick(category.name);
                    // Scroll to category in main view
                    const categoryElement = document.querySelector(
                      `[data-category="${category.name}"]`
                    );
                    if (categoryElement) {
                      categoryElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>
                    {category.count}
                    {category.hasFeatures !== undefined && category.hasFeatures > 0 && (
                      <span
                        className={styles.featureBadge}
                        title={`${category.hasFeatures} glyphs with OpenType features`}
                      >
                        ✦
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </nav>
      )}

      {!isCompact && (
        <div className={styles.stats}>
          {searchQuery ? (
            <p>
              <strong>{matchedGlyphs}</strong> of <strong>{totalGlyphs}</strong> glyphs in{" "}
              <strong>{displayCategories.length}</strong> categories
            </p>
          ) : (
            <p>
              <strong>{totalGlyphs}</strong> glyphs in <strong>{categories.length}</strong>{" "}
              categories
            </p>
          )}
        </div>
      )}
    </div>
  );
}
