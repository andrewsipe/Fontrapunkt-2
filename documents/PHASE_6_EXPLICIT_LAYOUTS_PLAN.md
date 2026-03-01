# Phase 6: Create Explicit Layouts — Plan

**Goal:** Replace implicit layout in MainApp with named layout components. Move layout structure and CSS from MainApp.tsx + App.css into DefaultLayout, PresentationLayout, CompactLayout. Enables future layouts (e.g. floating toolbar).

**Reference:** START_HERE.md Phase 6, REFACTORING_STATUS_REPORT.md, GRANULAR_REFACTORING_GUIDE.md → Layouts.

---

## Scope

### Current state
- **MainApp.tsx:** DropZone > div.app (with app--compact when compactMode) > app-main > sidebar-container (collapsed when !sidebarOpen, overlay-mode when isPresentMode) > Header, Sidebar; FontCanvas; BottomBar; lazy modals.
- **App.css:** .app, .app-main, .sidebar-container, .collapsed, .overlay-mode, .app--compact, .toast-viewport.

### Phase 6 deliverables
1. **DefaultLayout** — Sidebar + canvas + bottom bar; sidebar open/collapsed (no overlay).
2. **PresentationLayout** — Same structure with sidebar-container.overlay-mode (present mode).
3. **CompactLayout** — Same structure with app.app--compact.
4. **Shared layout CSS** — Layout.module.css with app, appMain, sidebarContainer, collapsed, overlayMode, appCompact. Toast viewport stays in App.css (global).
5. **MainApp** — Chooses layout by isPresentMode / compactMode; passes sidebarOpen and modal slots (children) to the selected layout.

---

## Checklist

- [x] Layout.module.css created (layout structure classes).
- [x] DefaultLayout.tsx created; renders shell + children (modals).
- [x] PresentationLayout.tsx created (overlay-mode).
- [x] CompactLayout.tsx created (app--compact).
- [x] MainApp.tsx refactored to use layout components; layout CSS removed from MainApp.
- [x] App.css trimmed to .toast-viewport only.
- [x] `npm run build` passes.
- [x] `npx biome check` on touched files.
- [x] GRANULAR_REFACTORING_GUIDE.md layouts section updated.

---

## Success criteria
- Layout is a named component; MainApp only selects which layout and passes props.
- New layouts (e.g. FloatingToolbarLayout) can be added without touching MainApp structure.
- No layout logic or layout-specific CSS in MainApp.
