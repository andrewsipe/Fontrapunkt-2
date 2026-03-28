/**
 * Font Info Tab
 * Displays font metadata in sections: General, Metrics, Miscellaneous
 * Phase 3: Uses cached extractor data instead of re-parsing
 * Updated: Shows all Name IDs 1-6, 16, 17 with labels even when data is missing
 */

import { useEffect, useState } from "react";
import type { CachedFont } from "../../../types/font.types";
import { LivePulseIcon, type LiveSyncState } from "../../components/LivePulseIcon";
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import { Label } from "../../primitives/Label/Label";
import { LoadingSpinner } from "../../ui/LoadingSpinner/LoadingSpinner";
import styles from "./FontInfoTab.module.css";

interface FontInfoData {
  general: Array<{ label: string; value: string }>;
  metrics: Array<{ label: string; value: string | number }>;
  miscellaneous: Array<{ label: string; value: string | number | boolean }>;
}

export function FontInfoTab({ font }: { font: CachedFont }) {
  const [info, setInfo] = useState<FontInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<LiveSyncState>("inactive");

  // Check watch status
  useEffect(() => {
    const checkWatchStatus = async () => {
      try {
        const { getWatchStatus } = await import("../../../engine/FontLoader");
        const status = getWatchStatus();
        const isCurrentFont = status.fileName === font.fileName;

        if (!isCurrentFont || !status.hasHandle) {
          setSyncState("inactive");
          return;
        }

        // Determine state: active, failed, or inactive
        if (status.isWatching) {
          setSyncState("active");
        } else if (status.syncError) {
          setSyncState("failed");
        } else {
          setSyncState("inactive");
        }
      } catch (_error) {
        setSyncState("inactive");
      }
    };

    checkWatchStatus();

    // Listen for font-reloaded events to update status
    const handleFontReloaded = () => {
      checkWatchStatus();
    };

    window.addEventListener("font-reloaded", handleFontReloaded as EventListener);

    // Poll periodically to ensure status is up-to-date
    const interval = setInterval(checkWatchStatus, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("font-reloaded", handleFontReloaded as EventListener);
    };
  }, [font.fileName]);

  useEffect(() => {
    function buildInfoFromCache() {
      setLoading(false);
      setError(null);

      const general: Array<{ label: string; value: string }> = [];
      const metrics: Array<{ label: string; value: string | number }> = [];
      const miscellaneous: Array<{
        label: string;
        value: string | number | boolean;
      }> = [];

      // Phase 3: Use cached extractor data instead of re-parsing
      // General section: Show all Name IDs 1-6, 16, 17 with labels even when data is missing
      if (font.metadata) {
        // Name ID 1: Font Family Name
        general.push({
          label: "Font Family Name (ID 1)",
          value: font.metadata.familyName || "",
        });

        // Name ID 2: Font Subfamily Name
        general.push({
          label: "Font Subfamily Name (ID 2)",
          value: font.metadata.subfamilyName || "",
        });

        // Name ID 3: Unique Font Identifier
        general.push({
          label: "Unique Font Identifier (ID 3)",
          value: font.metadata.uniqueIdentifier || "",
        });

        // Name ID 4: Full Font Name
        general.push({
          label: "Full Font Name (ID 4)",
          value: font.metadata.fullName || "",
        });

        // Name ID 5: Version
        general.push({
          label: "Version (ID 5)",
          value: font.metadata.version || "",
        });

        // Name ID 6: PostScript Name
        general.push({
          label: "PostScript Name (ID 6)",
          value: font.metadata.postscriptName || "",
        });

        // Name ID 16: Typographic Family Name
        general.push({
          label: "Typographic Family Name (ID 16)",
          value: font.metadata.preferredFamily || "",
        });

        // Name ID 17: Typographic Subfamily Name
        general.push({
          label: "Typographic Subfamily Name (ID 17)",
          value: font.metadata.preferredSubfamily || "",
        });
      } else {
        // If no metadata, still show labels with empty values
        general.push({ label: "Font Family Name (ID 1)", value: "" });
        general.push({ label: "Font Subfamily Name (ID 2)", value: "" });
        general.push({ label: "Unique Font Identifier (ID 3)", value: "" });
        general.push({ label: "Full Font Name (ID 4)", value: "" });
        general.push({ label: "Version (ID 5)", value: "" });
        general.push({ label: "PostScript Name (ID 6)", value: "" });
        general.push({ label: "Typographic Family Name (ID 16)", value: "" });
        general.push({ label: "Typographic Subfamily Name (ID 17)", value: "" });
      }

      // Vendor ID (from misc, but shown in General section)
      if (font.misc?.vendorID) {
        general.push({
          label: "Vendor ID",
          value: font.misc.vendorID,
        });
      } else {
        general.push({ label: "Vendor ID", value: "" });
      }

      // Add file info
      general.push({ label: "File Name", value: font.fileName });
      general.push({ label: "Format", value: font.format.toUpperCase() });
      general.push({
        label: "Is Variable",
        value: font.isVariable ? "Yes" : "No",
      });

      // Metrics section: All vertical metrics, Cap Height, x Height, Underline, Strikeout
      if (font.metrics) {
        // Units per Em (required)
        metrics.push({
          label: "Units per Em",
          value: font.metrics.unitsPerEm || 0,
        });

        // Cap Height
        metrics.push({
          label: "Cap Height",
          value:
            font.metrics.capHeight !== null && font.metrics.capHeight !== undefined
              ? font.metrics.capHeight
              : "",
        });

        // x Height
        metrics.push({
          label: "x Height",
          value:
            font.metrics.xHeight !== null && font.metrics.xHeight !== undefined
              ? font.metrics.xHeight
              : "",
        });

        // TYPO metrics
        metrics.push({
          label: "typo Ascender",
          value:
            font.metrics.typoAscender !== null && font.metrics.typoAscender !== undefined
              ? font.metrics.typoAscender
              : "",
        });
        metrics.push({
          label: "typo Descender",
          value:
            font.metrics.typoDescender !== null && font.metrics.typoDescender !== undefined
              ? font.metrics.typoDescender
              : "",
        });
        metrics.push({
          label: "typo Line Gap",
          value:
            font.metrics.typoLineGap !== null && font.metrics.typoLineGap !== undefined
              ? font.metrics.typoLineGap
              : "",
        });

        // HHEA metrics
        metrics.push({
          label: "hhea Ascender",
          value:
            font.metrics.hheaAscender !== null && font.metrics.hheaAscender !== undefined
              ? font.metrics.hheaAscender
              : "",
        });
        metrics.push({
          label: "hhea Descender",
          value:
            font.metrics.hheaDescender !== null && font.metrics.hheaDescender !== undefined
              ? font.metrics.hheaDescender
              : "",
        });
        metrics.push({
          label: "hhea Line Gap",
          value:
            font.metrics.hheaLineGap !== null && font.metrics.hheaLineGap !== undefined
              ? font.metrics.hheaLineGap
              : "",
        });

        // WIN metrics
        metrics.push({
          label: "win Ascender",
          value:
            font.metrics.winAscent !== null && font.metrics.winAscent !== undefined
              ? font.metrics.winAscent
              : "",
        });
        metrics.push({
          label: "win Descent",
          value:
            font.metrics.winDescent !== null && font.metrics.winDescent !== undefined
              ? font.metrics.winDescent
              : "",
        });

        // Underline metrics
        metrics.push({
          label: "Underline Position",
          value:
            font.metrics.underlinePosition !== null && font.metrics.underlinePosition !== undefined
              ? font.metrics.underlinePosition
              : "",
        });
        metrics.push({
          label: "Underline Thickness",
          value:
            font.metrics.underlineThickness !== null &&
            font.metrics.underlineThickness !== undefined
              ? font.metrics.underlineThickness
              : "",
        });

        // Strikeout metrics
        metrics.push({
          label: "Strikeout Position",
          value:
            font.metrics.strikeoutPosition !== null && font.metrics.strikeoutPosition !== undefined
              ? font.metrics.strikeoutPosition
              : "",
        });
        metrics.push({
          label: "Strikeout Size",
          value:
            font.metrics.strikeoutSize !== null && font.metrics.strikeoutSize !== undefined
              ? font.metrics.strikeoutSize
              : "",
        });
      } else {
        // If no metrics, still show labels with empty values
        metrics.push({ label: "Units per Em", value: "" });
        metrics.push({ label: "Cap Height", value: "" });
        metrics.push({ label: "x Height", value: "" });
        metrics.push({ label: "typo Ascender", value: "" });
        metrics.push({ label: "typo Descender", value: "" });
        metrics.push({ label: "typo Line Gap", value: "" });
        metrics.push({ label: "hhea Ascender", value: "" });
        metrics.push({ label: "hhea Descender", value: "" });
        metrics.push({ label: "hhea Line Gap", value: "" });
        metrics.push({ label: "win Ascender", value: "" });
        metrics.push({ label: "win Descent", value: "" });
        metrics.push({ label: "Underline Position", value: "" });
        metrics.push({ label: "Underline Thickness", value: "" });
        metrics.push({ label: "Strikeout Position", value: "" });
        metrics.push({ label: "Strikeout Size", value: "" });
      }

      // Miscellaneous data from MiscExtractor
      // Display order: Glyph count, Weight/Width classes, Italic Angle, fsSelection bits, fsType, Is Fixed Pitch, Available Tables
      if (font.misc) {
        // Number of Glyphs
        if (font.misc.glyphCount) {
          miscellaneous.push({
            label: "Number of Glyphs",
            value: font.misc.glyphCount,
          });
        }

        // Weight and Width Classes
        if (font.misc.weightClass !== null && font.misc.weightClass !== undefined) {
          miscellaneous.push({
            label: "Weight Class",
            value: font.misc.weightClass,
          });
        }
        if (font.misc.widthClass !== null && font.misc.widthClass !== undefined) {
          miscellaneous.push({
            label: "Width Class",
            value: font.misc.widthClass,
          });
        }

        // Italic Angle
        if (font.misc.italicAngle !== null && font.misc.italicAngle !== undefined) {
          miscellaneous.push({
            label: "Italic Angle",
            value: font.misc.italicAngle,
          });
        }

        // fsSelection bits - display as true/false code tags (matches reference UI)
        if (font.misc.fsSelection) {
          miscellaneous.push({
            label: "Italic (fsSelection)",
            value: font.misc.fsSelection.isItalic,
          });
          miscellaneous.push({
            label: "Bold (fsSelection)",
            value: font.misc.fsSelection.isBold,
          });
          miscellaneous.push({
            label: "Regular (fsSelection)",
            value: font.misc.fsSelection.isRegular,
          });
          miscellaneous.push({
            label: "Use Typo Metrics",
            value: font.misc.fsSelection.useTypoMetrics,
          });
        }

        // fsType - show interpreted value (matches reference UI)
        // Always show fsType label, even if value is missing
        if (font.misc.fsTypeInterpreted && font.misc.fsTypeInterpreted !== "Unknown") {
          miscellaneous.push({
            label: "fsType",
            value: font.misc.fsTypeInterpreted,
          });
        } else if (font.misc.fsType !== null && font.misc.fsType !== undefined) {
          // Fallback if interpretation failed but we have the raw value
          miscellaneous.push({
            label: "fsType",
            value: font.misc.fsType === 0 ? "Installable" : `0x${font.misc.fsType.toString(16)}`,
          });
        } else {
          // Show label even if value is missing
          miscellaneous.push({
            label: "fsType",
            value: "",
          });
        }

        // Is Fixed Pitch (boolean - display as code tag)
        if (font.misc.isFixedPitch !== undefined) {
          miscellaneous.push({
            label: "Is Fixed Pitch",
            value: font.misc.isFixedPitch,
          });
        }

        // Available Tables - always show label, even if empty
        if (font.misc.availableTables && font.misc.availableTables.length > 0) {
          miscellaneous.push({
            label: "Available Tables",
            value: font.misc.availableTables.join(", "),
          });
        } else {
          miscellaneous.push({
            label: "Available Tables",
            value: "",
          });
        }
      } else {
        // If no misc data, still show key labels with empty values
        miscellaneous.push({ label: "Number of Glyphs", value: "" });
        miscellaneous.push({ label: "Weight Class", value: "" });
        miscellaneous.push({ label: "Width Class", value: "" });
        miscellaneous.push({ label: "Italic Angle", value: "" });
        miscellaneous.push({ label: "Italic (fsSelection)", value: false });
        miscellaneous.push({ label: "Bold (fsSelection)", value: false });
        miscellaneous.push({ label: "Regular (fsSelection)", value: false });
        miscellaneous.push({ label: "Use Typo Metrics", value: false });
        miscellaneous.push({ label: "fsType", value: "" });
        miscellaneous.push({ label: "Is Fixed Pitch", value: false });
        miscellaneous.push({ label: "Available Tables", value: "" });
      }

      // Add variable font info
      if (font.isVariable && font.axes) {
        miscellaneous.push({
          label: "Variable Axes Count",
          value: font.axes.length,
        });
      }

      setInfo({ general, metrics, miscellaneous });
      setError(null);
    }

    buildInfoFromCache();
  }, [font]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="md" label="Loading font information…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load font information</p>
        <p className={styles.errorDetail}>{error}</p>
      </div>
    );
  }

  if (!info) {
    return <div className={styles.error}>No font information available</div>;
  }

  // Build format badges
  const formatBadges: string[] = [];
  if (font.isVariable) {
    formatBadges.push("VF");
  }
  // Add format badge
  const formatMap: Record<string, string> = {
    ttf: "TTF",
    otf: "OT",
    woff: "WOFF",
    woff2: "WOFF2",
  };
  const formatBadge = formatMap[font.format.toLowerCase()] || font.format.toUpperCase();
  formatBadges.push(formatBadge);

  return (
    <div className={styles.fontInfoTab}>
      {info.general.length > 0 && (
        <section className={styles.section}>
          <SectionHeader>General</SectionHeader>
          {/* Format badges row with Live indicator */}
          <div className={styles.badgeRow}>
            <LivePulseIcon state={syncState} />
            {formatBadges.map((badge) => (
              <span key={badge} className={styles.badge}>
                {badge}
              </span>
            ))}
          </div>
          <div className={styles.infoList}>
            {info.general.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <Label as="span" variant="keyValue" className={styles.label}>
                  {item.label}
                </Label>
                <span className={styles.value}>
                  {item.value || <span className={styles.emptyValue}>—</span>}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {info.metrics.length > 0 && (
        <section className={styles.section}>
          <Label as="h3" variant="section" className={styles.sectionTitle}>
            Metrics
          </Label>
          <div className={styles.infoList}>
            {info.metrics.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <Label as="span" variant="keyValue" className={styles.label}>
                  {item.label}
                </Label>
                <span className={styles.value}>
                  {item.value !== null &&
                  item.value !== undefined &&
                  String(item.value).length > 0 ? (
                    String(item.value)
                  ) : (
                    <span className={styles.emptyValue}>—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {info.miscellaneous.length > 0 && (
        <section className={styles.section}>
          <SectionHeader>Miscellaneous</SectionHeader>
          <div className={styles.infoList}>
            {info.miscellaneous.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <Label as="span" variant="keyValue" className={styles.label}>
                  {item.label}
                </Label>
                <span className={styles.value}>
                  {typeof item.value === "boolean" ? (
                    <code className={styles.codeTag}>{String(item.value)}</code>
                  ) : item.value !== "" && item.value !== null && item.value !== undefined ? (
                    String(item.value)
                  ) : (
                    <span className={styles.emptyValue}>—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
