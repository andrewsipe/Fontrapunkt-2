/**
 * Proofing Panel
 * Sample text, glyph sets, and proof sets via Base UI Tabs. One tab per proof group.
 * Tab row includes reset button on the right. Underline selection, accent color, hover highlight.
 */

import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useState } from "react";
import { useFontStore } from "../../../stores/fontStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useUIStore } from "../../../stores/uiStore";
import shared from "../../../styles/sidebar/SidebarShared.module.css";
import type { CachedFont } from "../../../types/font.types";
import { filterToAvailableGlyphs, getAvailableGlyphs } from "../../../utils/glyphUtils";
import {
  fetchGutenbergText,
  fetchQuotableQuote,
  fetchWikipedia,
  GLYPH_SETS,
  type GlyphSetName,
  getRandomPangram,
  getRandomTitle,
  PROOF_GROUPS,
  PROOF_SETS,
  type ProofSetName,
} from "../../../utils/sampleTextUtils";
import { getDefaultCanvasColors, getEffectiveCanvasTheme } from "../../../utils/themeUtils";
import styles from "./SampleTextPanel.module.css";

function proofGroupSlug(label: string): string {
  return `proof-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

const PREVIEW_MAX_LEN = 80;

function truncatePreview(text: string): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= PREVIEW_MAX_LEN) return oneLine;
  return `${oneLine.slice(0, PREVIEW_MAX_LEN)}…`;
}

/**
 * Build the "Entire Font" string: all available glyphs with visible first, then control/whitespace.
 * Shared by handleGlyphSet and the font-change repopulation effect.
 */
function buildEntireFontText(font: CachedFont): string {
  const availableGlyphs = getAvailableGlyphs(font);
  const visibleGlyphs: string[] = [];
  const controlChars: string[] = [];

  availableGlyphs.forEach((char) => {
    const code = char.codePointAt(0);
    if (code === undefined) return;
    if (code <= 0x1f || (code >= 0x09 && code <= 0x0d) || code === 0x20) {
      controlChars.push(char);
    } else {
      visibleGlyphs.push(char);
    }
  });

  return visibleGlyphs.join("") + controlChars.join("");
}

export function SampleTextPanel() {
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);
  const viewMode = useUIStore((state) => state.viewMode);
  const fontId = useFontStore((state) => state.currentFontId);
  const currentFont = useFontStore((state) => state.getCurrentFont());
  const defaultText = useSettingsStore((state) => state.defaultText);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const canvasTheme = useSettingsStore((state) => state.canvasTheme);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedSampleText, setSelectedSampleText] = useState<string>("");
  const [selectedGlyphSet, setSelectedGlyphSet] = useState<string>("");
  const [selectedProofSet, setSelectedProofSet] = useState<string>("");

  const isGlyphsView = viewMode === "glyphs";

  // When font changes and "Entire Font" is selected, repopulate tab text with the new font's glyph set.
  // Use stable deps (ids only) so updateTabSettings doesn't retrigger via new activeTab reference.
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentFont?.id and activeTab?.id trigger on identity change only; full refs would cause infinite loop
  useEffect(() => {
    if (selectedGlyphSet !== "Entire Font") return;
    const font = useFontStore.getState().getCurrentFont();
    const tab = useUIStore.getState().getActiveTab();
    if (!tab || !font) return;
    const text = buildEntireFontText(font);
    updateTabSettings(tab.id, { text });
  }, [fontId, selectedGlyphSet, activeTab?.id, updateTabSettings]);

  if (!activeTab) {
    return (
      <div className={styles.sampleTextPanel}>
        <div className={shared.emptyState}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleSampleText = async (
    type: "title" | "pangram" | "gutenberg" | "quote" | "wikipedia"
  ) => {
    setSelectedSampleText(type);
    setLoading(type);
    let text = "";

    try {
      switch (type) {
        case "title":
          text = await getRandomTitle();
          break;
        case "pangram":
          text = getRandomPangram();
          break;
        case "gutenberg":
          text = await fetchGutenbergText();
          break;
        case "quote":
          text = await fetchQuotableQuote();
          break;
        case "wikipedia":
          text = await fetchWikipedia();
          break;
      }

      // Filter sample text to only available glyphs if font is loaded
      if (currentFont && text) {
        text = filterToAvailableGlyphs(text, currentFont);
      }

      updateTabSettings(activeTab.id, { text });
    } catch (error) {
      console.error("Failed to fetch sample text:", error);
      setSelectedSampleText("");
    } finally {
      setLoading(null);
    }
  };

  const handleProofSet = (setName: ProofSetName) => {
    if (!currentFont) return;

    setSelectedProofSet(setName);
    const proofSetText = PROOF_SETS[setName] || "";
    const filteredText = filterToAvailableGlyphs(proofSetText, currentFont);
    updateTabSettings(activeTab.id, { text: filteredText });
  };

  const handleGlyphSet = (setName: GlyphSetName) => {
    if (!currentFont) return;

    setSelectedGlyphSet(setName);

    if (setName === "Entire Font") {
      const text = buildEntireFontText(currentFont);
      updateTabSettings(activeTab.id, { text });
    } else {
      // Filter glyph set to only available glyphs
      const glyphSetText = GLYPH_SETS[setName] || "";
      const filteredText = filterToAvailableGlyphs(glyphSetText, currentFont);
      updateTabSettings(activeTab.id, { text: filteredText });
    }
  };

  const handleReset = () => {
    if (!activeTab || !currentFont) return;

    // Clear select states
    setSelectedSampleText("");
    setSelectedGlyphSet("");
    setSelectedProofSet("");

    // Reset to default sample text from settings

    // Reset variable font axes to defaults if variable font (do this first)
    if (currentFont.isVariable && currentFont.axes) {
      const resetAxisValues: Record<string, number> = {};
      currentFont.axes.forEach((axis) => {
        resetAxisValues[axis.tag] = axis.default;
      });

      // Update font store axes first
      const { updateAxisValue } = useFontStore.getState();
      currentFont.axes.forEach((axis) => {
        updateAxisValue(currentFont.id, axis.tag, axis.default);
      });

      // Then update tab settings
      updateTabSettings(activeTab.id, { axisValues: resetAxisValues });
    }

    const isDark = getEffectiveCanvasTheme(colorScheme, canvasTheme) === "dark";
    const { color, backgroundColor } = getDefaultCanvasColors(isDark);

    // Reset all tab settings to defaults
    updateTabSettings(activeTab.id, {
      text: defaultText,
      fontSize: 72,
      letterSpacing: 0,
      lineHeight: 1.2,
      alignment: "left",
      direction: "ltr",
      textTransform: "none",
      verticalAlignment: "top",
      zoomToFit: false,
      verticalTrim: false,
      color,
      backgroundColor,
      otFeatures: {},
    });
  };

  const sampleTextOptions: Array<{
    value: "title" | "pangram" | "gutenberg" | "quote" | "wikipedia";
    label: string;
    preview: string;
  }> = [
    { value: "title", label: "Title", preview: "Random book, film, or album title." },
    { value: "pangram", label: "Pangram", preview: getRandomPangram() },
    { value: "gutenberg", label: "Gutenberg", preview: "Random paragraph from Project Gutenberg." },
    { value: "quote", label: "Quote", preview: "Random quote from Quotable API." },
    { value: "wikipedia", label: "Wikipedia", preview: "Random Wikipedia article summary." },
  ];

  const glyphSetEntries = Object.entries(GLYPH_SETS).map(([name, text]) => ({
    name: name as GlyphSetName,
    preview: text === null ? "All available glyphs from the loaded font." : truncatePreview(text),
  }));

  const proofGroupTabs = PROOF_GROUPS.map((group) => ({
    value: proofGroupSlug(group.label),
    label: group.label,
    keys: group.keys,
  }));

  const resetDisabled = !activeTab || !currentFont || isGlyphsView;

  if (isGlyphsView) {
    return <div className={styles.sampleTextPanel} />;
  }

  return (
    <div className={styles.sampleTextPanel}>
      <Tabs.Root
        defaultValue="sample-text"
        className={styles.tabsRoot}
        aria-label="Proofing categories"
      >
        <div className={styles.tabRow}>
          <Tabs.List className={styles.tabList}>
            <Tabs.Tab value="sample-text" className={styles.tab}>
              Sample Text
            </Tabs.Tab>
            <Tabs.Tab value="glyph-sets" className={styles.tab}>
              Glyph Sets
            </Tabs.Tab>
            {proofGroupTabs.map((t) => (
              <Tabs.Tab key={t.value} value={t.value} className={styles.tab}>
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={resetDisabled}
            title="Reset all settings to defaults"
            aria-label="Reset all settings to defaults"
          >
            Reset
          </button>
        </div>
        <div className={styles.tabsContent}>
          <Tabs.Panel value="sample-text" className={styles.tabPanel}>
            <ul className={styles.optionList} aria-label="Sample text options">
              {sampleTextOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={styles.optionCard}
                    data-selected={selectedSampleText === opt.value}
                    disabled={loading !== null}
                    onClick={() => handleSampleText(opt.value)}
                    aria-pressed={selectedSampleText === opt.value}
                  >
                    <span className={styles.optionName}>{opt.label}</span>
                    <span className={styles.optionPreview}>{opt.preview}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Tabs.Panel>
          <Tabs.Panel value="glyph-sets" className={styles.tabPanel}>
            <ul className={styles.optionList} aria-label="Glyph set options">
              {glyphSetEntries.map(({ name, preview }) => (
                <li key={name}>
                  <button
                    type="button"
                    className={styles.optionCard}
                    data-selected={selectedGlyphSet === name}
                    onClick={() => handleGlyphSet(name)}
                    aria-pressed={selectedGlyphSet === name}
                  >
                    <span className={styles.optionName}>{name}</span>
                    <span className={styles.optionPreview}>{preview}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Tabs.Panel>
          {proofGroupTabs.map(({ value, keys }) => (
            <Tabs.Panel key={value} value={value} className={styles.tabPanel}>
              <ul className={styles.optionList} aria-label="Proof set options">
                {keys.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={styles.optionCard}
                      data-selected={selectedProofSet === name}
                      onClick={() => handleProofSet(name as ProofSetName)}
                      aria-pressed={selectedProofSet === name}
                    >
                      <span className={styles.optionName}>{name}</span>
                      <span className={styles.optionPreview}>
                        {truncatePreview(PROOF_SETS[name as ProofSetName] ?? "")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Tabs.Panel>
          ))}
        </div>
      </Tabs.Root>
    </div>
  );
}
