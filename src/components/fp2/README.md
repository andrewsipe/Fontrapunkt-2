# FP2 — Fontrapunkt 2.0 components

New and migrated UI for the 2.0 build. Legacy components stay in `components/` (layouts, features, etc.) until replaced.

## Token system

FP2 uses the design token system. Ensure the app loads `tokens.css` (or the individual token files: foundation, palettes, color, typography, spacing, motion, elevation, components, icons).

- **Color:** `tokens.color.css` + `tokens.palettes.css` — semantic layers: `--bg-body` (main body), `--bg-canvas` (font surface), `--bg-surface`, `--bg-panel`, `--bg-hover`, `--bg-input` for containers; `--text-primary`, `--text-secondary`, `--text-tertiary` for content; `--border-subtle`, `--border-default`; accent and slider tokens from the same file. Palettes provide `-less` / `-more` steps where needed.
- **Spacing & radius:** `tokens.spacing.css` — `--space-*`, `--spacing-gap-tight`, `--radius-*`.
- **Type:** `tokens.typography.css` — `--text-2xs`, `--text-3xs`, `--text-xs`, `--text-sm`, `--font-ui`.
- **Shadows:** `tokens.elevation.css` — `--shadow-xs`, `--shadow-md`.

Shadows, overlays, and border standards may still be in progress; FP2 uses what’s available and can be updated when those tokens are finalized.

## Structure

- `FloatingCommandBar/` — command bar controls (size, weight, alignment, case, OpenType, Copy CSS).
- `FP2Header/` — font name + view strip (Plain, Waterfall, Styles, Glyphs, Present).
- `Fontrapunkt2Layout/` — shell layout (header + canvas + floating bar).
If the list grows, consider grouping by area (e.g. `fp2/layout/`, `fp2/bar/`, `fp2/header/`) or by feature.
