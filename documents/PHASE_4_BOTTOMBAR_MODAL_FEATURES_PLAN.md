# Phase 4: Extract BottomBar & Modal Features — Plan

**Goal:** Move ViewSelector and ExportButtons to `features/`, move the Modal base to `components/`, move LivePulseIcon to `components/`, and move each modal’s content to `features/`. BottomBar and MainApp become pure containers; modal content is domain-specific and lives in features.

**Estimated time:** 1–2 hours. Execute in the order below; build and commit after each part.

---

## Scope

### Part A: BottomBar features (2)

| # | Feature         | Files to move                          | Dependencies |
|---|-----------------|----------------------------------------|--------------|
| 1 | ViewSelector    | ViewSelector.tsx, ViewSelector.module.css | uiStore, CustomToggleGroup, Label |
| 2 | ExportButtons   | ExportButtons.tsx, ExportButtons.module.css | fontStore, uiStore, exportUtils, icons, IconContainer |

**BottomBar after Part A:** Only BottomBar.tsx, BottomBar.module.css; imports ViewSelector and ExportButtons from `../../features/...`.

---

### Part B: Modal base (component)

| # | Item    | Files to move     | Dependencies |
|---|---------|-------------------|--------------|
| 1 | Modal   | Modal.tsx, Modal.module.css | Radix Dialog, CloseButton (features), no domain logic |

**Location after move:** `components/Modal/Modal.tsx`, `components/Modal/Modal.module.css`, `components/Modal/index.ts`.

**Consumers (update imports to `../../components/Modal` or `../../../components/Modal`):**  
SettingsModal, FontInfoModal, FontDetailsModal, ScreenshotPreviewModal (all currently `./Modal`).

---

### Part C: LivePulseIcon (component)

| # | Item          | Files to move                    | Reason |
|---|---------------|----------------------------------|--------|
| 1 | LivePulseIcon | LivePulseIcon.tsx, LivePulseIcon.module.css | Generic “live sync state” indicator; used by FontSelector (features) and FontInfoTab (Modals). Move to `components/` so both can import without cross-feature dependency. |

**Location after move:** `components/LivePulseIcon/LivePulseIcon.tsx`, `components/LivePulseIcon/LivePulseIcon.module.css`, `components/LivePulseIcon/index.ts`.

**Consumers to update:**  
- `features/FontSelector/FontSelector.tsx`: `../../containers/Modals/LivePulseIcon` → `../../components/LivePulseIcon`.  
- FontInfoTab (moved with FontDetailsModal in Part D): `./LivePulseIcon` → `../../../components/LivePulseIcon` (from `features/FontDetailsModal/`).

Do **Part C after Part B** and **before Part D** so that when FontDetailsModal is moved, FontInfoTab already imports LivePulseIcon from components.

---

### Part D: Modal features (4 modals + sub-components)

| # | Feature               | Files to move | Notes |
|---|------------------------|---------------|--------|
| 1 | SettingsModal          | SettingsModal.tsx, SettingsModal.module.css | Uses Modal, stores, OKLCHPickerPanel, etc. |
| 2 | FontInfoModal          | FontInfoModal.tsx, FontInfoModal.module.css | About-app modal; uses Modal, RadixTabs. |
| 3 | FontDetailsModal       | FontDetailsModal.tsx, **FontInfoTab.tsx**, **FontSourceTab.tsx**, FontInfoTab.module.css, FontSourceTab.module.css | Tabs live inside `features/FontDetailsModal/`. Uses `../FontInfoModal/FontInfoModal.module.css` for shared modal styling (keep this import). |
| 4 | ScreenshotPreviewModal | ScreenshotPreviewModal.tsx, ScreenshotPreviewModal.module.css | Uses Modal, screenshot UI. |

**LivePulseIcon:** Already moved in Part C. Not moved again with modals.

**After Part D:**  
- `containers/Modals/` can be removed (or left empty).  
- MainApp lazy imports point to `../components/features/<ModalName>` for each modal.

---

## Path and import rules

**From `features/<Name>/` (e.g. ViewSelector, ExportButtons, SettingsModal):**

- **Stores / utils / engine / styles:** `../../../stores/`, `../../../utils/`, `../../../engine/`, `../../../styles/` (three levels up to `src/`).
- **Components:** `../../components/...` (e.g. Modal, ToggleGroup, Tooltip).
- **Primitives:** `../../primitives/...`
- **Other features:** `../Button/...`, `../OKLCHPicker/...`, etc.
- **BottomBar features:** No shared BottomBar CSS; each feature uses only its own module CSS.

**From `features/FontDetailsModal/`:**

- **FontInfoTab, FontSourceTab:** Stay as `./FontInfoTab`, `./FontSourceTab`.
- **Shared modal styles:** `../FontInfoModal/FontInfoModal.module.css`.
- **Modal base:** `../../components/Modal`.
- **LivePulseIcon:** `../../components/LivePulseIcon` (from FontInfoTab).

**From `components/Modal/`:**

- **CloseButton:** `../../features/Button/CloseButton`.
- **Styles:** `./Modal.module.css`.

**From `components/LivePulseIcon/`:**

- **Styles:** `./LivePulseIcon.module.css` only.

---

## Execution order

### Part A: BottomBar features

#### A1. ViewSelector

1. Create `src/components/features/ViewSelector/`.
2. Move `containers/BottomBar/ViewSelector.tsx` → `features/ViewSelector/ViewSelector.tsx`.
3. Move `containers/BottomBar/ViewSelector.module.css` → `features/ViewSelector/ViewSelector.module.css`.
4. In **ViewSelector.tsx**: from `features/ViewSelector/`, paths stay: `../../../stores/`, `../../components/`, `../../primitives/`, `./ViewSelector.module.css`.
5. Add `features/ViewSelector/index.ts`: `export { ViewSelector } from "./ViewSelector";`
6. In **BottomBar.tsx**: `import { ViewSelector } from "./ViewSelector"` → `import { ViewSelector } from "../../features/ViewSelector";`
7. Build; commit.

#### A2. ExportButtons

1. Create `src/components/features/ExportButtons/`.
2. Move `containers/BottomBar/ExportButtons.tsx` → `features/ExportButtons/ExportButtons.tsx`.
3. Move `containers/BottomBar/ExportButtons.module.css` → `features/ExportButtons/ExportButtons.module.css`.
4. In **ExportButtons.tsx**: from `features/ExportButtons/`, paths: `../../../stores/`, `../../../utils/`, `../../../styles/`, `../../components/` (IconContainer), `./ExportButtons.module.css`.
5. Add `features/ExportButtons/index.ts`: `export { ExportButtons } from "./ExportButtons";`
6. In **BottomBar.tsx**: `import { ExportButtons } from "./ExportButtons"` → `import { ExportButtons } from "../../features/ExportButtons";`
7. Build; commit.

**After Part A:** `containers/BottomBar/` contains only BottomBar.tsx and BottomBar.module.css.

---

### Part B: Modal base → components

1. Create `src/components/components/Modal/`.
2. Move `containers/Modals/Modal.tsx` → `components/Modal/Modal.tsx`.
3. Move `containers/Modals/Modal.module.css` → `components/Modal/Modal.module.css`.
4. In **Modal.tsx**: from `components/Modal/`, features are a sibling under `components/`, so CloseButton: `../features/Button/CloseButton` (was `../../features/Button/CloseButton` from `containers/Modals/`). Styles: `./Modal.module.css` unchanged.
5. Add `components/Modal/index.ts`: `export { Modal } from "./Modal";`
6. **Do not update modal consumers yet** — they still live in Modals and will need `../Modal` → `../../components/Modal` after the file move. So temporarily, from `containers/Modals/`, Modal is no longer there. Update all four modals in one go:
   - SettingsModal, FontInfoModal, FontDetailsModal, ScreenshotPreviewModal: `import { Modal } from "./Modal"` → `import { Modal } from "../../components/Modal";`
7. Build; commit.

**After Part B:** Modal is in `components/Modal/`. All four modals still in `containers/Modals/` and import Modal from `../../components/Modal`.

---

### Part C: LivePulseIcon → components

1. Create `src/components/components/LivePulseIcon/`.
2. Move `containers/Modals/LivePulseIcon.tsx` → `components/LivePulseIcon/LivePulseIcon.tsx`.
3. Move `containers/Modals/LivePulseIcon.module.css` → `components/LivePulseIcon/LivePulseIcon.module.css`.
4. In **LivePulseIcon.tsx**: only `./LivePulseIcon.module.css`; no other imports to fix.
5. Add `components/LivePulseIcon/index.ts`: `export { LivePulseIcon, type LiveSyncState } from "./LivePulseIcon";` (export the type if it exists).
6. Update **FontSelector** (already in features): `import { LivePulseIcon, type LiveSyncState } from "../../containers/Modals/LivePulseIcon"` → `import { LivePulseIcon, type LiveSyncState } from "../../components/LivePulseIcon";`
7. **FontInfoTab** still in `containers/Modals/` for now: `import { LivePulseIcon, type LiveSyncState } from "./LivePulseIcon"` → `import { LivePulseIcon, type LiveSyncState } from "../../components/LivePulseIcon";`
8. Build; commit.

**After Part C:** LivePulseIcon is in `components/LivePulseIcon/`. FontSelector and FontInfoTab import it from components.

---

### Part D: Modal features (one modal at a time)

#### D1. SettingsModal

1. Create `src/components/features/SettingsModal/`.
2. Move `containers/Modals/SettingsModal.tsx` → `features/SettingsModal/SettingsModal.tsx`.
3. Move `containers/Modals/SettingsModal.module.css` → `features/SettingsModal/SettingsModal.module.css`.
4. In **SettingsModal.tsx**: from `features/SettingsModal/`: `./Modal` → `../../components/Modal`; `./SettingsModal.module.css` → `./SettingsModal.module.css`. All other imports (`../../../engine/`, `../../../stores/`, `../../components/...`, `../../features/...`, `../../primitives/`) are already correct (three levels to src, two to components).
5. Add `features/SettingsModal/index.ts`: `export { SettingsModal } from "./SettingsModal";`
6. In **MainApp.tsx**: lazy import path `"../components/containers/Modals/SettingsModal"` → `"../components/features/SettingsModal";`
7. Build; commit.

#### D2. FontInfoModal

1. Create `src/components/features/FontInfoModal/`.
2. Move `containers/Modals/FontInfoModal.tsx` → `features/FontInfoModal/FontInfoModal.tsx`.
3. Move `containers/Modals/FontInfoModal.module.css` → `features/FontInfoModal/FontInfoModal.module.css`.
4. In **FontInfoModal.tsx**: `./Modal` → `../../components/Modal`; `./FontInfoModal.module.css` unchanged; `../../components/Tabs/RadixTabs` correct.
5. Add `features/FontInfoModal/index.ts`: `export { FontInfoModal } from "./FontInfoModal";`
6. In **MainApp.tsx**: lazy import path → `"../components/features/FontInfoModal";`
7. Build; commit.

#### D3. FontDetailsModal (+ FontInfoTab, FontSourceTab)

1. Create `src/components/features/FontDetailsModal/`.
2. Move **FontDetailsModal.tsx** → `features/FontDetailsModal/FontDetailsModal.tsx`.
3. Move **FontInfoTab.tsx**, **FontInfoTab.module.css** → `features/FontDetailsModal/`.
4. Move **FontSourceTab.tsx**, **FontSourceTab.module.css** → `features/FontDetailsModal/`.
5. In **FontDetailsModal.tsx**:  
   - `./FontInfoModal.module.css` → `../FontInfoModal/FontInfoModal.module.css`.  
   - `./FontInfoTab` → `./FontInfoTab`; `./FontSourceTab` → `./FontSourceTab`.  
   - `./Modal` → `../../components/Modal`.  
   - `../../components/Tabs/RadixTabs` unchanged; `../../../stores/` unchanged.
6. In **FontInfoTab.tsx**:  
   - `./LivePulseIcon` → `../../components/LivePulseIcon`.  
   - `./FontInfoTab.module.css` → `./FontInfoTab.module.css`.  
   - Fix any `../../../stores/`, `../../../utils/` etc. (same depth from features/FontDetailsModal).
7. In **FontSourceTab.tsx**:  
   - `./FontSourceTab.module.css` → `./FontSourceTab.module.css`; fix stores/utils paths (three levels to src).
8. Add `features/FontDetailsModal/index.ts`: `export { FontDetailsModal } from "./FontDetailsModal";`
9. In **MainApp.tsx**: lazy import path → `"../components/features/FontDetailsModal";`
10. Build; commit.

#### D4. ScreenshotPreviewModal

1. Create `src/components/features/ScreenshotPreviewModal/`.
2. Move `containers/Modals/ScreenshotPreviewModal.tsx` → `features/ScreenshotPreviewModal/ScreenshotPreviewModal.tsx`.
3. Move `containers/Modals/ScreenshotPreviewModal.module.css` → `features/ScreenshotPreviewModal/ScreenshotPreviewModal.module.css`.
4. In **ScreenshotPreviewModal.tsx**: `./Modal` → `../../components/Modal`; `./ScreenshotPreviewModal.module.css` unchanged; fix any other relative paths (stores, utils, components) for depth from features.
5. Add `features/ScreenshotPreviewModal/index.ts`: `export { ScreenshotPreviewModal } from "./ScreenshotPreviewModal";`
6. In **MainApp.tsx**: lazy import path → `"../components/features/ScreenshotPreviewModal";`
7. Build; commit.

---

## After Part D

- **containers/Modals/** should be empty. Remove the directory or leave it for future container-level modal orchestration if needed.
- **MainApp.tsx** lazy imports all four modals from `../components/features/<Name>`.
- **BottomBar** imports only from `../../features/ViewSelector` and `../../features/ExportButtons`.
- Run full build and a quick smoke test: open Settings, Font Info, Font Details (font loaded), Screenshot preview; use ViewSelector and ExportButtons.

---

## Checklist (per item)

**Part A (BottomBar)**  
- [ ] ViewSelector: folder created, files moved, imports fixed, BottomBar updated, index.ts, build, commit.  
- [ ] ExportButtons: same.

**Part B (Modal base)**  
- [ ] Modal: folder under components/, files moved, index.ts, all four modals updated to import from `../../components/Modal`, build, commit.

**Part C (LivePulseIcon)**  
- [ ] LivePulseIcon: folder under components/, files moved, index.ts, FontSelector and FontInfoTab imports updated, build, commit.

**Part D (Modal features)**  
- [ ] SettingsModal: folder, files, imports, MainApp lazy path, index.ts, build, commit.  
- [ ] FontInfoModal: same.  
- [ ] FontDetailsModal: folder, FontDetailsModal + FontInfoTab + FontSourceTab moved, CSS import to FontInfoModal, LivePulseIcon path in FontInfoTab, MainApp, index.ts, build, commit.  
- [ ] ScreenshotPreviewModal: same.

**Final**  
- [ ] `npm run build` passes.  
- [ ] `biome check .` passes (or document any remaining warnings).  
- [ ] Smoke test: BottomBar (view switch, export), all four modals open and close.

---

## Optional: index.ts pattern

Each feature and component can expose a barrel:

```ts
// features/ViewSelector/index.ts
export { ViewSelector } from "./ViewSelector";

// components/Modal/index.ts
export { Modal } from "./Modal";
```

Then consumers use `from "../../features/ViewSelector"` and `from "../../components/Modal"` without the file name.

---

## Summary

| Part | What | Where |
|------|------|--------|
| A    | ViewSelector, ExportButtons | `features/ViewSelector/`, `features/ExportButtons/` |
| B    | Modal (base)               | `components/Modal/` |
| C    | LivePulseIcon              | `components/LivePulseIcon/` |
| D    | SettingsModal, FontInfoModal, FontDetailsModal (+ tabs), ScreenshotPreviewModal | `features/SettingsModal/`, `features/FontInfoModal/`, `features/FontDetailsModal/`, `features/ScreenshotPreviewModal/` |

Execute A → B → C → D; build and commit after each step (or after each modal in D). Update MainApp lazy imports when each modal is moved.
