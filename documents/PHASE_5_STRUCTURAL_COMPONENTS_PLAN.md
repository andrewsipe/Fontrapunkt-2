# Phase 5: Create Structural Components — Plan

**Goal:** Extract repeated structural patterns so features stay thin and consistent. Phase 5 is **optional** (2–3 hours). Focus: formalize **PanelHeader** (already exists as TitleBar) and introduce a reusable **LabelRow** component; apply in 2–3 places and validate.

**Reference:** START_HERE.md Phase 5, GRANULAR_REFACTORING_GUIDE.md iteration order step 3–4.

---

## Scope

### What already exists

- **TitleBar** (`components/TitleBar/`) — Two variants: **panel** (icon + title + optional ResetButton) and **section** (heading + optional border). Already used as the panel header in VariableAxesPanel, TextControls, SampleTextPanel, OpenTypeFeaturesPanel, ColorPanel.
- **SectionHeader** (`components/SectionHeader/`) — Thin wrapper over TitleBar variant "section". Used in SettingsModal, FontInfoTab for section titles (Appearance, General, etc.).
- **LabelGroup** (`components/LabelGroup/`) — Icon + children (e.g. Label). Used inside label rows but does not include the full row (label + suffix + reset).

### What Phase 5 adds

1. **PanelHeader (formalize)** — Treat TitleBar variant "panel" as the canonical panel header. Optionally add a small **PanelHeader** wrapper or barrel export for discoverability; no new UI.
2. **LabelRow (new component)** — A single row: (optional icon + Label + optional suffix) on the left, optional ResetButton (or custom right slot) on the right. Shared CSS for flex, gap, and `:has([data-icon-container])` font-size. Use in **LabeledControl** and **TwoLayerSliderWithLayout**; identify a 3rd usage if easy.

---

## Part A: Formalize PanelHeader

**Current state:** TitleBar with `variant="panel"` is already the structural panel header. All sidebar panels use it.

**Options (pick one):**

### A1. Document only (minimal)

- Add a short note in GRANULAR_REFACTORING_GUIDE.md or in TitleBar’s JSDoc: “TitleBar variant='panel' is the canonical PanelHeader for sidebar panels.”
- No code changes.

### A2. Named export / alias (discoverability)

- Add `components/PanelHeader/` with `PanelHeader.tsx` that forwards to TitleBar with `variant="panel"` and a restricted prop set (title, icon, onReset, etc.), plus `index.ts`.
- Or add `export { TitleBar as PanelHeader }` from TitleBar with a JSDoc: “Use as PanelHeader in panels.”
- Update 0–2 panel features to import PanelHeader instead of TitleBar if you want consistency; otherwise leave imports as TitleBar.

**Recommendation:** A1 (document only) unless you want a dedicated PanelHeader name in the tree; then A2 with a thin wrapper.

---

## Part B: LabelRow component

### B1. Pattern to capture

Repeated structure today:

- **LabeledControl:** `<div className={labelRow}>` → LabelGroup (icon + Label + suffixLabel) + ResetButton; then control below.
- **TwoLayerSliderWithLayout:** `<div className={labelRow}>` → LabelGroup (icon + Label + suffixLabel) + ResetButton; then slider group.

Shared behavior:

- Row: flex, justify-content space-between, align-items center, gap.
- Left: LabelGroup (optional icon) + Label (variant configurable) + optional suffix (e.g. value/unit).
- Right: optional ResetButton (or render prop / children for custom right content).
- CSS: `labelRow`, `labelRow:has([data-icon-container]) { font-size: var(--text-xs) }`, `labelRow [data-label] { margin-bottom: 0; line-height: 1 }`.

### B2. API (proposed)

```tsx
// components/LabelRow/LabelRow.tsx
export interface LabelRowProps {
  label: string;
  icon?: IconComponent;
  suffixLabel?: React.ReactNode;
  onReset?: () => void;
  resetTooltip?: string;
  resetAriaLabel?: string;
  disabled?: boolean;
  labelVariant?: LabelVariant;
  /** Custom right content instead of ResetButton (e.g. link, badge). */
  right?: React.ReactNode;
  className?: string;
  children?: never; // LabelRow is the row only; parent puts control below
}
```

- If `onReset` is set, render ResetButton on the right; otherwise render `right` if provided.
- Use LabelGroup + Label (from primitives) + suffix; reuse existing ResetButton from features/Button.

### B3. Files to add

- `components/LabelRow/LabelRow.tsx` — Implementation.
- `components/LabelRow/LabelRow.module.css` — `.labelRow`, `.labelRow:has([data-icon-container])`, `.labelRow [data-label]`, optional `.suffixLabel` if needed.
- `components/LabelRow/index.ts` — `export { LabelRow } from "./LabelRow";`

### B4. Refactor LabeledControl

- Replace the inner label row div + LabelGroup + Label + suffixLabel + ResetButton with `<LabelRow label={...} icon={...} suffixLabel={...} onReset={...} ... />`.
- Keep the outer `.root` and `.control` wrapper; children still go in `.control`.
- Remove `.labelRow` (and any label-row-specific rules) from LabeledControl.module.css; rely on LabelRow’s CSS.

### B5. Refactor TwoLayerSliderWithLayout

- Replace the label row div + LabelGroup + Label + suffixLabel + ResetButton with `<LabelRow ... />`.
- Keep `.container`, `.sliderGroup`, `.sliderContainer`; the row is the only part replaced.
- Remove `.labelRow` and related rules from TwoLayerSliderWithLayout.module.css (or keep a minimal wrapper class if needed for layout).

### B6. Optional 3rd usage

- Scan other features (e.g. VariableAxesPanel, OpenTypeFeaturesPanel, SampleTextPanel) for a label + reset row that matches the pattern. If one is a clear fit, refactor it to use LabelRow; otherwise stop at 2 usages.

### B7. Validation

- Build passes.
- Biome passes on touched files.
- Quick visual check: sidebar panels that use LabeledControl or TwoLayerSliderWithLayout look unchanged (same spacing, font-size, reset behavior).

---

## Execution order

1. **Part A** — Choose A1 or A2; implement (document and/or PanelHeader wrapper).
2. **Part B** — Create LabelRow (B2–B3), refactor LabeledControl (B4), refactor TwoLayerSliderWithLayout (B5), optional 3rd usage (B6), validate (B7).

---

## Checklist

**Part A**
- [x] PanelHeader formalized (document only: TitleBar JSDoc + GRANULAR_REFACTORING_GUIDE iteration order and Components list).
- [x] No regressions in panels that use TitleBar (no code changes).

**Part B**
- [x] LabelRow component created (TSX, CSS, index).
- [x] LabeledControl uses LabelRow; CSS trimmed.
- [x] TwoLayerSliderWithLayout uses LabelRow; CSS trimmed.
- [x] Optional B6: All usages addressed — no 3rd fit (VariableAxesPanel, SampleTextPanel, OpenTypeFeaturesPanel use TitleBar panel header with onReset, not the label-row pattern; NativeRangeSliderWithLayout is label+value+trailing, different pattern).
- [x] `npm run build` passes.
- [x] `npx biome check` passes on new/touched files.
- [x] Visual check: label rows unchanged in sidebar.

---

## Success criteria

- **PanelHeader:** Clear that TitleBar (panel) is the panel header; optional PanelHeader name in codebase.
- **LabelRow:** One shared component for “label row + optional reset”; used in at least 2 places; no duplicated label-row layout/CSS in those files.
- **Quality:** Type-safe props, accessible (ResetButton aria-label/tooltip), consistent with existing design tokens (e.g. `--text-xs` for rows with icons).

---

## Out of scope for Phase 5

- Changing SectionHeader (already a thin wrapper; no need to touch).
- Refactoring every panel to use LabelRow (only 2–3 places; validate pattern first).
- New primitives (e.g. Track) or FormField changes; those can follow in a later pass.
