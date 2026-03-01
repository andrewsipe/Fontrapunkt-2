# Component Classification Report

**Date:** February 3, 2026  
**Purpose:** Complete analysis of all components with concrete classifications

---

## Classification Summary

| Category | Count | Notes |
|----------|-------|-------|
| **Correctly Placed Components** | 18 | Already in `components/` |
| **Correctly Placed Features** | 10 | Already in `features/` |
| **Misclassified Components** | 1 | Component in wrong location |
| **Features Stuck in Containers** | 25+ | Need extraction |
| **Redundant Files** | 1 | Delete |

---

## ✅ Correctly Classified

### Primitives (3)
All in `src/components/primitives/` ✓
- Icon
- Label
- NativeRangeSlider (+ NativeRangeSliderWithLayout)

### Components (18)
All in `src/components/components/` ✓
- Accordion/RadixAccordion
- Checkbox
- Collapsible/CustomCollapsible
- ErrorMessage
- FormField
- IconContainer
- LabelGroup
- LoadingSpinner
- Popover/RadixPopover
- SectionHeader
- Select/RadixSelect
- Separator/RadixSeparator
- Tabs/RadixTabs
- TitleBar
- Toast
- ToggleGroup/CustomToggleGroup
- Tooltip (Tooltip, SliderTooltip, TooltipButton)
- TwoLayerSlider (+ TwoLayerSliderWithLayout)

### Features (10)
All in `src/components/features/` ✓
- Button/ (ClearCacheButton, CloseButton, ExpandSidebarButton, InfoButton, ResetButton, SettingsButton, SwatchBookButton)
- LabeledControl
- OKLCHPicker/OKLCHPickerPanel

---

## ⚠️ Misclassified: Component in Wrong Location

### LabelWithPopover
**Current:** `containers/Sidebar/LabelWithPopover.tsx`  
**Should be:** `components/LabelWithPopover/LabelWithPopover.tsx`

**Classification:** COMPONENT (generic UI pattern)

**Reasoning:**
- Generic pattern: Label + Popover for contextual help
- No domain logic (accepts any `sectionKey` and `description`)
- Reusable in any context
- Only imports primitives (Label) and components (RadixPopover)

**Migration:**
```bash
# Move file
mkdir -p src/components/components/LabelWithPopover
mv src/components/containers/Sidebar/LabelWithPopover.tsx src/components/components/LabelWithPopover/
mv src/components/containers/Sidebar/LabelWithPopover.module.css src/components/components/LabelWithPopover/

# Update imports in:
# - Sidebar panels (FontSelector, TextControls, ColorPanel, etc.)
```

---

## 🗑️ Redundant: Delete

### OKLCHPicker (Sidebar wrapper)
**Current:** `containers/Sidebar/OKLCHPicker.tsx`  
**Should be:** DELETED

**Reasoning:**
```tsx
// Current code (redundant wrapper):
export function OKLCHPicker(props: OKLCHPickerProps) {
  return <OKLCHPickerPanel {...props} />;
}
```

This is just a pass-through. Import `OKLCHPickerPanel` directly instead.

**Migration:**
```bash
# Find all uses
rg "from.*['\"].*OKLCHPicker['\"]" --type tsx

# Update imports in ColorPanel and SettingsModal:
# Change: import { OKLCHPicker } from '../Sidebar/OKLCHPicker'
# To:     import { OKLCHPickerPanel } from '../../features/OKLCHPicker/OKLCHPickerPanel'

# Delete file
rm src/components/containers/Sidebar/OKLCHPicker.tsx
```

---

## 🔄 Features Stuck in Containers

### Sidebar Features (9 files)
**Current:** `containers/Sidebar/`  
**Should be:** `features/`

| File | Classification | Reason |
|------|---------------|--------|
| AxisSlider.tsx | FEATURE | Font axis-specific slider |
| ColorPanel.tsx | FEATURE | Sets font/bg colors, uses stores |
| FontSelector.tsx | FEATURE | Font picker, uses fontStore |
| OpenTypeFeaturesPanel.tsx | FEATURE | OT feature toggles, font-specific |
| SampleTextPanel.tsx | FEATURE | Sample text input, uses stores |
| TextControls.tsx | FEATURE | Font size/weight/etc controls |
| VariableAxesPanel.tsx | FEATURE | Variable font axes panel |
| LabelWithPopover.tsx | COMPONENT | Generic Label + Popover (see above) |
| OKLCHPicker.tsx | REDUNDANT | Delete (see above) |

**After extraction, Sidebar.tsx becomes:**
```tsx
// Pure container - composes features
export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <FontSelector />
      <TextControls />
      <SampleTextPanel />
      <VariableAxesPanel />
      <ColorPanel />
      <OpenTypeFeaturesPanel />
    </div>
  );
}
```

---

### Canvas Features (7+ files)
**Current:** `containers/Canvas/`  
**Should be:** `features/`

| File/Folder | Classification | Reason |
|------------|---------------|--------|
| EmptyState.tsx | FEATURE | Font upload/landing, uses fontStore heavily (397 lines) |
| LiveSyncIndicator.tsx | FEATURE | Font file watching, uses font engine |
| PlainView.tsx | FEATURE | Plain text view for fonts |
| PresentView.tsx | FEATURE | Presentation view for fonts |
| StylesView.tsx | FEATURE | Font styles grid |
| WaterfallView.tsx | FEATURE | Waterfall view for fonts |
| GlyphsView/ | FEATURE | Glyph grid (multiple files) |

**GlyphsView sub-components (5 files):**
- CategoryNavigation.tsx
- CategorySection.tsx
- GlyphCard.tsx
- GlyphsView.tsx
- VirtualizedGlyphGrid.tsx

All move to: `features/GlyphsView/`

**After extraction, FontCanvas.tsx becomes:**
```tsx
// Pure container - switches between feature views
export function FontCanvas() {
  const viewMode = useUIStore(state => state.viewMode);
  const hasFont = useFontStore(state => state.currentFont !== null);
  
  if (!hasFont) return <EmptyState />;
  
  return (
    <div className={styles.canvas}>
      <LiveSyncIndicator />
      {viewMode === 'plain' && <PlainView />}
      {viewMode === 'waterfall' && <WaterfallView />}
      {viewMode === 'styles' && <StylesView />}
      {viewMode === 'glyphs' && <GlyphsView />}
      {viewMode === 'present' && <PresentView />}
    </div>
  );
}
```

---

### BottomBar Features (2 files)
**Current:** `containers/BottomBar/`  
**Should be:** `features/`

| File | Classification | Reason |
|------|---------------|--------|
| ExportButtons.tsx | FEATURE | Export font CSS/screenshots |
| ViewSelector.tsx | FEATURE | Switch font view modes |

**After extraction, BottomBar.tsx becomes:**
```tsx
// Pure container - composes features
export function BottomBar() {
  return (
    <div className={styles.bottomBar}>
      <ViewSelector />
      <ExportButtons />
    </div>
  );
}
```

---

### Modal Features (4+ files)
**Current:** `containers/Modals/`  
**Should be:** `features/` (content) and `components/` (base Modal)

| File | Classification | Location After |
|------|---------------|---------------|
| Modal.tsx | COMPONENT | `components/Modal/` |
| FontDetailsModal.tsx | FEATURE | `features/FontDetailsModal/` |
| FontInfoModal.tsx | FEATURE | `features/FontInfoModal/` |
| FontInfoTab.tsx | FEATURE (sub) | `features/FontInfoModal/FontInfoTab.tsx` |
| FontSourceTab.tsx | FEATURE (sub) | `features/FontInfoModal/FontSourceTab.tsx` |
| LivePulseIcon.tsx | COMPONENT? | Check if generic or inline |
| ScreenshotPreviewModal.tsx | FEATURE | `features/ScreenshotPreviewModal/` |
| SettingsModal.tsx | FEATURE | `features/SettingsModal/` |

**Base Modal stays as component (generic chrome):**
```tsx
// components/Modal/Modal.tsx - generic modal chrome
export function Modal({ title, children, onClose, isOpen }) {
  // Generic modal structure, no domain logic
}
```

**Feature modals become:**
```tsx
// features/SettingsModal/SettingsModal.tsx
export function SettingsModal() {
  const isOpen = useUIStore(state => state.modals.settings);
  // Domain-specific settings content
  return <Modal title="Settings" isOpen={isOpen}>...</Modal>;
}
```

---

## Migration Priority Order

### Phase 1A: Quick Wins (30 mins)
1. ✅ Delete `containers/Sidebar/OKLCHPicker.tsx` (redundant)
2. ✅ Move `LabelWithPopover` to `components/`
3. ✅ Update imports (2 files: ColorPanel, SettingsModal + sidebar panels)

### Phase 2: Sidebar Features (2-3 hours)
Order: Simplest to most complex

1. **FontSelector** (standalone, minimal coupling)
2. **SampleTextPanel** (simple text input)
3. **TextControls** (font size/weight sliders)
4. **ColorPanel** (uses OKLCHPickerPanel)
5. **VariableAxesPanel** (uses AxisSlider)
6. **OpenTypeFeaturesPanel** (OT toggles)

For each:
- Create folder: `mkdir -p src/components/features/FontSelector`
- Move files: `mv containers/Sidebar/FontSelector.* features/FontSelector/`
- Update imports in Sidebar.tsx
- Test in browser
- Commit: `git commit -m "Extract FontSelector to features/"`

### Phase 3: Canvas Features (2-3 hours)
Order: Simplest to most complex

1. **LiveSyncIndicator** (small, standalone)
2. **EmptyState** (complex but standalone)
3. **PlainView** (minimal)
4. **WaterfallView** (minimal)
5. **PresentView** (medium)
6. **StylesView** (medium)
7. **GlyphsView** (complex, 5 files)

### Phase 4: BottomBar & Modal Features (1-2 hours)
1. **ViewSelector** (bottombar)
2. **ExportButtons** (bottombar)
3. **Modal base** → components/
4. **SettingsModal** → features/
5. **FontInfoModal** (+ tabs) → features/
6. **FontDetailsModal** → features/
7. **ScreenshotPreviewModal** → features/

---

## File Movement Commands

### Template for Moving a Feature
```bash
# Example: Move FontSelector

# 1. Create destination
mkdir -p src/components/features/FontSelector

# 2. Move files
mv src/components/containers/Sidebar/FontSelector.tsx \
   src/components/features/FontSelector/FontSelector.tsx
mv src/components/containers/Sidebar/FontSelector.module.css \
   src/components/features/FontSelector/FontSelector.module.css

# 3. Find and update imports
rg "from.*FontSelector" --type tsx
# Update Sidebar.tsx import path

# 4. Test
npm run dev

# 5. Commit
git add .
git commit -m "Extract FontSelector to features/"
```

---

## Verification Checklist

After each migration:
- [ ] File moved to correct location
- [ ] All imports updated (check with `rg "from.*ComponentName"`)
- [ ] No TypeScript errors
- [ ] Component renders correctly in browser
- [ ] No console errors
- [ ] Committed to git

---

## Success Criteria

### Phase 1 Complete
- [ ] No duplicate OKLCHPicker files
- [ ] LabelWithPopover in components/
- [ ] All imports updated

### Phase 2 Complete
- [ ] All 6 Sidebar features in features/
- [ ] Sidebar.tsx only imports from features/
- [ ] No domain logic in Sidebar.tsx

### Phase 3 Complete
- [ ] All 7 Canvas features in features/
- [ ] FontCanvas.tsx only imports from features/
- [ ] No view logic in FontCanvas.tsx

### Phase 4 Complete
- [ ] Modal base in components/
- [ ] All 4+ modal features in features/
- [ ] ViewSelector and ExportButtons in features/

### Final State
- [ ] Clear hierarchy: primitives → components → features → containers → layouts
- [ ] No domain logic in containers
- [ ] All features know domain, all components are generic
- [ ] Ready for layout refactoring (Phase 6)

---

*Use this as your source of truth during migration. Update checkboxes as you complete each item.*
