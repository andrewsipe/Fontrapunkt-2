# Non-Sidebar Component Inventory

**Date:** December 2024  
**Purpose:** Comprehensive catalog of all components outside the sidebar for pattern consistency review

---

## Core UI Components

### BottomBar
- **Files:** `BottomBar.module.css`, `BottomBar.tsx`
- **Sub-components:** `ViewSelector`, `ExportButtons`
- **Purpose:** Main application footer with view switching and export controls
- **Status:** ✅ Mostly compliant, minor state management issues

### Header
- **Files:** `Header.module.css`, `Header.tsx`
- **Purpose:** Application header with title and global controls
- **Status:** ✅ Fully compliant with sidebar patterns

### DropZone
- **Files:** `DropZone.module.css`, `DropZone.tsx`
- **Purpose:** Full-page drag-and-drop font upload handler
- **Status:** ✅ Recently updated with LoadingSpinner, compliant

---

## View Components

### Canvas Views
All located in `Canvas/` directory:

#### GlyphsView
- **Files:** `GlyphsView.module.css`, `GlyphsView.tsx`
- **Purpose:** Grid display of all font glyphs with search
- **Status:** ⚠️ Has documented exceptions (fixed black/white for contrast), but may have other deviations

#### PlainView
- **Files:** `PlainView.module.css`, `PlainView.tsx`
- **Purpose:** Simple text rendering view
- **Status:** ✅ Minimal styling, appears compliant

#### PresentView
- **Files:** `PresentView.module.css`, `PresentView.tsx`
- **Purpose:** Presentation-style text display
- **Status:** ⚠️ Needs review

#### StylesView
- **Files:** `StylesView.module.css`, `StylesView.tsx`
- **Purpose:** Grid display of font style variations
- **Status:** ⚠️ Has hover states missing proper disabled checks

#### WaterfallView
- **Files:** `WaterfallView.module.css`, `WaterfallView.tsx`
- **Purpose:** Typography size comparison view
- **Status:** ✅ Minimal styling, appears compliant

#### FontCanvas
- **Files:** `FontCanvas.module.css`, `FontCanvas.tsx`
- **Purpose:** Main canvas container
- **Status:** ⚠️ Needs review

#### EmptyState
- **Files:** `EmptyState.module.css`, `EmptyState.tsx`
- **Purpose:** Empty state display when no font loaded
- **Status:** ⚠️ Buttons missing proper state management

---

## Modal Components

All located in `Modals/` directory:

### UploadModal
- **Files:** `UploadModal.module.css`, `UploadModal.tsx`
- **Purpose:** Font file upload interface
- **Status:** ✅ Recently updated with LoadingSpinner and ErrorMessage, compliant

### SettingsModal
- **Files:** `SettingsModal.module.css`, `SettingsModal.tsx`
- **Purpose:** Application settings and preferences
- **Status:** ⚠️ Many hardcoded pixel values in slider controls, needs refactoring

### FontInfoModal
- **Files:** `FontInfoModal.module.css`, `FontInfoModal.tsx`
- **Sub-components:** `FontInfoTab`, `FontSourceTab`
- **Purpose:** Display font metadata and source information
- **Status:** ⚠️ FontInfoTab has hardcoded typography values

### DiagnosticModal
- **Files:** `DiagnosticModal.module.css`, `DiagnosticModal.tsx`
- **Purpose:** Font parsing diagnostic information
- **Status:** ⚠️ Needs review

### FontDetailsModal
- **Files:** `FontDetailsModal.tsx` (if exists)
- **Purpose:** Detailed font information
- **Status:** ⚠️ Needs review

---

## Utility Components

### LoadingSpinner
- **Files:** `LoadingSpinner.module.css`, `LoadingSpinner.tsx`
- **Purpose:** Reusable loading indicator
- **Status:** ✅ New component, fully compliant

### ErrorMessage
- **Files:** `ErrorMessage.module.css`, `ErrorMessage.tsx`
- **Purpose:** Standardized error display
- **Status:** ✅ New component, fully compliant

### FormField
- **Files:** `FormField.module.css`, `FormField.tsx`
- **Purpose:** Form field wrapper with label/error/hint
- **Status:** ✅ New component, fully compliant

---

## Diagnostic Components

All located in `Diagnostic/` directory:

### FontParserDiagnostic
- **Files:** `FontParserDiagnostic.module.css`, `FontParserDiagnostic.tsx`
- **Purpose:** Font parsing diagnostic display
- **Status:** ⚠️ Large file, needs comprehensive review

### ComparisonTable
- **Files:** `ComparisonTable.tsx`
- **Purpose:** Data comparison table
- **Status:** ⚠️ Needs review

### IssuesPanel
- **Files:** `IssuesPanel.tsx`
- **Purpose:** Display parsing issues
- **Status:** ⚠️ Needs review

### Other Diagnostic Components
- `DataMergingStage.tsx`
- `FontLoadStage.tsx`
- `ParserSourcesStage.tsx`
- `UIUsageStage.tsx`
- `NameTableLookups.tsx`
- `ExportButtons.tsx` (diagnostic version)

**Status:** ⚠️ All need review

---

## Component Categories Summary

| Category | Count | Compliant | Needs Review | Critical Issues |
|----------|-------|-----------|--------------|-----------------|
| Core UI | 3 | 2 | 1 | 0 |
| View Components | 7 | 2 | 5 | 0 |
| Modal Components | 5+ | 1 | 4+ | 0 |
| Utility Components | 3 | 3 | 0 | 0 |
| Diagnostic Components | 8+ | 0 | 8+ | 0 |
| **Total** | **26+** | **8** | **18+** | **0** |

---

## Files Requiring Review

### High Priority (User-Facing)
1. `BottomBar/BottomBar.module.css` - State management
2. `Canvas/EmptyState.module.css` - Button states
3. `Canvas/StylesView.module.css` - Hover states
4. `Modals/SettingsModal.module.css` - Many hardcoded values
5. `Modals/FontInfoTab.module.css` - Typography tokens

### Medium Priority (Functional)
6. `Canvas/GlyphsView.module.css` - Verify exceptions
7. `Canvas/FontCanvas.module.css` - Review patterns
8. `Canvas/PresentView.module.css` - Review patterns
9. `Modals/FontSourceTab.module.css` - Hardcoded widths
10. `Modals/DiagnosticModal.module.css` - Review patterns

### Low Priority (Diagnostic/Internal)
11. `Diagnostic/FontParserDiagnostic.module.css` - Large file, comprehensive review
12. All other diagnostic components

---

## Notes

- **Sidebar components excluded:** All components in `Sidebar/` directory are considered canonical reference
- **New components:** LoadingSpinner, ErrorMessage, FormField are fully compliant (created recently)
- **Recently updated:** DropZone, UploadModal have been updated with new patterns
- **Exception documentation:** GlyphsView has documented exceptions for fixed contrast colors

---

**Total Components Reviewed:** 26+  
**Components Fully Compliant:** 8 (31%)  
**Components Needing Review:** 18+ (69%)  
**Components with Critical Issues:** 0
