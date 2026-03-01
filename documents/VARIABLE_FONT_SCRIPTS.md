# Variable Font Parsing Scripts

## Overview
This document identifies all scripts in the Fontrapunkt project that directly handle parsing and extracting variable font data (axes, preset styles/instances, fvar table).

---

## Core Extraction Scripts

### 1. **`src/engine/extractors/AxisExtractor.ts`**
**Purpose:** Extracts variable font axes (weight, width, optical size, etc.)

**What it does:**
- Extracts axes from fontkit or opentype.js fonts
- Returns `VariableAxis[]` with: `tag`, `name`, `min`, `max`, `default`, `current`
- Validates axes with LENIENT mode
- Returns empty array for non-variable fonts (not an error)

**Key Function:**
```typescript
export function extractAxes(
  opentypeFont: ParsedFont | null,
  fontkitFont: ParsedFont | null
): ExtractionResult<VariableAxis[]>
```

**Data Source:**
- Primary: `fontkitFont.getVariationAxes()`
- Fallback: `opentypeFont.getVariationAxes()`

---

### 2. **`src/engine/extractors/InstanceExtractor.ts`**
**Purpose:** Extracts named variations/preset styles (instances) from fvar table

**What it does:**
- Extracts fvar instances with accurate name resolution
- Binary-first approach: reads fvar table directly via `RawTableParser`
- Resolves instance names from NameTable (handles NameID 17 → NameID 2 fallback)
- Extracts PostScript names (OpenType 1.8+)
- Marks default instance (matches all axis defaults)
- Falls back to fontkit `namedVariations` if binary parsing fails
- Sorts: default first, then alphabetically

**Key Function:**
```typescript
export function extractInstances(
  opentypeFont: ParsedFont | null,
  fontkitFont: ParsedFont | null,
  axes: VariableAxis[] | undefined,
  nameTable: NameTable | null,
  fontBuffer?: ArrayBuffer
): ExtractionResult<NamedVariation[]>
```

**Data Source:**
- Primary: Binary fvar table parsing via `parseFvarTable()`
- Fallback: `fontkitFont.raw.namedVariations`

**Returns:**
```typescript
NamedVariation[] = [
  {
    name: string,           // e.g., "Bold", "Condensed"
    coordinates: {          // Axis tag → value mapping
      'wght': 700,
      'wdth': 100,
      ...
    }
  }
]
```

---

### 3. **`src/engine/parsers/RawTableParser.ts`**
**Purpose:** Low-level binary parsing of fvar table directly from font file

**What it does:**
- Parses fvar table binary structure
- Extracts axes: tag, min, max, default values
- Extracts instances: coordinates array, subfamilyNameID, postScriptNameID
- Handles OpenType 1.8+ postScriptNameID field
- Used when library parsers fail or need raw binary access

**Key Functions:**
```typescript
// Parse fvar table from binary buffer
export function parseFvarTable(
  buffer: ArrayBuffer,
  offset: number,
  length: number
): FvarTableData | null

// Find table offset in SFNT structure
export function findTableOffset(
  buffer: ArrayBuffer,
  tableTag: string
): { offset: number; length: number; checksum: number } | null
```

**Parses:**
- **fvar header:** version, axis count, instance count, offsets
- **Axis records:** tag (4 bytes), min/max/default (Fixed 16.16), flags, axisNameID
- **Instance records:** subfamilyNameID, flags, coordinates array (one Fixed per axis), postScriptNameID (optional)

**Returns:**
```typescript
FvarTableData = {
  axes?: AxisData[],        // { tag, name, min, max, default }
  instances?: Array<{       // Raw instance data
    coordinates: number[],  // Float array, one per axis
    subfamilyNameID?: number,
    postScriptNameID?: number
  }>
}
```

---

## Orchestration Scripts

### 4. **`src/engine/FontParser.ts`**
**Purpose:** Main font parsing orchestrator

**What it does:**
- Coordinates all extraction steps
- Calls `extractAxes()` and `extractInstances()` in sequence
- Instances require axes and nameTable, so extracts after both are ready
- Combines results into `FontMetadata` object
- Handles fontkit/opentype.js fallback logic

**Key Flow:**
1. Parse font with fontkit and opentype.js
2. Extract name table
3. Extract axes (parallel with other metadata)
4. Extract instances (after axes and nameTable are ready)
5. Combine into final metadata

**Variable Font Detection:**
- Checks for `fvar` table presence
- Sets `isVariable` flag in metadata

---

### 5. **`src/workers/fontParser.worker.ts`**
**Purpose:** Web Worker version of font parser

**What it does:**
- Same extraction logic as `FontParser.ts` but runs in worker thread
- Prevents blocking main thread during font parsing
- Uses same extractors: `extractAxes()`, `extractInstances()`
- Also has fallback opentype.js-only path for instances

**Note:** Has additional fallback code that directly accesses `font.tables.fvar.instances` from opentype.js when binary parsing isn't available.

---

## Supporting Scripts

### 6. **`src/engine/parsers/FontkitParser.ts`**
**Purpose:** Wraps fontkit font parsing

**What it does:**
- Creates fontkit font from buffer
- Provides access to fontkit's variable font APIs
- Used by extractors to access `getVariationAxes()` and `namedVariations`

---

### 7. **`src/engine/parsers/OpentypeParser.ts`**
**Purpose:** Wraps opentype.js font parsing

**What it does:**
- Creates opentype.js font from buffer
- Provides access to opentype.js variable font APIs
- Used as fallback when fontkit fails

---

### 8. **`src/engine/resolvers/NameResolver.ts`**
**Purpose:** Resolves NameIDs to actual name strings

**What it does:**
- Resolves instance subfamilyNameID to name string
- Handles NameID 17 → NameID 2 fallback
- Used by `InstanceExtractor` to get instance names

**Key Function:**
```typescript
export function resolveName(
  nameID: number | null,
  nameTable: NameTable,
  opentypeFont?: any,
  fontkitFont?: any
): string | null
```

---

## Data Flow Summary

```
Font File (ArrayBuffer)
    ↓
FontParser.ts / fontParser.worker.ts
    ↓
┌─────────────────────────────────────┐
│ 1. Parse with fontkit & opentype.js │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Extract Name Table               │
│    (NameExtractor.ts)                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Extract Axes (parallel)          │
│    (AxisExtractor.ts)                │
│    → fontkit.getVariationAxes()      │
│    → opentype.getVariationAxes()     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Extract Instances                │
│    (InstanceExtractor.ts)           │
│    → RawTableParser.parseFvarTable() │
│    → NameResolver.resolveName()      │
│    → Fallback: fontkit.namedVariations│
└─────────────────────────────────────┘
    ↓
FontMetadata {
  isVariable: boolean
  variableAxes: VariableAxis[]
  namedVariations: NamedVariation[]
}
```

---

## Key Data Structures

### VariableAxis
```typescript
{
  tag: string;        // e.g., 'wght', 'wdth', 'opsz'
  name: string;       // e.g., 'Weight', 'Width', 'Optical Size'
  min: number;        // Minimum value
  max: number;        // Maximum value
  default: number;    // Default value
  current: number;    // Current value (initially = default)
}
```

### NamedVariation
```typescript
{
  name: string;                    // e.g., 'Bold', 'Condensed'
  coordinates: Record<string, number>;  // { 'wght': 700, 'wdth': 100 }
}
```

### FvarTableData (Raw Binary)
```typescript
{
  axes?: Array<{
    tag: string;
    name: string | null;  // Resolved from name table
    min: number;
    max: number;
    default: number;
  }>;
  instances?: Array<{
    coordinates: number[];        // Float array, one per axis
    subfamilyNameID?: number;    // NameID for instance name
    postScriptNameID?: number;   // NameID for PostScript name (OT 1.8+)
  }>;
}
```

---

## Summary

**Direct Variable Font Parsing:**
1. ✅ **AxisExtractor.ts** - Extracts axes
2. ✅ **InstanceExtractor.ts** - Extracts preset styles/instances
3. ✅ **RawTableParser.ts** - Binary fvar table parser

**Orchestration:**
4. ✅ **FontParser.ts** - Main parser (browser)
5. ✅ **fontParser.worker.ts** - Worker parser (background thread)

**Supporting:**
6. ✅ **NameResolver.ts** - Resolves instance names
7. ✅ **FontkitParser.ts** - Fontkit wrapper
8. ✅ **OpentypeParser.ts** - Opentype.js wrapper

**All variable font data flows through these scripts.**
