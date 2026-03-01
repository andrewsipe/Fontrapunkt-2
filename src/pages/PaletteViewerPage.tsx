/**
 * Neutral palette viewer (token build only).
 * Displays --neutral-bg, --neutral-fg, semantic layer stack, and button matrix.
 * Use to hone the token system; main build adopts decisions refined here.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CustomToggleGroup } from "../components/components/ToggleGroup/CustomToggleGroup";
import { ACCENT_PRESETS } from "../constants/themeConstants";
import { useSettingsStore } from "../stores/settingsStore";
import { getWcagContrastRatio, meetsAa, WCAG_AA_RATIO } from "../utils/contrastUtils";
import styles from "./PaletteViewerPage.module.css";

/** 1 pure + 5 layers × (more, base, less) = 16 bg tokens */
const STEPS_BG: ReadonlyArray<string> = [
  "pure",
  "1-more",
  "1",
  "1-less",
  "2-more",
  "2",
  "2-less",
  "3-more",
  "3",
  "3-less",
  "4-more",
  "4",
  "4-less",
  "5-more",
  "5",
  "5-less",
];
const STEPS_FG = ["pure", 1, 2, 3, 4, 5] as const;

/** Semantic background tokens for layer stack and button matrix (Body → Canvas → Surface → Panel → Input → Hover) */
const LAYER_TOKENS = [
  { id: "body", label: "Body", var: "--bg-body" },
  { id: "canvas", label: "Canvas", var: "--bg-canvas" },
  { id: "surface", label: "Surface", var: "--bg-surface" },
  { id: "panel", label: "Panel", var: "--bg-panel" },
  { id: "input", label: "Input", var: "--bg-input" },
  { id: "hover", label: "Hover", var: "--bg-hover" },
] as const;

/** Button states to show for token evaluation (not exhaustive; enough to tune bg/fg/border) */
const BUTTON_STATES = [
  { id: "default", label: "Default" },
  { id: "hover", label: "Hover" },
  { id: "focus", label: "Focus" },
  { id: "active", label: "Active" },
  { id: "disabled", label: "Disabled" },
] as const;

/** Default accent (Ocean) — matches app default in settingsStore */
const DEFAULT_ACCENT = { hue: 240, chroma: 0.24, lightness: 0.55 };

/** Layers to place buttons on so we see how bg-# affects the same control */
const BUTTON_LAYERS = [
  { id: "body", label: "On Body", var: "--bg-body" },
  { id: "surface", label: "On Surface", var: "--bg-surface" },
  { id: "panel", label: "On Panel", var: "--bg-panel" },
] as const;

export function PaletteViewerPage() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const tonePreference = useSettingsStore((s) => s.tonePreference);
  const setTonePreference = useSettingsStore((s) => s.setTonePreference);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const setAccentColorFull = useSettingsStore((s) => s.setAccentColorFull);
  const primaryOnBgRef = useRef<HTMLUListElement>(null);
  const sameStepRef = useRef<HTMLUListElement>(null);
  const [primaryOnBgRatios, setPrimaryOnBgRatios] = useState<Record<string, number>>({});
  const [sameStepRatios, setSameStepRatios] = useState<Record<string, number>>({});

  // Re-measure contrast when theme (light/dark) changes. Defer to next frame so the
  // browser has applied the theme class and recomputed styles (avoids reading stale
  // values and fluctuating ratios in dark mode).
  // biome-ignore lint/correctness/useExhaustiveDependencies: colorScheme intentionally triggers re-measure
  useEffect(() => {
    const measure = () => {
      const primaryEls = primaryOnBgRef.current?.querySelectorAll<HTMLLIElement>("[data-bg-step]");
      const sameEls = sameStepRef.current?.querySelectorAll<HTMLLIElement>("[data-fg-step]");

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

      if (sameEls?.length) {
        const next: Record<string, number> = {};
        sameEls.forEach((el) => {
          const step = el.getAttribute("data-fg-step");
          if (step != null) {
            const bg = getComputedStyle(el).backgroundColor;
            const fg = getComputedStyle(el).color;
            next[step] = getWcagContrastRatio(fg, bg);
          }
        });
        setSameStepRatios(next);
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
            <h1 className={styles.title}>Neutral palettes</h1>
            <p className={styles.subtitle}>
              bg = 1 pure + 5 layers (more/base/less) · fg = 5 steps. Goal: primary on any bg ≥{" "}
              {WCAG_AA_RATIO}:1 (AA).
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

        <div className={styles.controlsRow}>
          <div className={styles.controlBlock}>
            <span className={styles.controlLabel}>Tone</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={tonePreference}
              onChange={(e) => setTonePreference(Number(e.target.value))}
              className={styles.toneSlider}
              aria-label="Tone preference (cool to warm)"
              aria-valuetext={
                tonePreference === 0
                  ? "Neutral"
                  : tonePreference < 0
                    ? `Cool ${Math.round(Math.abs(tonePreference) * 100)}%`
                    : `Warm ${Math.round(tonePreference * 100)}%`
              }
            />
            <span className={styles.controlValue}>
              {tonePreference === 0
                ? "Neutral"
                : tonePreference < 0
                  ? `Cool ${Math.round(Math.abs(tonePreference) * 100)}%`
                  : `Warm ${Math.round(tonePreference * 100)}%`}
            </span>
          </div>
          <div className={styles.controlBlock}>
            <span className={styles.controlLabel}>Accent</span>
            <fieldset className={styles.accentPresetRow} aria-label="Accent presets">
              <button
                type="button"
                className={styles.accentPresetBtn}
                style={{
                  backgroundColor: `oklch(${DEFAULT_ACCENT.lightness} ${DEFAULT_ACCENT.chroma} ${DEFAULT_ACCENT.hue})`,
                }}
                onClick={() =>
                  setAccentColorFull(
                    DEFAULT_ACCENT.hue,
                    DEFAULT_ACCENT.chroma,
                    DEFAULT_ACCENT.lightness
                  )
                }
                title="Default (240° Ocean)"
                aria-label="Accent Default (240° Ocean)"
              />
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={styles.accentPresetBtn}
                  style={{
                    backgroundColor: `oklch(${preset.lightness} ${preset.chroma} ${preset.hue})`,
                  }}
                  onClick={() => setAccentColorFull(preset.hue, preset.chroma, preset.lightness)}
                  title={preset.name}
                  aria-label={`Accent ${preset.name}`}
                />
              ))}
            </fieldset>
            <span className={styles.controlValue}>
              Hue {accentColor.hue}° · L {accentColor.lightness.toFixed(2)}
            </span>
          </div>
          <p className={styles.tintNote} aria-hidden>
            Accent tint (neutral + accent hue) — coming later.
          </p>
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

      <section className={styles.section} aria-labelledby="layer-stack-heading">
        <h2 id="layer-stack-heading" className={styles.sectionTitle}>
          Layer stack: Body → Canvas → Surface → Panel → Input → Hover
        </h2>
        <p className={styles.sectionNote}>
          Semantic background order. Dark: bg-1 → canvas → bg-2…bg-5. Light: darkest → lightest
          (tune mapping in tokens.color.css).
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
          Same buttons on different bg layers to see how tokens layer. Use to tune bg-#, fg-#,
          borders, and focus. Inspired by{" "}
          <a
            href="https://gui-challenges.web.app/buttons/dist/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.extLink}
          >
            GUI Challenges Buttons
          </a>
          .
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

      <section className={styles.section} aria-labelledby="bg-heading">
        <h2 id="bg-heading" className={styles.sectionTitle}>
          Background (<code>--neutral-bg-*</code>) — pure + 5 layers × more / base / less
        </h2>
        <ul className={styles.swatchGridBg}>
          {STEPS_BG.map((id) => (
            <li
              key={id}
              className={styles.swatch}
              style={{ background: `var(--neutral-bg-${id})` }}
            >
              <span className={styles.label}>{id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="fg-heading">
        <h2 id="fg-heading" className={styles.sectionTitle}>
          Foreground (<code>--neutral-fg-*</code>) — 5 steps: primary → disabled
        </h2>
        <ul className={styles.swatchGridFg}>
          {STEPS_FG.map((n) => (
            <li key={n} className={styles.swatch} style={{ background: `var(--neutral-fg-${n})` }}>
              <span className={styles.label}>{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="primary-on-bg-heading">
        <h2 id="primary-on-bg-heading" className={styles.sectionTitle}>
          Primary text on each background (<code>--neutral-fg-1</code> on{" "}
          <code>--neutral-bg-n</code>)
        </h2>
        <p className={styles.sectionNote}>
          Use fg-1 (primary) or fg-2 (secondary) on any bg. Ratios below: WCAG 2.1; goal ≥{" "}
          {WCAG_AA_RATIO}:1 (AA).
        </p>
        <ul ref={primaryOnBgRef} className={styles.swatchGridBg}>
          {STEPS_BG.map((id) => (
            <li
              key={id}
              className={styles.swatchFgOnBg}
              data-bg-step={id}
              style={{
                background: `var(--neutral-bg-${id})`,
                color: "var(--neutral-fg-1)",
              }}
            >
              <span className={styles.fgOnBgLabel}>Aa</span>
              {primaryOnBgRatios[id] !== undefined && (
                <span
                  className={styles.ratio}
                  title={meetsAa(primaryOnBgRatios[id]) ? "Meets AA" : "Below AA"}
                >
                  {primaryOnBgRatios[id].toFixed(1)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="fg-on-bg-heading">
        <h2 id="fg-on-bg-heading" className={styles.sectionTitle}>
          Same-step pairing (<code>--neutral-fg-n</code> on <code>--neutral-bg-n</code>) — 5 steps
        </h2>
        <p className={styles.sectionNote}>
          Reference only. Low contrast expected at higher steps; use fg-1 on bg-n for text.
        </p>
        <ul ref={sameStepRef} className={styles.swatchGridFg}>
          {STEPS_FG.map((n) => (
            <li
              key={n}
              className={styles.swatchFgOnBg}
              data-fg-step={n}
              style={{
                background: `var(--neutral-bg-${n})`,
                color: `var(--neutral-fg-${n})`,
              }}
            >
              <span className={styles.fgOnBgLabel}>Aa</span>
              {sameStepRatios[String(n)] !== undefined && (
                <span className={styles.ratio}>{sameStepRatios[String(n)].toFixed(1)}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
