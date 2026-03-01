/**
 * Font feature utilities
 * Helper functions for building font-feature-settings strings
 */

/**
 * Browser default OpenType features that are enabled by default
 * These need to be explicitly disabled so user toggles work properly
 */
const BROWSER_DEFAULT_FEATURES = [
  "liga", // Standard ligatures
  "kern", // Kerning
  "calt", // Contextual alternates
  "clig", // Contextual ligatures
  "mark", // Mark positioning
  "mkmk", // Mark-to-mark positioning
] as const;

/**
 * Build font-feature-settings string that disables browser defaults
 * and applies user-enabled features
 *
 * @param enabledFeatures - Object mapping feature tags to enabled state
 * @returns CSS font-feature-settings string
 */
export function buildFeatureSettings(enabledFeatures?: Record<string, boolean>): string {
  const settings: string[] = [];

  // First, disable all browser defaults
  // This ensures that by default, all browser-default features are OFF
  BROWSER_DEFAULT_FEATURES.forEach((tag) => {
    settings.push(`"${tag}" 0`);
  });

  // Then, add user-enabled features (these override the disabled defaults)
  // Only add features that are explicitly set to true
  if (enabledFeatures) {
    Object.entries(enabledFeatures).forEach(([tag, enabled]) => {
      if (enabled === true) {
        settings.push(`"${tag}" 1`);
      }
      // If enabled is false or undefined, we don't add it (it stays disabled)
    });
  }

  // Always return a valid settings string (never "normal" which would enable browser defaults)
  return settings.join(", ");
}
