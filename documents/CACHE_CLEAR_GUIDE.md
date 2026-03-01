# Clearing Font Cache to See Preset Styles Fix

The variable font preset styles dropdown now works correctly! However, if you've previously loaded a variable font, you need to clear your font cache to see the fix because the old (broken) metadata is cached.

## Method 1: Browser Console (Recommended)

1. Press **F12** (or **Cmd+Option+I** on Mac) to open Developer Tools
2. Go to the **Console** tab
3. Paste this command and press Enter:
   ```javascript
   indexedDB.deleteDatabase('font-cache-db')
   ```
4. You should see a success message
5. **Refresh the page** (F5 or Cmd+R)
6. **Re-upload your variable font**

## Method 2: Application/Storage Tab

### Chrome/Edge:
1. Press **F12** to open Developer Tools
2. Go to the **Application** tab
3. In the left sidebar, expand **IndexedDB**
4. Find **font-cache-db**
5. Right-click and select **"Delete database"**
6. Refresh the page (F5)
7. Re-upload your variable font

### Firefox:
1. Press **F12** to open Developer Tools
2. Go to the **Storage** tab
3. In the left sidebar, expand **IndexedDB**
4. Find **font-cache-db**
5. Right-click and select **"Delete All"**
6. Refresh the page (F5)
7. Re-upload your variable font

### Safari:
1. Press **Cmd+Option+I** to open Developer Tools
2. Go to the **Storage** tab
3. In the left sidebar, expand **IndexedDB**
4. Find **font-cache-db**
5. Right-click and select **"Delete"**
6. Refresh the page (Cmd+R)
7. Re-upload your variable font

## Method 3: Programmatic (Advanced)

You can also use the built-in debug function:

1. Open browser console (F12)
2. Run:
   ```javascript
   __clearFontCache()
   ```
3. Refresh the page
4. Re-upload your variable font

## Verification

After clearing cache and reloading a variable font:

1. Open the **Variable Axes** panel in the sidebar
2. Look for the **"Preset Styles"** dropdown
3. You should see named instances like:
   - "Regular"
   - "Light"
   - "Bold"
   - "Black"
   - etc. (depending on your font)
4. Selecting a preset should update all axis sliders to match that preset

## Troubleshooting

**If presets still show as "Unknown":**

1. Check browser console for errors (F12 → Console tab)
2. Verify your font file is a valid variable font with an `fvar` table
3. Try a different variable font to test
4. Report the issue with:
   - Font file name
   - Browser and version
   - Console error messages (if any)
   - Screenshot of the dropdown

## Why This Is Needed

The font cache stores parsed font metadata in IndexedDB. The fix for preset styles extraction was applied to the parsing code, but fonts that were cached before the fix still have the old (broken) metadata. Clearing the cache forces the font to be re-parsed with the fixed code.

