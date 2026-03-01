# Fontrapunkt 2.0 — Vision & Plan

Full build perspective with a focus on Phase 1. Use this as the actionable plan; the vision and first slice are the compass so we don’t stray when building. After Phase 1 is complete, we’ll review (what we built in 2.0, what exists in 1.0, what’s left) and plan Phase 2+ with full context.

---

## 1. Purpose & use of this document

- **Single source** for the entire Fontrapunkt 2.0 build perspective.
- **Phase 1** is specified in enough detail to execute now (transition + first slice).
- **Later phases** are skeleton only; we’ll scope them after Phase 1 is done.
- **Decisions / deviations** get recorded here as we intentionally change the plan.

---

## 2. Vision & principles

- **New project from a copy** of the current build. Same engine, stores, and tooling; UI/layout is a clean slate. The existing app (1.0) remains as reference; no published overlap to support.
- **Functionally the same** as 1.0; **visually and interactively different**. Re-approach how the tool is used, not what it does.
- **First slice** = core (Plain) view + Floating Command Bar + views strip (including Present) + Sample Text modal + OpenType drawer. Other views and features come in later phases.

**Design principles**

- **Canvas:** Neutral, matte background (e.g. #E8E8E8) so typography stays the focus. High contrast for character shapes.
- **Glassmorphism:** Use **subtly** where it helps hierarchy (e.g. modal backdrops, overlays, optional bar/drawer). We already use blur on modals and Glyphs search; extend sparingly. Don’t compete with the font on screen. Meet contrast requirements; prefer more blur over busy backgrounds; support reduce-transparency / high-contrast when feasible ([NN/G glassmorphism](https://www.nngroup.com/articles/glassmorphism/)).
- **Bar & floating UI:** Pill shape, light elevation (shadow). Optional light glass (blur + opacity) if it reinforces depth without hurting readability.
- **Accent:** Single accent for active states and primary actions (e.g. Electric Blue #2F6BFF). Surfaces: white/light for active components; cool grey background.
- **Typography (UI):** Neutral, geometric sans; small sizes (11–13px) so the inspected font remains the focus.

**Key interaction decisions**

- **Sample Text** → Modal (open → choose → close → canvas updates).
- **OpenType** → Drawer (toggle, stays open until closed; long-list friendly).
- **Present** → Full-screen canvas; header and control bar hidden.

---

## 3. Full build perspective (skeleton)

High-level map of the entire 2.0 product. Phase 1 implements the bold parts; the rest is later.

| Area | Scope | Phase |
|------|--------|--------|
| **Shell** | Header (font selector, metadata tags, views strip, Present button). Optional/minimal sidebar or none for core flow. Canvas area. Floating Command Bar. | **Phase 1:** layout + bar + views strip + Present. |
| **Plain view** | Core editable text block; default sample text; font/size/weight/alignment/case/features from store. | **Phase 1.** |
| **Waterfall view** | Fluid scale, metric overlay, etc. | Later. |
| **Styles view** | Preset grid, named instances. | Later. |
| **Glyphs view** | Glyph grid, detail view, search. | Later. |
| **Present** | Full-screen canvas; header and bar hidden. | **Phase 1.** |
| **Sample Text** | Modal with presets and text preview; select → close → canvas updates. | **Phase 1.** |
| **OpenType** | Right drawer; OT badge + optional bar trigger; feature list; Copy CSS. | **Phase 1.** |
| **Variable Axes** | Left drawer; VF badge in header. | **Phase 1.** |
| **Preset Styles** | Header: dropdown or font-name control doubles as preset selector. | **Phase 1.** |
| **Orientation** | Bar, next to alignment (top / center / bottom). | **Phase 1.** |
| **Color** | SwatchBook icon in bar (Phase 1); link color picker in future phase. | **Phase 1** (icon); picker later. |
| **Export** | SVG/PNG/PDF, etc. | **Phase 1** (trigger in bar). |
| **Font loading, header** | Font name/preset, VF/OT badges, FileUp, BookA, Settings, glyph count. | **Phase 1.** |

---

## 3.2 Placement & behavior (clarified)

Where things live so we’re not “out of scope” for lack of clarity. Phase 1 implements the shell and triggers; some behavior (e.g. color picker, metadata/settings content) is a future phase.

**Floating Command Bar**

- **Orientation** (vertical alignment: top / center / bottom) — **in the bar**, next to the alignment toggles.
- **Color picker** — **SwatchBook icon** in the bar. Icon in Phase 1; link the actual color picker in a future phase.

**Header**

- **Font name** — Primary label; can double as **Preset Styles** dropdown (select named instance) so we don’t add a separate header menu. Simplifies the “font selection” from FP1.0 and adds context.
- **VF badge** — Shown when font is variable. **Activation toggle:** opens/closes **Variable Axes drawer (left)**.
- **OT badge** — Shown when font has OpenType features. **Activation toggle:** opens/closes **OpenType Features drawer (right)**.
- **Context icons:**
  - **FileUp** — access file system / upload font.
  - **BookA** — trigger metadata modal (modal content/specificity in a future phase).
  - **Settings** — trigger settings modal (modal content/specificity in a future phase).
- **Glyph count** — in the header.
- **Preset Styles** — Either a dedicated select dropdown in the header, or the font-name control doubles as the preset styles menu (one control for font + preset).

**Drawers**

- **Left drawer** — Variable Axes. Opened/closed by **VF** badge in header.
- **Right drawer** — OpenType Features. Opened/closed by **OT** badge in header (and optionally a modest trigger in the bar for discoverability).

**Future phase (placement decided, behavior later)**

- **Screenshot and CSS code copy** — To be added; how to expose (bar, header, menu) TBD.
- **Metadata modal** — BookA icon in Phase 1; modal content/specificity in a future phase.
- **Settings modal** — Settings icon in Phase 1; modal content/specificity in a future phase.
- **Color picker UI** — SwatchBook icon in Phase 1; link picker in a future phase.

---

## 3.3 Before Phase 1 — Optional clarifications

Answer only if you have a preference; otherwise we proceed with the defaults below.

| Question | Default assumption |
|----------|--------------------|
| **Where does the 2.0 project live?** | Sibling folder next to current Fontrapunkt (e.g. `Fontrapunkt-2`). Copy folder, then work there. |
| **Exit from Present mode** | **Esc** exits Present (like 1.0). Optionally **F** toggles into Present. On-screen hint: “Esc to exit” when in Present. |
| **Font loading in 2.0** | Keep **drop zone** for initial load (minimal UI). Optionally add a “Load font” control in header later. |
| **Default viewMode** | **plain**. |
| **Tabs in Phase 1** | Keep **multi-tab** store shape from 1.0 (tabs, activeTabId, addTab, etc.). Phase 1 UI can show a single “active” tab; add tab switcher in header in a later pass if needed. |

---

## 4. Phase 1 — Transition (new project setup)

Do these steps before building new UI. Goal: new project runs with existing engine/stores, minimal shell, ready for Phase 1 components.

### 4.1 Create the new project

- Copy the current Fontrapunkt project folder to a new location (e.g. `Fontrapunkt-2` or new repo).
- Confirm the copy runs (install deps, `npm run dev`). Optionally rename app in `package.json` / README.

### 4.2 Directories and code: keep vs replace

**Keep (retain or move as-is)**

- `src/engine/` — font loading, parsing, extractors, cache, workers.
- `src/stores/` — fontStore, uiStore, settingsStore.
- `src/workers/` — parser worker, types.
- `src/utils/` — font utils, sampleTextUtils, fontSizeUtils, colorUtils, exportUtils, feature utils, etc.
- `src/types/` — all type definitions.
- `src/data/` — unicode, punctuation, symbols, etc.
- `src/hooks/` — useFontLoader, useFontDrop, useDefaultTab, useKeyboardShortcuts, useTheme, etc.
- `src/assets/` (fonts, etc.) and `public/` as needed.
- Test setup and engine/unit tests if we want to keep them.

**Replace / rebuild**

- `src/components/` — rebuild for 2.0 (or remove and add new components incrementally).
- `src/pages/` — layout and routing for 2.0 shell.
- `src/App.tsx` — entry and provider tree for 2.0.
- `src/styles/` — adapt for 2.0 design tokens; keep shared bits (e.g. reset, global.css) and update as we go.

**Reference only (1.0)**

- Original project stays as reference for behavior and technical solutions. No need to copy every legacy component into 2.0.

### 4.3 Dependencies

- **Add Base UI:** `npm i @base-ui/react` (or per-component imports as per Base UI docs). Plan to use Base UI for new primitives: Dialog (modal, drawer pattern), Tabs, Select, Toggle Group, etc.
- **Radix:** Remove as we replace primitives, or keep temporarily and migrate component-by-component. Document which primitives are replaced in Phase 1 (e.g. Dialog for modal, Toggle Group for views strip).
- **Rest:** Keep React, Vite, Zustand, Lucide (or current icon set), etc. consistent with 1.0 unless we explicitly change.

### 4.4 Minimal runnable shell (post-transition)

- **Layout:** One main layout: canvas region + header strip (placeholder for font name + views) + bottom bar slot. No full UI yet.
- **State:** Wire existing stores so font load and tab state work (e.g. drop zone or minimal load trigger, active tab, viewMode).
- **Canvas:** Render a single view slot (e.g. placeholder or 1.0 PlainView with minimal wiring) so we can confirm font application and store updates.
- **Done when:** App runs, a font can be loaded, state updates, and we have a clear place to add the Floating Command Bar and real Plain view.

---

## 5. Phase 1 — First slice (build)

After the transition, implement in this order. Each step is actionable; “done when” is implied by the description.

### 5.1 Shell and layout

- Define the main 2.0 layout: canvas area (flex/grid), header strip (top), Floating Command Bar (bottom center).
- Canvas background: #E8E8E8 or design token; overflow/scroll so content can scroll if needed.
- Ensure the bar has a reserved region (e.g. fixed or sticky bottom) so it doesn’t overlap content unpredictably.
- **Present mode:** Toggle that hides header and bar and makes the canvas full-screen. Wire to viewMode (e.g. `viewMode === "present"`). **Exit:** Esc key sets viewMode back to plain and restores header/bar; optional F key to enter Present. Show an on-screen hint in Present (e.g. “Esc to exit”).

### 5.2 Views strip

- Implement the mode switcher in the header: Plain, Waterfall, Styles, Glyphs, Present (five options).
- Wire to store `viewMode` (or equivalent). Switching mode re-renders the canvas view; no full page reload.
- **Present** switches to full-screen and hides header + bar; other modes show normal layout.
- For Phase 1, only **Plain** and **Present** need full behavior. Waterfall, Styles, Glyphs can render a placeholder (“Coming in a later phase”) or a minimal 1.0 view if we want something visible.

### 5.3 Floating Command Bar

- Build the pill-shaped bar: bottom center, elevation (shadow), optional subtle glass (blur + opacity).
- **Contents (left to right):** Size slider, Weight slider, **Alignment** (Left / Center / Right), **Orientation** (vertical alignment: top / center / bottom, next to alignment), **Case** (AB / Aa / ab), **SwatchBook icon** (placeholder for color picker; link picker in future phase), OpenType trigger (opens right drawer; modest, not dominant), Export (e.g. icon + menu or direct action).
- Wire each control to the same store APIs used in 1.0 (e.g. tab settings: fontSize, weight/axis, alignment, verticalAlignment, textTransform; OpenType = open right drawer; Export = existing export utils).
- Use Base UI where it fits (e.g. Toggle Group for alignment, orientation, and case). Sliders can be Base UI Slider or current pattern; keep behavior consistent with 1.0 (e.g. size range, weight range).

### 5.4 Core (Plain) view

- Implement or adapt the Plain view: single editable text block, font/size/weight/alignment/**orientation (vertical)**/case/features from store.
- Default sample text: e.g. “Standard Alphabet” (A–Z, a–z, 0–9) or current 1.0 default.
- Reuse or port 1.0 PlainView logic (and fontSizeUtils, getCanvasFontStack, buildFeatureSettings, etc.) so behavior matches (zoom-to-fit, contentEditable sync, variable font axes).
- Ensure the canvas receives font family, size, weight, alignment, textTransform, fontFeatureSettings, and variation settings from the active tab.

### 5.5 Sample Text modal

- Add a trigger (e.g. in bar or header) that opens the Sample Text modal.
- Modal content: list of presets (e.g. Standard Alphabet, Pangram, Lowercase waterfall, Article snippet) with **actual text preview** for each.
- On select: set active tab’s text (store update), close modal, canvas updates.
- Use Base UI Dialog; blurred backdrop to match glassmorphism. Accessible (focus trap, title, close button).

### 5.6 Drawers (Variable Axes left, OpenType right)

- **Left drawer — Variable Axes.** Opened/closed by **VF** badge in header (when font is variable). Content: axis sliders / preset list. Toggle closes it; stays open until user closes. Long content: scrollable.
- **Right drawer — OpenType Features.** Opened/closed by **OT** badge in header (and optionally a modest trigger in the bar). Content: list of OpenType features (e.g. stylistic sets) with checkboxes; optional “Copy CSS” button for `font-feature-settings`. Long list: scrollable. Wire checkboxes to store (e.g. tab `otFeatures`); canvas already reads this for `fontFeatureSettings`.
- Use overlay or push layout so drawers don’t fully block the canvas. Base UI or simple panel pattern.

### 5.7 Header (font, badges, icons, glyph count)

- **Font name** — Show current font; acts as dropdown for switching loaded fonts and/or **Preset Styles** (named instances). Simplify FP1.0 font selector; one control for font + preset where appropriate.
- **VF badge** — Shown when font is variable. Click opens/closes **left drawer (Variable Axes)**. Style as activation toggle when drawer is open.
- **OT badge** — Shown when font has OpenType features. Click opens/closes **right drawer (OpenType Features)**. Style as activation toggle when drawer is open.
- **Context icons:** **FileUp** (upload / load font), **BookA** (open metadata modal — content in future phase), **Settings** (open settings modal — content in future phase).
- **Glyph count** — Display in header (e.g. “1,234 glyphs” when font is loaded).
- Reuse store and load pipeline from 1.0. Drop zone still available for initial load; FileUp can trigger file picker.

### 5.8 Phase 1 “done when”

- New project runs after transition; Base UI installed; minimal shell in place.
- Layout: canvas + header (views strip, font name/preset, VF/OT badges, FileUp, BookA, Settings, glyph count) + Floating Command Bar.
- Plain view works with store-driven font/size/weight/alignment/**orientation**/case/features; default sample text.
- Command bar: Size, Weight, Alignment, **Orientation**, Case, **SwatchBook icon**, OpenType trigger, Export.
- Present mode: full-screen canvas, header and bar hidden; Esc to exit.
- Sample Text modal: open → choose preset with preview → close → canvas text updates.
- **Left drawer (Variable Axes):** opened by VF badge; axis/preset content; toggle close.
- **Right drawer (OpenType):** opened by OT badge (and optional bar trigger); feature toggles update canvas; long list scrolls; optional Copy CSS.
- Export trigger in bar works (existing export utils).
- Font can be loaded (drop or FileUp); name, VF/OT badges, and glyph count in header; BookA and Settings open modals (content can be placeholder for future phase).

---

## 6. Phase 1 — Out of scope (or future-phase behavior)

Placement is now decided; the following are either not in Phase 1 or only the trigger/placeholder is in Phase 1:

- **Color picker UI** — SwatchBook icon is in the bar in Phase 1; **linking the actual color picker** is a future phase.
- **Metadata modal content** — BookA icon opens the modal in Phase 1; **modal content/specificity** is a future phase.
- **Settings modal content** — Settings icon opens the modal in Phase 1; **modal content/specificity** is a future phase.
- **Screenshot and CSS code copy** — How to expose (bar, header, menu) and full behavior TBD; future phase.
- **Full redesigns** of Waterfall, Styles, Glyphs views (placeholders or minimal 1.0 wiring only in Phase 1).

---

## 7. Later phases (skeleton)

To be planned **after** Phase 1 is complete, using:

- What we built in 2.0 (Phase 1).
- What exists in 1.0 (reference).
- What’s left (Waterfall, Styles, Glyphs, orientation, color, variable axes, etc.).

**Rough scope (no detail yet):**

- **Phase 2+:** Waterfall view redesign; Styles view redesign; Glyphs view redesign; **color picker** (link to SwatchBook icon); **metadata modal** and **settings modal** content; **Screenshot and CSS copy** (placement TBD). Variable Axes and OpenType drawers are in Phase 1; orientation and Preset Styles are in Phase 1. Additional toolbar/header refinements as needed.

---

## 8. Design tokens (placeholder)

To be defined when building Phase 1. Suggested areas:

- Canvas background, surface, accent (e.g. #E8E8E8, #FFFFFF, #2F6BFF).
- Radii (e.g. 12–16px for cards/modals; full pill for bar).
- Shadows (e.g. bar elevation).
- Spacing and typography scale for UI (11–13px labels, etc.).

---

## 9. Decisions / deviations

*(Record intentional changes from this plan as we build.)*

-
