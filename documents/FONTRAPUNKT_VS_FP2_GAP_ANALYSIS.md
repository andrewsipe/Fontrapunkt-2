# Fontrapunkt (original) vs Fontrapunkt-2 — Gap Analysis

What exists in the original Fontrapunkt that has **not** been ported to FP2, or exists only in a basic/placeholder form. Use this to prioritize future work.

---

## 1. Routes & Pages

| Item | Fontrapunkt (original) | Fontrapunkt-2 | Notes |
|------|------------------------|---------------|--------|
| **Main app** | `/` → MainApp (DropZone + Layout + modals) | `/` → Fontrapunkt2Route (DropZone + Fontrapunkt2Layout) | Ported; different layout. |
| **Playground** | `/playground`, `/playground/:component`, `/toolbar-playground` | — | **Not ported.** Original has PlaygroundIndex, PlaygroundLayout, PlaygroundScene, and scenes for ColorPanel, FontSelector, GlyphsView, etc. |
| **Palette** | — | `/palette` → PaletteViewerPage | FP2-only. |

**Summary:** Playground is **not** ported to FP2 and is **skipped** (unused in FP2).

---

## 2. Shell & Layout

| Item | Fontrapunkt (original) | Fontrapunkt-2 | Notes |
|------|------------------------|---------------|--------|
| **Sidebar** | DefaultLayout: Header + **Sidebar** + SidebarResizeHandle + FontCanvas + BottomBar | No sidebar | **Not ported.** FP2 uses header + canvas + floating bar only. |
| **Resizable sidebar** | SidebarResizeHandle, collapse/expand | — | **Not ported.** |
| **Header** | containers/Header (logo + HeaderControls) | fp2/FP2Header (font name, badges, view strip, icon buttons) | Different design; FP2 header is the main nav. |
| **Bottom bar** | containers/BottomBar (ViewSelector, ExportButtons, GlyphCountBadge, ExpandSidebarButton) | Replaced by fp2/FloatingCommandBar | View strip moved to FP2Header; export/screenshot in FloatingCommandBar. |
| **Toolbar** | containers/Toolbar (used in layout or bar) | — | **Not ported** as a separate container; controls live in FloatingCommandBar. |
| **Layouts** | DefaultLayout, CompactLayout, PresentationLayout | Single layout (Fontrapunkt2Layout) + present mode | **CompactLayout** will not be ported to FP2. |

**Summary:** Sidebar is **not** ported to FP2 and is **skipped** (unused in FP2). FP2 uses a flat header + floating command bar + drawers for VF/OT.

---

## 3. Features in Original Sidebar Not Wired in FP2

These exist as **components** in `components/features/` in FP2 (used by fp2 modals or shared code) but are **not** used in the FP2 shell in the same way as the original sidebar.

| Feature | Original (where used) | FP2 status |
|---------|------------------------|------------|
| **FontSelector** | Sidebar | **Not in FP2 UI.** No in-app “switch font” list; font is set by drop (and possibly by future multi-tab/font flow). |
| **TextControls** | Sidebar | Replaced by FloatingCommandBar (size, weight, alignment, etc.). |
| **SampleTextPanel** | Sidebar | Replaced by Proofing modal (SampleTextModal) with tabs. |
| **VariableAxesPanel** | Sidebar | **Placeholder only.** VariableAxesDrawer exists but does not render VariableAxesPanel; content “coming soon”. |
| **ColorPanel** | Sidebar | Replaced by OKLCH popover in FloatingCommandBar. |
| **OpenTypeFeaturesPanel** | Sidebar | **Placeholder only.** OpenTypeDrawer exists but does not render OpenTypeFeaturesPanel; content “coming soon”. |

So in FP2:

- **Variable axes:** drawer shell only; no sliders/controls.
- **OpenType features:** drawer shell only; no feature toggles.
- **Font selector:** no UI to switch between multiple loaded fonts (if that model exists in store).

---

## 4. Modals

| Modal | Original | FP2 | Notes |
|-------|----------|-----|--------|
| Settings | ✅ MainApp | ✅ Fontrapunkt2Layout | Ported (fp2/modals/SettingsModal). |
| Font Info (app info) | ✅ MainApp | ✅ Fontrapunkt2Layout | Ported (fp2/modals/FontInfoModal). |
| Font Details (metadata) | ✅ MainApp | ✅ Fontrapunkt2Layout | Ported (fp2/modals/FontDetailsModal). |
| Sample Text / Proofing | In sidebar (SampleTextPanel) | ✅ SampleTextModal | Ported; redesigned (tabs + option cards). |
| **Screenshot Preview** | ✅ MainApp | ✅ Ported | ScreenshotPreviewModal mounted in Fontrapunkt2Layout; uses Base UI Dialog. Capture via [html2canvas-pro](https://yorickshan.github.io/html2canvas-pro/getting-started.html); screenshot button opens preview modal. |

**Summary:** Screenshot Preview is ported: modal in layout, Base UI Dialog, preview → download/copy/cancel.

---

## 5. Header / Bar Features (original vs FP2)

| Item | Original | FP2 | Notes |
|------|----------|-----|--------|
| ViewSelector (Plain, Waterfall, Styles, Glyphs, Present) | BottomBar | FP2Header (view strip) | Ported; different placement. |
| Glyph count | BottomBar (badge) | FP2Header (plain text) | Ported; FP2 shows count as simple text in header, not a badge. |
| ExportButtons (CSS Copy, Screenshot, etc.) | BottomBar | FloatingCommandBar (CSS Copy, Screenshot) | Ported; no separate “Export” group. |
| ExpandSidebarButton | BottomBar | — | N/A (no sidebar). |
| HeaderControls (global reset, swatch) | Header | Replaced by FP2Header actions (settings, font info, sample text, etc.) | Different design. |

---

## 6. Engine, Stores, Utils, Data

- **Engine, stores, types, workers:** Same structure; FP2 has the same core (font loading, parsing, cache, fontStore, uiStore, settingsStore).
- **Utils:** FP2 has the same set plus `constants/themeConstants.ts` and `utils/contrastUtils.ts` (and token-related styling). No major util removed in FP2.
- **Data:** Both have `data/unicode` (and optional `storage` in original). Parity for analysis purposes.

---

## 7. Components Only in Original (not in FP2)

- **containers/** (all): Sidebar, Header, BottomBar, Toolbar, Canvas, DropZone — replaced by fp2 layout and components.
- **layouts/** (all): DefaultLayout, CompactLayout, PresentationLayout, SidebarResizeHandle — replaced by Fontrapunkt2Layout and present mode.
- **pages/** (original-only): MainApp, PlaygroundIndex, PlaygroundLayout, PlaygroundScene, `playground/` scenes (e.g. ColorPanelScene, FontSelectorScene, GlyphsViewScene, etc.).
- **UnusedComponents/** (original): LabeledControl, VirtualizedFontList, EditableSlider — never part of main flow; FP2 has no equivalent and likely doesn’t need them unless you reintroduce similar UI.

---

## 8. Summary: Not Ported, Skipped, or To Be Wired

1. **Playground** — **Skipped.** Not used in FP2.
2. **Sidebar** — **Skipped.** Not used in FP2.
3. **Variable axes UI** — VariableAxesDrawer will contain axis sliders (variable font); content to be wired.
4. **OpenType features UI** — OpenTypeDrawer will contain OpenType feature selectables; content to be wired.
5. **Font selector** — **Skipped.** FP2 is single-font viewer.
6. **Screenshot Preview modal** — **Ported.** Mounted in FP2 layout; Base UI Dialog; html2canvas-pro for capture.
7. **Glyph count** — In FP2 header as plain text (not a badge).
8. **CompactLayout** — **Skipped.** Will not be ported.

---

## 9. Suggested Next Steps (priority order)

1. **Fill VariableAxesDrawer** with axis sliders (VariableAxesPanel or fp2 equivalent) when variable font is loaded.
2. **Fill OpenTypeDrawer** with OpenType feature selectables (OpenTypeFeaturesPanel or fp2 equivalent).

This document can be updated as you port or remove features.
