import { useEffect } from "react";
import {
  ACCENT_LIGHTNESS_GUARDRAIL,
  BASE_CHROMA_MULTIPLIERS,
  CONTRAST_RATIOS,
  TONE_SYSTEM,
} from "../constants/themeConstants";
import { useSettingsStore } from "../stores/settingsStore";
import {
  getTextOnAccentForBackground,
  getWcagContrastRatio,
  PURE_BLACK,
  PURE_WHITE,
} from "../utils/contrastUtils";

/** Build OKLCH CSS string for contrast checks (L 0–1, C, H 0–360). */
function oklchString(l: number, c: number, h: number): string {
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Single source of math for theme: base chroma and hue are computed here and
 * written to --base-chroma-* / --base-hue-*. The neutral palette (tokens.palettes.css)
 * uses those variables with no per-step chroma mult in CSS.
 *
 * Possible future: at neutral (tonePreference ≈ 0), inject a small "neutral intensity"
 * chroma and use accent hue so the neutral palette shows a subtle tint of the chosen
 * accent; the tone slider would then intensify toward cool/warm. When we address
 * accent tokens, we can add that path here (e.g. set base chroma/hue from accent
 * when |tonePreference| < threshold) and keep all chroma/hue math in this hook.
 */

export function useTheme() {
  const accentColor = useSettingsStore((state) => state.accentColor);
  const tonePreference = useSettingsStore((state) => state.tonePreference);
  const colorScheme = useSettingsStore((state) => state.colorScheme);

  useEffect(() => {
    const root = document.documentElement;

    // 1. Set Accent Hue
    root.style.setProperty("--user-accent-hue", accentColor.hue.toString());

    // 2. Derive Tone (Tailwind-style Neutrals)
    const safePreference =
      typeof tonePreference === "number" && !Number.isNaN(tonePreference) ? tonePreference : 0;

    let hueValue: number;
    let calculatedChroma: number;

    if (Math.abs(safePreference) < TONE_SYSTEM.NEUTRAL_THRESHOLD) {
      // PURE NEUTRAL (Tailwind "Neutral")
      hueValue = 0;
      calculatedChroma = 0;
    } else {
      // INTENSITY: map to [MIN_CHROMA, MAX_CHROMA] so low end stays above muddy
      const intensity = Math.abs(safePreference);
      calculatedChroma =
        TONE_SYSTEM.MIN_CHROMA + intensity * (TONE_SYSTEM.MAX_CHROMA - TONE_SYSTEM.MIN_CHROMA);

      // HUE SELECTION
      if (safePreference < 0) {
        // Sliding Left: Mimics Zinc -> Slate
        hueValue = TONE_SYSTEM.COOL_HUE;
      } else {
        // Sliding Right: Mimics Stone
        hueValue = TONE_SYSTEM.WARM_HUE;
      }
    }

    // 3. Apply Base Tone Variables
    root.style.setProperty("--base-hue-light", hueValue.toString());
    root.style.setProperty("--base-hue-dark", hueValue.toString());

    // Apply chroma with multipliers for light/dark
    root.style.setProperty(
      "--base-chroma-light",
      (calculatedChroma * BASE_CHROMA_MULTIPLIERS.LIGHT).toString()
    );
    root.style.setProperty(
      "--base-chroma-dark",
      (calculatedChroma * BASE_CHROMA_MULTIPLIERS.DARK).toString()
    );

    /* -----------------------------------------------------------
       Accent: guardrail clamps L per mode so picker can’t produce washed-out
       (light) or invisible (dark) accents. Stored value unchanged.
       ----------------------------------------------------------- */
    const lightnessLight = Math.min(accentColor.lightness, ACCENT_LIGHTNESS_GUARDRAIL.LIGHT_MAX);
    const lightnessDark = Math.max(accentColor.lightness, ACCENT_LIGHTNESS_GUARDRAIL.DARK_MIN);
    root.style.setProperty("--accent-chroma-light", accentColor.chroma.toString());
    root.style.setProperty("--accent-lightness-light", lightnessLight.toString());
    root.style.setProperty("--accent-chroma-dark", accentColor.chroma.toString());
    root.style.setProperty("--accent-lightness-dark", lightnessDark.toString());

    /* Text-on-accent: use guarded L per mode so contrast matches rendered accent. */
    const C = accentColor.chroma;
    const H = accentColor.hue;
    const minRatio = CONTRAST_RATIOS.AAA;

    const activeLightL = Math.max(0.1, lightnessLight - 0.12);
    const activeLightC = Math.min(0.4, C * 1.1);
    const activeDarkL = lightnessDark + 0.1;
    const activeDarkC = Math.min(0.4, C * 1.1);

    const activeLightStr = oklchString(activeLightL, activeLightC, H);
    const activeDarkStr = oklchString(activeDarkL, activeDarkC, H);
    const familyLight =
      getWcagContrastRatio(PURE_WHITE, activeLightStr) >= minRatio ? "light" : "dark";
    const familyDark =
      getWcagContrastRatio(PURE_WHITE, activeDarkStr) >= minRatio ? "light" : "dark";

    /* Default state: pure white or black (rich, exceeds threshold). No dialing. */
    const primaryTextLight = familyLight === "light" ? PURE_WHITE : PURE_BLACK;
    const primaryTextDark = familyDark === "light" ? PURE_WHITE : PURE_BLACK;

    root.style.setProperty("--text-on-accent-primary-light", primaryTextLight);
    root.style.setProperty("--text-on-accent-primary-dark", primaryTextDark);

    /* Hover/active: nuanced shade so text aligns with state effect (dimming, overlay). */
    root.style.setProperty(
      "--text-on-accent-hover-light",
      getTextOnAccentForBackground(
        Math.max(0.1, lightnessLight - 0.08),
        C,
        H,
        familyLight,
        minRatio,
        false
      )
    );
    root.style.setProperty(
      "--text-on-accent-active-light",
      getTextOnAccentForBackground(activeLightL, activeLightC, H, familyLight, minRatio, false)
    );
    root.style.setProperty(
      "--text-on-accent-hover-dark",
      getTextOnAccentForBackground(lightnessDark + 0.05, C, H, familyDark, minRatio, false)
    );
    root.style.setProperty(
      "--text-on-accent-active-dark",
      getTextOnAccentForBackground(activeDarkL, activeDarkC, H, familyDark, minRatio, false)
    );
  }, [accentColor, tonePreference]);

  // System theme listener
  useEffect(() => {
    if (colorScheme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      /* Force render if needed */
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorScheme]);
}
