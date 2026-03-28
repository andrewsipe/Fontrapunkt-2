/**
 * Palette viewer (dev tool).
 * Displays fixed sienna + neutral palette, semantic layer stack, and button matrix.
 * Use to verify token system; colors are now fixed (no longer customizable).
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CustomToggleGroup } from "../components/components/ToggleGroup/CustomToggleGroup";
import { useSettingsStore } from "../stores/settingsStore";
import { getWcagContrastRatio, meetsAa, WCAG_AA_RATIO } from "../utils/contrastUtils";
import styles from "./PaletteViewerPage.module.css";

/** Neutral primitive steps from theme.css */
const NEUTRAL_STEPS = [
  "white",
  "50",
  "100",
  "150",
  "200",
  "250",
  "300",
  "350",
  "400",
  "450",
  "500",
  "550",
  "600",
  "700",
  "750",
  "800",
  "850",
  "900",
  "950",
  "1000",
  "black",
] as const;

/** sienna accent steps from theme.css */
const sienna_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

/** Semantic background tokens for layer stack (Body → Canvas → Surface → Panel → Input → Hover) */
const LAYER_TOKENS = [
  { id: "body", label: "Body", var: "--surface-1" },
  { id: "canvas", label: "Canvas", var: "--bg-canvas" },
  { id: "surface", label: "Surface", var: "--surface-3" },
  { id: "panel", label: "Panel", var: "--surface-4" },
  { id: "input", label: "Input", var: "--surface-5" },
  { id: "hover", label: "Hover", var: "--surface-6" },
] as const;

/** Button states to show for token evaluation */
const BUTTON_STATES = [
  { id: "default", label: "Default" },
  { id: "hover", label: "Hover" },
  { id: "focus", label: "Focus" },
  { id: "active", label: "Active" },
  { id: "disabled", label: "Disabled" },
] as const;

/** Layers to place buttons on so we see how bg-# affects the same control */
const BUTTON_LAYERS = [
  { id: "body", label: "On Body", var: "--surface-1" },
  { id: "surface", label: "On Surface", var: "--surface-2" },
  { id: "panel", label: "On Panel", var: "--surface-3" },
] as const;

export function PaletteViewerPage() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const primaryOnBgRef = useRef<HTMLUListElement>(null);
  const [primaryOnBgRatios, setPrimaryOnBgRatios] = useState<Record<string, number>>({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: colorScheme intentionally triggers re-measure
  useEffect(() => {
    const measure = () => {
      const primaryEls = primaryOnBgRef.current?.querySelectorAll<HTMLLIElement>("[data-bg-step]");

      if (primaryEls?.length) {
        const next: Record<string, number> = {};
        primaryEls.forEach((el) => {
          const step = el.getAttribute("data-bg-step");
          if (step) {
            const bg = getComputedStyle(el).backgroundColor;
            const fg = getComputedStyle(el).color;
            next[step] = getWcagContrastRatio(fg, bg);
          }
        });
        setPrimaryOnBgRatios(next);
      }
    };

    const raf = requestAnimationFrame(() => {
      measure();
    });
    return () => cancelAnimationFrame(raf);
  }, [colorScheme]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Fixed Palette Viewer</h1>
            <p className={styles.subtitle}>
              sienna accent + warm neutrals. Fixed palette - no longer customizable.
            </p>
          </div>
          <div className={styles.themeControl}>
            <span className={styles.themeLabel}>Theme</span>
            <CustomToggleGroup.Root
              type="single"
              value={colorScheme}
              onValueChange={(value) => {
                if (value) setColorScheme(value as "system" | "light" | "dark");
              }}
              variant="segmented"
              className={styles.themeToggle}
              aria-label="Color scheme"
            >
              <CustomToggleGroup.Item value="system">System</CustomToggleGroup.Item>
              <CustomToggleGroup.Item value="light">Light</CustomToggleGroup.Item>
              <CustomToggleGroup.Item value="dark">Dark</CustomToggleGroup.Item>
            </CustomToggleGroup.Root>
          </div>
        </div>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.back}>
            ← Back to app
          </Link>
          <Link to="/style-matrix" className={styles.back}>
            Style matrix
          </Link>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="sienna-heading">
        <h2 id="sienna-heading" className={styles.sectionTitle}>
          sienna Accent (<code>--color-sienna-*</code>)
        </h2>
        <p className={styles.sectionNote}>Hero color at 400. Hue ~39° (orange-brown).</p>
        <ul className={styles.swatchGridFg}>
          {sienna_STEPS.map((step) => (
            <li
              key={step}
              className={styles.swatch}
              style={{ background: `var(--color-sienna-${step})` }}
            >
              <span className={styles.label}>{step}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="neutral-heading">
        <h2 id="neutral-heading" className={styles.sectionTitle}>
          Warm Neutrals (<code>--color-neutral-*</code>)
        </h2>
        <p className={styles.sectionNote}>
          Cream (light end) to chocolate (dark end). Hue shifts 75→25.
        </p>
        <ul className={styles.swatchGridBg}>
          {NEUTRAL_STEPS.map((step) => (
            <li
              key={step}
              className={styles.swatch}
              style={{ background: `var(--color-neutral-${step})` }}
            >
              <span className={styles.label}>{step}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="layer-stack-heading">
        <h2 id="layer-stack-heading" className={styles.sectionTitle}>
          Layer stack: Body → Canvas → Surface → Panel → Input → Hover
        </h2>
        <p className={styles.sectionNote}>
          Semantic background tokens. Uses light-dark() for automatic theme switching.
        </p>
        <div className={styles.layerStack}>
          {LAYER_TOKENS.reduceRight(
            (child, layer) => (
              <div
                key={layer.id}
                className={styles.layerBox}
                style={{ background: `var(${layer.var})` }}
              >
                <span className={styles.layerLabel}>{layer.label}</span>
                {child}
              </div>
            ),
            null
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="button-states-heading">
        <h2 id="button-states-heading" className={styles.sectionTitle}>
          Button states (Primary & Secondary)
        </h2>
        <p className={styles.sectionNote}>
          Same buttons on different bg layers to verify token layering.
        </p>
        {BUTTON_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className={styles.buttonStatesStrip}
            style={{ background: `var(${layer.var})` }}
          >
            <span className={styles.buttonStatesLayerLabel}>{layer.label}</span>
            <div className={styles.buttonStatesRow}>
              <span className={styles.buttonStyleLabel}>Primary</span>
              <ul className={styles.buttonSamples}>
                {BUTTON_STATES.map((state) => (
                  <li key={state.id} className={styles.buttonSampleWrap}>
                    <span
                      className={`${styles.buttonSample} ${styles.buttonSamplePrimary}`}
                      data-state={state.id}
                      aria-hidden
                    >
                      Label
                    </span>
                    <span className={styles.buttonStateLabel}>{state.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.buttonStatesRow}>
              <span className={styles.buttonStyleLabel}>Secondary</span>
              <ul className={styles.buttonSamples}>
                {BUTTON_STATES.map((state) => (
                  <li key={state.id} className={styles.buttonSampleWrap}>
                    <span
                      className={`${styles.buttonSample} ${styles.buttonSampleSecondary}`}
                      data-state={state.id}
                      aria-hidden
                    >
                      Label
                    </span>
                    <span className={styles.buttonStateLabel}>{state.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="contrast-heading">
        <h2 id="contrast-heading" className={styles.sectionTitle}>
          Contrast check: text-primary on surfaces
        </h2>
        <p className={styles.sectionNote}>
          Goal: primary text (--text-primary) ≥ {WCAG_AA_RATIO}:1 (AA) on all surfaces.
        </p>
        <ul ref={primaryOnBgRef} className={styles.swatchGridFg}>
          {LAYER_TOKENS.map((layer) => (
            <li
              key={layer.id}
              className={styles.swatchFgOnBg}
              data-bg-step={layer.id}
              style={{
                background: `var(${layer.var})`,
                color: "var(--text-primary)",
              }}
            >
              <span className={styles.fgOnBgLabel}>Aa</span>
              <span className={styles.layerName}>{layer.label}</span>
              {primaryOnBgRatios[layer.id] !== undefined && (
                <span
                  className={styles.ratio}
                  title={meetsAa(primaryOnBgRatios[layer.id]) ? "Meets AA" : "Below AA"}
                >
                  {primaryOnBgRatios[layer.id].toFixed(1)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
