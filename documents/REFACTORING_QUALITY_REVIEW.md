# Refactoring Quality Review

**Date:** February 3, 2026  
**Scope:** Post–Phase 6 review against GRANULAR_REFACTORING_GUIDE.md and START_HERE.md

---

## Summary

The refactor is **structurally complete**: Phases 1A–6 are implemented. Codebase matches the intended hierarchy (layouts → containers → features → components → primitives). A few documentation and copy edits were overdue; no code bugs were found.

---

## What’s in Good Shape

### Hierarchy and paths
- **Layouts:** DefaultLayout, PresentationLayout, CompactLayout live in `layouts/` and are used by MainApp. Layout CSS is in `Layout.module.css`; App.css only has `.toast-viewport`.
- **Containers:** Sidebar, Header, BottomBar, FontCanvas, DropZone are in `containers/` and only compose features (no domain logic). No `containers/Modals/`; Modal base is in `components/Modal/`.
- **Features:** All 20+ features are in `features/` (FontSelector, TextControls, SampleTextPanel, VariableAxesPanel, ColorPanel, OpenTypeFeaturesPanel, ViewSelector, ExportButtons, modal features, view features, Button/, LabeledControl, OKLCHPicker/).
- **Components:** Modal, LabelWithPopover, TitleBar, SectionHeader, LabelRow, etc. are in `components/`. No redundant OKLCHPicker wrapper; OKLCHPickerPanel is in `features/OKLCHPicker/`.
- **Primitives:** Icon, Label, NativeRangeSlider in `primitives/`.

### Imports
- Features import from `../../components/` and `../OtherFeature/` (or `../../containers/Sidebar/` for Sidebar.module.css and SidebarShared.module.css only). Layouts import from `../containers/`. No stale references to `containers/Modals/` or deleted OKLCHPicker.tsx.

### Contracts (guide)
- Panel header: TitleBar `variant="panel"` is the canonical panel header; used in all sidebar panels.
- Label row: LabelRow is used by LabeledControl and TwoLayerSliderWithLayout; shared CSS in LabelRow.module.css.
- Font-size / `:has([data-icon-container])`: Used where needed (LabelRow, TitleBar, SettingsModal, etc.).
- Import direction: Layout → containers → features → components → primitives; no upward feature/component imports from containers.

---

## Issues Found and Addressed

### 1. Documentation out of date (fixed in this pass)

- **START_HERE.md**  
  - Still said “40% complete” and listed Phases 1–6 as to-do.  
  - **Update:** Status set to “Phases 1–6 complete”; “What’s done” and “What’s left” revised; “Next steps” adjusted for post–Phase 6.

- **REFACTORING_STATUS_REPORT.md**  
  - Still said “Features still in containers/Sidebar, Canvas, BottomBar, Modals” and “Layouts not started”.  
  - **Update:** Inventory updated: features in `features/`, Modal in `components/Modal/`, layouts in `layouts/`; Layouts section marked complete.

- **GRANULAR_REFACTORING_GUIDE.md**  
  - Modal was listed under Containers as `containers/Modals/Modal.tsx`; Layout “Where it lives” still mentioned App.css for layout structure; Features/Components/Containers checkboxes didn’t reflect extractions; Primitives said “Future: Label” although Label exists.  
  - **Update:** Modal path set to `components/Modal/`; Layout “Where it lives” updated to layouts/ and Layout.module.css; Containers and Features checkboxes updated; Primitives updated to include Label; OKLCHPicker entry clarified as OKLCHPickerPanel in features.

### 2. No code defects

- **SettingsModal OKLCHPicker import:** `../../features/OKLCHPicker/OKLCHPickerPanel` from `features/SettingsModal/` correctly resolves to `components/features/OKLCHPicker/` — no change.
- **Orphaned files:** No `containers/Modals/` folder; no `OKLCHPicker.tsx` wrapper in Sidebar. Clean.

---

## Refinements and Opportunities

### Optional (non-blocking)

1. **CompactLayout**  
   - `Layout.module.css` has an empty `.appCompact { }`. When compact design tokens exist, add a short comment or token here so the class isn’t a no-op.

2. **Shared sidebar styles**  
   - Features still import `Sidebar.module.css` and `SidebarShared.module.css` from `containers/Sidebar/`. This is intentional (container-owned context). If you later want features to be fully independent of container paths, you could move shared sidebar styles to e.g. `components/` or a shared styles folder and have Sidebar + features both import from there. Not required for correctness.

3. **UnusedComponents/**  
   - Guide says it “remains until migrated”. EditableSlider, FontList, etc. are unchanged. Leave as-is until you’re ready to migrate or remove.

4. **REFACTORING_STATUS_REPORT “Next actions”**  
   - Could add a “Post–Phase 6” line: e.g. “Optional: compact tokens, floating toolbar layout, or further feature thinning.”

5. **LabelRow / FormField**  
   - *(Done)* Guide iteration step 4 completed: LabelRow supports optional `htmlFor` for form mode; FormField uses LabelRow with `htmlFor` and Label variant form; duplicate label styles removed from FormField.

---

## Checklist Used for Review

- [x] Layouts: DefaultLayout, PresentationLayout, CompactLayout exist and are used; layout CSS in layout module.
- [x] Containers: Only Sidebar, Header, BottomBar, Canvas, DropZone; no Modals folder; Modal base in components.
- [x] Features: All expected features in `features/`; Sidebar composes them by import.
- [x] Components: Modal, LabelWithPopover, LabelRow, TitleBar, etc. in `components/`; no OKLCHPicker wrapper.
- [x] Primitives: Icon, Label, NativeRangeSlider in `primitives/`.
- [x] No stale imports to removed paths or deleted files.
- [x] START_HERE, REFACTORING_STATUS_REPORT, GRANULAR_REFACTORING_GUIDE updated to reflect current state.

---

## Conclusion

Refactoring matches the intended hierarchy and contracts. The only issues were documentation lag; those have been corrected. Optional refinements (compact tokens, sidebar shared styles, FormField/Label) can be done when useful.
