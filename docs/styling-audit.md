# Fontrapunkt-2 Styling Consistency Audit

Component-by-component review of styling against the design system (`src/styles/tokens.css`). We check: token usage (OKLCH, spacing, typography, radius, transitions), focus/accessibility, container queries where relevant, and intentional vs accidental divergence. After the audit we’ll derive a single set of update/address actions.

**Audit order:** `components/` → `features/` → `fp2/` → `primitives/` (directory order within each).

**Reference:** Design tokens in `src/styles/tokens.css` (OKLCH, `light-dark()`, container-query spacing `cqi`, focus ring, state transitions, reduced motion).

---

## 1. Accordion

**Path:** `src/components/components/Accordion/`  
**Files:** `Accordion.tsx`, `Accordion.module.css`

### Token usage

- **Spacing:** `--space-xs`, `--space-sm`
- **Background:** `--bg-surface`, `--interactive-bg`, `--interactive-hover`, `--interactive-active`
- **Radius:** `--radius-md`
- **Typography:** `--font-ui`, `--text-secondary`
- **Focus:** `--border-focus` (outline)
- **State:** `--transition-state`, `--state-disabled-opacity`, `--state-disabled-cursor`, `--state-transition-pressed`
- **Motion:** `--ease-out`, `--ease-out-expo`, `--duration-normal`

No raw OKLCH or hex; no container queries in this file (spacing already cqi-based via tokens).

### Consistency

- All styling from design tokens.
- Hover/active/disabled use semantic tokens.
- Focus: `:focus-visible` with `outline: 2px solid var(--border-focus)`, `outline-offset: 2px`.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables transitions and active scale.
- Height animation uses `grid-template-rows: 0fr/1fr` with max-height fallback.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Trigger `cursor: auto`** | Low | Trigger is button-like but doesn’t use `cursor: pointer`. Align with other trigger/button components after audit. |
| **`.contentInner` padding** | Low | Only `padding-top: var(--space-xs)`; no horizontal/bottom. Content is full-width. Consider `padding-inline` / `padding-bottom` from spacing scale if panels should be consistent. |
| **Active state transition** | Cosmetic | `transform: scale(0.98)` uses its own transition; `--transition-state` already includes transform. Fine as-is. |

**Verdict:** Aligned with design system. Optional: standardize cursor and content padding after reviewing other components.

---

## 2. Checkbox

**Path:** `src/components/components/Checkbox/`  
**Files:** `Checkbox.tsx`, `Checkbox.module.css`

### Token usage

- **Spacing:** `--space-sm`
- **Background/border:** `--bg-input`, `--border-default`, `--accent-primary`, `--accent-hover`, `--text-on-accent`
- **Typography:** `--text-sm`, `--text-primary`
- **Focus:** `--border-focus`, `--state-focus-ring-opacity` (box-shadow with `oklch(from var(--border-focus) ...)`)
- **State:** `--transition-state`, `--state-disabled-opacity`, `--state-disabled-cursor`

No raw hex; relative color for focus ring. Fixed size 1.125rem for the box.

### Consistency

- Tokens only for colors and typography. Checkmark via mask + `--text-on-accent`.
- Focus-visible: outline none + border + box-shadow (accessible).
- Disabled uses semantic tokens.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **`cursor: auto`** | Low | On `.label` and `.input`. Align with cursor convention after audit. |
| **Reduced motion** | Low | No `prefers-reduced-motion` for checkbox; transitions are subtle. Optional: add. |

**Verdict:** Aligned. Optional: cursor convention, reduced motion.

---

## 3. Collapsible

**Path:** `src/components/components/Collapsible/`  
**Files:** `CustomCollapsible.tsx`, `CustomCollapsible.module.css`

### Token usage

- **Spacing:** `--space-xs`, `--space-sm`
- **Background/border:** `--bg-surface`, `--border-default`, `--interactive-hover`, `--interactive-active`
- **Radius:** `--radius-md`
- **Text:** `--text-primary`, `--text-secondary`
- **Focus:** `--border-focus`
- **State:** `--transition-state`, `--state-disabled-opacity`, `--state-disabled-cursor`
- **Motion:** `--ease-out`, `--state-transition-pressed`
- **Custom:** `--collapsible-panel-height` (used in keyframes)

### Consistency

- Ghost/card variants; card uses tokens. Focus-visible and disabled states correct.
- Reduced motion: animation none, overflow visible.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **`--collapsible-panel-height`** | Low | Set by Base UI at runtime (not in tokens). Document or add fallback in tokens.components.css if needed. |
| **Trigger `cursor: auto`** | Low | Same as Accordion; align with cursor convention. |

**Verdict:** Aligned. Document runtime token; cursor convention.

---

## 4. ControlGroup

**Path:** `src/components/components/ControlGroup/`  
**Files:** `ControlGroup.tsx`, `ControlGroup.module.css`

### Token usage

- **Spacing:** `--space-md`, `--space-xs`
- **Colors:** `--text-tertiary`, `--text-primary`, `--accent-primary`, `--border-focus`
- **State:** `--state-disabled-cursor`, `--state-disabled-opacity`, `--transition-colors`
- **Radius:** `--radius-sm`

### Consistency

- Layout and typography from tokens. Label hover/focus and disabled group state correct.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Label `cursor: auto`** | Low | Align with cursor convention for clickable labels. |

**Verdict:** Aligned.

---

## 5. ErrorMessage

**Path:** `src/components/components/ErrorMessage/`  
**Files:** `ErrorMessage.tsx`, `ErrorMessage.module.css`

### Token usage

- **Spacing:** `--space-md`, `--space-sm`, `--space-xs`
- **Semantic:** `--danger-bg`, `--danger`, `--text-primary`, `--text-secondary`, `--border-default`, `--interactive-hover`
- **Typography:** `--text-sm`, `--text-xs`
- **Radius:** `--radius-md`
- **Icon:** `--icon-size-md`
- **State:** `--transition-state`, `--state-disabled-opacity`, `--state-disabled-cursor`
- **Relative color:** `oklch(from var(--danger) calc(l - 0.1) c h)` for retry hover

### Consistency

- Error styling uses semantic danger tokens. Layout and typography token-based.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Retry button `color: white`** | Medium | Hardcoded; should use `--text-on-accent` or a dedicated token for text on danger. |
| **No focus-visible on buttons** | Medium | `.retryButton` and `.dismissButton` lack `:focus-visible` outline/ring. |
| **Buttons `cursor: auto`** | Low | Align with cursor convention. |

**Verdict:** Fix retry text color and add focus-visible for buttons; then aligned.

---

## 6. FormField

**Path:** `src/components/components/FormField/`  
**Files:** `FormField.tsx`, `FormField.module.css`

### Token usage

- **Spacing:** `--space-xs`, `--space-3xs`, `--space-2xs`
- **Typography:** `--text-xs`, `--text-sm`
- **Colors:** `--text-secondary`, `--danger`

### Consistency

- Minimal layout and typography; error/hint/required use tokens. Label from LabelRow/Label primitive.

### Divergences / follow-up

- None material. `.error::before` uses character "⚠" for icon; fine.

**Verdict:** Aligned.

---

## 7. IconContainer

**Path:** `src/components/components/IconContainer/`  
**Files:** `IconContainer.tsx`, `IconContainer.module.css`

### Token usage

- **Spacing:** `--space-sm`
- **Background/color:** `--interactive-bg`, `--interactive-hover`, `--interactive-active`, `--text-secondary`, `--text-primary`
- **Radius:** `--radius-md`
- **Typography:** `--text-sm`, `--text-xs`, `--text-base`, `--text-lg`
- **Focus:** `--border-focus`
- **State:** `--control-height`, `--duration-fast`, `--ease-out`, `--state-disabled-opacity`, `--state-disabled-cursor`, `--shadow-sm`
- **Motion:** Reduced motion disables transition.

### Consistency

- Static vs interactive; interactive matches ToggleGroup item height and states. Focus-visible and disabled correct.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **`cursor: default` (static) / `cursor: auto` (interactive)** | Low | Align with cursor convention for buttons. |

**Verdict:** Aligned.

---

## 8. LabelGroup

**Path:** `src/components/components/LabelGroup/`  
**Files:** `LabelGroup.tsx`, `LabelGroup.module.css`

### Token usage

- **Spacing:** `--space-xs`
- **Color:** `--text-secondary`

### Consistency

- Minimal flex layout; tokens only.

**Verdict:** Aligned.

---

## 9. LabelRow

**Path:** `src/components/components/LabelRow/`  
**Files:** `LabelRow.tsx`, `LabelRow.module.css`

### Token usage

- **Spacing:** `--space-xs`
- **Typography:** `--text-xs`
- **Colors:** `--accent-primary`, `--icon-size-label`

### Consistency

- Row layout and icon/label context from tokens. Composes Label and LabelGroup.

**Verdict:** Aligned.

---

## 10. LabelWithPopover

**Path:** `src/components/components/LabelWithPopover/`  
**Files:** `LabelWithPopover.tsx`, `LabelWithPopover.module.css`

### Token usage

- Popover content: `--space-sm`, `--text-sm`, `--text-xs`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--leading-snug`, `--leading-relaxed`

### Consistency

- Label from Label primitive; popover content uses typography and spacing tokens.

**Verdict:** Aligned.

---

## 11. LivePulseIcon

**Path:** `src/components/components/LivePulseIcon/`  
**Files:** `LivePulseIcon.tsx`, `LivePulseIcon.module.css`

### Token usage

- **Spacing:** `--space-xs`
- **Colors:** `--text-tertiary`, `--success`, `--danger` (with fallback oklch in var())
- **Motion:** 200ms ease-out hardcoded; `cubic-bezier(0.36, 0.11, 0.89, 0.32)` for animation

### Consistency

- Semantic states (active/inactive/failed) use token + fallback. Decorative (role="img"), no focus needed.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **No reduced motion for pulse** | Low | `pulseRipple` runs regardless of `prefers-reduced-motion`. Consider disabling or simplifying when reduced. |
| **Hardcoded 200ms** | Cosmetic | Could use `var(--duration-fast)` / `var(--ease-out)` for transitions. |

**Verdict:** Aligned; optional reduced motion and duration token.

---

## 12. LoadingSpinner

**Path:** `src/components/components/LoadingSpinner/`  
**Files:** `LoadingSpinner.tsx`, `LoadingSpinner.module.css`

### Token usage

- **Border:** `--border-subtle`, `--accent-primary`
- **Radius:** `--radius-full`
- **Duration:** `--duration-slower`
- **Reduced motion:** duration set to 1.5s (still animates)

### Consistency

- Colors and duration from tokens. Accessible label in srOnly.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Reduced motion** | Low | tokens.motion.css uses 0.01ms for animations in reduced-motion; here spinner is 1.5s. Decide: near-disable (0.01ms) vs “slower” (1.5s). |
| **Sizes 16/24/32px** | Cosmetic | Could use `--icon-size-sm`, `--icon-size-lg`, `--icon-size-xl` for consistency. |

**Verdict:** Aligned; optional reduced-motion and size tokens.

---

## 13. Modal

**Path:** `src/components/components/Modal/`  
**Files:** `Modal.tsx`, `Modal.module.css`

### Token usage

- **Overlay:** `--overlay-medium`, `--z-modal-backdrop`, `--duration-normal`, `--ease-out`
- **Content:** `--bg-body` (from tokens.color.css), `--radius-lg`, `--shadow-2xl`, `--z-modal`
- **Layout/typography:** `--space-lg`, `--space-xl`, `--space-md`, `--space-xs`, `--text-lg`, `--text-sm`, `--text-primary`, `--text-secondary`
- **Border:** `--border-default`
- **Close button:** `--interactive-hover`, `--interactive-active`, `--border-focus`, `--transition-state`, `--state-transition-pressed`, `--ease-out`
- **Reduced motion:** transitions disabled; overlay/content shown without scale/opacity animation

### Consistency

- Sizes (standard/wide/full) use % and max-width. Focus-visible on close button. Backdrop blur 6px (hardcoded).

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Close button `cursor: auto`** | Low | Align with cursor convention. |

**Verdict:** Aligned.

---

## 14. Popover

**Path:** `src/components/components/Popover/`  
**Files:** `Popover.tsx`, `Popover.module.css`

### Token usage

- **Trigger/close:** `--text-secondary`, `--text-primary`, `--bg-hover`, `--interactive-active`, `--border-focus`, `--space-xs`, `--radius-sm`, `--transition-colors`, `--transition-state`, `--state-disabled-*`
- **Content:** `--bg-surface`, `--border-width-default`, `--border-default`, `--shadow-lg`, `--z-popover`, `--space-md`, `--radius-md`, `--duration-normal`, `--ease-out-expo`, `--ease-out`
- **Close button:** fixed 24×24px

### Consistency

- Matches Modal/Select look. Focus-visible and reduced motion on content.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Trigger and close `cursor: auto`** | Low | Align with cursor convention. |

**Verdict:** Aligned.

---

## 15. SectionHeader

**Path:** `src/components/components/SectionHeader/`  
**Files:** `SectionHeader.tsx`, `SectionHeader.module.css`

### Token usage

- **Spacing:** `--space-sm`, `--space-xs`
- **Border:** `--border-default` (1px)

### Consistency

- Minimal; tokens only.

**Verdict:** Aligned.

---

## 16. Select

**Path:** `src/components/components/Select/`  
**Files:** `Select.tsx`, `Select.module.css`

### Token usage

- Full set: spacing, bg, border, text, focus, state, shadow, radius, z-index, typography.
- **Container query:** `@container sidebar-container (max-width: 260px)` for compact trigger.
- **Custom:** `--select-trigger-width` (optional)

### Consistency

- Variants (default/compact), viewport, items, groups, separators all token-based. Focus-visible on trigger and items (item uses accent inset ring). Reduced motion.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Trigger and item `cursor: auto`** | Low | Align with cursor convention. |

**Verdict:** Aligned.

---

## 17. Separator

**Path:** `src/components/components/Separator/`  
**Files:** `Separator.tsx`, `Separator.module.css`

### Token usage

- **Color:** `--border-default`
- **Orientation:** data-orientation horizontal/vertical; 1px size

### Consistency

- Tokens only; no focus (non-interactive).

**Verdict:** Aligned.

---

## 18. Tabs

**Path:** `src/components/components/Tabs/`  
**Files:** `Tabs.tsx`, `Tabs.module.css`

### Token usage

- **Spacing:** `--space-md`, `--space-sm`, `--space-xs`
- **Colors/state:** `--text-secondary`, `--text-primary`, `--accent-primary`, `--accent-bg`, `--interactive-bg`, `--border-focus`, `--state-disabled-opacity`, `--state-disabled-cursor`, `--state-transition-pressed`
- **Typography:** `--text-xs`, `--font-ui`
- **Radius:** `--radius-md`, `--radius-full`
- **Motion:** `--transition-state`, `--duration-normal`, `--ease-out`
- **Relative color:** `oklch(from var(--accent-primary) l c h / var(--state-disabled-opacity))` for disabled active
- **Container:** `@container (max-width: 280px)` for list gap

### Consistency

- Underline/pill/ghost variants. Focus-visible and reduced motion. Content visibility/height transitions.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Trigger `cursor: auto`** | Low | Align with cursor convention. |
| **`border-bottom-width: 2px` and pill `!important`** | Cosmetic | Intentional for underline; document if needed. |

**Verdict:** Aligned.

---

## 19. TitleBar

**Path:** `src/components/components/TitleBar/`  
**Files:** `TitleBar.tsx`, `TitleBar.module.css`

### Token usage

- **Spacing:** `--space-xl`, `--space-lg`, `--space-xs`, `--space-sm`
- **Border:** `--border-width-default`, `--border-default`
- **Typography:** `--text-xs`, `--tracking-wide`, `--text-primary`, `--icon-size-header`
- **Colors:** `--accent-primary`, `--border-focus`, `--bg-panel`
- **Motion:** `--duration-fast`, `--ease-out`
- **Container:** `@container (max-width: 280px)` for panel header

### Consistency

- Panel vs section variants; focus-visible on panel title text. Reduced motion on transition.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **`.panelTitleText` `cursor: auto`** | Low | Align with cursor convention for clickable titles. |

**Verdict:** Aligned.

---

## 20. Toast

**Path:** `src/components/components/Toast/`  
**Files:** `Toast.tsx` (placeholder), README.md

### Token usage

- N/A: toasts use **react-hot-toast**; container styling via **`shared.standardToast`** in `src/styles/shared.module.css`. No component CSS in this folder.

**Verdict:** N/A — audit shared.standardToast when reviewing global/shared styles.

---

## 21. ToggleGroup

**Path:** `src/components/components/ToggleGroup/`  
**Files:** `CustomToggleGroup.tsx`, `CustomToggleGroup.module.css`

### Token usage

- **Layout:** `--radius-md`, `--radius-tight-from-md`, `--spacing-gap-tight`, `--border-width-default`, `--border-default`, `--z-toggle-divider`, `--z-toggle-active`
- **Item:** `--control-height`, `--space-sm`, `--space-md`, `--space-xs`, `--text-secondary`, `--text-primary`, `--accent-primary`, `--text-on-accent`, `--interactive-hover`, `--border-focus`, `--state-disabled-*`, `--shadow-sm`, `--duration-fast`, `--ease-out`, `--state-transition-pressed`, `--icon-size-control`
- **Relative color:** disabled pressed uses `oklch(from var(--accent-primary) ...)` and same for text
- **Container:** `@container (max-width: 280px)` for item padding/font

### Consistency

- Segmented vs discrete; focus-visible and reduced motion. Nested tooltip wrapper supported.

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Item `cursor: auto`** | Low | Align with cursor convention. |

**Verdict:** Aligned.

---

## 22. Tooltip

**Path:** `src/components/components/Tooltip/`  
**Files:** `Tooltip.tsx`, `TooltipButton.tsx`, `SliderTooltip.tsx`, `Tooltip.module.css`

### Token usage

- **Content:** `--bg-panel`, `--text-primary`, `--space-xs`, `--space-sm`, `--radius-md`, `--text-xs`, `--shadow-md`, `--border-width-default`, `--border-default`, `--z-tooltip`
- **Arrow:** fill and stroke from same tokens

### Consistency

- Popup and arrow use design tokens. Non-interactive content; trigger styling lives in TooltipButton or parent.

### Divergences / follow-up

- None. (Arrow uses `stroke-width`; SVG attribute is `stroke-width`, valid in CSS for SVG.)

**Verdict:** Aligned.

---

## 23. TwoLayerSlider

**Path:** `src/components/components/TwoLayerSlider/`  
**Files:** `TwoLayerSlider.tsx`, `TwoLayerSliderWithLayout.tsx`, `TwoLayerSlider.module.css`, `TwoLayerSliderWithLayout.module.css`

### Token usage

- **Root/track:** `--control-height`, `--space-xs`, `--bg-surface`, `--radius-md`, `--slider-track-inset`, `--border-width-thick`, `--border-default`, `--slider-value-bg`, `--accent-primary`, `--duration-expand`, `--ease-expand`, `--ease-retract`, `--duration-retract`, `--duration-fast`, `--ease-out`, `--shadow-sm`, `--z-slider-thumb`, `--z-dropdown`
- **State:** `--state-disabled-opacity`, `--state-disabled-cursor`
- **Layout:** `--slider-thumb-width`, `--slider-thumb-expanded-width`, etc. from tokens
- **Color-mix:** `color-mix(in srgb, var(--accent-primary) 20%, transparent)` for precision highlight

### Consistency

- Slider tokens and layout variables; disabled overlay and pointer-events. Cursor on track is auto (slider drag context).

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **Track `cursor: auto`** | Low | Slider track often uses default/auto; align with cursor convention if desired. |

**Verdict:** Aligned.

---

## Cross-cutting patterns and inconsistencies

These patterns appear across multiple components; fixing them will make styling more consistent.

### 1. Focus ring: outline-offset (1px vs 2px)

- **2px:** Accordion, Collapsible, Modal close, Tabs, IconContainer, TitleBar, ControlGroup, ToggleGroup item.
- **1px:** Select trigger, Popover trigger, Popover close.

**Recommendation:** Pick one (e.g. 2px for consistency with most components) and apply everywhere, or document when to use 1px (e.g. tight trigger in dropdowns).

### 2. Focus ring: style (outline vs glow vs accent)

- **Solid outline, `--border-focus`:** Most triggers and buttons (Accordion, Collapsible, Modal, Popover, Select trigger, Tabs, ToggleGroup, IconContainer, TitleBar, ControlGroup).
- **Glow (no outline, box-shadow):** Checkbox uses `outline: none`, `border-color: var(--border-focus)`, `box-shadow: 0 0 0 3px oklch(from var(--border-focus) l c h / var(--state-focus-ring-opacity))`.
- **Accent inset:** Select *items* use `outline: 2px solid var(--accent-primary)`, `outline-offset: -2px` (inside the item).
- **Outline + extra box-shadow:** IconContainer adds both outline and `0 0 0 2px var(--border-focus)` + `var(--shadow-sm)`.

So we have four treatments: (a) outline only, (b) glow only (checkbox), (c) accent inset (select items), (d) outline + shadow (IconContainer). (c) and (d) may be intentional for context; (a) vs (b) is inconsistent for form-like controls.

### 3. Hover background token: `--bg-hover` vs `--interactive-hover`

Variables define both; `--state-hover-bg` points to `--interactive-hover` for interactive elements.

- **`--interactive-hover`:** Accordion, Collapsible, Modal close, IconContainer, ToggleGroup, ErrorMessage dismiss, ExportButtons, ScreenshotPreviewModal; OpenTypeFeaturesPanel (partial); EmptyState, CategorySection; SettingsModal; FontSelector (partial).
- **`--bg-hover`:** Popover trigger/close, Select trigger/item hover; OpenTypeFeaturesPanel (one spot); SampleTextPanel, CategoryNavigation, GlyphsView, FP2Header, Toast, FontSelector, FontSourceTab; OpenTypeDrawer, VariableAxesDrawer.

Same intent (hover state on controls/triggers) is styled with two different tokens. Design-system-wise, interactive controls should use **`--interactive-hover`**; `--bg-hover` is the generic surface hover. Recommendation: use `--interactive-hover` for buttons, triggers, and clickable items; reserve `--bg-hover` for non-button hover (e.g. list rows, tiles) or align and document.

### 4. Active/pressed scale (0.98 vs 0.95)

- **scale(0.98):** Accordion, Collapsible, Tabs, Select trigger, Popover trigger, ToggleGroup, IconContainer, Modal close, OpenTypeFeaturesPanel, ExportButtons, ScreenshotPreviewModal.
- **scale(0.95):** Popover close button, NativeRangeSlider thumb, EmptyState button.

Most use 0.98; a few use 0.95 (Popover close, one slider, one CTA). Recommendation: standardize on 0.98 for buttons/triggers unless a design reason exists for 0.95 (e.g. smaller close control).

### 5. Explicit border-radius on focus

Some components set `border-radius` on `:focus-visible` so the outline matches the control shape (Tabs, ToggleGroup, ControlGroup label, TitleBar). Others rely on the element’s existing radius. Inconsistent only in that it’s not applied everywhere; adding radius on focus where the control is rounded is a good pattern to apply consistently.

### 6. Reduced motion: degree of reduction

- **Full disable (no transition / 0.01ms):** tokens, Accordion, Collapsible, Modal, Popover, Select, Tabs, TitleBar, ToggleGroup, IconContainer.
- **Slower, not disabled:** LoadingSpinner uses `animation-duration: 1.5s` instead of stopping.
- **No reduction:** LivePulseIcon pulse animation always runs.

So we have “fully respect” vs “partially respect” vs “ignore”. Recommendation: document one rule (e.g. “always disable or reduce to &lt;100ms”) and apply to spinner and LivePulseIcon.

### 7. Transition property set

Most use `--transition-state` or `--transition-colors`. IconContainer interactive uses a custom pair: `background-color` and `color` with `--duration-fast` and `--ease-out` (no transform in the base transition; transform is added on active). So we have “full state” vs “colors only”; both are valid but the mix is inconsistent. Optional: standardize on `--transition-state` for all interactive controls that have hover/active/transform.

---

## Pending (to be filled as we audit)

- [x] Accordion
- [x] Checkbox
- [x] Collapsible
- [x] ControlGroup
- [x] ErrorMessage
- [x] FormField
- [x] IconContainer
- [x] LabelGroup
- [x] LabelRow
- [x] LabelWithPopover
- [x] LivePulseIcon
- [x] LoadingSpinner
- [x] Modal
- [x] Popover
- [x] SectionHeader
- [x] Select
- [x] Separator
- [x] Tabs
- [x] TitleBar
- [x] Toast (N/A – react-hot-toast + shared)
- [x] ToggleGroup
- [x] Tooltip
- [x] TwoLayerSlider
- [x] features/Button
- [x] features/ColorPanel
- [x] features/ExportButtons
- [x] features/FontDetailsModal
- [x] features/FontInfoModal
- [x] features/FontSelector
- [x] features/GlyphCountBadge
- [x] features/HeaderControls
- [x] features/LiveSyncIndicator
- [x] features/OKLCHPicker
- [x] features/OpenTypeFeaturesPanel
- [x] features/SampleTextPanel
- [x] features/ScreenshotPreviewModal
- [x] features/SettingsModal
- [x] features/TextControls
- [x] features/VariableAxesPanel
- [x] features/ViewSelector
- [x] fp2/DropZone
- [x] fp2/EmptyState
- [x] fp2/FP2Header
- [x] fp2/FloatingCommandBar
- [x] fp2/FontCanvas
- [x] fp2/Fontrapunkt2Layout
- [x] fp2/LoadingSpinner
- [x] fp2/OpenTypeDrawer
- [x] fp2/VariableAxesDrawer
- [x] fp2/modals/*
- [x] fp2/views/*
- [x] primitives/Icon
- [x] primitives/Label
- [x] primitives/NativeRangeSlider

---

## Primitives

### 24. Icon

**Path:** `src/components/primitives/Icon/`  
**Files:** `Icon.tsx`, `Icon.module.css`

### Token usage

- None. Purely structural: `display: inline-flex`, `align-items: center`, `justify-content: center`, `width: 1em`, `height: 1em`, `flex-shrink: 0`. SVG fills container.

### Consistency

- Icon is a pass-through; size comes from parent (e.g. `--icon-size-header`, `--icon-size-label`, `--icon-size-control`). No colors or spacing in the primitive. `aria-hidden` and `data-icon` for semantics.

### Divergences / follow-up

- None. No design tokens required; parent controls context.

**Verdict:** Aligned (minimal primitive).

---

### 25. Label

**Path:** `src/components/primitives/Label/`  
**Files:** `Label.tsx`, `Label.module.css`

### Token usage

- **Transition/state:** `--transition-state`, `--text-tertiary`, `--state-disabled-opacity`, `--state-disabled-cursor`
- **Typography:** `--text-xs`, `--text-2xs`, `--text-sm`, `--tracking-wide`, `--leading-tight`
- **Colors:** `--text-secondary`, `--text-primary`

All variants (default, small, section, form, keyValue) use tokens only.

### Consistency

- Typography-only; parent controls layout. Disabled state uses `data-disabled` and semantic tokens. Focus is handled by parent (e.g. LabelWithPopover, ControlGroup) when the label is a trigger.

### Divergences / follow-up

- None.

**Verdict:** Aligned.

---

### 26. NativeRangeSlider

**Path:** `src/components/primitives/NativeRangeSlider/`  
**Files:** `NativeRangeSlider.tsx`, `NativeRangeSliderWithLayout.tsx`, `NativeRangeSlider.module.css`

### Token usage

- **Track/border:** `--radius-full`, `--radius-md`, `--border-width-default`, `--border-subtle`, `--bg-input`, `--slider-track`
- **Thumb:** `--icon-size-md`, `--icon-size-sm`, `--border-width-thick`, `--neutral-overlay-20`, `--neutral-overlay-15`, `--space-3xs`, `--space-xs`, `--space-sm`, `--z-slider-thumb`, `--duration-fast`, `--ease-out`
- **Layout/label:** `--text-xs`, `--tracking-wide`, `--text-secondary`, `--leading-tight`, `--font-mono`, `--space-xs`

### Consistency

- Solid track uses `--bg-input` and `--slider-track` (Mozilla). Label row and value text use typography tokens. Hue and tone variants use fixed OKLCH gradients by design (spectrum/tone visualization).

### Divergences / follow-up

| Item | Severity | Notes |
|------|----------|--------|
| **No `:focus-visible`** | Medium | Native range input has `outline: none` and no focus ring. Keyboard users need a visible focus indicator (e.g. outline or box-shadow using `--border-focus`). |
| **Hardcoded `.wrapper` gap** | Low | `gap: 2px`; could use `var(--space-2xs)` or `var(--spacing-gap-tight)` for consistency. |
| **Thumb border/shadow** | Intentional | Thumb uses `border: solid white` and neutral overlays for shadow; design system has `--slider-thumb` for the custom TwoLayerSlider. Native range uses a different treatment (white ring) for picker sliders; document or leave as-is. |
| **Active scale 0.95** | Cosmetic | Matches Popover close / EmptyState; cross-audit already notes 0.98 vs 0.95. |
| **No reduced motion** | Low | Thumb has `transition: transform` and hover/active scale; no `prefers-reduced-motion` override. |
| **Fixed heights 12px / 8px** | Low | Track height not from tokens; could add `--slider-native-track-height` if we want consistency with tokens. |
| **`cursor: auto`** | Low | Same pattern as other controls; align with cursor convention. |

**Verdict:** Mostly aligned. Add focus-visible for accessibility; optionally tokenize wrapper gap, track height, and reduced motion.

---

## Features

### 27. Button

**Path:** `src/components/features/Button/` (feature wrappers) and `src/components/components/Button/` (shared primitive).

- **Feature Button** (CloseButton, ResetButton, etc.): Compose **IconContainer** or other primitives; no feature-level CSS.
- **Shared Button** (`components/components/Button/`): Wraps [Base UI Button](https://base-ui.com/react/components/button). Used by **IconContainer** (interactive without tooltip) and **TooltipButton** so icon/tooltip triggers get `data-disabled`, `focusableWhenDisabled`, and one place to swap behavior. Styling remains in IconContainer.module.css; Button is behavior-only. Other `<button>` usages (ExportButtons, ErrorMessage, etc.) can migrate to this Button over time for consistency.

**Verdict:** N/A for feature CSS; shared Button added and wired into IconContainer + TooltipButton.

---

### 28. ColorPanel

**Path:** `src/components/features/ColorPanel/`  
**Files:** `ColorPanel.tsx`, `ColorPanel.module.css`

**Token usage:** `--space-md`, `--space-sm`, `--text-sm`, `--text-secondary`, `--font-mono`, `--border-focus` (in focus box-shadow). **Divergence:** `.hexInput:focus` uses box-shadow with `0.1` opacity (not `var(--state-focus-ring-opacity)`); uses `:focus` not `:focus-visible`. **Verdict:** Add `:focus-visible` and use token for focus ring opacity.

---

### 29. ExportButtons

**Path:** `src/components/features/ExportButtons/`  
**Files:** `ExportButtons.tsx`, `ExportButtons.module.css`

**Token usage:** Full set (spacing, interactive-*, border-focus, accent, state-disabled, transition-state). Focus-visible 2px outline; hover uses `--interactive-hover`. **Divergence:** `cursor: auto`. **Verdict:** Aligned.

---

### 30. FontDetailsModal

**Path:** `src/components/features/FontDetailsModal/`  
**Files:** `FontDetailsModal.tsx`, `FontInfoTab.module.css`, `FontSourceTab.module.css` (modal chrome uses Modal component).

**FontInfoTab:** Tokens only; layout and typography consistent. **Verdict:** Aligned.

**FontSourceTab:** Tokens for colors, spacing, scrollbar, semantic badges. **Divergences:** `.tableHeader` / `.definitionTrigger` `cursor: auto`; `.specBadge` / `.statusBadge` use `padding: 2px 6px` (could use `var(--space-2xs)` / `var(--space-xs)`). **Verdict:** Mostly aligned.

---

### 31. FontInfoModal

**Path:** `src/components/features/FontInfoModal/`  
**Files:** `FontInfoModal.tsx`, `FontInfoModal.module.css`

**Token usage:** `--space-sm`, `--space-md`, `--space-lg`, `--text-lg`, `--text-base`, `--text-primary`, `--leading-normal`. Typography-only layout. **Verdict:** Aligned.

---

### 32. FontSelector

**Path:** `src/components/features/FontSelector/`  
**Files:** `FontSelector.tsx`, `FontSelector.module.css`

**Token usage:** Spacing, typography, bg-surface, interactive-bg/hover, border-default, shadow, z-index. Container query for narrow width. **Divergences:** `.fontInfoButton:hover` uses `--bg-hover` (use `--interactive-hover` for button hover per cross-audit). `.optionButton:disabled` uses `opacity: 0.5` and `cursor: not-allowed` — should use `--state-disabled-opacity` and `--state-disabled-cursor`. No `:focus-visible` on `.fontInfoButton`, `.closeButton`, or `.optionButton`. **Verdict:** Fix hover token, disabled token, and add focus-visible.

---

### 33. GlyphCountBadge

**Path:** `src/components/features/GlyphCountBadge/`  
**Files:** `GlyphCountBadge.tsx`, `GlyphCountBadge.module.css`

**Token usage:** `--text-sm`, `--font-mono`, `--text-primary`, `--border-default`, `--bg-body`, `--space-3xs`, `--space-lg`, `--radius-md`, `--opacity-subtle`. **Verdict:** Aligned.

---

### 34. HeaderControls

**Path:** `src/components/features/HeaderControls/`  
**Files:** `HeaderControls.tsx`, `HeaderControls.module.css`

**Token usage:** None in CSS (one rule: `.swatchBookButton { flex-shrink: 0; }`). Layout only. **Verdict:** Aligned.

---

### 35. LiveSyncIndicator

**Path:** `src/components/features/LiveSyncIndicator/`  
**Files:** `LiveSyncIndicator.tsx`, `LiveSyncIndicator.module.css`

**Token usage:** `--success-bg`, `--success`, `--shadow-sm`, `--z-toast`, `--icon-size-xs`, `--space-md` (in keyframe). **Divergences:** Fixed values: `top: 1rem`, `right: 1rem`, `gap: 0.5rem`, `padding: 0.5rem 0.75rem`, `border-radius: 0.5rem`, `font-size: 0.75rem`; `.pulseDot` uses `--color-success, #22c55e` (hex fallback); `.label` uses `letter-spacing: 0.05em` (could use `--tracking-wide`). No `:focus-visible` (fixed toast-like element). No `prefers-reduced-motion` for `pulseDot` animation. **Verdict:** Tokenize spacing/size where possible; add reduced motion for pulse; document or replace hex fallback.

---

### 36. OKLCHPicker

**Path:** `src/components/features/OKLCHPicker/`  
**Files:** `OKLCHPickerPanel.tsx`, `OKLCHPickerPanel.module.css`

**Token usage:** Spacing, radius, border, bg-input, neutral-black/white (with fallbacks), swatch-bg, text-*, font-mono, control-height. **Divergences:** `.hexInputField:focus` has `outline: none` only — no visible focus ring. `.hexWrap` uses `gap: 2px` (could use `var(--space-2xs)` or `var(--spacing-gap-tight)`). **Verdict:** Add focus-visible for hex input; optionally tokenize gap.

---

### 37. OpenTypeFeaturesPanel

**Path:** `src/components/features/OpenTypeFeaturesPanel/`  
**Files:** `OpenTypeFeaturesPanel.tsx`, `OpenTypeFeaturesPanel.module.css`

**Token usage:** Full set for panel, feature items, popover, tags. **Divergences:** `.popoverTag` uses `--bg-subtle` (not defined in tokens — use `--bg-input` or add token). `.infoIcon:focus-visible` uses `outline-offset: 1px` (inconsistent with 2px elsewhere). `.checkbox` 16×16px hardcoded; `.featureTag` `opacity: 0.7` (could use `--opacity-subtle`). **Verdict:** Replace or define `--bg-subtle`; align outline-offset; optional token for checkbox size and tag opacity.

---

### 38. SampleTextPanel

**Path:** `src/components/features/SampleTextPanel/`  
**Files:** `SampleTextPanel.tsx`, `SampleTextPanel.module.css`

**Token usage:** Spacing, typography, borders, bg-panel, interactive-hover, accent, border-focus, state-disabled. **Divergences:** `.tab` and `.resetBtn` use `transition: … 0.15s` (hardcoded; use `var(--duration-fast)` or `--transition-colors`). `.tab` uses `cursor: pointer` (only feature with pointer — fine). `.optionCard:focus-visible` uses `oklch(… / 0.25)` instead of `var(--state-focus-ring-opacity)`. **Verdict:** Use duration/focus-opacity tokens for consistency.

---

### 39. ScreenshotPreviewModal

**Path:** `src/components/features/ScreenshotPreviewModal/`  
**Files:** `ScreenshotPreviewModal.tsx`, `ScreenshotPreviewModal.module.css`

**Token usage:** Spacing, bg-surface, border, shadow, text-*, font-mono, radius, transition-state, border-focus. **Divergences:** `.button` uses `--accent-oklch` and `--accent-hover-oklch` (not in tokens — use `--accent-primary` / `--accent-hover` or add tokens). `.buttonSecondary` uses `--bg-subtle` (not in tokens). `.button:disabled` uses `opacity: 0.5` and `cursor: not-allowed` — use `--state-disabled-opacity` and `--state-disabled-cursor`. **Verdict:** Replace undefined tokens with design-system tokens; fix disabled state.

---

### 40. SettingsModal

**Path:** `src/components/features/SettingsModal/`  
**Files:** `SettingsModal.tsx`, `SettingsModal.module.css`, sections, `AccentPresetGrid.module.css`

**Token usage:** Overlay, bg-body, spacing, typography, borders, interactive-*, danger/success, shadow, radius, state-disabled (for defaultTextInput). **Divergences:** `.select:focus-visible` uses `--accent-primary` (rest of app uses `--border-focus` for triggers — align or document). `.closeButton:hover` uses `--interactive-bg` (should be hover state, e.g. `--interactive-hover`). No `:focus-visible` on `.closeButton`. `.toneSliderTicks` and `.tick` use `color: red; background-color: red` (debug styling — remove or replace with token). `.dangerButton`, `.settingsToggleButton`, `.advancedTrigger` use `cursor: auto`. **Verdict:** Fix Select focus token, closeButton hover/focus; remove debug red; align cursor.

**AccentPresetGrid:** Tokens; `.presetSwatch:hover` uses `border-color: white` (hardcoded). **Verdict:** Minor; optional token for white border.

---

### 41. TextControls

**Path:** `src/components/features/TextControls/`  
**Files:** `TextControls.tsx`, `TextControls.module.css`

**Token usage:** Spacing, font-icons, border-subtle, accent-primary, text-on-accent, icon-size-control. Layout and icon typography from design system. **Divergence:** `.letterSpacingIcon` uses `gap: 2px`; `.divider` / `.toolbarDivider` use `height: 20px` (could use token). **Verdict:** Aligned; optional tokenize gap/height.

---

### 42. VariableAxesPanel

**Path:** `src/components/features/VariableAxesPanel/`  
**Files:** `VariableAxesPanel.tsx`, `VariableAxesPanel.module.css`, `AxisSlider.tsx`, `AxisSlider.module.css`

**Token usage:** Spacing, typography, border. Layout only; Select and sliders from other components. **Verdict:** Aligned.

---

### 43. ViewSelector

**Path:** `src/components/features/ViewSelector/`  
**Files:** `ViewSelector.tsx`, `ViewSelector.module.css`

**Token usage:** `--space-sm`, `--space-3xs`, `--text-2xs`, `--tracking-wide`, `--text-secondary`, `--leading-tight`. Buttons from CustomToggleGroup. **Verdict:** Aligned.

---

## fp2

### 44. DropZone

**Path:** `src/components/fp2/DropZone/`  
**Files:** `DropZone.tsx`, `DropZone.module.css`

**Token usage:** `--space-sm`, `--space-xl`, `--space-xs`, `--bg-surface`, `--border-default`, `--radius-xl`, `--shadow-xl`, `--text-xl`, `--text-base`, `--text-sm`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--border-width-thin`, `--space-3xs`, `--z-dropzone`. **Relative color:** `oklch(from var(--accent-primary) l c h / 0.75)` for overlay. **Verdict:** Aligned.

---

### 45. EmptyState

**Path:** `src/components/fp2/EmptyState/`  
**Files:** `EmptyState.tsx`, `EmptyState.module.css`

**Token usage:** Full set including `--hero-font-family`, `--hero-logo-stack`, `--hero-logo-drop`, `--button-primary-*` (from tokens.components.css), `--interactive-bg`, `--interactive-hover`, `--accent-hover`, `--border-focus`, `--state-disabled-*`. Reduced motion for hero animation. **Divergences:** `.iconButton` uses fixed 32×32px and `transform: scale(0.95)` on active (cross-audit 0.98 vs 0.95). **Verdict:** Aligned.

---

### 46. FP2Header

**Path:** `src/components/fp2/FP2Header/`  
**Files:** `FP2Header.tsx`, `FP2Header.module.css`

**Token usage:** Spacing, typography, bg-surface, bg-panel, bg-hover, border-subtle, accent-primary, text-on-accent, border-focus, spacing-gap-tight. **Divergences:** `.badge` uses `padding: 2px 8px` (could use `var(--space-2xs)` / `var(--space-sm)`). `.iconBtn` fixed 32×32, svg 18×18. Hardcoded `0.15s` / `0.04em` / `0.03em` instead of duration/tracking tokens. **Verdict:** Mostly aligned; optional tokenize padding and duration.

---

### 47. FloatingCommandBar

**Path:** `src/components/fp2/FloatingCommandBar/`  
**Files:** `FloatingCommandBar.tsx`, `FloatingCommandBar.module.css`

**Token usage:** Spacing, border-subtle, slider-*, accent-primary, bg-panel, text-*, border-focus, z-popover. **Divergences:** `.slider` fixed width 88px, height 6px; thumb 14×14px (could use tokens). `.slider::-moz-range-thumb` uses `--text-primary` for fill (design system uses `--slider-value-bg`). `.sectionDivider` height 24px. `.toggleBtn` / `.iconBtn` fixed 32×28; `.iconBtn svg` 16×16. Hardcoded `0.15s` transitions. **Verdict:** Mostly aligned; align Mozilla slider fill with `--slider-value-bg`; optional tokenize sizes.

---

### 48. FontCanvas

**Path:** `src/components/fp2/FontCanvas/`  
**Files:** `FontCanvas.tsx`, `FontCanvas.module.css`

**Token usage:** `--canvas-bg` (with `--bg-canvas` fallback), `--z-canvas`. **Divergences:** `transition: filter 0.15s ease-out` hardcoded; flash animation 0.15s. **Verdict:** Aligned; optional duration token.

---

### 49. Fontrapunkt2Layout

**Path:** `src/components/fp2/Fontrapunkt2Layout/`  
**Files:** `Fontrapunkt2Layout.tsx`, `Fontrapunkt2Layout.module.css`

**Token usage:** Spacing, bg-surface, bg-canvas, border-subtle, shadow-md, radius-lg. **Divergences:** `.barSlot` uses `bottom: 15%`, `min-height: 60px` (fixed). `.exitHint` tokens. **Verdict:** Aligned.

---

### 50. LoadingSpinner (fp2)

**Path:** `src/components/fp2/LoadingSpinner/`  
**Files:** Same pattern as `components/components/LoadingSpinner` (tokens, reduced motion 1.5s). **Verdict:** Same as components audit; consider consolidating to single LoadingSpinner source.

---

### 51. OpenTypeDrawer / 52. VariableAxesDrawer

**Path:** `src/components/fp2/OpenTypeDrawer/`, `VariableAxesDrawer/`  
**Files:** Each has `*.module.css` (nearly identical).

**Token usage:** bg-surface, border-default, shadow-xl, z-drawer, space-md, radius-sm, text-secondary, border-focus. **Divergences:** `.closeBtn` fixed 32×32, `font-size: 24px`; `transition: all 0.15s`. No reduced motion for `slideIn` / `slideInRight` animations. **Verdict:** Aligned; add reduced motion for drawer animation; optional tokenize close button size.

---

### 53. fp2/modals (SettingsModal, FontDetailsModal, FontInfoModal, SampleTextModal)

**SettingsModal:** Mirrors features/SettingsModal (tokens, overlay, bg-body, sections). Same divergences: Select focus uses `--accent-primary`; closeButton hover `--interactive-bg`; toneSliderTicks debug red (if present in fp2 copy). **AccentPresetGrid:** Tokens; presetSwatch hover `border-color: white`. **FontDetailsModal (FontInfoTab, FontSourceTab):** Token-based; same notes as features FontDetailsModal. **FontInfoModal:** Typography tokens only. **SampleTextModal:** Minimal (max-height, overflow). **Verdict:** Aligned with same follow-ups as features SettingsModal; remove debug red if present in fp2.

---

### 54. fp2/views/GlyphsView (main)

**Path:** `src/components/fp2/views/GlyphsView/GlyphsView.module.css`

**Token usage:** bg-surface, space-*, border-default, bg-input, text-*, accent-primary, border-focus, touch-target-min, icon-size-sm, transition-colors, z-sticky. **Divergences:** `.searchInput` border `0.5px` (use `--border-width-default` or thin). `.filterToggle` / `.categoryToggle` use `cursor: auto`. **Verdict:** Aligned.

---

### 55. fp2/views/GlyphsView/CategorySection

**Path:** `src/components/fp2/views/GlyphsView/CategorySection.module.css`

**Token usage:** Spacing, bg-surface, border-default, radius-md, interactive-hover, accent-primary, border-focus, transition-state, text-*. Uses `--accordion-panel-height` in keyframes (runtime-set by Base UI). **Divergences:** `.categoryHeader` `cursor: auto`. **Verdict:** Aligned.

---

### 56. fp2/views/GlyphsView/CategoryNavigation

**Path:** `src/components/fp2/views/GlyphsView/CategoryNavigation.module.css`

**Token usage:** Partial — scrollbar and list use tokens (`--space-xs`, `--bg-panel`, `--border-default`, `--text-*`, `--accent-*`, `--success-*`, `--font-mono`). **Divergences (high):** `.navigation` uses `#fff`, `#ddd`, `12px`; `.toggleButton` uses `12px`, `16px`, `14px`, `#333`, `#eee`; `.toggleButton:focus-visible` uses `#0066cc`; `.categoryList::-webkit-scrollbar` `width: 8px`. Most of the nav container and toggle button are hex/fixed px, not design tokens. **Verdict:** Not aligned — refactor to use tokens tokens (bg-surface, border-default, text-primary, border-focus, spacing, radius).

---

### 57. fp2/views/GlyphsView/GlyphCard

**Path:** `src/components/fp2/views/GlyphsView/GlyphCard.module.css`

**Token usage:** Only `--glyph-*` (font-family, font-size, etc.) and transition. **Divergences (high):** Card and content use `#fff`, `#ddd`, `#333`, `#666`, `#0066cc`, `rgba(0,0,0,0.1)`, `12px`, `24px`, `16px`, `4px`, `60px`; focus/active/copied use `#0066cc`, `#0a0`, `#f0fff0`. Disabled uses `opacity: 0.5`, `cursor: not-allowed` instead of state tokens. **Verdict:** Not aligned — refactor to design tokens (bg-surface, border-default, text-primary, text-secondary, accent-primary, border-focus, success-*, state-disabled-*, spacing/radius).

---

### 58. fp2/views/GlyphsView/VirtualizedGlyphGrid

**Path:** `src/components/fp2/views/GlyphsView/VirtualizedGlyphGrid.module.css`

**Token usage:** `--cell-padding`, `--loading-padding` (with fallback), `--space-sm`, `--text-secondary`, `--text-sm`. **Verdict:** Aligned.

---

### 59. fp2/views/StylesView

**Path:** `src/components/fp2/views/StylesView/StylesView.module.css`

**Token usage:** bg-canvas, space-*, bg-surface, border-default, accent-primary, text-on-accent, border-focus, success-*, style-sample-* (custom), opacity-subtle. **Verdict:** Aligned.

---

### 60. fp2/views/PresentView

**Path:** `src/components/fp2/views/PresentView/PresentView.module.css`

**Token usage:** space-md, space-2xs, text-tertiary, duration-fast, ease-out. Reduced motion for exitHint. **Divergences:** `opacity: 0.4` / `0.7` / `0.5` (could use opacity token). **Verdict:** Aligned.

---

### 61. fp2/views/PlainView

**Path:** `src/components/fp2/views/PlainView/PlainView.module.css`

**Token usage:** space-lg, space-sm, text-secondary. **Divergences:** `0.15s ease-out` hardcoded. **Verdict:** Aligned.

---

### 62. fp2/views/WaterfallView

**Path:** `src/components/fp2/views/WaterfallView/WaterfallView.module.css`

**Token usage:** `--waterfall-font-size`, `--waterfall-font-family`, `--waterfall-color`, etc. (custom); `--text-secondary` in emptyState. **Divergences (medium):** `padding: 32px`, `gap: 24px`, `16px`, `14px`, `#f5f5f5`, `#666`, `#333` — fixed px and hex. **Verdict:** Not aligned — replace with spacing/typography/color tokens.

---

## Post-audit: Actions

### Done (easy wins – implemented)

- **ErrorMessage:** Retry button uses semantic token `var(--text-on-danger)` (added to tokens.color.css and tokens); `:focus-visible` for `.retryButton` and `.dismissButton`.
- **SettingsModal (features + fp2):** Removed debug red on `.toneSliderTicks` / `.tick` (now `var(--text-tertiary)` + `var(--opacity-subtle)`). CloseButton hover → `--interactive-hover`.
- **ScreenshotPreviewModal:** `--accent-oklch`/`--accent-hover-oklch` → `--accent-primary`/`--accent-hover`; `--bg-subtle` → `--bg-panel`; disabled → state tokens.
- **FontSelector:** Hover token, disabled state tokens, `:focus-visible` on fontInfoButton, closeButton, optionButton.
- **OpenTypeFeaturesPanel:** `--bg-subtle` → `--bg-input` for `.popoverTag`.
- **NativeRangeSlider:** Added `:focus-visible` with `--border-focus`.
- **ColorPanel:** `.hexInput:focus` → `:focus-visible` and `var(--state-focus-ring-opacity)`.
- **OKLCHPicker:** Added `:focus-visible` for `.hexInputField`.
- **fp2 Drawers:** Added `prefers-reduced-motion` for slide animation.
- **Sliders (cursor):** NativeRangeSlider, TwoLayerSlider, FloatingCommandBar: use `cursor: ew-resize` (no grab) for track and thumb; TwoLayerSlider `.cursorGrab` → `ew-resize`.

### Applied (recommendations from Remaining)

- **Content padding:** Accordion `.contentInner` now uses `padding: var(--space-xs) var(--space-md) var(--space-md)` (panel inner token); fallback in `@supports` block updated.
- **Collapsible:** Added `--collapsible-panel-height: 300px` fallback in tokens with comment that Base UI overrides at runtime.
- **LoadingSpinner (components + fp2):** Reduced motion set to `animation-duration: 0.01ms`; sizes use `--icon-size-sm` / `--icon-size-md` / `--icon-size-lg`.
- **LivePulseIcon:** Pulse animation wrapped in `@media (prefers-reduced-motion: no-preference)`; reduced-motion state shows green fill, no animation; transitions use `var(--duration-fast)` and `var(--ease-out)`.
- **Focus outline-offset:** Select and Popover trigger/close set to 2px; OpenTypeFeaturesPanel `.infoIcon:focus-visible` set to 2px.
- **Focus border-radius:** Select trigger and Popover close `:focus-visible` use `border-radius: var(--radius-sm)` where applicable.
- **Active scale:** Popover close 0.95 → 0.98; NativeRangeSlider thumb active 0.95 → 0.98; EmptyState CTA kept 0.95 with comment "Intentional stronger feedback for CTA button".
- **Hover token / Reduced motion:** tokens comments added (--interactive-hover vs --bg-hover; reduced motion policy &lt;100ms).
- **NativeRangeSlider:** `.wrapper` gap → `var(--space-2xs)`; `--slider-track-height` added to tokens and used; `prefers-reduced-motion` disables thumb scale transition.
- **SettingsModal (features + fp2):** `.select:focus-visible` uses `--border-focus` instead of accent.
- **LiveSyncIndicator:** Spacing/size tokenized (`--space-md`, `--space-sm`, `--text-xs`, `--radius-md`); `.pulseDot` uses `var(--success)`; `prefers-reduced-motion` disables pulse animation; label letter-spacing → `var(--tracking-wide)`.
- **fp2 – CategoryNavigation:** Refactored to tokens (--bg-surface, --border-default, --text-primary, --border-focus, --interactive-hover, --space-*, --radius-md, --text-sm, --icon-size-sm, --text-2xs).
- **fp2 – GlyphCard:** Refactored to tokens (--bg-surface, --border-default, --text-primary, --text-secondary, --accent-primary, --success, --success-bg, --state-disabled-*, spacing/radius/duration); copied state uses semantic --success / --success-bg.
- **fp2 – WaterfallView:** Refactored to tokens (--bg-panel, --space-xl, --space-lg, --space-md, --text-sm, --font-mono, --text-secondary, --text-primary, --duration-fast, --ease-out).
- **fp2 – Drawers (OpenType + VariableAxes):** Close button uses `--icon-size-xl` and `--icon-size-md`; transition/animation use `var(--duration-fast)` and `var(--ease-out)`; `var(--transition-state)` for close hover.
- **fp2 – LoadingSpinner:** Already shares same tokens and reduced-motion policy as components/LoadingSpinner (icon sizes, 0.01ms).

### Design-system direction (decided)

- **Cursor:** Keep `cursor: auto` (or default) globally. Sliders: use **ew-resize** (no grab); implemented on all horizontal range sliders. Button-like triggers remain `auto` unless we standardize later.
- **4pt grid:** Adopt a **4-point grid** for spacing (margins, paddings, line-heights). Reference: [Webflow – Why we're using a 4-point grid](https://webflow.com/blog/why-were-using-a-4-point-grid-in-webflow). Use values divisible by 4 where practical; font size and glyph size are exceptions. Full implementation (spacing scale audit, token alignment) to follow.
- **Accessibility:** Follow **standard practice and Base UI guidance** (e.g. `:focus-visible`, reduced motion). Align to Base UI where something clearly violates that.
- **Tokens migration:** **tokens.\*.css** is the target core; **tokens** is to be phased out. Tokens are built from tokens. Prefer adding new decisions in tokens; avoid new design decisions only in tokens.

### Remaining (optional follow-ups)

- **Content padding:** Extend panel-inner token to Modal, Collapsible, Drawers, Popover content where still mixed (Accordion done).
- **Focus style:** Document in design-system that "outline only" is default and checkbox/IconContainer are intentional exceptions.
- **Focus border-radius:** Roll out matching radius on `:focus-visible` to any remaining components (e.g. Checkbox, list items) if not already matching.
- **fp2 – LoadingSpinner:** Optionally refactor to import and use `components/LoadingSpinner` instead of duplicate implementation (tokens and reduced motion already aligned).
