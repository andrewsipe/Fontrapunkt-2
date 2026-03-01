# Developer Tools UI Refactoring Plan

**Date:** February 4, 2026  
**Purpose:** Actionable refactoring plan derived from the Developer Tools UI skill review. Aligns layout, panels, toolbars, and polish with dev-tool UX best practices (Evil Martians–style).

**Reference:** Assessment in conversation; skill: `developer-tools-ui` (tabs, toolbars, sidebars, properties panels, tables, friction reduction, state persistence, responsive/chrome).

**Related:** `GRANULAR_REFACTORING_GUIDE.md` (hierarchy), `REFACTORING_STATUS_REPORT.md` (current state), `START_HERE.md` (quick start).

---

## Principles (guiding the plan)

1. **Primary work area stays dominant** — Canvas remains central; changes support it (e.g. resizable sidebar, compact chrome).
2. **Reduce friction** — Resize, persist scroll/tab, adequate hit areas, consistent controls.
3. **No single happy path** — Support narrow windows, compact mode, and varied workflows.
4. **Polish and a11y** — Scrollbars, focus, and hierarchy clear without relying on color alone.

---

## Phase overview

| Phase | Focus | Est. | Dependency |
|-------|--------|-----|-------------|
| **A** | Resizable sidebar | 2–3 h | None |
| **B** | Compact layout density | 1–2 h | None |
| **C** | Toolbar hit areas and grouping | 1–2 h | None |
| **D** | Sidebar state persistence | 1 h | Phase A (optional: tie to resize state) |
| **E** | Tabs and tables (targeted) | 1–2 h | None |
| **F** | Header chrome and scrollbars | ~1 h | None |

Phases A–C are the highest impact; D–F can be done in any order after or in parallel.

---

## Phase A: Resizable sidebar

**Goal:** Sidebar width is user-adjustable via a drag handle so users can favor canvas or panels.

**Tasks:**

- [x] **A.1** Add a resize handle (vertical strip) between the sidebar container and the canvas.
  - **Where:** Between `sidebarContainer` and `FontCanvas` in `DefaultLayout.tsx` and `CompactLayout.tsx` (and `PresentationLayout.tsx` if sidebar is not overlay-only).
  - **Behavior:** Pointer drag updates width; constrain to min/max (e.g. `--sidebar-width-min`, `--sidebar-width-max` or clamp like `200px`–`480px`).
- [x] **A.2** Drive sidebar width from state or a CSS variable.
  - **Option 1:** Store pixel width in `uiStore` (e.g. `sidebarWidthPx`) and apply inline style or a CSS variable on the layout/sidebar container.
  - **Option 2:** Use a single CSS variable (e.g. `--sidebar-width`) set by a layout effect or container component so existing `clamp()` can be overridden when user has resized.
- [x] **A.3** Persist preferred width (e.g. `localStorage` key like `fontrapunkt.sidebarWidth`) and restore on load so the choice survives refresh.
- [x] **A.4** Ensure the handle has a visible focus style and sufficient hit area (e.g. 8–12px wide, full height; consider `aria-label="Resize sidebar"` and optional keyboard adjust (e.g. arrow keys) later).
- [x] **A.5** When sidebar is collapsed, skip or hide the resize handle so it doesn’t appear in the collapsed state.

**Files to touch:**

- `src/components/layouts/DefaultLayout.tsx` (and CompactLayout, PresentationLayout if applicable)
- `src/components/layouts/Layout.module.css` (handle styling; width may stay variable-driven)
- `src/stores/uiStore.ts` (sidebar width state + persistence, or a small hook that reads/writes localStorage)
- Optional: `src/styles/tokens.css` (min/max tokens for sidebar if you prefer design tokens)

**Verification:**

- Drag handle resizes sidebar smoothly; min/max respected.
- Width persists after reload.
- Collapsed state hides handle; no layout jump.
- Focus visible on handle; no regression in keyboard nav.

---

## Phase B: Compact layout density

**Goal:** When `compactMode` is true, the app uses tighter spacing and typography so it works in narrow/short windows.

**Tasks:**

- [x] **B.1** Define compact tokens (e.g. under a `.appCompact` or `[data-compact]` scope) in `Layout.module.css` or `tokens.css`.
  - **Suggestions:** Smaller `--space-xs` through `--space-lg`, slightly smaller `--text-xs`/`--text-sm`, and a smaller `--control-height` so form controls and headers feel denser.
- [x] **B.2** Apply the compact scope in `CompactLayout.tsx` (already uses `styles.appCompact`); ensure the root of the layout has the class so all children inherit (e.g. `className={appClass}` on the outer div).
- [x] **B.3** Prefer cascading variables over duplicating rules: e.g. ` .appCompact { --space-md: 10px; --text-xs: 0.7rem; } ` so sidebar and panels pick them up without editing every feature.
- [x] **B.4** Optionally reduce header and footer padding in compact mode (container or layout CSS) so the chrome takes less vertical space.

**Files to touch:**

- `src/components/layouts/Layout.module.css` (`.appCompact` tokens)
- `src/components/layouts/CompactLayout.tsx` (confirm class application)
- If needed: `src/styles/tokens.css` (reference or override tokens for compact)

**Verification:**

- Toggling compact mode (when wired to a setting or flag) visibly tightens spacing and type.
- Sidebar panels, header, and bottom bar all reflect the new density; no overflow or clipped text in normal content.

---

## Phase C: Toolbar hit areas and grouping

**Goal:** All toolbar and footer buttons meet a minimum touch/click target; related actions are visually grouped.

**Tasks:**

- [x] **C.1** Introduce a shared token for minimum interactive size (e.g. `--touch-target-min: 44px` in `tokens.css`) and use it for IconContainer, footer buttons, and header controls where appropriate.
- [x] **C.2** Audit and fix hit areas:
  - **Sidebar footer:** `Sidebar.module.css` `.footerButton` — ensure min-width/min-height or padding yields at least 44px effective target.
  - **Header:** `HeaderControls` buttons (Reset, SwatchBook) — same.
  - **BottomBar:** ViewSelector toggles, ExportButtons, ExpandSidebarButton, GlyphCountBadge — ensure each interactive element meets the minimum.
  - **GlyphsView toolbar:** Search input, category prev/next, filter toggles — adequate height and padding.
- [x] **C.3** Group GlyphsView toolbar: add a visual separator or extra gap between “search + filters” and “category navigation” (e.g. in `GlyphsView.module.css` `.toolbarRow` or a wrapper) so the two task areas are distinct.
- [x] **C.4** Confirm IconContainer (and any toolbar icon) uses the token or a size prop that maps to a sufficient hit area; document in the component or Storybook if present.

**Files to touch:**

- `src/styles/tokens.css` (add `--touch-target-min`)
- `src/components/containers/Sidebar/Sidebar.module.css` (`.footerButton`)
- `src/components/features/HeaderControls/HeaderControls.module.css` (if needed)
- `src/components/features/GlyphsView/GlyphsView.module.css` (toolbar grouping)
- `src/components/features/Button` (or shared button styles) if used in header/bottom bar
- Optional: `src/components/components/IconContainer/IconContainer.tsx` + CSS (min dimensions)

**Verification:**

- All listed buttons/controls have at least 44×44px (or 44px min dimension) clickable area.
- GlyphsView toolbar has clear grouping between search/filters and category nav.
- No unintended layout break in narrow sidebar or compact mode.

---

## Phase D: Sidebar state persistence

**Goal:** Sidebar scroll position (and optionally panel collapse state) is restored when the user reopens the sidebar so they don’t lose place.

**Tasks:**

- [x] **D.1** Persist scroll position of the sidebar content area when the sidebar is closed or on unmount.
  - **Where:** The scrollable node is the element with `sidebarContent` in `Sidebar.module.css` (used in `Sidebar.tsx`). Add a ref to that div, and on close (or before unmount when `sidebarOpen` becomes false) read `scrollTop` and store it (e.g. in `uiStore` or a dedicated key in localStorage).
- [x] **D.2** Restore scroll position when the sidebar opens again: when `sidebarOpen` becomes true, set `scrollTop` on the same ref (e.g. in a `useEffect` that runs when `sidebarOpen` is true and a stored value exists).
- [x] **D.3** Skipped: No user-activated panel collapse; only disable states in certain views. Defer panel-collapse design before investing in state persistence.

**Files to touch:**

- `src/components/containers/Sidebar/Sidebar.tsx` (ref to content div, save/restore scroll; optionally read/write from uiStore or localStorage)
- `src/stores/uiStore.ts` (optional: `sidebarScrollTop`, `setSidebarScrollTop`, or persist in a single key)

**Verification:**

- Open sidebar, scroll down, collapse sidebar, expand again — scroll position is restored.
- After reload, if you persist scroll in localStorage, reopening sidebar restores it (optional).

---

## Phase E: Tabs and tables (targeted)

**Goal:** Prepare for tab overflow if needed; improve table clarity and accessibility where tables are used.

**Tasks:**

- [x] **E.1** Tabs (modals / future font tab bar):
  - **Current:** RadixTabs in FontInfoModal and FontDetailsModal; no overflow handling. Font “tabs” in store but no main-window tab bar yet.
  - **Action:** Document in code or in this doc that when the number of modal tabs (or future font tabs) grows, add overflow: horizontal scroll, “more” menu, or limit visible tabs with a dropdown. No code change required until tabs are added or lists grow.
  - **Done:** Added `overflow-x: auto` and comment in `RadixTabs.module.css` (`.list`); tab list scrolls when many tabs; plan references Phase E for future "more" menu.
- [x] **E.2** Tables (FontDetailsModal FontSourceTab):
  - **Headers:** `.tableHeader` uses `--bg-panel` and `font-weight: 500` so header rows stand out from expanded `.tableContent` (data).
  - **Sticky:** `.tableCount` ("Found N tables") is sticky at top with `--bg-surface` so it stays visible on scroll.
  - **A11y:** Container `role="list"` and `aria-label="Font tables"`; each `.tableItem` `role="listitem"`; rows are native buttons (Enter/Space supported).

**Files to touch:**

- `src/components/components/Tabs/RadixTabs.module.css` (optional overflow behavior for `.list`)
- `src/components/features/FontDetailsModal/FontSourceTab.module.css` (header distinction; sticky if applicable)
- `src/components/features/FontDetailsModal/FontSourceTab.tsx` (if adding roles or keyboard behavior)

**Verification:**

- Tab list with many items scrolls or wraps in a controlled way; no overflow chaos.
- Table header is clearly separate from data; if sticky, it stays visible when scrolling.
- Any interactive table supports keyboard and is announced correctly (quick manual test with screen reader).

---

## Phase F: Header chrome and scrollbars

**Goal:** Compact logo/chrome in narrow layout; consistent scrollbar styling for sidebar and panels.

**Tasks:**

- [x] **F.1** Header logo/chrome:
  - **Current:** Full “Fontrapunkt” text in header (`Header.tsx` + `Header.module.css`).
  - **Option:** Add a compact mode or narrow-container mode: show only an icon (or icon + short wordmark) in the top-left, with full name in `aria-label` or tooltip, to free horizontal space. Can be gated by container query (e.g. when sidebar is below 260px) or by `compactMode`.
- [x] **F.2** Scrollbar consistency:
  - **Done:** Scrollbar tokens in `tokens.css`; global and `.sidebarContent` use them; `scrollbar-color`/`scrollbar-width: thin` on sidebar for consistency.

**Files to touch:**

- `src/components/containers/Header/Header.tsx` (optional icon/compact title)
- `src/components/containers/Header/Header.module.css` (compact/narrow rules; container query or class)
- `src/components/containers/Sidebar/Sidebar.module.css` (scrollbar-color/width for `.sidebarContent` if desired)
- Optional: `src/styles/tokens.css` (scrollbar tokens)

**Verification:**

- In narrow or compact mode, header uses less horizontal space (if F.1 implemented).
- Sidebar scroll area matches the rest of the app’s scrollbar style.

---

## Optional / future work

- **Font tab bar in main UI:** When you add a tab bar for open fonts (using `tabs` / `activeTabId` from uiStore), add: overflow handling, close button on active (or each) tab, and persistence of last active tab and optionally order.
- **Panel reorder/collapse:** If users can reorder or collapse sidebar panels, persist that state (e.g. in settings or localStorage) and reapply on load.
- **Quick switcher:** For multiple open fonts, a Cmd/Ctrl+number or compact dropdown to switch fonts without losing place.

---

## Success criteria (overall)

- Sidebar is resizable and width persists across reloads.
- Compact layout is visibly denser and usable in narrow/short windows.
- All toolbar and footer controls meet minimum hit area; GlyphsView toolbar is clearly grouped.
- Sidebar scroll position (and optional panel state) restores when reopening.
- Tabs and tables are ready for growth and accessibility; header and scrollbars are consistent and space-efficient where intended.

---

## Quick reference: file map

| Area | Primary files |
|------|----------------|
| Layout / sidebar shell | `layouts/DefaultLayout.tsx`, `CompactLayout.tsx`, `Layout.module.css` |
| Sidebar content | `containers/Sidebar/Sidebar.tsx`, `Sidebar.module.css` |
| Header | `containers/Header/Header.tsx`, `Header.module.css`; `features/HeaderControls/` |
| Bottom bar | `containers/BottomBar/`; `features/ViewSelector/`, `ExportButtons/` |
| GlyphsView toolbar | `features/GlyphsView/GlyphsView.tsx`, `GlyphsView.module.css` |
| Tabs | `components/Tabs/RadixTabs.tsx`, `RadixTabs.module.css` |
| Tables | `features/FontDetailsModal/FontSourceTab.tsx`, `FontSourceTab.module.css` |
| State | `stores/uiStore.ts` |
| Tokens | `styles/tokens.css`, `styles/global.css` |

You can execute phases in order A → B → C, then D–F as needed; D can follow A if you tie persistence to the same layout state.
