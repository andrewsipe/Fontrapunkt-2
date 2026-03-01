---
name: css-oklch-modules
description: OKLCH colors, container queries, and CSS Modules for Fontrapunkt. Use when writing or reviewing CSS, adding colors, making components responsive, or styling with variables. Biome is used for all linting (including CSS); no Stylelint or ESLint.
---

# CSS: OKLCH, Container Queries, Modules (Fontrapunkt)

Fontrapunkt uses OKLCH for colors, container queries for component-level responsiveness, and CSS Modules for scoped styles. Biome handles all linting and formatting (including CSS); no Stylelint or ESLint.

## When to Apply

- Writing or editing `.module.css` or global styles
- Adding or changing colors
- Making components responsive
- Referencing design tokens in `src/styles/` (e.g. `tokens.css`, `tokens.color.css`)

## OKLCH

- **All colors in OKLCH** for perceptual uniformity.
- **Variables**: Use CSS custom properties from the token system (e.g. `var(--accent-primary)`, `var(--text-1)`).
- **New colors**: Prefer existing variables; if adding new ones, explain lightness/chroma and keep light/dark compatibility.
- **Quick reference**: Accent `oklch(65% 0.2 var(--accent-hue))`; text `oklch(20% 0 0)` / `oklch(95% 0 0)`; bg `oklch(98% 0 0)` / `oklch(15% 0 0)`.

## Container Queries

- **Prefer `@container` over `@media`** for component-level responsive design.
- **Units**: Use `cqi` for fluid spacing and typography inside containers.
- **Examples**: Spacing `clamp(1rem, 2cqi, 1.5rem)`; typography `clamp(1rem, 3cqi + 0.5rem, 2rem)`.

## CSS Modules

- **Scope**: One module per component; avoid global leakage.
- **Import**: `import styles from './Component.module.css'`.
- **Usage**: Reference classes via `styles.className`; avoid inline styles except for dynamic values (e.g. `--custom-property`).
- **Features**: Use `clamp()`, `color-mix()`, logical properties where appropriate.

## Linting

- Biome is used for all linting (including CSS); address Biome warnings before delivery.
- Keep OKLCH and container-query usage consistent with existing codebase.
