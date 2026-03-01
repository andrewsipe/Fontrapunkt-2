# Live Sync System Analysis

## What the System Does (Current Implementation)

### Architecture Overview
The live sync system attempts to automatically enable file watching when fonts are loaded, allowing fonts to update in real-time when saved in external font editors.

### Two Entry Points

#### 1. Drag-and-Drop (DropZone.tsx)
**Flow:**
1. User drags file onto page
2. Native interceptor (capture phase) attempts to capture `FileSystemFileHandle` via `dataTransfer.items[].getAsFileSystemHandle()`
3. If native interceptor fails, `onDrop` callback tries again with `dataTransfer.items`
4. If handle captured → calls `setWatchedFile()` and `startLiveWatch()`
5. If handle captured → sets `showHotReloadPrompt = true` to show toast
6. Font loads via `loadFontFile()`

**Key Code Locations:**
- Native interceptor: `DropZone.tsx` lines 230-275 (capture phase event listener)
- Handle capture: `DropZone.tsx` lines 70-142 (onDrop callback)
- Live sync setup: `DropZone.tsx` lines 154-163
- Toast trigger: `DropZone.tsx` line 163

#### 2. File Menu (FontSelector.tsx)
**Flow:**
1. User clicks "Open" button
2. Calls `showOpenFilePicker()` (File System Access API)
3. Gets `FileSystemFileHandle` directly from picker
4. Calls `loadFontFile(file, fileHandle)` - handle is passed
5. Calls `startLiveWatch()` directly
6. **NO TOAST TRIGGER** - toast state is in DropZone component

**Key Code Locations:**
- File picker: `FontSelector.tsx` lines 31-45
- Live sync setup: `FontSelector.tsx` lines 60-64
- Missing: No toast notification

### Live Watch System (FontLoader.ts)
**How it works:**
1. `setWatchedFile(handle, fileName)` stores handle and filename
2. `startLiveWatch(callback)` starts `setInterval` polling every 1000ms
3. Each poll: Gets file via `handle.getFile()`, checks `file.lastModified`
4. If `lastModified` changed → calls `reloadWatchedFile()`
5. `reloadWatchedFile()` parses font, preserves axis values, updates UI

**Key Code Locations:**
- Watch setup: `FontLoader.ts` lines 70-79, 88-166
- Polling logic: `FontLoader.ts` lines 101-166
- Reload logic: `FontLoader.ts` lines 186-341

---

## What the System is Supposed to Do (Intended Behavior)

### Expected User Experience
1. **Drag-and-Drop:**
   - User drags font file → Handle captured automatically → Live sync enabled → Toast appears: "Live sync enabled — font will update automatically when you save changes"

2. **File Menu:**
   - User clicks "Open" → File picker opens → Handle obtained → Live sync enabled → Toast appears: "Live sync enabled — font will update automatically when you save changes"

3. **Live Sync Active:**
   - LiveSyncIndicator appears in top-right showing "Live Sync" with pulsing dot
   - Font automatically reloads when saved in external editor
   - No user interaction required

### Design Principles
- **Zero friction:** No clicks required - drag-and-drop gesture is sufficient permission
- **Automatic:** Handle capture should work seamlessly during drop
- **Informational:** Toast confirms feature is active, not asking for permission
- **Graceful degradation:** If handle capture fails, app works normally without live sync

---

## Where It's Failing (Root Cause Analysis)

### Failure Point 1: Drag-and-Drop Handle Capture
**Symptom:** `dataTransfer.items` is empty (length: 0)

**Evidence from logs:**
```
[DropZone] Found 0 items in dataTransfer
[DropZone] ✗ No file items found in dataTransfer
```

**Root Causes:**
1. **React-Dropzone consumes dataTransfer:** By the time `onDrop` callback runs, `react-dropzone` has already processed the drop event and consumed `dataTransfer.items`, leaving it empty
2. **Native interceptor timing:** The native interceptor runs in capture phase but:
   - It's async (`await item.getAsFileSystemHandle()`)
   - The `onDrop` callback checks for handle after only 50ms delay
   - The handle may not be captured yet when checked
3. **Browser security restrictions:** `getAsFileSystemHandle()` may not be available on `dataTransfer.items` in all browsers/contexts

**Code Evidence:**
- `DropZone.tsx` line 91: `Found ${items.length} items` → Always 0
- `DropZone.tsx` line 74: 50ms delay may be insufficient
- Native interceptor line 258: Async operation may not complete in time

### Failure Point 2: Toast Not Appearing (File Menu)
**Symptom:** Live sync starts successfully but no toast notification

**Evidence from logs:**
```
[FontLoader] Watching file for live reload: GrenettePro-Semibold.ttf
[FontLoader] Starting live watch for: GrenettePro-Semibold.ttf
```
✅ Live sync is working, but no toast appears

**Root Cause:**
- Toast state (`showHotReloadPrompt`) is local to `DropZone` component
- `FontSelector` component (file menu) doesn't have access to this state
- `FontSelector` successfully enables live sync but can't trigger toast

**Code Evidence:**
- `DropZone.tsx` line 20: `const [showHotReloadPrompt, setShowHotReloadPrompt] = useState(false);`
- `FontSelector.tsx` lines 60-64: Calls `startLiveWatch()` but no toast trigger
- Toast component is only rendered in `DropZone.tsx` line 300

### Failure Point 3: Toast Not Appearing (Drag-and-Drop)
**Symptom:** Even when handle capture should succeed, toast doesn't appear

**Evidence from logs:**
- No toast-related logs appear
- `setShowHotReloadPrompt(true)` is called (line 163) but toast doesn't render

**Possible Root Causes:**
1. **State update timing:** Toast state set but component doesn't re-render
2. **Toast component not mounted:** Toast may not be in the render tree
3. **Radix Toast Provider issue:** Toast may not be properly connected to viewport

**Code Evidence:**
- `DropZone.tsx` line 163: `setShowHotReloadPrompt(true)` is called
- `DropZone.tsx` line 300: Toast component should render when `showHotReloadPrompt === true`
- `App.tsx` line 45: ToastProvider wraps app, ToastViewport is present

---

## Technical Constraints & Browser Limitations

### File System Access API Limitations
1. **Drag-and-Drop Restrictions:**
   - `getAsFileSystemHandle()` on `dataTransfer.items` is not universally supported
   - Browser security model: Drag-and-drop doesn't grant persistent file access
   - React-Dropzone processes event before we can access `dataTransfer`

2. **User Gesture Requirements:**
   - `showOpenFilePicker()` requires a user gesture (click)
   - Cannot be called asynchronously after gesture completes
   - This is why fallback picker approach failed

3. **Handle Persistence:**
   - FileSystemFileHandle can be stored and reused
   - But must be obtained during a user gesture
   - Drag-and-drop gesture may not qualify in all browsers

### React-Dropzone Behavior
- Processes drop event synchronously
- Consumes `dataTransfer` before our code can access it
- Native interceptor in capture phase may work, but timing is critical

---

## Summary of Failure Modes

| Entry Point | Handle Capture | Live Sync | Toast | Status |
|------------|----------------|-----------|-------|--------|
| Drag-and-Drop | ❌ Fails (dataTransfer empty) | ❌ Not enabled | ❌ Not shown | **BROKEN** |
| File Menu | ✅ Succeeds (showOpenFilePicker) | ✅ Enabled | ❌ Not shown | **PARTIAL** |

### Critical Issues
1. **Drag-and-Drop:** Complete failure - handle never captured
2. **Toast System:** Not working for either entry point
3. **State Management:** Toast state isolated to DropZone, not accessible from FontSelector

### Working Components
- File menu handle capture ✅
- Live watch polling ✅
- Font reload on change ✅ (when handle is available)
- LiveSyncIndicator display ✅ (when watching)

---

## Research Questions

1. **Is `getAsFileSystemHandle()` on `dataTransfer.items` actually supported in modern browsers?**
   - MDN documentation suggests it exists, but browser support may be limited
   - Need to verify: Chrome, Safari, Firefox support status

2. **Can we capture handle BEFORE react-dropzone processes the event?**
   - Native interceptor uses capture phase - should work
   - But async nature may cause timing issues
   - Need to verify: Is 50ms delay sufficient? Should we wait longer?

3. **Should we use a different approach for drag-and-drop?**
   - Alternative: Use native drag-and-drop API instead of react-dropzone
   - Trade-off: Lose react-dropzone features (accept, maxFiles, etc.)
   - Need to evaluate: Is live sync worth this trade-off?

4. **How should toast state be managed?**
   - Current: Local state in DropZone (not accessible from FontSelector)
   - Options:
     - Global state (Zustand store)
     - Context API
     - Event-based system
   - Need to decide: Best pattern for app architecture

5. **Is the native interceptor actually firing?**
   - Logs show "Native interceptor triggered" but no handle capture
   - Need to verify: Is interceptor actually running? Are items available in capture phase?

---

## Recommended Next Steps

1. **Verify Browser Support:**
   - Test `getAsFileSystemHandle()` availability in target browsers
   - Check MDN compatibility data
   - Test in Chrome, Safari, Firefox

2. **Debug Native Interceptor:**
   - Add more detailed logging to capture phase handler
   - Verify items are available before react-dropzone processes
   - Test with longer delays or different timing strategies

3. **Fix Toast System:**
   - Move toast state to global store or context
   - Ensure toast triggers from both DropZone and FontSelector
   - Verify Radix Toast Provider/Viewport setup

4. **Consider Alternative Approaches:**
   - Native drag-and-drop API (bypass react-dropzone)
   - Post-load handle capture (if browser allows)
   - Accept that drag-and-drop may not support live sync

---

## Files Involved

- `src/components/DropZone/DropZone.tsx` - Drag-and-drop entry point, toast state
- `src/components/Sidebar/FontSelector.tsx` - File menu entry point
- `src/components/Toast/Toast.tsx` - Radix Toast wrapper
- `src/components/Canvas/LiveSyncIndicator.tsx` - Status indicator
- `src/engine/FontLoader.ts` - Live watch implementation
- `src/App.tsx` - ToastProvider setup

---

*Analysis Date: 2025-01-17*
*Status: System partially functional - file menu works, drag-and-drop fails, toast system broken*
