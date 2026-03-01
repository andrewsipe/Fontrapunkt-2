/**
 * OpenType Features Panel
 * Toggle OpenType features on/off
 */

import { useFontStore } from "../../../stores/fontStore";
import { useUIStore } from "../../../stores/uiStore";
import panelStyles from "../../../styles/sidebar/Panel.module.css";
import shared from "../../../styles/sidebar/SidebarShared.module.css";
import type { OpenTypeFeature } from "../../../types/font.types";
import {
  getCharacterVariantDescription,
  getFeatureDescription,
  getStylisticSetDescription,
} from "../../../utils/featureDescriptions";
import { Info, Ligature } from "../../../utils/icons";
import { Accordion } from "../../components/Accordion";
import { IconContainer } from "../../components/IconContainer/IconContainer";
import { LabelWithPopover } from "../../components/LabelWithPopover";
import { Popover } from "../../components/Popover";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { Label } from "../../primitives/Label/Label";
import styles from "./OpenTypeFeaturesPanel.module.css";

// Category display names and order
const CATEGORY_INFO: Record<string, { label: string; order: number }> = {
  stylistic: { label: "Stylistic", order: 0 },
  ligature: { label: "Ligature", order: 1 },
  script: { label: "Script", order: 2 },
  figure: { label: "Figure", order: 3 },
  capital: { label: "Capital", order: 4 },
  positional: { label: "Positional", order: 5 },
  other: { label: "Other", order: 6 },
};

export function OpenTypeFeaturesPanel() {
  const fontId = useFontStore((state) => state.currentFontId);
  const features = useFontStore((state) => state.getFontFeatureDetails());
  const featureTags = useFontStore((state) => state.getFontFeatures());
  const activeTab = useUIStore((state) => state.getActiveTab());
  const updateTabSettings = useUIStore((state) => state.updateTabSettings);

  const handlePanelReset = () => {
    if (!activeTab) return;
    updateTabSettings(activeTab.id, { otFeatures: {} });
  };

  if (!fontId) {
    return (
      <div
        id="opentype-features-panel"
        className={`${panelStyles.sidebarPanel} ${styles.featuresPanel}`}
      >
        <TitleBar
          variant="panel"
          title={
            <Label as="span" variant="section">
              OpenType Features
            </Label>
          }
          icon={Ligature}
          onReset={handlePanelReset}
          resetTooltip="Reset all features to disabled"
          resetAriaLabel="Reset all features to disabled"
          resetDisabled
        />
        <div className={shared.emptyState}>
          <p>Load a font to see OpenType features</p>
        </div>
      </div>
    );
  }

  if (!activeTab) {
    return null;
  }

  const featureList: OpenTypeFeature[] = features ?? [];
  const enabledFeatures = activeTab.settings.otFeatures || {};

  if (featureList.length === 0 && featureTags && featureTags.length > 0) {
    console.warn("[OpenTypeFeaturesPanel] Font has features array but no featureDetails:", {
      features: featureTags,
    });
  }

  const toggleFeature = (tag: string) => {
    const newFeatures = {
      ...enabledFeatures,
      [tag]: !enabledFeatures[tag],
    };
    updateTabSettings(activeTab.id, { otFeatures: newFeatures });
  };

  if ((features?.length ?? 0) === 0) {
    return (
      <div
        id="opentype-features-panel"
        className={`${panelStyles.sidebarPanel} ${styles.featuresPanel}`}
      >
        <TitleBar
          variant="panel"
          title={
            <Label as="span" variant="section">
              OpenType Features
            </Label>
          }
          icon={Ligature}
          onReset={handlePanelReset}
          resetTooltip="Reset all features to disabled"
          resetAriaLabel="Reset all features to disabled"
          resetDisabled
        />
        <p className={shared.emptyState}>No OpenType features found for this font.</p>
      </div>
    );
  }

  const featuresByCategory = featureList.reduce(
    (acc, feature) => {
      const category = feature.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    },
    {} as Record<string, OpenTypeFeature[]>
  );

  // Sort categories by order, then sort features within each category
  const sortedCategories = Object.entries(featuresByCategory)
    .sort(([catA], [catB]) => {
      const orderA = CATEGORY_INFO[catA]?.order ?? 99;
      const orderB = CATEGORY_INFO[catB]?.order ?? 99;
      return orderA - orderB;
    })
    .map(([category, categoryFeatures]) => {
      // Sort features within category
      const sorted = [...categoryFeatures].sort((a, b) => {
        // Within stylistic category, sort SS01-SS20 first, then CV01-CV99, then alphabetical
        if (category === "stylistic") {
          const aIsSS = /^ss\d{2}$/i.test(a.tag);
          const bIsSS = /^ss\d{2}$/i.test(b.tag);
          if (aIsSS && !bIsSS) return -1;
          if (!aIsSS && bIsSS) return 1;
          if (aIsSS && bIsSS) {
            const aNum = parseInt(a.tag.slice(2), 10);
            const bNum = parseInt(b.tag.slice(2), 10);
            return aNum - bNum;
          }

          const aIsCV = /^cv\d{2}$/i.test(a.tag);
          const bIsCV = /^cv\d{2}$/i.test(b.tag);
          if (aIsCV && !bIsCV) return -1;
          if (!aIsCV && bIsCV) return 1;
          if (aIsCV && bIsCV) {
            const aNum = parseInt(a.tag.slice(2), 10);
            const bNum = parseInt(b.tag.slice(2), 10);
            return aNum - bNum;
          }
        }
        return a.name.localeCompare(b.name);
      });
      return [category, sorted] as [string, OpenTypeFeature[]];
    });

  return (
    <div
      id="opentype-features-panel"
      className={`${panelStyles.sidebarPanel} ${styles.featuresPanel}`}
    >
      <TitleBar
        variant="panel"
        title={
          <LabelWithPopover sectionKey="opentype features" as="span" variant="section">
            OpenType Features
          </LabelWithPopover>
        }
        useInteractiveTitleStyle
        icon={Ligature}
        onReset={handlePanelReset}
        resetTooltip="Reset all features to disabled"
        resetAriaLabel="Reset all features to disabled"
        resetDisabled={Object.keys(enabledFeatures).length === 0}
      />
      <Accordion.Root
        type="multiple"
        defaultValue={[
          "stylistic",
          "ligature",
          "script",
          "figure",
          "capital",
          "positional",
          "other",
        ]}
        className={styles.categoriesList}
      >
        {sortedCategories.map(([category, categoryFeatures]) => {
          const categoryInfo = CATEGORY_INFO[category] || {
            label: category,
            order: 99,
          };

          return (
            <Accordion.Item key={category} value={category} className={styles.categoryGroup}>
              <Accordion.Header>
                <Accordion.Trigger className={styles.categoryHeader}>
                  <span className={styles.categoryTitle}>
                    {categoryInfo.label} ({categoryFeatures.length})
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <div className={styles.featuresList}>
                  {categoryFeatures.map((feature) => {
                    // Check if this is a stylistic set without a proper name (fallback name)
                    const isStylisticSet = /^ss\d{2}$/i.test(feature.tag);
                    const hasUIName = feature.uinameid !== undefined;
                    const isFallbackName =
                      isStylisticSet && !hasUIName && feature.name.startsWith("Stylistic Set");

                    // Get feature description
                    let featureDesc = getFeatureDescription(feature.tag);
                    if (!featureDesc) {
                      // Try stylistic set pattern
                      const ssMatch = feature.tag.match(/^ss(\d{2})$/i);
                      if (ssMatch) {
                        featureDesc = getStylisticSetDescription(parseInt(ssMatch[1], 10));
                      } else {
                        // Try character variant pattern
                        const cvMatch = feature.tag.match(/^cv(\d{2})$/i);
                        if (cvMatch) {
                          featureDesc = getCharacterVariantDescription(parseInt(cvMatch[1], 10));
                        }
                      }
                    }

                    // Show info icon if we have a description or if it's a fallback name
                    const showInfo = featureDesc || isFallbackName;

                    return (
                      <label key={feature.tag} className={styles.featureItem}>
                        <div className={styles.featureNameGroup}>
                          <input
                            type="checkbox"
                            checked={enabledFeatures[feature.tag] || false}
                            onChange={() => toggleFeature(feature.tag)}
                            className={styles.checkbox}
                          />
                          <Label as="span" variant="default" className={styles.featureName}>
                            {feature.name}
                          </Label>
                        </div>
                        <div className={styles.featureTagGroup}>
                          <span className={styles.featureTag}>({feature.tag})</span>
                          {showInfo && (
                            <Popover.Root>
                              <Popover.Trigger
                                asChild
                                nativeButton={true}
                                className={styles.infoButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <IconContainer
                                  icon={Info}
                                  variant="interactive"
                                  ariaLabel={`Information about ${feature.name} (${feature.tag})`}
                                  onClick={(e) => e.stopPropagation()}
                                  fontSize="sm"
                                  className={styles.infoIcon}
                                />
                              </Popover.Trigger>
                              <Popover.Portal>
                                <Popover.Content side="right" sideOffset={8} align="start">
                                  <div className={styles.popoverContent}>
                                    <h4 className={styles.popoverTitle}>{feature.name}</h4>
                                    {featureDesc && (
                                      <p className={styles.popoverDescription}>
                                        {featureDesc.description}
                                      </p>
                                    )}
                                    {isFallbackName && (
                                      <p className={styles.popoverWarning}>
                                        <strong>Note:</strong> UINameID not found in font - using
                                        fallback name.
                                      </p>
                                    )}
                                    <code className={styles.popoverTag}>{feature.tag}</code>
                                    {featureDesc?.reference && (
                                      <p className={styles.popoverReference}>
                                        {featureDesc.reference}
                                      </p>
                                    )}
                                  </div>
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </div>
  );
}
