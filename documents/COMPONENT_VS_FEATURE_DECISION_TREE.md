# Component vs Feature: Decision Framework

**Purpose:** Clear criteria for classifying UI pieces during refactoring

---

## The Core Question

**Does it know about your product domain (fonts, settings, export, axes)?**

- **YES** → Feature
- **NO** → Component

---

## Decision Tree

```
┌─────────────────────────────────────┐
│ Could I copy this into a different  │
│ app (e.g. image editor, music app)  │
│ and use it with minimal changes?    │
└─────────────────────────────────────┘
           │
           ├─ YES → Probably a COMPONENT
           │        (or primitive)
           │
           └─ NO → Probably a FEATURE
                   (domain-specific)
```

---

## Quick Tests

### Test 1: The Rename Test
**If I renamed "font" to "image", would this still make sense?**

✅ **YES → Component**
- "IconContainer" — works with any icon
- "FormField" — works with any form
- "TooltipButton" — works anywhere
- "RadixSelect" — generic select
- "TwoLayerSlider" — generic slider with dual layers

❌ **NO → Feature**
- "FontSelector" — specifically selects fonts
- "VariableAxesPanel" — specifically for font axes
- "OpenTypeFeaturesPanel" — specifically for OpenType
- "ExportButtons" — exports *font* screenshots/CSS
- "GlyphCard" — displays a *glyph*

### Test 2: The Zustand Test
**Does it read from or write to a domain-specific store?**

✅ **Uses domain stores → Feature**
- Reads `useFontStore` → Feature
- Reads `useSettingsStore` → Feature
- Writes to `useUIStore` for font-related state → Feature

❌ **No store usage OR only UI state → Could be Component**
- Manages own local state (e.g. `isOpen`) → Component
- No state at all → Component or Primitive

### Test 3: The Props Test
**What data does it accept?**

✅ **Generic props → Component**
- `value`, `onChange`, `label`, `disabled`
- `children`, `title`, `isOpen`
- `size`, `variant`, `color`

❌ **Domain props → Feature**
- `font`, `axes`, `features`, `glyphs`
- `selectedFont`, `currentAxis`, `otFeatures`
- `exportType`, `screenshotData`

### Test 4: The Imports Test
**What does it import?**

✅ **Only UI/React/primitives → Component**
```tsx
import { Icon } from '../../primitives/Icon/Icon';
import * as Radix from '@radix-ui/react-popover';
import styles from './Component.module.css';
```

❌ **Imports domain stores/utils → Feature**
```tsx
import { useFontStore } from '@/stores/fontStore';
import { parseOpenTypeFeatures } from '@/utils/fontUtils';
import { Icon } from '../../primitives/Icon/Icon';
```

---

## Practical Examples from Fontrapunkt

### Clear Components
| Name | Why It's a Component |
|------|---------------------|
| IconContainer | Generic container for any icon, no font knowledge |
| FormField | Generic form field wrapper, works in any form |
| TooltipButton | Generic button + tooltip, reusable anywhere |
| RadixSelect | Styled Radix wrapper, no domain logic |
| TwoLayerSlider | Generic dual-layer slider, no axis knowledge |
| Modal | Generic modal chrome, no content knowledge |
| LoadingSpinner | Generic loading indicator |
| ErrorMessage | Generic error display |

### Clear Features
| Name | Why It's a Feature |
|------|-------------------|
| FontSelector | Knows about fonts, uses fontStore |
| VariableAxesPanel | Knows about font axes, reads axis data |
| OpenTypeFeaturesPanel | Knows about OT features, toggles font features |
| GlyphsView | Knows about glyphs, renders font glyphs |
| ViewSelector | Switches between font view modes |
| ExportButtons | Exports font CSS/screenshots |
| ColorPanel | Sets font/background colors (domain action) |
| TextControls | Controls font size/weight/etc |

### Tricky Cases (Requires Analysis)

#### Case: OKLCHPickerPanel
**Current:** `features/OKLCHPicker/OKLCHPickerPanel.tsx`

**Analysis:**
- Does it know about fonts? No
- Could it work in another app? Yes (any app needing color picking)
- What does it import? Only UI primitives (TwoLayerSlider)
- What props? `lightness`, `chroma`, `hue`, `onChange` (generic color values)

**Decision:** **COMPONENT** — It's a generic OKLCH color picker  
**Action:** Move to `components/OKLCHPicker/` (or keep as special "complex component")

#### Case: OKLCHPicker (in Sidebar) ✅ ANALYZED
**Current:** `containers/Sidebar/OKLCHPicker.tsx`

**Analysis:**
- Does it know about fonts? No
- Imports domain stores? No
- What does it do? Just a pass-through wrapper to OKLCHPickerPanel

**Actual Code:**
```tsx
export function OKLCHPicker(props: OKLCHPickerProps) {
  return <OKLCHPickerPanel {...props} />;
}
```

**Decision:** **DELETE** — This is redundant. Just import OKLCHPickerPanel directly.  
**Action:** Remove this file, update ColorPanel to import `features/OKLCHPicker/OKLCHPickerPanel` directly

#### Case: AxisSlider
**Current:** `containers/Sidebar/AxisSlider.tsx`

**Analysis:**
- Does it know about font axes? Likely yes
- What props? Probably `axis` (font axis object)
- Could I use it elsewhere? No, it's specific to variable font axes

**Decision:** **FEATURE**  
**Action:** Move to `features/VariableAxesPanel/AxisSlider.tsx` (sub-component of VariableAxesPanel)

#### Case: LabelWithPopover ✅ ANALYZED
**Current:** `containers/Sidebar/LabelWithPopover.tsx`

**Analysis:**
- Does it know about fonts? No—just knows about UI descriptions (generic pattern)
- Imports domain stores? No—imports `getSectionDescription` util but component is generic
- What does it do? Wraps Label primitive with Popover for contextual help
- Could I reuse it? Yes—pass any `sectionKey` and `description`

**Decision:** **COMPONENT**  
**Action:** Move to `components/LabelWithPopover/` (generic UI pattern with domain-agnostic API)

#### Case: GlyphCard
**Current:** `containers/Canvas/GlyphsView/GlyphCard.tsx`

**Analysis:**
- Does it know about glyphs? Yes
- Could I use it elsewhere? No, it's glyph-specific
- What props? `glyph`, `unicode`, `name` (domain data)

**Decision:** **FEATURE** (sub-component)  
**Action:** Move to `features/GlyphsView/GlyphCard.tsx`

#### Case: EmptyState ✅ ANALYZED
**Current:** `containers/Canvas/EmptyState.tsx`

**Analysis:**
- Does it know about fonts? **YES** (heavily)
- Imports: `useFontStore`, `useUIStore`, `useFontLoader`, `loadFontIntoApp`, `addFont`, `setCurrentFont`, `addTab`
- What does it do? Landing page with font upload, session restore, random font loading, creates tabs
- Lines of code: 397 (complex feature)

**Decision:** **FEATURE** (domain-heavy)  
**Action:** Move to `features/EmptyState/EmptyState.tsx`

#### Case: LiveSyncIndicator ✅ ANALYZED
**Current:** `containers/Canvas/LiveSyncIndicator.tsx`

**Analysis:**
- Does it know about fonts? **YES**
- Imports: `getWatchStatus` from font engine, listens for `font-reloaded` events
- What does it do? Shows live sync status for font file watching
- Could I reuse it? No—specifically for font file watching

**Decision:** **FEATURE**  
**Action:** Move to `features/LiveSyncIndicator/LiveSyncIndicator.tsx`

---

## Borderline Cases: When Components Become Features

### Pattern: Wrapper with Domain Logic

Sometimes you have:
- **Generic component:** `TwoLayerSlider` (component)
- **Domain wrapper:** `AxisSlider` wraps TwoLayerSlider with axis-specific logic (feature)

```tsx
// Component (generic)
export function TwoLayerSlider({ value, min, max, onChange }) {
  // Generic slider implementation
}

// Feature (domain-specific)
export function AxisSlider({ axis }: { axis: FontAxis }) {
  const { updateAxisValue } = useFontStore();
  
  return (
    <TwoLayerSlider
      value={axis.value}
      min={axis.min}
      max={axis.max}
      onChange={(val) => updateAxisValue(axis.tag, val)}
    />
  );
}
```

**Rule:** Generic component in `components/`, domain wrapper in `features/`

---

## When in Doubt

### Ask Yourself:
1. **Domain knowledge test:** If I removed all references to "font", "glyph", "axis", "feature", etc., would this still have a clear purpose?
   - YES → Component
   - NO → Feature

2. **Reusability test:** Would another developer building a different app (e.g., a video editor) want to copy this?
   - YES → Component
   - NO → Feature

3. **Location test:** Where would I expect to find this in a design system library?
   - In the design system → Component
   - Not in the design system → Feature

### Tiebreaker Rules:
- **If it reads/writes domain stores** → Feature (even if it looks generic)
- **If it's only used once** → Probably Feature (components are reusable)
- **If you're unsure** → Start as Feature, refactor to Component later if you find reuse

---

## Migration Checklist

When moving a component, ask:

### Before Moving:
- [ ] Does it import domain stores? (useFontStore, useSettingsStore)
- [ ] Does it have font/glyph/axis-specific props?
- [ ] Is it used in multiple places or just one?
- [ ] Could I use this in a non-font app?

### After Classifying:
- [ ] Component → stays in or moves to `components/`
- [ ] Feature → moves to `features/`
- [ ] Feature sub-component → moves to `features/ParentFeature/SubComponent.tsx`

### Red Flags (Reclassify):
- ⚠️ Component that imports useFontStore → Should be Feature
- ⚠️ Feature with zero domain logic → Should be Component
- ⚠️ Component used only once → Might be Feature or inline it

---

## Summary Table

| Characteristic | Component | Feature |
|---------------|-----------|---------|
| **Domain knowledge** | None | Yes (fonts, axes, glyphs) |
| **Store usage** | None or UI-only | useFontStore, useSettingsStore |
| **Props** | Generic (`value`, `label`) | Domain (`font`, `axis`) |
| **Reusability** | Used in many places | Often used once or few times |
| **Naming** | Generic nouns | Domain + purpose |
| **Imports** | Primitives, Radix, React | Stores, domain utils, components |
| **Location** | `components/` | `features/` |
| **Examples** | IconContainer, FormField, Modal | FontSelector, AxisSlider, GlyphCard |

---

## Next Steps

1. **Start with clear cases** (FontSelector, TextControls, etc.) — build confidence
2. **Tackle tricky cases** (LabelWithPopover, EmptyState) — read implementation first
3. **When in doubt** → Mark as Feature, refactor later if you find reuse
4. **Document borderlines** → Add to this file for future reference

---

*Use this as a reference while working through Phase 2-4 of the refactoring. Update with new patterns as you discover them.*
