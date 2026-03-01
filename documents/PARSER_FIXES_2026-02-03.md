# Parser Extraction Fixes - February 3, 2026

## Issues Fixed

### 1. Missing Name IDs 4 & 6 (Full Font Name, PostScript Name)

**Problem:** Font Info tab showed "—" for Name IDs 4 and 6, even though the values existed in the raw font data.

**Root Cause:** In `OpentypeParser.ts`, the code tried to extract from `opentypeFont.names` (semantic accessor) by treating keys as numeric nameIDs. However, opentype.js uses semantic string keys like `"fullName"` and `"postScriptName"`, not numeric keys like `"4"` and `"6"`.

**Fix:** Added a semantic-to-nameID mapping table in `OpentypeParser.ts` (lines 100-147):

```typescript
const semanticToNameID: Record<string, number> = {
  copyright: 0,
  fontFamily: 1,
  fontSubfamily: 2,
  uniqueID: 3,
  fullName: 4,           // ← Now correctly mapped
  version: 5,
  postScriptName: 6,     // ← Now correctly mapped
  trademark: 7,
  manufacturer: 8,
  designer: 9,
  description: 10,
  manufacturerURL: 11,
  designerURL: 12,
  license: 13,
  licenseURL: 14,
  preferredFamily: 16,
  preferredSubfamily: 17,
  compatibleFullName: 18,
  sampleText: 19,
};
```

**Result:** Name IDs 4 and 6 now correctly extract from opentype.js semantic accessor.

---

### 2. Use Typo Metrics showing `false` instead of `true`

**Problem:** Font Info tab showed "Use Typo Metrics: false" even though the OS/2 table's fsSelection bit 7 was set (should be `true`).

**Root Cause:** In `MiscExtractor.ts`, the code was checking **bit 11** (0x0800) for Use Typo Metrics instead of **bit 7** (0x0080). This was a fundamental error in the bit mask.

According to the OpenType specification:
- Bit 0 (0x0001): Italic
- Bit 5 (0x0020): Bold  
- Bit 6 (0x0040): Regular
- **Bit 7 (0x0080): Use Typo Metrics** ← Correct bit!
- Bit 8 (0x0100): WWS
- Bit 9 (0x0200): Oblique

**Debug Output:**
```
binaryValue: 416
binaryHex: '0x1a0'
Binary breakdown: 0x020 (Bold) + 0x080 (Use Typo Metrics) + 0x100 (WWS) = 0x1a0
```

**Fix:** Changed all instances of `0x0800` to `0x0080` in `MiscExtractor.ts`:

**Before:**
```typescript
misc.fsSelection.useTypoMetrics = !!(fsSelection & 0x0800); // Wrong bit!
```

**After:**
```typescript
misc.fsSelection.useTypoMetrics = !!(fsSelection & 0x0080); // Correct bit!
```

**Locations Fixed:**
1. Line ~74: Fontkit parser fsSelection extraction
2. Line ~84: Fontkit alternative property extraction
3. Line ~251: Opentype parser fsSelection extraction
4. Line ~262: Opentype alternative property extraction  
5. Line ~336: Binary fallback individual flag check
6. Line ~344: Binary fallback all-flags-false check (old code path)

**Result:** Use Typo Metrics now correctly extracts from bit 7 (0x0080) instead of bit 11 (0x0800).

---

## Files Modified

1. `/src/engine/parsers/OpentypeParser.ts` - Added semantic name mapping
2. `/src/engine/extractors/MiscExtractor.ts` - Fixed fsSelection binary fallback logic

## Testing

After applying these fixes:
1. Clear application data in browser DevTools
2. Restart dev server
3. Re-upload test font (Euchre-BoldItalic.otf)
4. Verify Font Info tab shows:
   - Full Font Name (ID 4): "Euchre Bold Italic"
   - PostScript Name (ID 6): "Euchre-BoldItalic"
   - Use Typo Metrics: `true`

## Notes

- The parser wiring was already correct - these were extraction logic issues
- Both fixes improve reliability for fonts where library parsers partially succeed
- No new linter errors introduced (only pre-existing `any` type warnings remain)
