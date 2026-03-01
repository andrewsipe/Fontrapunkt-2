# Containers: Further Extraction & Cleanup

**Goal:** Per GRANULAR_REFACTORING_GUIDE, containers should only compose features and set context. Clean orphaned CSS and extract remaining domain logic into features.

---

## Findings

### 1. Orphaned CSS in Sidebar/
- **ComponentPatterns.module.css** — Not imported anywhere. Contains sectionHeader, categoryHeader, buttonGroup, inputGroup, controlGroup, iconButton sizes. **Action:** Remove (dead code).
- **PopoverShared.module.css** — Not imported anywhere. Contains popover content/title/description styles. **Action:** Remove (dead code). If popover styles are needed later, add to LabelWithPopover or a shared popover styles module.

### 2. Broken composes
- **AxisSlider.module.css** — `composes: labelSection from "../../containers/Sidebar/SidebarShared.module.css"` but SidebarShared.module.css does not define `.labelSection`. **Action:** Remove composes; Label primitive (variant small) already provides typography; keep only layout (flex-shrink, line-height) in .axisName.

### 3. Domain logic still in containers
- **Header** — handleGlobalReset (reset axes, updateTabSettings, default text/colors) and openSwatchBook (open settings modal) are feature-level behavior. **Action:** Extract **HeaderControls** (or GlobalToolbar) feature: renders ResetButton + SwatchBookButton with those handlers; Header composes it and only provides layout (logo + HeaderControls).
- **BottomBar** — Glyph count badge (fontStore.glyphCount) is domain UI. **Action:** Extract **GlyphCountBadge** feature; BottomBar composes it.
- **DropZone** — addFont, addTab, loadFontFile, handle capture, live watch are domain logic. **Action (optional):** Extract **useFontDrop** hook or FontDropHandler feature; DropZone stays as thin wrapper (useDropzone + overlay UI). Larger refactor; list as future opportunity.

### 4. Shared CSS location
- **SidebarShared.module.css** — Used by FontSelector, SampleTextPanel, OpenTypeFeaturesPanel (shared.button, shared.emptyState). AxisSlider composes labelSection (to be removed). **Option:** Move to `src/styles/sidebar/` so Sidebar folder only has Sidebar.tsx + Sidebar.module.css. **Decision:** Leave in Sidebar for now; Sidebar "owns" sidebar context. Document in guide.

---

## Checklist

- [x] Remove ComponentPatterns.module.css (orphaned).
- [x] Remove PopoverShared.module.css (orphaned).
- [x] Fix AxisSlider.module.css: remove broken composes; keep .axisName layout only.
- [x] Extract HeaderControls feature; Header composes it.
- [x] Extract GlyphCountBadge feature; BottomBar composes it.
- [x] useFontDrop hook — DropZone is thin (layout + overlay); domain logic in `src/hooks/useFontDrop.ts`.
- [x] SidebarShared moved to `src/styles/sidebar/SidebarShared.module.css`; FontSelector, SampleTextPanel, OpenTypeFeaturesPanel import from `../../../styles/sidebar/SidebarShared.module.css`. Sidebar folder now only has Sidebar.tsx + Sidebar.module.css.
