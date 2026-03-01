# Phase 2: Extract Sidebar Features — Plan

**Goal:** Move the six domain panels from `containers/Sidebar/` to `features/` so Sidebar becomes a pure container. Execute one feature at a time; commit after each.

---

## Scope

| # | Feature | Files to move | Dependencies |
|---|---------|----------------|--------------|
| 1 | FontSelector | FontSelector.tsx, FontSelector.module.css | LivePulseIcon (Modals), Sidebar.module.css, SidebarShared.module.css |
| 2 | SampleTextPanel | SampleTextPanel.tsx, SampleTextPanel.module.css | Sidebar.module.css, SidebarShared.module.css |
| 3 | TextControls | TextControls.tsx, TextControls.module.css | Sidebar.module.css only |
| 4 | ColorPanel | ColorPanel.tsx, ColorPanel.module.css | Sidebar.module.css only |
| 5 | VariableAxesPanel | VariableAxesPanel.tsx, VariableAxesPanel.module.css, **AxisSlider.tsx**, **AxisSlider.module.css** | Sidebar.module.css only |
| 6 | OpenTypeFeaturesPanel | OpenTypeFeaturesPanel.tsx, OpenTypeFeaturesPanel.module.css | Sidebar.module.css, SidebarShared.module.css |

**Shared CSS (do not move in Phase 2):** Panels use `Sidebar.module.css` (e.g. `.sidebarPanel`, `.panelCollapsed`, `.panelContent`) and some use `SidebarShared.module.css` (e.g. `.button`, `.emptyState`). After moving to `features/`, each feature will keep using these by importing from the container:

- `sidebarStyles` from `../../../containers/Sidebar/Sidebar.module.css`
- `shared` from `../../../containers/Sidebar/SidebarShared.module.css` (only where used)

This preserves current look and avoids new shared CSS in this phase. Later you can move panel chrome into a shared style or have the container wrap each feature with the panel class.

---

## Path and import rules (from `features/<Name>/`)

- **Stores / utils / types / styles:** `../../../stores/`, `../../../utils/`, `../../../types/`, `../../../styles/` — same as today (three levels up to `src/`).
- **Components:** `../../components/...` (e.g. TitleBar, LabelWithPopover, TwoLayerSlider).
- **Primitives:** `../../primitives/...`
- **Other features:** `../OKLCHPicker/OKLCHPickerPanel`, `../Button/CloseButton`, etc.
- **Sidebar CSS (temporary):** `../../../containers/Sidebar/Sidebar.module.css`, `../../../containers/Sidebar/SidebarShared.module.css`.
- **FontSelector only:** LivePulseIcon from `../../containers/Modals/LivePulseIcon`.
- **VariableAxesPanel only:** AxisSlider stays next to it as `./AxisSlider` (move AxisSlider into `features/VariableAxesPanel/` with the panel).

---

## Execution order (one feature at a time)

### 1. FontSelector

- Create `src/components/features/FontSelector/`.
- Move `containers/Sidebar/FontSelector.tsx` → `features/FontSelector/FontSelector.tsx`.
- Move `containers/Sidebar/FontSelector.module.css` → `features/FontSelector/FontSelector.module.css`.
- In **FontSelector.tsx** update imports:
  - `../../components/` → `../../components/` (unchanged).
  - `../Modals/LivePulseIcon` → `../../containers/Modals/LivePulseIcon`.
  - `./FontSelector.module.css` → `./FontSelector.module.css` (unchanged).
  - `./Sidebar.module.css` → `../../../containers/Sidebar/Sidebar.module.css`.
  - `./SidebarShared.module.css` → `../../../containers/Sidebar/SidebarShared.module.css`.
- In **Sidebar.tsx**: `import { FontSelector } from "./FontSelector"` → `import { FontSelector } from "../../features/FontSelector/FontSelector"` (or `../../features/FontSelector` if you add an index).
- Add `features/FontSelector/index.ts` that exports `FontSelector` (optional but consistent).
- Run build; commit.

### 2. SampleTextPanel

- Create `features/SampleTextPanel/`, move SampleTextPanel.tsx + SampleTextPanel.module.css.
- In **SampleTextPanel.tsx**: fix `./Sidebar.module.css` and `./SidebarShared.module.css` to `../../../containers/Sidebar/...`.
- **Sidebar.tsx**: import SampleTextPanel from `../../features/SampleTextPanel/...`.
- Build; commit.

### 3. TextControls

- Create `features/TextControls/`, move TextControls.tsx + TextControls.module.css.
- In **TextControls.tsx**: only `./Sidebar.module.css` → `../../../containers/Sidebar/Sidebar.module.css`.
- **Sidebar.tsx**: import TextControls from `../../features/TextControls/...`.
- Build; commit.

### 4. ColorPanel

- Create `features/ColorPanel/`, move ColorPanel.tsx + ColorPanel.module.css.
- In **ColorPanel.tsx**: `./Sidebar.module.css` → `../../../containers/Sidebar/Sidebar.module.css`. Other imports (components, features/OKLCHPicker, LabelWithPopover) already use correct relative paths from `containers/Sidebar`; from `features/ColorPanel` they become `../../components/...`, `../OKLCHPicker/OKLCHPickerPanel`, `../../components/LabelWithPopover`.
- **Sidebar.tsx**: import ColorPanel from `../../features/ColorPanel/...`.
- Build; commit.

### 5. VariableAxesPanel (+ AxisSlider)

- Create `features/VariableAxesPanel/`.
- Move **VariableAxesPanel.tsx**, **VariableAxesPanel.module.css**, **AxisSlider.tsx**, **AxisSlider.module.css** into `features/VariableAxesPanel/`.
- In **VariableAxesPanel.tsx**: `./Sidebar.module.css` → `../../../containers/Sidebar/Sidebar.module.css`; `./AxisSlider` stays `./AxisSlider`; `../../components/...` and `../../primitives/...` stay (same depth from features).
- In **AxisSlider.tsx**: `./AxisSlider.module.css` stays `./AxisSlider.module.css`; `../../components/TwoLayerSlider` → `../../components/TwoLayerSlider`; `../../../stores/`, `../../../types/`, `../../../utils/` unchanged.
- **Sidebar.tsx**: import VariableAxesPanel from `../../features/VariableAxesPanel/...`.
- Build; commit.

### 6. OpenTypeFeaturesPanel

- Create `features/OpenTypeFeaturesPanel/`, move OpenTypeFeaturesPanel.tsx + OpenTypeFeaturesPanel.module.css.
- In **OpenTypeFeaturesPanel.tsx**: `./Sidebar.module.css` and `./SidebarShared.module.css` → `../../../containers/Sidebar/...`.
- **Sidebar.tsx**: import OpenTypeFeaturesPanel from `../../features/OpenTypeFeaturesPanel/...`.
- Build; commit.

---

## After all six

- **Sidebar.tsx** only imports from `../../features/...` and `../../components/...` (and uiStore, icons). No `./ColorPanel` etc.
- **containers/Sidebar/** should contain only: Sidebar.tsx, Sidebar.module.css, SidebarShared.module.css, and any other shared sidebar-only files (e.g. ComponentPatterns.module.css, PopoverShared.module.css if still referenced). Remove **OKLCHPicker.module.css** if it was left behind after Phase 1A (orphaned).
- Run full build and quick smoke test (open font, change axes, colors, sample text, OT features).

---

## Checklist (per feature)

- [ ] Folder `features/<Name>/` created.
- [ ] TSX and module CSS moved (and AxisSlider + its CSS for VariableAxesPanel).
- [ ] All imports in the moved file(s) updated (stores, utils, components, primitives, Sidebar CSS, LivePulseIcon or AxisSlider as needed).
- [ ] Sidebar.tsx updated to import from `../../features/<Name>/...`.
- [ ] Optional: `features/<Name>/index.ts` added.
- [ ] `npm run build` passes.
- [ ] Committed.

---

## Optional: index.ts per feature

For consistency with Phase 1A (LabelWithPopover), each feature can have an `index.ts`:

```ts
export { FontSelector } from "./FontSelector";
```

Then Sidebar can use `import { FontSelector } from "../../features/FontSelector"` instead of `../../features/FontSelector/FontSelector`.
