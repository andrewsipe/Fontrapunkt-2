# Component Refactoring: Start Here

**Date:** February 3, 2026  
**Status:** Phases 1–6 complete; refactoring aligned with hierarchy

---

## What Just Happened?

I've analyzed your entire component structure and created a complete refactoring plan. You now have:

1. ✅ **Full audit** of current state (40% complete)
2. ✅ **Clear component vs feature definitions** with decision framework
3. ✅ **Concrete classifications** for all 50+ components
4. ✅ **Phase-by-phase migration plan** with time estimates
5. ✅ **Tricky cases resolved** (LabelWithPopover, OKLCHPicker, EmptyState, etc.)

---

## Your New Documentation

### 📋 Core References (Keep These Open)

1. **GRANULAR_REFACTORING_GUIDE.md** (original)
   - Hierarchy definitions
   - Contracts and rules
   - Living checklist

2. **COMPONENT_VS_FEATURE_DECISION_TREE.md** (new)
   - 4 quick tests to classify any component
   - Practical examples from your codebase
   - Analyzed tricky cases with verdicts

3. **COMPONENT_CLASSIFICATION_REPORT.md** (new)
   - Complete inventory of all 50+ components
   - Concrete classifications with reasoning
   - File movement commands
   - Verification checklist

4. **REFACTORING_STATUS_REPORT.md** (new)
   - Current state summary
   - 6 phases with time estimates
   - Success metrics
   - How to stay on track

5. **DEV_TOOLS_UI_REFACTORING_PLAN.md** (optional)
   - Layout and chrome polish: resizable sidebar, compact density, toolbars, persistence
   - Phased plan; iterate from this doc when doing dev-tools UX work

---

## Quick Start: Do This First

### Option 1: Just Want the Plan? ✅ Done
You're all set. Read through the docs above and start when ready.

### Option 2: Start Phase 1A (Quick Wins - 30 mins)

**What it does:** Removes duplication and fixes one misclassified component

**Steps:**
1. Delete redundant `OKLCHPicker.tsx` wrapper
2. Move `LabelWithPopover` to components/
3. Update imports

**See:** COMPONENT_CLASSIFICATION_REPORT.md → "Migration Priority Order" → "Phase 1A"

### Option 3: I'll Implement It For You

I can execute Phase 1A right now (delete redundant file, move LabelWithPopover, update imports).

Just say: **"Implement Phase 1A"**

---

## Understanding the Hierarchy

```
Layout (page structure)
  └─ Container (composes features, sets context)
      └─ Feature (domain-specific: knows about fonts/settings)
          └─ Component (reusable: no domain knowledge)
              └─ Primitive (single responsibility)
```

### The Key Question

**"Does it know about fonts/settings/export/glyphs/axes?"**
- **YES** → Feature
- **NO** → Component

**Still confused?** Read: COMPONENT_VS_FEATURE_DECISION_TREE.md

---

## Current State Summary

### ✅ What's Done (Phases 1–6)
- **Primitives:** Icon, Label, NativeRangeSlider in `primitives/`
- **Components:** Modal, LabelWithPopover, TitleBar, SectionHeader, LabelRow, Radix wrappers, FormField, IconContainer, TwoLayerSlider, etc. in `components/`
- **Features:** All in `features/` — FontSelector, TextControls, SampleTextPanel, VariableAxesPanel, ColorPanel, OpenTypeFeaturesPanel, ViewSelector, ExportButtons, Button/, LabeledControl, OKLCHPicker/, modal features (SettingsModal, FontInfoModal, FontDetailsModal, ScreenshotPreviewModal), view features (PlainView, WaterfallView, StylesView, GlyphsView, PresentView, EmptyState, LiveSyncIndicator)
- **Containers:** Sidebar, Header, BottomBar, FontCanvas, DropZone in `containers/`; they only compose features
- **Layouts:** DefaultLayout, PresentationLayout, CompactLayout in `layouts/`; MainApp selects by view/compact mode
- **Cleanup:** Redundant OKLCHPicker wrapper deleted; LabelWithPopover in components/; Modal base in components/Modal/

### Optional refinements
- **Layout & dev tools UX** — Resizable sidebar, compact tokens (`.appCompact`), toolbar hit areas, state persistence. See **DEV_TOOLS_UI_REFACTORING_PLAN.md**.
- UnusedComponents/ migration when ready
- FormField vs Label/LabelRow unification (guide iteration step 4)

---

## The 6 Phases

### Phase 1A: Quick Wins (30 mins) ⭐ START HERE
- Delete redundant OKLCHPicker wrapper
- Move LabelWithPopover to components/
- Update imports (2-3 files)

### Phase 2: Extract Sidebar Features (2-3 hours)
- Move 6 panels from containers/Sidebar/ to features/
- Order: FontSelector → SampleTextPanel → TextControls → ColorPanel → VariableAxesPanel → OpenTypeFeaturesPanel
- One at a time, commit each

### Phase 3: Extract Canvas Features (2-3 hours)
- Move 7 view components from containers/Canvas/ to features/
- Order: LiveSyncIndicator → EmptyState → PlainView → WaterfallView → PresentView → StylesView → GlyphsView

### Phase 4: Extract BottomBar & Modal Features (1-2 hours)
- Move ViewSelector, ExportButtons from BottomBar
- Move Modal base to components/
- Move modal content to features/

### Phase 5: Create Structural Components (optional, 2-3 hours)
- Extract repeated patterns (PanelHeader, LabelRow)
- Apply to 2-3 places, validate

### Phase 6: Create Explicit Layouts (1-2 hours)
- Create DefaultLayout, PresentationLayout, CompactLayout
- Move layout logic from MainApp.tsx + App.css
- **Enables:** Your floating toolbar redesign

---

## How to Stay On Track

### The Commit-Per-Feature Pattern
1. Pick one feature (e.g. "FontSelector")
2. Create folder: `mkdir -p src/components/features/FontSelector`
3. Move files: `mv containers/Sidebar/FontSelector.* features/FontSelector/`
4. Update imports in parent container
5. Test in browser
6. Commit: `git commit -m "Extract FontSelector to features/"`
7. ✅ Check off in REFACTORING_STATUS_REPORT.md
8. Repeat

### When You Get Sidetracked
1. Note current task in TODO list (already set up)
2. Create branch: `git checkout -b feature/new-thing`
3. Complete side quest
4. Merge: `git checkout main && git merge feature/new-thing`
5. Resume from TODO list

### If You Forget What's Component vs Feature
Read COMPONENT_VS_FEATURE_DECISION_TREE.md → Run the 4 quick tests

---

## What Happens After Phase 6?

You'll have:
- ✅ Clear hierarchy: primitives → components → features → containers → layouts
- ✅ Modular system: easy to swap layouts
- ✅ No domain logic in containers
- ✅ Ready for floating toolbar redesign

Then you can:
- Create new layouts (FloatingToolbarLayout, MobileLayout, etc.)
- Compose features in different arrangements
- Add/remove features without touching layout
- Maintain clear boundaries

---

## Decision Tree Quick Reference

### Is it a Component or Feature?

```
┌─────────────────────────────────────┐
│ Could I copy this into a different  │
│ app (music player, image editor)    │
│ and use it with minimal changes?    │
└─────────────────────────────────────┘
           │
           ├─ YES → COMPONENT
           │        (generic, reusable)
           │
           └─ NO → FEATURE
                   (domain-specific)
```

**Quick tests:**
1. **Rename test:** If I renamed "font" to "image", does it still make sense?
2. **Store test:** Does it import useFontStore or useSettingsStore?
3. **Props test:** Does it accept `font`, `axis`, `glyph` props?
4. **Imports test:** Does it import domain utils or stores?

**Examples:**
- IconContainer → Component (works with any icon)
- FontSelector → Feature (specifically selects fonts)
- TwoLayerSlider → Component (generic dual-layer slider)
- AxisSlider → Feature (wraps TwoLayerSlider with axis logic)

---

## Common Questions

### "Should OKLCHPickerPanel be a component or feature?"
**Component.** It's a generic OKLCH color picker. Could be used in any app that needs color picking. No font knowledge.

### "What about LabelWithPopover?"
**Component.** Generic pattern: Label + Popover for help text. Works with any description, not font-specific.

### "Where should AxisSlider live?"
**Feature.** It's specific to variable font axes. Move to `features/VariableAxesPanel/AxisSlider.tsx` (sub-component).

### "GlyphCard?"
**Feature.** Displays font glyphs specifically. Move to `features/GlyphsView/GlyphCard.tsx`.

### "EmptyState?"
**Feature.** 397 lines, uses fontStore heavily, loads fonts, creates tabs. Definitely domain-specific.

### "Can I move multiple features at once?"
Yes, but commit each separately so you can track progress and revert if needed.

---

## File Movement Template

```bash
# Template for moving any feature
FEATURE_NAME="FontSelector"
SOURCE_DIR="containers/Sidebar"
DEST_DIR="features"

# 1. Create destination
mkdir -p src/components/$DEST_DIR/$FEATURE_NAME

# 2. Move files
mv src/components/$SOURCE_DIR/$FEATURE_NAME.tsx \
   src/components/$DEST_DIR/$FEATURE_NAME/
mv src/components/$SOURCE_DIR/$FEATURE_NAME.module.css \
   src/components/$DEST_DIR/$FEATURE_NAME/

# 3. Find imports to update
rg "from.*$FEATURE_NAME" --type tsx

# 4. Update imports in parent container

# 5. Test
npm run dev

# 6. Commit
git add .
git commit -m "Extract $FEATURE_NAME to features/"
```

---

## Ready to Start?

### I Want to Start Myself
1. Read COMPONENT_VS_FEATURE_DECISION_TREE.md (5 mins)
2. Read COMPONENT_CLASSIFICATION_REPORT.md → Phase 1A (5 mins)
3. Execute Phase 1A (30 mins)
4. Move to Phase 2, one feature at a time

### I Want You to Start Phase 1A
Just say: **"Implement Phase 1A"** and I'll:
- Delete redundant OKLCHPicker.tsx
- Move LabelWithPopover to components/
- Update all imports
- Test for errors
- Report results

### I Have Questions First
Ask away! I can:
- Clarify component vs feature for specific cases
- Explain why a classification was chosen
- Help with import paths
- Suggest migration order changes

---

## Documents Created for You

1. **COMPONENT_VS_FEATURE_DECISION_TREE.md** - How to classify anything
2. **COMPONENT_CLASSIFICATION_REPORT.md** - Complete inventory with verdicts
3. **REFACTORING_STATUS_REPORT.md** - Status + phases + success metrics
4. **START_HERE.md** - This file (overview + quick start)
5. **DEV_TOOLS_UI_REFACTORING_PLAN.md** - Layout/chrome polish (resizable sidebar, compact, toolbars); iterate from here when doing dev-tools UX

**Original (updated):**
- GRANULAR_REFACTORING_GUIDE.md - Hierarchy definitions and contracts

---

## Next Steps

**Refactoring complete.** Optional next steps:

A. **Floating toolbar / new layout** — Add a new layout (e.g. FloatingToolbarLayout) in `layouts/` and wire it in MainApp  
B. **Layout & dev tools UX** — Resizable sidebar, compact tokens, toolbar hit areas, persistence. See **DEV_TOOLS_UI_REFACTORING_PLAN.md**.  
C. **UnusedComponents** — Migrate or remove EditableSlider, FontList, etc. when ready  
D. **Quality check** — See REFACTORING_QUALITY_REVIEW.md for full review and opportunities

---

*Phases 1–6 are complete. See REFACTORING_QUALITY_REVIEW.md for a post-refactor quality check and optional next steps.*
