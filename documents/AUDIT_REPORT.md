# Fontrapunkt - Pre-Deployment Audit Report

**Date:** 2025-01-27  
**Auditor:** Senior Frontend Engineer & Accessibility Specialist  
**Scope:** Accessibility, CSS Architecture, React Best Practices, Responsiveness, Design Tokens

---

## 🔴 CRITICAL ISSUES

### 1. Hardcoded Z-Index Values Bypassing Design System

**Location:** Multiple files  
**Issue:** Several components use hardcoded `z-index` values instead of design tokens, creating potential stacking context conflicts.

**Files Affected:**
- `src/components/Canvas/LiveSyncIndicator.module.css` - `z-index: 1000` (should be `var(--z-toast)` or higher)
- `src/components/Sidebar/EditableSlider.module.css` - `z-index: 10` and `z-index: 100` (should use tokens)
- `src/components/ToggleGroup/CustomToggleGroup.module.css` - Multiple `z-index: 1` and `z-index: 2` (should use tokens)
- `src/components/Modals/SettingsModal.module.css` - `z-index: 1` and `z-index: 2` (should use tokens)

**Impact:** Z-index wars can cause modals, tooltips, or dropdowns to appear behind other elements, breaking functionality.

**Fix:**
```css
/* LiveSyncIndicator.module.css */
.indicator {
  z-index: var(--z-toast); /* 800 - above modals */
}

/* EditableSlider.module.css */
.thumb {
  z-index: var(--z-base); /* 0 - or create --z-slider-thumb: 10 */
}

.editableSlider[data-disabled]::after {
  z-index: var(--z-base); /* 0 - or appropriate token */
}

/* CustomToggleGroup.module.css */
/* Replace all z-index: 1 with var(--z-base) or remove if not needed */
/* Replace z-index: 2 with appropriate token or remove */
```

**Recommendation:** Add to `tokens.css`:
```css
--z-slider-thumb: 10;
--z-toggle-active: 1;
```

---

### 2. Missing Keys in List Rendering (Potential React Warnings)

**Location:** `src/components/Canvas/GlyphsView/CategorySection.tsx:94`  
**Issue:** Using `index` in key prop can cause rendering issues when list order changes.

**Current Code:**
```tsx
{glyphs.map((glyph, index) => (
  <GlyphCard
    key={`${glyph.unicode}-${index}`}  // ⚠️ Index in key
    glyph={glyph}
    // ...
  />
))}
```

**Fix:**
```tsx
{glyphs.map((glyph) => (
  <GlyphCard
    key={glyph.unicode || `${glyph.char}-${glyph.name}`}  // Use stable identifier
    glyph={glyph}
    // ...
  />
))}
```

**Note:** If `glyph.unicode` is not unique, combine with `glyph.char` or `glyph.name`.

---

### 3. Hardcoded Pixel Values in CSS (Not Using Design Tokens)

**Location:** Multiple CSS files  
**Issue:** Several hardcoded pixel values should use design tokens for consistency and maintainability.

**Examples:**
- `src/components/Canvas/LiveSyncIndicator.module.css:15` - `z-index: 1000` (already covered above)
- `src/components/Canvas/LiveSyncIndicator.module.css:28-29` - `width: 8px; height: 8px;` (should use `--icon-size-xs` or spacing token)
- `src/components/Canvas/LiveSyncIndicator.module.css:50` - `box-shadow: 0 0 0 8px` (should use spacing token)
- `src/components/Sidebar/EditableSlider.module.css:64` - `width: calc(100% - 24px)` (should use spacing token)
- `src/components/Sidebar/EditableSlider.module.css:84` - `min-width: 45px` (should use spacing token)
- `src/components/Sidebar/EditableSlider.module.css:111` - `min-width: 48px` (should use spacing token)

**Fix:**
```css
/* LiveSyncIndicator.module.css */
.pulseDot {
  width: var(--icon-size-xs); /* 12px */
  height: var(--icon-size-xs);
  /* ... */
  box-shadow: 0 0 0 var(--space-md) rgba(34, 197, 94, 0); /* 12px */
}

/* EditableSlider.module.css */
.trackWrapper {
  width: calc(100% - var(--space-xl)); /* 24px */
}

.thumb {
  min-width: calc(var(--space-xl) + var(--space-md)); /* ~45px */
}

.thumb.editing {
  min-width: calc(var(--space-xl) * 2); /* 48px */
}
```

---

### 4. Potential Content Hiding from Overflow

**Location:** `src/components/Collapsible/CustomCollapsible.module.css:108`  
**Issue:** `overflow: hidden` is required for height animations but may clip tooltips/popovers.

**Current Code:**
```css
.content {
  overflow: hidden; /* Required for animations */
}
```

**Impact:** Nested tooltips, popovers, or dropdowns inside collapsible content may be clipped.

**Fix:** Ensure nested interactive elements use Radix Portals (which they should already via Radix primitives). Add comment:
```css
.content {
  overflow: hidden; /* Required for height animations */
  /* Note: Nested tooltips/popovers must use Portal to escape clipping */
}
```

**Verification:** Check that all Radix Tooltip, Popover, and Select components inside collapsibles use `Portal` (they should by default in Radix).

---

## 🟡 HIGH PRIORITY ISSUES

### 5. Inconsistent Z-Index Usage in ToggleGroup

**Location:** `src/components/ToggleGroup/CustomToggleGroup.module.css`  
**Issue:** Multiple `z-index: 1` and `z-index: 2` values without clear purpose or design token usage.

**Lines:** 64, 118, 188, 287

**Fix:** Either remove z-index if not needed, or use design tokens:
```css
/* If z-index is needed for stacking within component */
.item[data-state="active"] {
  z-index: var(--z-toggle-active, 1); /* Define in tokens.css */
}
```

---

### 6. Hardcoded Values in SettingsModal

**Location:** `src/components/Modals/SettingsModal.module.css`  
**Issue:** Multiple `z-index: 1` and `z-index: 2` values (lines 269, 354, 364, 577).

**Fix:** Replace with design tokens or remove if unnecessary.

---

### 7. Toast Viewport Z-Index Calculation

**Location:** `src/App.css:72`  
**Issue:** Using `calc(var(--z-dropzone) + 1)` instead of a dedicated token.

**Current:**
```css
.toast-viewport {
  z-index: calc(var(--z-dropzone) + 1);
}
```

**Fix:** Use the existing `--z-toast` token:
```css
.toast-viewport {
  z-index: var(--z-toast); /* 800 - already defined */
}
```

---

### 8. Missing ARIA Labels on Some Interactive Elements

**Location:** Various components  
**Issue:** Some interactive elements may lack descriptive ARIA labels.

**Examples to Verify:**
- Range sliders (hue, lightness, chroma) in SettingsModal
- Color picker inputs
- Font selector dropdowns

**Fix:** Ensure all interactive elements have `aria-label` or are properly associated with visible labels:
```tsx
<input
  type="range"
  aria-label="Hue slider"
  aria-valuemin={0}
  aria-valuemax={360}
  aria-valuenow={settings.accentColor.hue}
  // ...
/>
```

---

### 9. Potential Layout Shift from Modal Scrollbar

**Location:** `src/components/Modals/Modal.tsx:96-108`  
**Issue:** Code attempts to prevent layout shift but uses `--scrollbar-width` which may not be set initially.

**Current Code:**
```tsx
useEffect(() => {
  if (isOpen) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    document.body.classList.add("modal-open");
  }
  // ...
}, [isOpen]);
```

**Fix:** Ensure `modal-open` class in global CSS properly handles scrollbar:
```css
/* In global.css */
body.modal-open {
  overflow: hidden;
  padding-right: var(--scrollbar-width, 0px);
}
```

---

### 10. Hardcoded Spacing in App.css

**Location:** `src/App.css:58`  
**Issue:** Hardcoded `box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1)` should use design tokens.

**Fix:**
```css
.sidebar-container.overlay-mode {
  box-shadow: var(--shadow-md); /* Or create --shadow-sidebar */
}
```

---

## 🟢 LOW PRIORITY ISSUES

### 11. Magic Numbers in VirtualizedGlyphGrid

**Location:** `src/components/Canvas/GlyphsView/VirtualizedGlyphGrid.tsx:114`  
**Issue:** Hardcoded `infoHeight = 50` should use a design token.

**Fix:**
```tsx
const infoHeight = 50; // → const infoHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glyph-info-height')) || 50;
```

Or add to tokens.css:
```css
--glyph-info-height: 50px;
```

---

### 12. Inconsistent Border Width Usage

**Location:** Multiple files  
**Issue:** Some places use `1px`, `2px` directly instead of `var(--border-width-default)`, `var(--border-width-thick)`.

**Examples:**
- `src/components/Sidebar/Sidebar.module.css:5` - `border-right: 1px solid` (should use `var(--border-width-default)`)
- `src/components/Sidebar/FontSelector.module.css:151` - `border: 1px solid` (should use token)

**Fix:** Replace with design tokens:
```css
border-right: var(--border-width-default) solid var(--border-default);
```

---

### 13. Hardcoded Icon Sizes in Some Components

**Location:** Various components  
**Issue:** Some icon size props use hardcoded numbers instead of design tokens.

**Example:** `src/components/Modals/SettingsModal.tsx:111` - `<Trash2 size={14} />` should use token or consistent sizing.

**Fix:** Create a mapping or use consistent sizes:
```tsx
// In icon utils or constants
const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

<Trash2 size={ICON_SIZES.sm} />
```

---

### 14. Missing Focus Visible States

**Location:** Some interactive elements  
**Issue:** Ensure all interactive elements have visible focus indicators.

**Verification:** Check that all buttons, inputs, and interactive elements have `:focus-visible` styles. Radix components should handle this, but verify custom elements.

---

### 15. Container Query Units in clamp() - Potential CLS

**Location:** `src/styles/tokens.css`  
**Issue:** Using `cqi` units in `clamp()` may cause layout shifts if container isn't defined.

**Example:**
```css
--space-md: clamp(12px, 1.8cqi, 16px);
```

**Impact:** If a component using this variable doesn't have `container-type: inline-size`, the `cqi` value falls back, potentially causing shifts.

**Fix:** Ensure all components using these tokens have proper container queries set up, or add fallback values.

**Verification:** Check that components using spacing tokens have `container-type: inline-size` or `container-type: size`.

---

### 16. React Hook Dependencies

**Location:** Various components  
**Issue:** Some `useEffect` or `useCallback` hooks may have missing dependencies.

**Example to Verify:** `src/components/Modals/Modal.tsx:63-72` - `handleOpenChange` callback dependencies look correct, but verify all similar patterns.

**Recommendation:** Run ESLint with `react-hooks/exhaustive-deps` rule to catch any issues.

---

### 17. Suspense Fallback is null

**Location:** `src/App.tsx:62-70`  
**Issue:** Suspense boundaries use `fallback={null}`, which may cause layout shift when modals load.

**Current:**
```tsx
<Suspense fallback={null}>
  <SettingsModal />
</Suspense>
```

**Fix:** Consider a minimal loading state:
```tsx
<Suspense fallback={<div aria-hidden="true" style={{ display: 'none' }} />}>
  <SettingsModal />
</Suspense>
```

Or keep `null` if modals are not critical for initial render (current approach is fine if intentional).

---

## ✅ POSITIVE FINDINGS

1. **Excellent Design Token System:** OKLCH color system with container queries is well-implemented.
2. **Radix UI Usage:** Proper use of Radix primitives with good accessibility defaults.
3. **CSS Modules:** Good scoping prevents style conflicts.
4. **TypeScript:** Strong typing throughout.
5. **Accessibility:** Most interactive elements have ARIA labels.
6. **Modal Implementation:** Good focus management and scrollbar handling.
7. **Responsive Design:** Container queries used appropriately.

---

## 📋 RECOMMENDED ACTION ITEMS

### Immediate (Before Deployment):
1. Fix all hardcoded z-index values (Issue #1)
2. Replace index-based keys with stable identifiers (Issue #2)
3. Fix toast viewport z-index (Issue #7)
4. Verify all range inputs have ARIA labels (Issue #8)

### Short Term (Post-Deployment):
5. Replace hardcoded pixel values with tokens (Issue #3, #12)
6. Standardize z-index usage in ToggleGroup (Issue #5)
7. Add missing design tokens for edge cases (Issue #11)

### Long Term (Maintenance):
8. Set up automated accessibility testing (Playwright + axe-core)
9. Add ESLint rule for React hooks dependencies
10. Document z-index hierarchy in design system
11. Create icon size constants/mapping

---

## 🔍 TESTING RECOMMENDATIONS

1. **Keyboard Navigation:** Test all modals, dropdowns, and interactive elements with keyboard only.
2. **Screen Reader:** Test with NVDA/JAWS/VoiceOver to verify ARIA labels.
3. **Z-Index Stacking:** Open multiple modals/tooltips simultaneously to verify stacking.
4. **Responsive:** Test on mobile viewports to verify container queries work.
5. **Reduced Motion:** Test with `prefers-reduced-motion: reduce` enabled.
6. **Focus Management:** Verify focus trapping in modals and focus restoration on close.

---

## 📝 NOTES

- The codebase is generally well-structured and follows modern React patterns.
- Design system is comprehensive and well-thought-out.
- Most issues are minor and can be addressed incrementally.
- No critical accessibility blockers found (Radix handles most cases).

---

**End of Audit Report**
