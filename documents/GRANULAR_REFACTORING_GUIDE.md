# Granular Refactoring Guide: Primitives, Components, Features, Containers, Layouts

**Purpose:** Shared terminology and a 5-level hierarchy for granularizing the UI. Use this to align language, classify existing pieces, and iterate with consistency.

**Related:** README "Primitives and components"; `documents/COMPONENT_INVENTORY.md` (component catalog).

---

## 1. The five levels (top to bottom)

| Level | Definition | Who owns | Naming |
|-------|------------|----------|--------|
| **Layout** | How top-level regions are arranged (sidebar left, canvas right, modals overlay). Structure of the page, not content. | Page / route | Descriptive: "sidebar-left", "presentation", "compact". |
| **Container** | A region that composes features and sets context (font-size, gap, alignment). No domain logic. | Layout or parent container | Region/role: Sidebar, Header, BottomBar, FontCanvas, Modal. |
| **Feature** | Domain-specific UI: knows about fonts, settings, actions. Composes components + primitives. | Product | Noun + purpose: TextControls, SampleTextPanel, VariableAxesPanel, ResetButton. |
| **Component** | Reusable building block: primitives + chrome (box, states) + a small set of variants. No domain logic. | Design system | Noun or compound: IconContainer, FormField, TooltipButton, RadixSelect. |
| **Primitive** | Smallest unit: one job, no chrome, no layout assumptions. | Design system | Single concept: Icon, (future: Label, Track). |

**Flow:** Layout arranges **containers**. Containers compose **features**. Features use **components**. Components use **primitives**.

**Directory structure:** `src/components/` is organized by tier: `primitives/`, `components/`, `features/`, `containers/`, `layouts/`. Import from the appropriate tier (e.g. `../../components/IconContainer/IconContainer`, `../../features/Button`). `UnusedComponents/` remains at the root of `components/` until migrated.

---

## 2. Definitions and rules (by level)

### Layout

- **What it is:** The arrangement of major regions (sidebar, canvas, header, bottom bar, modals). Can change per view mode (e.g. present vs edit) or per route.
- **Where it lives:** Named layout components in `layouts/` (e.g. DefaultLayout, PresentationLayout, CompactLayout) and shared layout CSS in `layouts/Layout.module.css`. MainApp selects layout; global layout-scoped styles (e.g. toast viewport) may remain in `App.css`.
- **Rule:** Layout does not contain domain logic or feature content; it only positions containers and applies layout classes (e.g. `collapsed`, `overlay-mode`).
- **Naming:** Use descriptive layout names when they become explicit (e.g. "default", "presentation", "compact").

### Container

- **What it is:** A region that wraps one or more features (or other containers). Sets context: font-size, spacing, alignment. Composes; does not implement business logic.
- **Rule:** If you move a container to another layout, it should still work; only its parent and CSS context may change.
- **Naming:** Region or role: `Sidebar`, `Header`, `BottomBar`, `FontCanvas`, `Modal` (base), `DropZone`. Not "SidebarPanel" for the whole sidebar—that's the Sidebar; panels inside are features.

### Feature

- **What it is:** UI that knows about the product: fonts, settings, export, reset, sample text, axes, color, OpenType. Composes components and primitives; owns semantics (aria-label, role) and domain handlers.
- **Rule:** Feature = component(s) + domain content + domain behavior. Keep features "thin" by pushing generic structure into components and primitives.
- **Naming:** Noun + purpose or domain: `TextControls`, `SampleTextPanel`, `VariableAxesPanel`, `ColorPanel`, `OpenTypeFeaturesPanel`, `ResetButton`, `FontSelector`, `ViewSelector`, `ExportButtons`.

### Component

- **What it is:** Reusable UI building block. Uses primitives; adds chrome (box, padding, border-radius) and variants (e.g. static vs interactive, size tokens). No domain logic.
- **Rule:** Variants are behavior or design tokens (e.g. `xs`/`sm`/`base`), not layout names (e.g. "sidebar" / "header"). Prefer context (parent sets font-size) over new variant props.
- **Naming:** Noun or compound: `IconContainer`, `FormField`, `TooltipButton`, `RadixSelect`, `RadixTabs`, `RadixAccordion`, `RadixPopover`, `RadixSeparator`, `Modal`, `Toast`, `CustomToggleGroup`, `LoadingSpinner`, `ErrorMessage`, `DropZone`, `SliderTooltip`, etc.

### Primitive

- **What it is:** Smallest unit. One responsibility; no chrome; no layout assumptions. Often presentational only (e.g. Icon renders at 1em).
- **Rule:** Can this be used in a different layout without changing the primitive? If not, it's likely a component or feature.
- **Naming:** Single concept: `Icon`. (Future candidates: `Label`, `Track` for sliders, etc.)

---

## 3. Current inventory (checklist)

Use this as a living checklist. Mark items as you refactor or confirm classification.

### Layouts

- [x] **DefaultLayout** — `layouts/DefaultLayout.tsx`. Sidebar + canvas + bottom bar; sidebar open/collapsed (no overlay).
- [x] **PresentationLayout** — `layouts/PresentationLayout.tsx`. Same structure with sidebar in overlay mode (present view).
- [x] **CompactLayout** — `layouts/CompactLayout.tsx`. Same structure with compact density (app--compact). Shared CSS: `layouts/Layout.module.css`.
- [ ] *(Add new layouts here as they are formalized.)*

### Containers

- [x] **Sidebar** — `containers/Sidebar/Sidebar.tsx` + `Sidebar.module.css` only. Composes FontSelector, TextControls, SampleTextPanel, VariableAxesPanel, ColorPanel, OpenTypeFeaturesPanel; footer with icon buttons. Shared sidebar styles in `src/styles/sidebar/SidebarShared.module.css`.
- [x] **Header** — `containers/Header/Header.tsx`. Title + global controls.
- [x] **BottomBar** — `containers/BottomBar/BottomBar.tsx`. Composes ViewSelector, ExportButtons.
- [x] **FontCanvas** — `containers/Canvas/FontCanvas.tsx`. Composes view features (PlainView, WaterfallView, StylesView, GlyphsView, PresentView) and EmptyState.
- [x] **DropZone** — `containers/DropZone/DropZone.tsx`. Full-page drop target; layout + overlay only. Font load/tab logic in `hooks/useFontDrop.ts`.
- [ ] *(Modal base is a **component**: `components/Modal/`. Modal content is in features/.)*

### Features

- [x] **FontSelector** — Font picker / upload entry.
- [x] **TextControls** — Font size, weight, sample text controls.
- [x] **SampleTextPanel** — Sample text input and options.
- [x] **VariableAxesPanel** — Variable font axes (AxisSlider in same folder).
- [x] **ColorPanel** — Text/background color.
- [x] **OpenTypeFeaturesPanel** — OpenType feature toggles.
- [x] **Button/** — `features/Button/`. ResetButton, CloseButton, SwatchBookButton, ExpandSidebarButton, ClearCacheButton, etc. Use `:has([data-icon-container])` where needed (panelHeader, labelRow, settingRow).
- [x] **HeaderControls** — Global reset + swatch book (open settings to appearance). Composed by Header.
- [x] **GlyphCountBadge** — Displays total glyph count from font store. Composed by BottomBar.
- [x] **ViewSelector** — View mode tabs (Plain, Waterfall, Styles, Glyphs, Present).
- [x] **ExportButtons** — Copy CSS, screenshot, record, etc.
- [x] **SettingsModal**, **FontInfoModal**, **FontDetailsModal**, **ScreenshotPreviewModal** — Modal content (use Modal from components/).
- [x] **GlyphsView** — Glyph grid + search + categories (CategoryNavigation, CategorySection, GlyphCard, VirtualizedGlyphGrid in same folder).
- [x] **PlainView**, **WaterfallView**, **StylesView**, **PresentView** — View content.
- [x] **EmptyState**, **LiveSyncIndicator** — Canvas/empty/sync UI.
- [x] **LabeledControl** — Label row + control slot (uses LabelRow).
- [x] **OKLCHPicker/** — OKLCHPickerPanel (color picker; used by ColorPanel, SettingsModal).
- [x] **LabelWithPopover** — In `components/`; used by features for section labels + popover.
- [ ] *(Add/remove as features are split or merged.)*

### Components

- [ ] **IconContainer** — `components/IconContainer/IconContainer.tsx`. Ghost box around icon; static/interactive; optional fontSize.
- [ ] **FormField** — Label + hint + error + single child (form context).
- [ ] **TooltipButton** — Button with tooltip and optional icon.
- [ ] **Tooltip** — Tooltip only (no button).
- [ ] **SliderTooltip** — Slider-specific tooltip.
- [ ] **RadixSelect** — Styled select wrapper.
- [ ] **RadixTabs** — Styled tabs wrapper.
- [ ] **RadixAccordion** — Accordion wrapper.
- [ ] **RadixPopover** — Popover wrapper.
- [ ] **RadixSeparator** — Separator.
- [ ] **CustomCollapsible** — Collapsible section.
- [ ] **CustomToggleGroup** — Toggle group.
- [ ] **TitleBar** — Structural title row: **panel** = PanelHeader (icon + title + optional ResetButton); **section** = section heading (used via SectionHeader). Canonical panel header for sidebar panels.
- [x] **Modal** — `components/Modal/`. Modal chrome (title, content, close).
- [x] **LabelRow** — Structural row: optional icon + label + suffix + ResetButton/right slot; used by LabeledControl, TwoLayerSliderWithLayout.
- [ ] **Toast** — Toast notification.
- [ ] **LoadingSpinner** — Loading indicator.
- [ ] **ErrorMessage** — Error message block.
- [ ] **AxisSlider** — Slider for axis (component if generic; feature if axis-specific).
- [ ] **EditableSlider** — Label + slider + value + optional reset (component).
- [ ] **OKLCHPickerPanel** — Color picker UI lives in `features/OKLCHPicker/`; generic picker could be promoted to component later.
- [ ] **VirtualizedGlyphGrid** — Virtualized grid (component).
- [ ] **GlyphCard** — Single glyph card (component).
- [ ] **CategoryNavigation** — Category nav (could be component or feature).
- [ ] **EmptyState** — Empty state message + optional actions (component).
- [ ] **LiveSyncIndicator** — Live sync badge (component).
- [ ] *(Promote from feature to component when domain logic is stripped; add new components as they are extracted.)*

### Primitives

- [x] **Icon** — Renders a Lucide icon at 1em; no chrome, no semantics.
- [x] **Label** — Typography primitive; variants (default, small, section, form, keyValue); use `data-label` for `:has()` targeting.
- [ ] *(Future: Track for sliders, etc.—add as extracted.)*

---

## 4. Shared CSS (not a level)

**SidebarShared.module.css** lives in `src/styles/sidebar/`; features (FontSelector, SampleTextPanel, OpenTypeFeaturesPanel) import from there. **Sidebar** container folder has only Sidebar.tsx + Sidebar.module.css. Shared styles (e.g. `.label`, `.button`, `.iconButton`, `.input`). They are not a "level" but support multiple levels:

- Use **shared CSS** for visual patterns that vary by context and don't need a single component API.
- Prefer **components/primitives** when you need structure, a11y, or stable hooks (e.g. `data-icon-container` for `:has()`).

As refactors consolidate patterns (e.g. icon buttons → IconContainer), reduce reliance on duplicate shared classes (e.g. `.iconButton`) in favor of components.

---

## 5. Contracts (reminder)

- **Font-size:** Containers (or layout) set font-size for a region; components inherit or accept an explicit size prop (e.g. `fontSize`) as fallback. Use `:has([data-icon-container])` where a row should set font-size when it contains an icon.
- **Semantics / a11y:** Features (or the component that wraps an action) own aria-label, role, keyboard behavior. Components expose focus and structure; primitives are presentational.
- **Stable hooks:** Use data attributes (e.g. `data-icon-container`) for container-driven styling so CSS modules can target "contains X" without relying on hashed class names.
- **Variants:** Prefer context and tokens over new variant props. Avoid layout-named variants (e.g. "sidebar"); use behavior (static/interactive) or token names (xs, sm, base).

---

## 6. Iteration order (suggested)

1. **Lock contracts** — Document in README or here; ensure Icon/IconContainer/ResetButton follow them.
2. **Icon system** — Add `data-icon-container`; add `:has()` rules where needed; footer migration to IconContainer. *(Done: IconContainer sets `data-icon-container`; Sidebar `.panelHeader`, `.sidebarFooter` footer buttons, EditableSlider `.labelRow`, SettingsModal `.settingRow` use IconContainer or `:has()` for font-size. Feature wrappers: ResetButton, CloseButton, SwatchBookButton, ExpandSidebarButton, ClearCacheButton.)*
3. **One structural component** — PanelHeader: **TitleBar** with `variant="panel"` is the canonical panel header (title + optional icon + ResetButton). Use in sidebar panels; already used in VariableAxesPanel, TextControls, SampleTextPanel, ColorPanel, OpenTypeFeaturesPanel.
4. **Label / label-row** — *(Done)* Label primitive for typography; LabelRow for structural row (panel: icon + label + suffix + reset; form: label + htmlFor + right). FormField uses LabelRow with htmlFor and Label variant form; no duplicate label styles in FormField.
5. **Containers** — Ensure Sidebar, Header, BottomBar, FontCanvas only compose and set context; move any domain logic into features.
6. **Layouts** — Name current layouts (default, presentation, compact) and add new layout variants as needed.
7. **Layout and chrome polish** — Resizable sidebar, compact density tokens, toolbar hit areas, and state persistence live in a separate plan so this guide stays focused on hierarchy. See **DEV_TOOLS_UI_REFACTORING_PLAN.md** when working on that layer.

---

*Update this guide as you add or reclassify items. Use the checkboxes to track refactoring progress per level.*
