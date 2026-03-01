# Radix → Base UI Migration Plan

**Status: Complete.** All UI primitives use Base UI (or react-hot-toast for toasts). Radix has been removed from dependencies and from component/file naming.

---

## Base UI patterns (reference)

- **Composition:** Radix uses `asChild` + Slot; Base UI uses a **`render` prop** (element or callback). See [useRender](https://base-ui.com/react/utils/use-render) and “Migrating from Radix UI” there. Wrappers that emulate `asChild` use `render={(props) => cloneElement(children, props)}` (and merge handlers/className as needed).
- **Trigger “button” expectation:** Components that act as buttons (Popover.Trigger, Menu.Trigger, etc.) default to expecting a **native `<button>`**. If the rendered element is not a real `<button>` (e.g. when using `asChild` with a `<label>` or `<div>`), set **`nativeButton={false}`** on the Base UI trigger to avoid the dev warning and get correct semantics.

---

## Components (all Base UI)

| Component | File / export | Where used |
|-----------|----------------|------------|
| **Dialog** | `Modal.tsx` | Shared modal shell |
| **Tabs** | `Tabs.tsx` / `Tabs` | SampleTextPanel, FontDetailsModal, FontInfoModal |
| **Toggle / ToggleGroup** | `FP2Header`, `FloatingCommandBar`, `CustomToggleGroup` | View strip, alignment, case, GlyphsView, Settings |
| **Tooltip** | `Tooltip.tsx`, `TooltipButton.tsx`, `SliderTooltip.tsx` | Base UI |
| **Popover** | `Popover.tsx` / `Popover` | FloatingCommandBar, FontSourceTab, OpenTypeFeaturesPanel, TextControls, LabelWithPopover |
| **Accordion** | `Accordion.tsx` / `Accordion` | OpenTypeFeaturesPanel, GlyphsView, CategorySection |
| **Select** | `Select.tsx` / `Select` | VariableAxesPanel, RenderingSettings |
| **Separator** | `Separator.tsx` / `Separator` | Where needed |
| **Collapsible** | `CustomCollapsible.tsx` | Base UI Collapsible |
| **Toast** | — | react-hot-toast only (Toaster in AppProviders) |

---

## 1. Tooltip (high impact — removes App-level Provider)

**Radix:** `@radix-ui/react-tooltip`  
**Base UI:** `@base-ui/react/tooltip`  
**Docs:** https://base-ui.com/react/components/tooltip

**Current usage:**
- **AppProviders.tsx** — `Tooltip.Provider` wraps the app (needed for all Radix tooltips).
- **TooltipButton** — Used by: fp2 AccentPresetGrid, features AccentPresetGrid, IconContainer, FontSelector.
- **Tooltip** (generic) — Used by: fp2 GlyphCard, fp2 StylesView.
- **SliderTooltip** — Used by sliders (e.g. VariableAxesPanel AxisSlider, FloatingCommandBar size/weight).
- **CustomToggleGroup** — Each item wraps with Radix Tooltip (fp2 GlyphsView, fp2 SettingsModal GeneralSettings/AppearanceSettings).

**Migration:**
- Add Base UI Tooltip component (e.g. `components/Tooltip/BaseUITooltip.tsx` or replace `Tooltip.tsx` / `TooltipButton.tsx` / `SliderTooltip.tsx` to use `@base-ui/react/tooltip`).
- Base UI tooltips do not require a provider; remove `Tooltip.Provider` from AppProviders.
- Update CustomToggleGroup to use Base UI Tooltip instead of Radix (or keep Radix only there until ToggleGroup is migrated).
- Update useKeyboardShortcuts if Base UI tooltip uses different data attributes for “open” (optional).

**Files to touch:** AppProviders, Tooltip.tsx, TooltipButton.tsx, SliderTooltip.tsx, CustomToggleGroup.tsx, any direct Radix Tooltip imports.

---

## 2. Popover (used in fp2 and features)

**Radix:** `@radix-ui/react-popover` via `RadixPopover.tsx`  
**Base UI:** `@base-ui/react/popover`  
**Docs:** https://base-ui.com/react/components/popover

**Current usage:**
- **FloatingCommandBar** — OKLCH color picker in popover (fp2).
- **FontDetailsModal FontSourceTab** — Info popover (fp2).
- **OpenTypeFeaturesPanel** — Per-feature info popover (drawer).
- **TextControls** — Multiple popovers (features; not in fp2 shell but in codebase).

**Migration:**
- Create `BaseUIPopover` (or replace `RadixPopover.tsx`) using `@base-ui/react/popover`; preserve API (Root, Trigger, Portal, Content, side/align/sideOffset).
- Replace RadixPopover usage in FloatingCommandBar, FontSourceTab, OpenTypeFeaturesPanel, TextControls.
- Use Base UI anchor positioning if needed (same as Radix side/align).

**Files to touch:** RadixPopover.tsx (or new Base UI wrapper), FloatingCommandBar, FontSourceTab, OpenTypeFeaturesPanel, TextControls.

---

## 3. Accordion (drawer + Glyphs view)

**Radix:** `@radix-ui/react-accordion`  
**Base UI:** `@base-ui/react/accordion`  
**Docs:** https://base-ui.com/react/components/accordion

**Current usage:**
- **OpenTypeFeaturesPanel** — Categories (Stylistic, Ligature, Script, etc.) via `RadixAccordion` wrapper.
- **GlyphsView** — Category list via direct `Accordion` in GlyphsView.tsx and CategorySection.tsx.

**Migration:**
- Replace `RadixAccordion` with Base UI Accordion (Root, Item, Header, Trigger, Panel); map `defaultValue` / `value` / `onValueChange` to Base UI’s `defaultValue` / `value` / `onValueChange`; use `multiple` for OpenType.
- Update GlyphsView and CategorySection to use Base UI Accordion (or a shared wrapper).
- CSS: Radix uses `data-state`; Base UI uses `data-open` (and optionally `data-starting-style` / `data-ending-style` for animation). Update accordion CSS modules.

**Files to touch:** RadixAccordion.tsx (or new Base UI Accordion wrapper), OpenTypeFeaturesPanel, GlyphsView.tsx, CategorySection.tsx, accordion CSS.

---

## 4. Select (drawer + Settings)

**Radix:** `@radix-ui/react-select` via `RadixSelect.tsx`  
**Base UI:** `@base-ui/react/select`  
**Docs:** https://base-ui.com/react/components/select

**Current usage:**
- **VariableAxesPanel** — Preset styles dropdown (drawer).
- **RenderingSettings** (fp2 Settings modal) — Render quality (high/medium/low).

**Migration:**
- Replace RadixSelect with Base UI Select (Root, Value, Trigger, Listbox, Option, etc.). Base UI Select API differs (e.g. listbox instead of Content + Viewport).
- Update useKeyboardShortcuts: change `[data-radix-select-content][data-state="open"]` to Base UI select open selector (e.g. `[data-base-ui-select-listbox][data-state="open"]` or equivalent from Base UI docs).
- Preserve variants (sidebar, modal, compact) via className/props on the new component.

**Files to touch:** RadixSelect.tsx (or new Base UI Select wrapper), VariableAxesPanel, RenderingSettings, useKeyboardShortcuts.

---

## 5. Tabs (modals)

**Radix:** `@radix-ui/react-tabs` via `RadixTabs.tsx`  
**Base UI:** `@base-ui/react/tabs` (already used in SampleTextPanel)

**Current usage:**
- **FontDetailsModal** — RadixTabs (Info / Source).
- **FontInfoModal** — RadixTabs (About / Shortcuts / Tips).

**Migration:**
- Use same Base UI Tabs pattern as SampleTextPanel (`import { Tabs } from "@base-ui/react/tabs"`; Root, List, Tab, Panel).
- RadixTabs wrapper may have a custom `Content` that takes `items`; reimplement with Base UI Tabs.Panel per tab.
- Replace RadixTabs in FontDetailsModal and FontInfoModal; then remove or deprecate RadixTabs.tsx.

**Files to touch:** FontDetailsModal, FontInfoModal, RadixTabs.tsx (remove or keep for non-fp2 only).

---

## 6. ToggleGroup (fp2 Settings + Glyphs)

**Radix:** `@radix-ui/react-toggle-group` in **CustomToggleGroup.tsx**  
**Base UI:** Already using `@base-ui/react/toggle-group` in FP2Header and FloatingCommandBar.

**Current usage:**
- **CustomToggleGroup** (wraps Radix ToggleGroup + Radix Tooltip): fp2 GlyphsView (filter), fp2 Settings GeneralSettings (LTR/RTL), AppearanceSettings (theme + canvas theme).

**Migration:**
- Replace CustomToggleGroup internals with Base UI ToggleGroup; keep the same public API (Root, Item) and segmented styling.
- Tooltip per item: use Base UI Tooltip (after step 1) so no Radix left in this component.
- FP2Header and FloatingCommandBar already use Base UI ToggleGroup directly; align CustomToggleGroup with that pattern.

**Files to touch:** CustomToggleGroup.tsx (and its CSS), GlyphsView, GeneralSettings, AppearanceSettings.

---

## 7. Collapsible ✅ Done

**Was:** `@radix-ui/react-collapsible` in CustomCollapsible.tsx.  
**Now:** `@base-ui/react/collapsible` (Root, Trigger, Panel). CustomCollapsible.tsx migrated; same public API.

---

## 8. Toast ✅ Done

**Was:** `@radix-ui/react-toast` in Toast.tsx.  
**Now:** App uses **react-hot-toast** only (Toaster in AppProviders; `toast()` / `toast.success()` / `shared.standardToast`). Toast.tsx is a stub/comment; no Radix Toast.

---

## 9. Separator ✅ Done

**Was:** `RadixSeparator` (Radix).  
**Now:** `@base-ui/react/separator`. RadixSeparator.tsx uses Base UI; export name kept for drop-in replacement.

---

## Suggested order of work

1. **Tooltip** — Unblocks removal of Tooltip.Provider and touches many components; do first.
2. **Popover** — Critical for fp2 (FloatingCommandBar color, FontSourceTab, OpenType drawer).
3. **Accordion** — OpenType drawer + Glyphs view.
4. **Select** — Variable Axes drawer + Settings; update ESC handling in useKeyboardShortcuts.
5. **Tabs** — FontDetails and FontInfo modals (straightforward; same as SampleTextPanel).
6. **ToggleGroup** — Replace CustomToggleGroup with Base UI ToggleGroup + Base UI Tooltip.

After 1–6, Collapsible, Toast, and Separator are migrated (items 7–9). All `@radix-ui/*` packages have been removed from package.json; remaining UI is Base UI (or react-hot-toast for toasts).
