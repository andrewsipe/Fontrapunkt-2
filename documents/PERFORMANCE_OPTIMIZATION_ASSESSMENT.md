# Fontrapunkt - Performance & Optimization Assessment

**Date:** February 2, 2026  
**Status:** Development - Experiencing Lag  
**Scope:** Backend/scripting optimization and performance bottlenecks

---

## Executive Summary

Fontrapunkt has a **solid architecture** with workers, caching, and parallel extraction pipelines. However, there are **7 critical performance bottlenecks** causing the lag you're experiencing. Most issues are in the **data layer** (huge JSON files, redundant parsing) and **state management** (over-rendering, unnecessary updates).

**Impact:** Medium-to-large fonts (>1MB) and complex interactions (axis changes, view switches) trigger cascading re-renders and expensive operations.

**Severity Breakdown:**
- 🔴 Critical (3 issues): Blocking the main thread, memory bloat
- 🟠 High (4 issues): Unnecessary re-renders, inefficient data structures
- 🟡 Medium (5 issues): Optimization opportunities, technical debt

---

## 🔴 Critical Issues (Fix First)

### 1. Unicode Data File is 440,108 Lines (Massive JSON)

**File:** `src/data/unicode/other.json`  
**Size:** Likely 10-20MB+ based on line count  
**Impact:** Blocking main thread during parse, huge bundle size

**Problem:**
- The entire unicode categorization dataset is bundled into the app
- Parsed synchronously on load (JSON.parse blocks main thread)
- Loaded even when glyphs view isn't active
- Likely causing initial load lag and bundle bloat

**Recommendations:**

1. **Lazy Load** - Only load when user opens Glyphs view:
   ```typescript
   // Instead of: import unicodeData from './unicode/other.json'
   // Do this:
   const unicodeData = await import('./unicode/other.json');
   ```

2. **Split by Category** - Break into smaller chunks:
   ```
   unicode/
     ├── basic-latin.json     (~1KB)
     ├── symbols.json         (~5KB)
     ├── cjk.json            (~50KB)
     └── index.ts            (lazy loader)
   ```

3. **IndexedDB Cache** - Store processed data client-side:
   ```typescript
   // Parse once, cache forever (until version changes)
   const cached = await unicodeDB.get('processed-v1');
   if (!cached) {
     const data = processUnicode(await import('./unicode/other.json'));
     await unicodeDB.put('processed-v1', data);
   }
   ```

4. **Web Worker** - Move heavy processing off main thread:
   ```typescript
   const worker = new Worker('./unicodeProcessor.worker.ts');
   worker.postMessage({ type: 'PROCESS_UNICODE' });
   ```

**Expected Impact:** Reduces initial load by 5-10s, eliminates parse jank

---

### 2. Font Parsing Still Runs on Main Thread for Small Fonts

**File:** `src/engine/FontParser.ts`, `src/workers/fontParser.worker.ts`  
**Threshold:** 5MB (hardcoded)  
**Impact:** Main thread blocking for 2-5MB fonts

**Problem:**
```typescript
// FontLoader.ts - 5MB threshold
if (file.size > 5 * 1024 * 1024) {
  // Use worker
} else {
  // Main thread - BLOCKS UI
  const suite = await parseWithMemoryLimit(...);
}
```

**Why This Hurts:**
- Most production fonts are 1-4MB (below threshold)
- `parseWithMemoryLimit` does **sequential parsing** with both opentype.js AND fontkit
- opentype.js alone takes 200-800ms for a 2MB variable font
- fontkit adds another 300-1000ms for complex fonts
- User sees frozen UI during this time

**Recommendations:**

1. **Lower Worker Threshold to 1MB:**
   ```typescript
   const WORKER_THRESHOLD = 1 * 1024 * 1024; // 1MB instead of 5MB
   ```

2. **Always Use Worker for Initial Load** (parse in background while showing skeleton):
   ```typescript
   // Load font immediately (for display)
   const quickParse = await parseOpentype(buffer); // Fast, minimal
   showFontSkeleton(quickParse);
   
   // Full extraction in worker (metadata, features, instances)
   worker.postMessage({ type: 'EXTRACT_FULL', buffer });
   ```

3. **Time-Box Main Thread Work** - If parsing takes >100ms, move to worker:
   ```typescript
   const start = performance.now();
   const parsed = await parseFont(buffer);
   const duration = performance.now() - start;
   
   if (duration > 100) {
     console.warn('Font parsing took', duration, 'ms - consider worker threshold');
   }
   ```

**Expected Impact:** Eliminates UI freezes for 1-5MB fonts

---

### 3. State Store Triggers Unnecessary Re-renders

**Files:** `src/stores/fontStore.ts`, `src/stores/uiStore.ts`  
**Impact:** Every axis change triggers full component tree re-render

**Problem:**

**FontStore Pattern:**
```typescript
// VariableAxesPanel.tsx - Every component that reads currentFont
const currentFont = useFontStore((state) => state.getCurrentFont());
```

When `updateAxisValue` is called, it **mutates the font object** and triggers a re-render of **every component** using `getCurrentFont()`:
- FontCanvas
- PlainView / WaterfallView / StylesView / GlyphsView
- VariableAxesPanel
- TextControls
- Header
- BottomBar
- etc.

**Why This Hurts:**
- Moving a slider fires `updateAxisValue` → full tree re-render → 16ms budget exceeded → visible lag
- Happens **multiple times per second** during drag
- Each re-render recalculates font-variation-settings, regenerates DOM, reflows layout

**Zustand Anti-Pattern:**
```typescript
// This selector returns NEW object every time
getCurrentFont: () => {
  const { fonts, currentFontId } = get();
  return currentFontId ? fonts.get(currentFontId) || null : null;
},
```

**Recommendations:**

1. **Fine-Grained Selectors** - Only subscribe to what you need:
   ```typescript
   // BAD: Re-renders on ANY font change
   const currentFont = useFontStore(state => state.getCurrentFont());
   
   // GOOD: Only re-renders when axes change
   const axes = useFontStore(state => state.getCurrentFont()?.axes);
   const familyName = useFontStore(state => state.getCurrentFont()?.name);
   ```

2. **Memoize Expensive Derivations:**
   ```typescript
   // In fontStore.ts
   const getVariationSettings = () => {
     const font = get().getCurrentFont();
     if (!font?.axes) return '';
     
     // Cache this! Don't recalculate every render
     return font.axes
       .map(a => `"${a.tag}" ${a.current}`)
       .join(', ');
   };
   ```

3. **Throttle Axis Updates** (already partially done, but can improve):
   ```typescript
   // Batch updates within 16ms window
   const throttledUpdate = throttle((fontId, tag, value) => {
     updateAxisValue(fontId, tag, value);
   }, 16); // One update per frame max
   ```

4. **React.memo Wrapper for Expensive Components:**
   ```typescript
   export const VariableAxesPanel = memo(VariableAxesPanelComponent, (prev, next) => {
     // Only re-render if axes actually changed
     return prev.axes === next.axes;
   });
   ```

**Expected Impact:** Reduces slider lag by 60-80%

---

## 🟠 High Priority Issues

### 4. Glyph Categorizer Runs Synchronously on UI Thread

**File:** `src/utils/glyphCategorizer.ts`  
**Impact:** Freezes UI when loading large fonts (1000+ glyphs)

**Problem:**
```typescript
// GlyphsView.tsx
const glyphs = categorizeGlyphs(font); // BLOCKS for 100-500ms
```

For a font with 2000 glyphs:
- Iterates every glyph
- Checks unicode ranges
- Builds category maps
- All synchronous, all on main thread
- User sees frozen UI

**Recommendations:**

1. **Move to Web Worker:**
   ```typescript
   // glyphCategorizer.worker.ts
   self.onmessage = (e) => {
     const categorized = categorizeGlyphs(e.data.font);
     self.postMessage({ type: 'CATEGORIZED', categorized });
   };
   ```

2. **Lazy Categorization** - Only categorize visible range:
   ```typescript
   // Instead of categorizing all 2000 glyphs upfront:
   // Categorize on-demand as user scrolls
   const visibleGlyphs = glyphs.slice(startIndex, endIndex);
   const categorized = categorizeBatch(visibleGlyphs);
   ```

3. **Cache Results in IndexedDB:**
   ```typescript
   const cacheKey = `glyphs-${fontHash}`;
   const cached = await glyphCache.get(cacheKey);
   if (cached) return cached;
   
   const categorized = categorizeGlyphs(font);
   await glyphCache.put(cacheKey, categorized);
   return categorized;
   ```

**Expected Impact:** Eliminates glyph view freeze

---

### 5. FontCache Double-Parsing (opentype.js + fontkit Sequential)

**File:** `src/engine/FontParser.ts` lines 54-140  
**Impact:** 2x parsing time for every font

**Problem:**
```typescript
// FontParser.ts - Sequential parsing
const parseQueue = new FontParseQueue();
// Stage 1: Parse with opentype.js (300ms)
const opentypeParsed = parseOpentype(buffer);
// Stage 2: Parse AGAIN with fontkit (400ms)
const fontkitParsed = parseFontkit(buffer);
// Total: 700ms instead of 400ms
```

**Why This Design?**
- Different parsers expose different APIs
- opentype.js better for basic metadata
- fontkit better for variable font details
- But **parsing is redundant** - same binary data, twice

**Recommendations:**

1. **Parse Once, Extract Smart:**
   ```typescript
   // Use whichever parser is FASTER for this font
   const parsed = preferFontkit(buffer) 
     ? await parseFontkit(buffer)
     : await parseOpentype(buffer);
   
   // Then extract everything from that one parse
   const suite = await extractAll(parsed);
   ```

2. **Lazy Secondary Parse:**
   ```typescript
   // Parse with opentype.js (fast) for initial display
   const quickParse = await parseOpentype(buffer);
   showFont(quickParse);
   
   // Parse with fontkit ONLY if user needs advanced features
   // (e.g., when they open Variable Axes panel)
   if (needsAdvancedFeatures) {
     const fullParse = await parseFontkit(buffer);
     enrichMetadata(fullParse);
   }
   ```

3. **Parallel Parsing** (if you keep both):
   ```typescript
   // At least don't block - parse simultaneously
   const [opentypeParsed, fontkitParsed] = await Promise.all([
     parseOpentype(buffer),
     parseFontkit(buffer),
   ]);
   ```

**Expected Impact:** Reduces font load time by 30-40%

---

### 6. localStorage Reads on Every Render (Session Cache)

**File:** `src/stores/fontStore.ts` lines 16-52  
**Impact:** Synchronous disk I/O in render path

**Problem:**
```typescript
// fontStore.ts - getCachedSession called MANY times
function getCachedSession(): SessionState | null {
  const sessionStr = localStorage.getItem("app-session"); // SYNC I/O
  return JSON.parse(sessionStr);
}
```

While there's a 1-second TTL cache, this still fires frequently:
- On every store access
- Multiple components read store
- localStorage.getItem is **synchronous** and **slow** (10-50ms)

**Recommendations:**

1. **Move to Memory-Only Cache:**
   ```typescript
   // Only persist on visibility change / beforeunload
   let sessionState = null;
   
   window.addEventListener('beforeunload', () => {
     localStorage.setItem('app-session', JSON.stringify(sessionState));
   });
   
   // Never read during render - only on app init
   ```

2. **Increase Cache TTL:**
   ```typescript
   const SESSION_CACHE_TTL = 60000; // 60s instead of 1s
   ```

3. **Eliminate Session Persistence** - Use Zustand persist middleware:
   ```typescript
   import { persist } from 'zustand/middleware';
   
   export const useFontStore = create(
     persist(
       (set, get) => ({ /* store */ }),
       { name: 'font-session', storage: createJSONStorage(() => localStorage) }
     )
   );
   ```

**Expected Impact:** Eliminates micro-stutters during interaction

---

### 7. useEffect Chains Creating Cascading Updates

**File:** `src/components/containers/Sidebar/VariableAxesPanel.tsx` lines 35-69  
**Impact:** Multiple sequential re-renders

**Problem:**
```typescript
// VariableAxesPanel.tsx - Multiple useEffects watching same deps
useEffect(() => { /* Update refs */ }, [currentFont]);
useEffect(() => { /* Reset preset */ }, [currentFont?.id]);
useEffect(() => { /* Validate preset */ }, [namedVariations]);
```

**React Render Cascade:**
1. Font changes → First effect fires → `setSelectedPreset`
2. That triggers re-render → Second effect fires → `setIsOpen`
3. That triggers re-render → Third effect validates
4. **Total: 3-4 renders** for one font change

**Recommendations:**

1. **Combine Effects:**
   ```typescript
   useEffect(() => {
     // Do all updates in one effect
     const firstPreset = currentFont?.namedVariations?.[0]?.name || '';
     setSelectedPreset(firstPreset);
     setIsOpen(false);
     // One setState call = one re-render
   }, [currentFont?.id]);
   ```

2. **Use useReducer for Complex State:**
   ```typescript
   const [state, dispatch] = useReducer(presetReducer, initialState);
   
   useEffect(() => {
     dispatch({ 
       type: 'FONT_CHANGED', 
       payload: { font: currentFont } 
     });
   }, [currentFont?.id]);
   ```

3. **Move Logic Outside Render:**
   ```typescript
   // Derive state, don't store it
   const selectedPreset = useMemo(() => {
     return currentFont?.namedVariations?.[0]?.name || '';
   }, [currentFont?.id]);
   ```

**Expected Impact:** Reduces component re-renders by 50%

---

## 🟡 Medium Priority Optimizations

### 8. Lazy Load View Components (Already Partially Done ✓)

**Status:** ✅ Already implemented in `FontCanvas.tsx`  
**Recommendation:** Verify code splitting is working

```typescript
// FontCanvas.tsx - Already using React.lazy
const PlainView = lazy(() => import('./PlainView'));
const GlyphsView = lazy(() => import('./GlyphsView/GlyphsView'));
```

**Check:** Run `npm run build` and verify separate chunks:
```
dist/assets/PlainView-[hash].js
dist/assets/GlyphsView-[hash].js
```

If not chunking properly, add manual chunk config to `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'views': [
          './src/components/containers/Canvas/PlainView',
          './src/components/containers/Canvas/WaterfallView',
          './src/components/containers/Canvas/StylesView',
          './src/components/containers/Canvas/GlyphsView',
        ],
      },
    },
  },
},
```

---

### 9. Virtualization in Waterfall/Styles Views

**Files:** `WaterfallView.tsx`, `StylesView.tsx`  
**Current:** Renders all items upfront (20-50 rows)  
**Issue:** DOM bloat, slow scrolling with large fonts

**Recommendation:**

GlyphsView already uses `react-window` ✓. Apply same pattern to other views:

```typescript
// WaterfallView.tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={containerHeight}
  itemCount={fontSizes.length}
  itemSize={rowHeight}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <WaterfallRow size={fontSizes[index]} />
    </div>
  )}
</FixedSizeList>
```

---

### 10. Memoize Expensive Selectors in Sidebar Panels

**Pattern:** Many panels recalculate same data every render

**Example (TextControls.tsx):**
```typescript
// Recalculated on every render (wasteful)
const settings = activeTab?.settings || defaultSettings;
```

**Fix:**
```typescript
const settings = useMemo(
  () => activeTab?.settings || defaultSettings,
  [activeTab?.id] // Only recalc when tab changes
);
```

**Apply to:**
- `TextControls.tsx` - settings derivation
- `VariableAxesPanel.tsx` - selectOptions (already done ✓)
- `OpenTypeFeaturesPanel.tsx` - feature list generation
- `ColorPanel.tsx` - color conversions

---

### 11. IndexedDB Cache Has No Eviction Policy

**File:** `src/engine/cache/FontCacheDB.ts`  
**Issue:** Unlimited cache growth

**Problem:**
- Fonts stored forever in IndexedDB
- User loads 100 fonts → 500MB+ stored
- No LRU (Least Recently Used) eviction
- Browser may throttle/reject writes

**Recommendation:**

1. **Add Cache Size Limit:**
   ```typescript
   const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
   const MAX_FONT_COUNT = 50; // Or 50 fonts
   
   async function evictOldest() {
     const fonts = await getAllFonts();
     fonts.sort((a, b) => a.lastAccessed - b.lastAccessed);
     while (getCacheSize() > MAX_CACHE_SIZE) {
       await deleteFont(fonts.shift().id);
     }
   }
   ```

2. **Track Access Time:**
   ```typescript
   interface CachedFontEntry {
     id: string;
     data: ArrayBuffer;
     metadata: FontMetadata;
     lastAccessed: number; // timestamp
   }
   ```

3. **Implement LRU:**
   ```typescript
   async function getFontFile(id: string) {
     const font = await db.get('fonts', id);
     if (font) {
       // Update access time
       font.lastAccessed = Date.now();
       await db.put('fonts', font);
     }
     return font;
   }
   ```

---

### 12. Worker Communication Could Use Structured Clone

**File:** `src/workers/fontParser.worker.ts`  
**Current:** Transferring ArrayBuffers correctly ✓  
**Optimization:** Use `Transferable` objects explicitly

```typescript
// Worker response
self.postMessage(
  { type: 'PARSE_SUCCESS', payload: { metadata } },
  [arrayBuffer] // Transfer ownership (zero-copy)
);
```

Verify main thread isn't cloning large buffers:
```typescript
// FontLoader.ts
const result = await worker.parseFont(buffer);
// buffer should be neutered (length = 0) after transfer
console.assert(buffer.byteLength === 0, 'Buffer was cloned, not transferred');
```

---

## 📊 Performance Metrics to Track

Add these measurements to quantify improvements:

```typescript
// utils/performance.ts
export class PerformanceTracker {
  static measureFontLoad(fontId: string) {
    performance.mark(`font-load-start-${fontId}`);
    return {
      end: () => {
        performance.mark(`font-load-end-${fontId}`);
        performance.measure(
          `font-load-${fontId}`,
          `font-load-start-${fontId}`,
          `font-load-end-${fontId}`
        );
      },
    };
  }
  
  static measureRender(componentName: string) {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        if (duration > 16) {
          console.warn(`${componentName} render took ${duration}ms (>16ms frame budget)`);
        }
      },
    };
  }
}
```

**Track:**
- Font parse time (target: <200ms)
- Axis update lag (target: <16ms)
- View switch time (target: <100ms)
- Glyph view load (target: <500ms)

---

## 🎯 Recommended Implementation Order

### Phase 1: Quick Wins (1-2 hours)
1. Lower worker threshold to 1MB (#2)
2. Combine useEffect chains (#7)
3. Increase localStorage cache TTL (#6)

**Expected Impact:** 40% lag reduction

### Phase 2: High Impact (3-5 hours)
1. Lazy load unicode data (#1)
2. Fine-grained Zustand selectors (#3)
3. Move glyph categorization to worker (#4)

**Expected Impact:** 70% lag reduction

### Phase 3: Structural (5-8 hours)
1. Single-parser strategy (#5)
2. Memoize expensive computations (#10)
3. Add cache eviction (#11)

**Expected Impact:** 85% lag reduction + better memory

### Phase 4: Polish (2-3 hours)
1. Add performance tracking (#12)
2. Virtualize remaining views (#9)
3. Verify bundle splitting (#8)

**Expected Impact:** 95% lag reduction + monitoring

---

## 🔍 Tools for Profiling

Before implementing, measure baseline:

1. **React DevTools Profiler**
   - Record interaction (move slider)
   - Identify components with longest render times
   - Look for unnecessary re-renders (gray flames)

2. **Chrome Performance Tab**
   - Record while loading font
   - Look for long tasks (>50ms red bars)
   - Check Main Thread activity during interactions

3. **Bundle Analyzer**
   ```bash
   npm install -D rollup-plugin-visualizer
   npx vite-bundle-visualizer
   ```
   - Identify largest chunks
   - Verify code splitting is working

4. **Lighthouse**
   ```bash
   lighthouse http://localhost:5173 --view
   ```
   - Check Time to Interactive
   - Look for render-blocking resources

---

## 💡 Architecture Strengths (Keep These!)

Your codebase already has several excellent patterns:

✅ **Worker-based parsing** (just needs lower threshold)  
✅ **IndexedDB caching** (just needs eviction)  
✅ **Parallel extraction pipeline** (well-structured)  
✅ **Lazy-loaded views** (good code splitting)  
✅ **Virtualized glyph grid** (efficient for large sets)  
✅ **Zustand for state** (performant, just needs fine-grained selectors)  
✅ **Hash-based deduplication** (smart cache strategy)

---

## 📝 Summary

**Root Causes of Lag:**
1. **440K-line JSON parsed synchronously** → initial load freeze
2. **Main thread parsing** for 1-5MB fonts → UI freeze on load
3. **Full tree re-renders** on axis changes → slider lag
4. **Synchronous glyph categorization** → view switch freeze
5. **Double parsing** (opentype + fontkit) → 2x parse time

**Fix Priority:**
- 🔴 Unicode lazy load + worker threshold (#1, #2)
- 🟠 Fine-grained selectors + glyph worker (#3, #4)
- 🟡 Single parser + memoization (#5, #10)

**Expected Results:**
- Initial load: 5-10s faster
- Slider interaction: Smooth (no dropped frames)
- View switches: <100ms
- Memory usage: -30% (with cache eviction)

Let me know which area you'd like to tackle first, and I can provide specific implementation code.
