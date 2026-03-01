# Type Trials (PangramPangram) vs Fontrapunkt — Build Comparison

**Focus:** Core build quality, features, and functionality for **font rendering and inspection** (not a11y).  
**Reference:** [Type Trials](https://typetrials.com/) (PangramPangram), Fontrapunkt (this repo).

---

## 1. Side-by-side overview

| Area | Type Trials (typetrials.com) | Fontrapunkt |
|------|------------------------------|-------------|
| **Font input** | Drag & drop + **OPEN** button on main page; **Add remote fonts / Load** (URL); built-in **Pangram variable font catalog** | Drag & drop (overlay); **Add Font** in sidebar/empty state (file picker); **Cmd+O** → file input. **No URL/remote load**, no built-in catalog |
| **Formats** | WOFF, TTF, OTF (stated on landing) | TTF, OTF, WOFF, **WOFF2** |
| **Persistence** | Not evident (session-only?) | **IndexedDB** cache, **session restore** (last font), **hot reload** via File System Access API when opening from file picker |
| **Multi-font / tabs** | **Tabbed canvases** at top; each Text Sample can create a new tab; **+** adds a tab from last tab’s settings; tabs have close (X). Single typeface per tab; catalog + upload. | **Single typeface at a time** in the UI. No tab bar. Tab *state* exists in the store (see Appendix) but no user-facing tab list or switch; **Cmd+W** closes current “tab” (implemented), **Cmd+T** (new tab) is README/TODO only |
| **View modes** | **3 views**: (1) Standard — full-width sidebar + tabbed canvases; (2) **Collapsed** — sidebar as icon strip; each icon opens that tool’s panel; (3) **Presentation** — TV icon hides everything except logo + TV icon. | **5 modes**: Plain, **Waterfall**, **Styles** (named instances grid), **Glyphs** (Unicode categories + search), **Present** (fullscreen). No collapsed-sidebar-as-icons layout. |
| **Text / samples** | Basic Set, Specimen, Pangram, Wikipedia, **All Glyphs**, **Kerning Text** | Basic Set, Specimen, Pangram, Wikipedia, **Entire Font**, **Proof sets** (Lowercase, Uppercase, Mixed, Ligatures, Figures, etc.), custom |
| **Typography controls** | Size, line height, letter spacing, alignment | Size, line height, letter spacing, alignment (horizontal + **vertical**), **zoom to fit**, **auto-fit fill** |
| **Variable axes** | Sliders with **adjustable range stops** at both ends; **Play All** (thumbs animate over range); **ease** dropdown (e.g. Quad); **time** (e.g. 1x); **follow mouse** (e.g. weight = left/right, italic = up/down). | Sliders + **named instance presets** (dropdown). **No axis animation**, no range stops, no follow-mouse. |
| **OpenType** | Toggle list; **some features on by default** (e.g. ccmp, liga, kern, mark, mkmk); defaults appear consistent across fonts; refresh to reset. | OpenType feature toggles in panel. |
| **Color** | **Hex** (no OKLCH). **Stroke/outline toggle** (solid vs outline). **Background image upload**. Pop-up pickers for typeface + background. **Flip** fg/bg. | **OKLCH** text + background; theme (light/dark/match); accent presets in Settings. No stroke/outline toggle; no background image. |
| **Export** | **Copy CSS** (font-variation-settings, etc.); **Export modal** with **Post/Square** and **Stories/Portrait** (Instagram/TikTok-friendly); Download, Copy CSS, Export for Instagram. | **Copy CSS** (with axis/features/size/color), **Screenshot** (preview modal, filename). No preset aspect ratios for social. “Record animations” in docs; **not in ExportButtons**. |
| **Font metadata / internals** | Not visible from landing | **Font Info** modal; **Font Details** modal with **Font Source** tab (table tree, TTX-like), checksums, parse status |
| **Empty / landing** | Drag & drop + OPEN + “Use Pangram variable fonts”; remote load CTA | **Empty state**: hero title (per-character font demo), **Add Font** + file input, **session restore** |
| **Keyboard** | Unknown | **Cmd+O** (open), **Cmd+W** (close tab), **Cmd+C** (copy CSS when no selection), **R** (reset axes), **F** (fullscreen), **Esc** (exit present / close modals) |
| **Tech / stack** | Not inspected | React 19, Vite, TypeScript, Zustand, opentype.js, fontkit, IndexedDB, OKLCH, Radix UI, optional server for static instance generation |

---

## 2. Where each build is stronger

### Type Trials

- **Discovery and entry:** One place to start: drag/drop, **OPEN**, or **Add remote fonts** + **catalog of Pangram variable fonts**. No need to have files locally.
- **Variable font animation:** **Play All** (and Quad / 1x) for axis animation is a clear, dedicated feature for testing variable behavior.
- **Kerning-focused sample:** “Kerning Text” sample is explicitly called out for type testing.
- **Simplicity and focus:** Less busy layout; 3 clear views (standard, collapsed sidebar-as-icons, presentation). Sidebar doesn’t overwhelm; tool panels open on demand. Good for quick trials.

### Fontrapunkt

- **Rendering and inspection depth:**  
  - **5 view modes** (Plain, Waterfall, Styles, Glyphs, Present).  
  - **Glyphs view**: full glyph set, Unicode categories, search, copy glyph.  
  - **Styles view**: grid of named instances with copy CSS per instance.  
  - **Font Source tab**: binary/table-level inspection (TTX-like), parsers, status badges.
- **Export and workflow:** Copy CSS (with current axis/features/size/color), screenshot with preview and filename; supports design-to-code workflow.
- **Persistence and iteration:** IndexedDB cache, session restore, hot reload when using file picker (File System Access API).
- **Per-font view state:** Tab model in store holds one “tab” per loaded font (settings, axis values); in practice the UI shows one font at a time with no tab bar to switch.
- **Typography controls:** Vertical alignment, zoom-to-fit, auto-fit fill; more control for specimen layout.
- **Sample text variety:** Proof sets (e.g. Lowercase, Uppercase, Mixed, Ligatures, Figures) beyond the usual Pangram/Wikipedia set.
- **Color and theme:** OKLCH, light/dark/match canvas, accent presets; more systematic color handling.
- **Codebase quality:** Typed (TypeScript), modular (primitive → component → feature), Radix-based UI, documented shortcuts and structure.

**Tradeoff:** Fontrapunkt’s sidebar and component styling can feel **busy and overly complicated** compared to Type Trials’ simpler, more focused layout and lighter design system.

---

## 3. Gaps and tradeoffs

| Gap | Type Trials | Fontrapunkt |
|-----|-------------|-------------|
| **Load from URL / remote** | ✅ Add remote fonts, Load | ❌ Upload/file only |
| **Built-in foundry catalog** | ✅ Pangram variable fonts | ❌ None (optional server for instances only) |
| **Variable axis animation** | ✅ Play All, Quad, 1x | ❌ Docs mention play/pause; not in app |
| **Glyph-level view** | “All Glyphs” sample | ✅ Dedicated **Glyphs** view (categories, search, copy) |
| **Named instances grid** | Not visible | ✅ **Styles** view |
| **Table / binary inspection** | Not visible | ✅ **Font Source** tab |
| **Export (CSS / screenshot)** | Not visible | ✅ Copy CSS, Screenshot |
| **Multi-tab / multi-font** | ✅ Tabbed canvases; + adds tab; text sample can create tab | ❌ Single font in UI; tab state exists but no tab bar or switch UI |
| **Session / cache** | Unclear | ✅ IndexedDB + session restore + hot reload |
| **WOFF2** | Not listed on landing | ✅ Supported |
| **Record animation / video** | Not visible | ❌ Mentioned in docs; not in Export UI |

---

## 4. Summary

- **Type Trials** is optimized for **quick trials**: get a font on screen fast (upload, OPEN, or URL + catalog), adjust basics and variable axes, and use **axis animation** to see variable behavior. Strong on **discovery** (remote + catalog) and **variable animation**.
- **Fontrapunkt** is optimized for **deeper inspection and workflow**: multiple views (including Glyphs and Styles), font internals (Font Source), export (CSS + screenshot), persistence (cache, session, hot reload), . Strong on **rendering/inspection surface**, **export**, and **developer/designer workflow**; weaker on **remote loading**, **catalog**, and **axis animation**.

A practical “best of both” for Fontrapunkt would be: add **load from URL** (and optionally a small catalog or links), and implement **variable axis animation** (e.g. Play All + speed) so the existing variable and export features are complemented by discovery and motion testing.

---

## Appendix: Where “tab” support exists in Fontrapunkt

Fontrapunkt is **single typeface at a time** in the UI: there is **no tab bar** and no way to switch between multiple open fonts. The following is where multi-tab *state and shortcuts* live, without any user-facing tab list.

| What | Where |
|------|--------|
| **Tab state** | `src/stores/uiStore.ts`: `tabs: FontTab[]`, `activeTabId`, `addTab`, `removeTab`, `setActiveTab`, `updateTabSettings`, `getActiveTab`, `getNewTabSettings`. Each `FontTab` has `id`, `fontId`, `fontName`, `isVariable`, `settings` (text, size, axis values, etc.). |
| **Tab types** | `src/types/ui.types.ts`: `FontTab`, `TabSettings`. |
| **Where tabs are created** | One tab is added when a font is loaded: `useFontDrop.ts` (drop), `FontSelector.tsx` (Add Font / file picker), `EmptyState.tsx` (file input or session restore). `useDefaultTab.ts` creates a single default (empty) tab when `tabs.length === 0`. |
| **Where tabs are closed** | `useKeyboardShortcuts.ts`: **Cmd+W** calls `removeTab(activeTab.id)`. No close button or tab bar in the UI. |
| **Switching tabs** | Store’s `setActiveTab(tabId)` exists and restores axis values from the selected tab’s settings; **no component ever calls it**. So you cannot switch between font tabs in the UI. |
| **Documentation** | `README.md` lists “Cmd/Ctrl + W: Close tab” and “Cmd/Ctrl + T: New tab”. In code, **Cmd+T** is a no-op (TODO: “Create new tab”). |

So: the app uses the tab model to hold **one active “view” per font** (settings, axes, text). Loading a font adds a tab and sets it active; the UI only ever shows that one. The infrastructure for multiple tabs and switching is in the store and shortcuts, but there is no tab bar or other UI that exposes it.

---

## Appendix: Type Trials tech stack (inspected)

Findings from the live site (HTML, JS/CSS assets). Not official; inferred from bundle content and markup.

| Layer | Type Trials (typetrials.com) |
|-------|------------------------------|
| **Framework** | **Vue 2.7.16** (bundle header: `Vue.js v2.7.16`) |
| **Build** | **Vite** (modulepreload snippet, hashed assets e.g. `/assets/index-bdRs1Q_P.js`) |
| **State** | **Vuex** (references in main bundle) |
| **Routing** | **vue-router** (reference in bundle) |
| **Font parsing** | **opentype** (likely opentype.js; heavy use in bundle) |
| **Hosting / SPA** | **GitHub Pages** (in-page script: “Single Page Apps for GitHub Pages” for client-side redirects) |
| **Edge / CDN** | **Cloudflare** (challenge script in footer) |
| **Analytics** | **Google Tag Manager** (gtag.js, id `G-G8H0REJRQE`) |
| **CSS** | Reset/normalize; BEM-like classes (e.g. `.ui-modal__mask`, `.ui-modal__header`); Vue transitions (`.fade-enter-active`, `.fade-leave-to`); `@font-face` for PP Fraktion Mono (variable TTF) and PP Neue Montreal (WOFF2). |

**Font parsing: opentype.js only; no fontkit; no bespoke parser.**  
The main JS bundle uses the **opentype.js** font object shape throughout: `font.tables.fvar` (axes, instances), `font.tables.gpos` / `font.tables.gsub` (scripts, features), `font.names`, and `font.glyphs`. There are no references to **fontkit** in the bundle. Low-level binary usage is minimal (only a couple of `ArrayBuffer`/`Uint8Array` references), so parsing is not bespoke—they rely on opentype.js to parse the font and then read `tables`, `names`, and `glyphs` from the result.

**Comparison with Fontrapunkt:** Fontrapunkt uses React 19, Vite, Zustand, **opentype.js + fontkit**; Type Trials uses Vue 2.7, Vite, Vuex, and **opentype.js only**. Both are Vite-built SPAs with client-side font parsing; Fontrapunkt adds fontkit for richer metrics/advanced features.

**CSS and design system: vanilla CSS + custom component library (no third‑party design system).**  
Type Trials does **not** use Tailwind, Bootstrap, Vuetify, or any other third‑party design system. Styling is **vanilla CSS** with:

- A **custom, in-house UI component set** using a consistent `ui-` prefix and **BEM-style** naming: `ui-button`, `ui-button__content`, `ui-button--type-primary`, `ui-modal__header`, `ui-slider`, `ui-sliderRange`, `ui-select`, `ui-checkbox`, `ui-textbox`, `ui-icon-button`, `ui-fileupload`, `ui-color-picker`, `ui-popover`, `ui-tooltip`, `ui-progress-circular`, `ui-progress-linear`, `ui-ripple-ink`, etc. So they have a **bespoke design system** (component API + naming convention), not a generic utility or framework.
- **Vue scoped CSS** for some components (e.g. `[data-v-640406c0]`).
- **Tippy.js** for tooltips (`.tippy-popper`, `.tippy-backdrop`).
- **Material Icons** only as an optional icon set (`iconSet` default `"material-icons"`), not Material Design the framework.
- A **normalize-style reset**, then custom tokens (e.g. `#151515`, `#2e2e2e`, `#35ca10`), Vue transition classes (`.fade-enter-active`, etc.), and app-specific classes (`.but`, `.row`, `.toolbox`, `.specimen-sect`).

So: **vanilla CSS** with a **custom design system** (their own `ui-*` component library and BEM), not a third‑party design system.

---

## Appendix: User-observed Type Trials behavior (detailed)

Hands-on walkthrough; aligns with screenshots and live use.

### Views and layout

- **3 views:** (1) **Standard** — full-width sidebar + tabbed canvases at top. (2) **Collapsed** — sidebar collapses to a strip of icon buttons; each icon opens that section’s panel (Typeface, Basic Controls, Variable Settings, Text Samples, Colors, OpenType, Export). (3) **Presentation** — TV icon hides everything except logo and TV icon for a clean, full-canvas view.
- **Tabs:** Each tab is a canvas; selecting a Text Sample can create a new tab; **+** adds a new tab using the last tab’s settings. Tabs have a close (X). Simpler, more visible than Fontrapunkt’s single-canvas + hidden tab state.

### Per-section (tool panels)

| Section | Type Trials (observed) | Notes vs Fontrapunkt |
|--------|-------------------------|----------------------|
| **Typeface** | Font name + Preset Styles dropdown; **folder** = upload, **drawer** = Pangram catalog. **No** font metadata / table inspection. | We have Font Details (metadata + Font Source tab); they keep it to name + presets + OT features. |
| **Basic Controls** | Size, line height, letter spacing, alignment (L/C/R + vertical), **Auto-Fit** (triangle icon — resize to fill container); **2 case toggles** (Caps, Upper/Lower). **Smooth** resizing animation. | We have more (e.g. vertical alignment options, zoom-to-fit, auto-fit fill); our resize/updates feel **jerky** (see Rendering smoothness below). |
| **Variable Settings** | Sliders with **green adjustable stops** at both ends of the track (set animation range). **Play All** animates thumbs over range; **ease** (e.g. Quad); **time** (e.g. 1x); **follow mouse** (e.g. weight ↔, italic ↕). | We have sliders + named presets only; no animation, no range stops, no follow-mouse. |
| **Text Samples** | Basic Set, Specimen (= our Waterfall), Pangram, Wikipedia, **All Glyphs** (= our Entire Font / Glyphs view), **Kerning Text** (many proof sets in one scroll). Some samples **disable** text controls. | We separate “view mode” (Plain/Waterfall/Glyphs) from “sample”; they combine sample + view in one list. |
| **Colors & Backgrounds** | Hex; **stroke/outline toggle**; background **image upload**; pop-up pickers for typeface + background; **flip** fg/bg. | We use OKLCH, no stroke toggle, no background image. |
| **OpenType Features** | Checkbox list; some **on by default** (e.g. ccmp, liga, kern, mark, mkmk); defaults look consistent across fonts; refresh to reset. | We have toggles; behavior similar. |
| **Export** | **Copy CSS** (we do this). Export modal: **Post/Square**, **Stories/Portrait** (Instagram/TikTok); Download, Copy CSS, Export for Instagram. | We have Copy CSS + Screenshot; no aspect presets for social. |

### Settings and info

- **No site-wide settings** (no theme, cache, or app prefs panel).
- **Info modals** are minimal: how to use + credits.

---

## Appendix: Rendering smoothness (why Type Trials feels smooth, Fontrapunkt jerky)

### What Type Trials does

In their CSS, the **font sample content** container has:

```css
.font-sample .font-sample-content .font-sample-content-inner {
  transition: all .2s;
}
```

and a `.noanim` class that sets `transition: none` when they want instant updates (e.g. switching text sample). So when they update **font-size**, **font-variation-settings**, or other properties on that element (via inline style or CSS variables), the **browser interpolates** over ~200ms instead of jumping. That’s why axis and size changes feel smooth.

### What Fontrapunkt does

In **PlainView** (and similarly wherever the canvas text is styled), we apply `fontSize`, `fontVariationSettings`, `letterSpacing`, `lineHeight`, etc. in a **useEffect** that runs whenever `activeTab`, `variationSettings`, or related state changes. We set them as **inline styles** with **no CSS transition** on the text element (`.textContent` in `PlainView.module.css` has no `transition` for font-size or font-variation-settings). So every slider tick or state update causes an **instant** style change → **jerky** perception.

### Recommendation for Fontrapunkt

1. **Add a short transition** on the canvas text element for the properties that change during interaction, e.g. in `PlainView.module.css`:
   ```css
   .textContent {
     transition: font-size 0.15s ease-out, font-variation-settings 0.15s ease-out,
                 letter-spacing 0.15s ease-out, line-height 0.15s ease-out;
   }
   ```
2. **Optional:** Add a `.noanim` (or similar) class when you want instant updates (e.g. switching view mode or sample text) and remove it when the user is dragging a slider or changing axes, so you get smooth interpolation during direct manipulation and no odd delays on discrete changes.
3. **Keep** RAF-throttled updates for the slider handlers so you’re not firing hundreds of effect runs per second; the transition will smooth the values that do get applied.

That should bring Fontrapunkt’s “changes between renders” much closer to Type Trials’ smooth feel without changing the rest of the architecture.

---

### Appendix: Type Trials auto-fit (from minified bundle)

The main bundle (`index-*.js`) is minified; the following is inferred from string/class names and structure.

- **Two fit-related usages**
  1. **Font selector dropdown:** A **FitMe** component (`fit-me` / `fitted` class) is used inside the font select. It has a `ref:"fitted"`, a `fontSize` value in state, and renders text with `style: font-size: ${e.fontSize}px`. So the **dropdown option preview** uses a fit-to-container step (likely binary search on font-size) so the sample text fits the option box.
  2. **Main canvas (custom / editable sample):** The editable area is a single div with `ref:"content"`, class `font-sample-content-inner`, and inline style `font-size: ${e.settings.fontSize}${e.settings.fontSizeUnit}`. When the user enables the **Auto-Fit** control (triangle icon in text controls), something must either (a) run a fit routine that **writes the computed font-size** onto this element (or into store so the template re-renders with it), or (b) use a small library that does the same.

- **Likely mechanism**
  - A **textFit**-style helper is present in the bundle (export from the same chunk that contains FitMe). Standard approach: measure the container (width/height), then binary-search or step **font-size** until the text fits (e.g. `scrollHeight <= clientHeight` and `scrollWidth <= clientWidth`). The result is applied as `element.style.fontSize` (or equivalent), so the **smooth resizing** the user sees is the same **CSS transition** on `.font-sample-content-inner` (`transition: all .2s`) that smooths axis/size changes. When fit runs, it sets a new font-size and the browser animates to it.

- **Summary for Fontrapunkt**
  - **Fit text to container:** Resize the text node (or a wrapper), read container and text dimensions, then adjust `font-size` (binary search or step) until the content fits. Apply the result to the same element that already has a **transition** on `font-size` so updates animate. Optionally disable transition (e.g. add `noanim`) during the fit loop so only the final value is animated. A small dependency like **textFit** (or a few lines of binary-search + `scrollHeight`/`offsetHeight`) is enough; no need to reverse-engineer Type Trials’ exact code.
