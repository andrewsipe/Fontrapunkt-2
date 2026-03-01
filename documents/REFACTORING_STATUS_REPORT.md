# Component Refactoring Status Report

**Date:** February 3, 2026  
**Purpose:** Clear snapshot of current state and actionable next steps for component hierarchy refactoring

---

## Executive Summary

### Current State: Phases 1–6 Complete

**What's Working:**
- ✅ Hierarchy defined and implemented (GRANULAR_REFACTORING_GUIDE.md)
- ✅ Primitives: Icon, Label, NativeRangeSlider in `primitives/`
- ✅ Components: Modal, LabelWithPopover, LabelRow, TitleBar, SectionHeader, Radix wrappers, FormField, IconContainer, TwoLayerSlider, etc. in `components/`
- ✅ Features: All in `features/` (sidebar panels, view components, modal content, Button/, LabeledControl, OKLCHPicker/)
- ✅ Containers: Sidebar, Header, BottomBar, FontCanvas, DropZone in `containers/`; compose features only
- ✅ Layouts: DefaultLayout, PresentationLayout, CompactLayout in `layouts/`; MainApp selects by view/compact mode
- ✅ Redundant OKLCHPicker wrapper deleted; Modal base in `components/Modal/`

**Optional refinements:** Compact tokens, UnusedComponents migration, FormField/Label unification (see REFACTORING_QUALITY_REVIEW.md)

---

## Detailed Inventory

### ✅ Primitives (Complete)
Location: `src/components/primitives/`

- [x] **Icon** — Lucide icon wrapper, 1em, no chrome
- [x] **Label** — Basic label primitive
- [x] **NativeRangeSlider** — Base slider with optional layout wrapper

**Status:** This layer is functional. May need additional primitives as patterns emerge.

---

### ✅ Components (Mostly Complete)
Location: `src/components/components/`

**Radix Wrappers:**
- [x] RadixAccordion, RadixCollapsible, RadixPopover, RadixSelect, RadixSeparator, RadixTabs

**UI Components:**
- [x] Checkbox, CustomToggleGroup, ErrorMessage, FormField, IconContainer, LabelGroup, LoadingSpinner, SectionHeader, TitleBar, Toast, Tooltip (SliderTooltip, TooltipButton), TwoLayerSlider

**Status:** Strong foundation. Most components properly scoped. TwoLayerSlider recently completed.

---

### ✅ Features (Extracted)
Location: `src/components/features/`

**Sidebar / panels:** FontSelector, SampleTextPanel, TextControls, VariableAxesPanel (with AxisSlider), ColorPanel, OpenTypeFeaturesPanel  
**BottomBar:** ViewSelector, ExportButtons  
**Canvas / views:** EmptyState, LiveSyncIndicator, PlainView, WaterfallView, PresentView, StylesView, GlyphsView (CategoryNavigation, CategorySection, GlyphCard, VirtualizedGlyphGrid)  
**Modals:** SettingsModal, FontInfoModal, FontDetailsModal (FontInfoTab, FontSourceTab), ScreenshotPreviewModal  
**Other:** Button/, LabeledControl, OKLCHPicker/ (OKLCHPickerPanel)

**Status:** All features extracted; containers only compose and set context.

---

### ✅ Containers (Structure Good)
Location: `src/components/containers/`

- [x] **BottomBar/** — Composes ViewSelector, ExportButtons (from features/)
- [x] **Canvas/** — Composes view features (PlainView, WaterfallView, etc.) and EmptyState
- [x] **DropZone/** — Full-page wrapper; correctly scoped
- [x] **Header/** — Title + global controls
- [x] **Sidebar/** — Composes panel features (FontSelector, TextControls, etc.); shared CSS (Sidebar.module.css, SidebarShared.module.css)

**Note:** Modal base lives in `components/Modal/`; modal content (SettingsModal, FontInfoModal, etc.) in `features/`. No `containers/Modals/` folder.

**Status:** Containers only compose features; no domain logic.

---

### ✅ Layouts (Complete)
Location: `src/components/layouts/`

- [x] **DefaultLayout** — Sidebar + canvas + bottom bar; sidebar open/collapsed
- [x] **PresentationLayout** — Same structure, sidebar in overlay mode (present view)
- [x] **CompactLayout** — Same structure, compact density
- [x] **Layout.module.css** — Shared layout structure (app, appMain, sidebarContainer, collapsed, overlayMode, appCompact)

**Status:** MainApp selects layout by isPresentMode / compactMode; layout CSS in layout module; App.css only has .toast-viewport.

---

## Priority Roadmap

### Phase 1: Resolve Duplication ⭐ START HERE
**Goal:** Eliminate confusion from duplicated OKLCHPicker and misclassified components

#### 1A. Delete Redundant OKLCHPicker Wrapper
- **Delete:** `containers/Sidebar/OKLCHPicker.tsx` (just a pass-through to OKLCHPickerPanel)
- **Update imports:**
  - `containers/Sidebar/ColorPanel.tsx` → import from `features/OKLCHPicker/OKLCHPickerPanel`
  - `containers/Modals/SettingsModal.tsx` → import from `features/OKLCHPicker/OKLCHPickerPanel`
- **Search for other uses:** `rg "from.*OKLCHPicker['\"]" --type tsx`

#### 1B. Move Misclassified Component
- **Move:** `containers/Sidebar/LabelWithPopover.tsx` → `components/LabelWithPopover/`
- **Reason:** Generic UI pattern (Label + Popover), no domain logic, reusable
- **Update imports:** In all Sidebar panels that use it

**Outcome:** No duplication, clear component vs feature boundaries.

---

### Phase 2: Extract Sidebar Features
**Goal:** Move domain-specific panels from `containers/Sidebar/` to `features/`

**Order:**
1. **FontSelector** (least coupled)
2. **SampleTextPanel** (simple text input + options)
3. **TextControls** (font size, weight controls)
4. **ColorPanel** (text/bg color, uses OKLCHPicker)
5. **VariableAxesPanel** (axis sliders, uses AxisSlider)
6. **OpenTypeFeaturesPanel** (OT feature toggles)

**For each:**
- Move from `containers/Sidebar/` to `features/`
- Update Sidebar imports
- Verify no broken imports

**Outcome:** Sidebar becomes a pure container that composes features.

---

### Phase 3: Extract Canvas Features
**Goal:** Move view components from `containers/Canvas/` to `features/`

**Order:**
1. **EmptyState** (simple, standalone)
2. **LiveSyncIndicator** (small badge)
3. **PlainView** (minimal)
4. **WaterfallView** (minimal)
5. **PresentView** (presentation view)
6. **StylesView** (styles grid)
7. **GlyphsView** (complex, save for last)

**Outcome:** FontCanvas becomes a pure container that switches between feature views.

---

### Phase 4: Extract BottomBar & Modal Features
**Goal:** Move remaining features from containers

**BottomBar:**
- Move ViewSelector to `features/ViewSelector/`
- Move ExportButtons to `features/ExportButtons/`

**Modals:**
- Keep Modal base in `components/`
- Move content: SettingsModal, FontInfoModal, FontDetailsModal, ScreenshotPreviewModal to `features/`

**Outcome:** All containers only compose features, no domain logic.

---

### Phase 5: Create Structural Components (Optional)
**Goal:** Extract repeated patterns into reusable components

**Candidates:**
- **PanelHeader** (title + action slot) — used in multiple sidebar panels
- **LabelRow** (label + control) — unified with FormField
- **Label primitive** — if pattern emerges

**Approach:**
- Create component
- Apply to 2-3 places
- Validate pattern before wider rollout

**Outcome:** Less duplication, more consistency.

---

### Phase 6: Create Explicit Layouts (Final)
**Goal:** Replace implicit layout with named layout components

**Create:**
- `layouts/DefaultLayout.tsx` (current default)
- `layouts/PresentationLayout.tsx` (overlay mode)
- `layouts/CompactLayout.tsx` (compact variant)

**Migrate:**
- Move layout logic from `MainApp.tsx` + `App.css` to layout components
- Update `MainApp.tsx` to switch between layouts

**Outcome:** Clear separation of layout from content. Easy to add new layouts (floating toolbar, mobile, etc.).

---

## How to Stay On Track

### Use the Checklist Approach
1. Pick a feature to extract (e.g. "FontSelector")
2. Move file: `containers/Sidebar/FontSelector.tsx` → `features/FontSelector/FontSelector.tsx`
3. Update imports in Sidebar
4. Test in browser
5. Check off in GRANULAR_REFACTORING_GUIDE.md
6. Commit: `git commit -m "Extract FontSelector to features/"`
7. Repeat

### When You Get Sidetracked
1. Note current task in TODO
2. Create branch for side quest: `git checkout -b feature/new-slider-component`
3. Complete side quest
4. Merge back: `git checkout main && git merge feature/new-slider-component`
5. Resume original task from TODO

### Progress Tracking
- Mark tasks complete in this document
- Update GRANULAR_REFACTORING_GUIDE.md checkboxes
- Keep TODO list updated (already set up for you)

---

## Key Principles (Reminder)

### Hierarchy Flow
```
Layout → Container → Feature → Component → Primitive
```

### What Goes Where
- **Primitive:** Single responsibility, no chrome, no domain knowledge (Icon, Label)
- **Component:** Reusable building block, no domain logic (IconContainer, FormField, RadixSelect)
- **Feature:** Domain-specific UI, knows about fonts/settings/actions (FontSelector, TextControls, ViewSelector)
- **Container:** Composes features, sets context (font-size, spacing), no domain logic (Sidebar, Header, Canvas)
- **Layout:** Arranges containers, defines page structure (DefaultLayout, PresentationLayout)

### Import Direction (Always Down)
```
Layout imports Container ✓
Container imports Feature ✓
Feature imports Component ✓
Component imports Primitive ✓

Container imports Container ✓ (nesting)
Feature imports Feature ✓ (composition)

Component imports Feature ✗
Primitive imports anything ✗
```

---

## Next Actions

**Today:**
1. Read this document
2. Start Phase 1: Consolidate OKLCHPicker (resolve duplication)
3. Mark `move-oklch-picker` TODO as complete

**This Week:**
- Complete Phase 2: Extract 2-3 Sidebar features
- Update GRANULAR_REFACTORING_GUIDE.md checkboxes as you go

**This Month:**
- Complete Phases 2-4: Extract all features
- Review for Phase 5: Identify structural component patterns

**Future:**
- Phase 6: Create explicit layouts (prerequisite for floating toolbar redesign)
- New layouts: Floating toolbar system

---

## Questions to Ask Before Moving Forward

1. **Is this a feature or component?**
   - Does it know about fonts/settings/domain? → Feature
   - Is it reusable with no domain logic? → Component

2. **Where should this live?**
   - Follow the hierarchy table in GRANULAR_REFACTORING_GUIDE.md
   - When in doubt, ask: "Could I use this in a different app?" (Component: yes, Feature: no)

3. **Am I creating duplication?**
   - Check if similar component already exists
   - Consolidate before creating new

4. **Will this break imports?**
   - Use IDE "Find All References" before moving
   - Update all imports in same commit

---

## Success Metrics

**Phase 1 Complete:** No duplicate files, OKLCHPicker resolved  
**Phase 2 Complete:** Sidebar only composes features, no domain logic in Sidebar.tsx  
**Phase 3 Complete:** FontCanvas only composes features, no view logic in FontCanvas.tsx  
**Phase 4 Complete:** All containers only compose features  
**Phase 5 Complete:** 2-3 structural components created and validated  
**Phase 6 Complete:** Explicit layout components, easy to add floating toolbar layout

**Final State:**
- Clear hierarchy: primitives → components → features → containers → layouts
- Modular: easy to swap layouts without touching features
- Maintainable: changes scoped to appropriate level
- Future-proof: ready for floating toolbar redesign

---

*This is a living document. Update as you complete phases and discover new patterns.*
