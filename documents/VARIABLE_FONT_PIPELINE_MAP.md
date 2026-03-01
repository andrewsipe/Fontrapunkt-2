# Variable Font Pipeline - Function Map

## Overview
This document maps the complete flow from font upload through variable font parsing to UI presentation in the FontSite script.

---

## 1. FONT UPLOAD & LOADING

### Entry Points
- **`handleFiles(fileList)`** - Main entry point for font file processing
  - Validates file types (.ttf, .otf, .woff, .woff2)
  - Validates file sizes (max 50MB, warns at 10MB)
  - Shows loading skeletons
  - Processes files in batches (BATCH_SIZE = 5)
  - Calls `processFontFile()` for each file

- **`processFontFile(file)`** - Processes individual font file
  - Converts file to ArrayBuffer
  - Creates fontkit font: `fontkitFont = fontkit.create(arrayBuffer)`
  - Creates opentype.js font: `opentypeFont = opentype.parse(arrayBuffer)`
  - Calls `extractMetadata(fontkitFont, file)` to extract all font data
  - Creates object URL for font file
  - Pushes font data to `fonts[]` array

---

## 2. VARIABLE FONT DETECTION

### Detection Function
- **`isVariableFont(font)`** - Checks if font is variable
  ```javascript
  // Checks:
  1. font.variationAxes && Object.keys(font.variationAxes).length > 0
  2. OR font._src?.tables?.fvar !== undefined
  ```
  - Returns: `true` if variable, `false` otherwise
  - Called during metadata extraction
  - Result stored in `fontData.isVariable`

---

## 3. VARIABLE AXES EXTRACTION

### Extraction Function
- **`extractVariableAxes(font)`** - Extracts variable font axes
  ```javascript
  // Extracts from: font.variationAxes
  // Returns array of axis objects:
  {
    tag: string,      // e.g., 'wght', 'wdth', 'opsz'
    name: string,     // e.g., 'Weight', 'Width', 'Optical Size'
    min: number,      // Minimum value
    max: number,      // Maximum value
    default: number   // Default value
  }
  ```
  - Wrapped in try-catch during `extractMetadata()`
  - Result stored in `fontData.variableAxes[]`
  - Empty array `[]` if not variable or extraction fails

---

## 4. NAMED VARIATIONS (PRESET STYLES) EXTRACTION

### Extraction Function
- **`extractNamedVariations(font)`** - Extracts preset style variations
  ```javascript
  // Extracts from: font.namedVariations
  // Returns array of variation objects:
  {
    name: string,           // e.g., 'Light', 'Regular', 'Bold'
    coordinates: {           // Object mapping axis tags to values
      'wght': 300,
      'wdth': 100,
      ...
    }
  }
  ```
  - Wrapped in try-catch during `extractMetadata()`
  - Result stored in `fontData.namedVariations[]`
  - Empty array `[]` if no named variations or extraction fails

---

## 5. METADATA EXTRACTION (Main Orchestrator)

### Main Function
- **`extractMetadata(font, file)`** - Extracts all font metadata
  - Calls `extractVariableAxes(font)` → stores in `variableAxes`
  - Calls `isVariableFont(font)` → stores in `isVariable`
  - Calls `extractNamedVariations(font)` → stores in `namedVariations`
  - Returns complete metadata object including:
    - Basic info (filename, family, subfamily, etc.)
    - Variable font flags and data
    - OpenType features
    - Metrics, tables, etc.

---

## 6. UI RENDERING - Variable Font Controls

### Panel Creation Functions

#### A. Variable Controls Panel (Legacy/Standalone)
- **`createVariableControlsPanel(fontData, columnIndex)`**
  - Creates full variable font control panel
  - Includes axis sliders, named variations dropdown
  - Used in legacy variable mode (not preview mode)

#### B. Variable Axes Section (Unified Preview Panel)
- **`createVariableAxesSectionForPreview(fontData, columnIndex)`**
  - Creates collapsible section with axis controls
  - Each axis gets:
    - Label with name and tag
    - Range slider with datalist for ticks
    - Number input field
    - Min/max/default display
  - Calls `calculateTicks(axis)` for slider tick marks
  - Calls `formatAxisValue(value, axis)` for display formatting

#### C. Named Variations Section (Preset Styles Dropdown)
- **`createNamedVariationsSection(fontData, columnIndex)`**
  - Creates collapsible section with dropdown
  - Dropdown options: "Select a preset..." + all named variations
  - Each option shows variation name
  - Stores variation index as value

#### D. Unified Preview Panel
- **`createUnifiedPreviewPanel(fontData, columnIndex, fontFaceName)`**
  - Combines all preview components:
    1. Preview text section
    2. Universal controls (font size, line height, letter spacing)
    3. Variable axes section (if variable)
    4. Named variations section (if has named variations)
    5. OpenType features section (if has features)

---

## 7. UI HELPER FUNCTIONS

### Formatting & Calculation
- **`formatAxisValue(value, axis)`** - Formats axis value for display
  - Large ranges (>100): rounds to integer
  - Smaller ranges: keeps 1-2 decimal places

- **`calculateTicks(axis)`** - Calculates tick marks for slider
  - Special handling for weight axis (wght): 100-unit increments
  - Other axes: Calculates 5-10 ticks with rounded intervals
  - Returns array of tick values

---

## 8. VARIATION STATE MANAGEMENT

### State Variables
- **`currentVariations[columnIndex]`** - Object storing current axis values
  ```javascript
  {
    'wght': 400,
    'wdth': 100,
    'opsz': 14,
    ...
  }
  ```
  - Initialized with default values when font is selected
  - Updated when sliders/inputs change
  - Used to apply variations to preview text

---

## 9. VARIATION APPLICATION

### Application Function
- **`updateFontVariation(columnIndex, variations)`** - Applies variations to preview
  ```javascript
  // Builds CSS font-variation-settings:
  previewElement.style.fontVariationSettings = 
    '"wght" 400, "wdth" 100, "opsz" 14';
  ```
  - Called whenever variations change
  - Updates preview text element in real-time

---

## 10. EVENT HANDLERS - Sliders & Inputs

### Handler Attachment
- **`attachVariableControlHandlers()`** - Attaches all variable font control handlers

#### A. Axis Slider Handlers
- **Slider `input` event:**
  - Gets columnIndex and axisTag from control element
  - Parses slider value
  - Updates corresponding number input with formatted value
  - Updates `currentVariations[columnIndex][axisTag]`
  - Calls `updateFontVariation()` to apply changes
  - Calls `checkAndSyncPreset()` to sync dropdown

- **Slider `keyup` event (arrow keys):**
  - Same as input event
  - Handles keyboard navigation

- **Slider `mouseup` event:**
  - Ensures variation is updated after drag
  - Calls `checkAndSyncPreset()`

#### B. Axis Input Field Handlers
- **Input `input` event:**
  - Gets value from input field
  - Constrains to min/max range
  - Formats value for display
  - Updates slider to match
  - Updates `currentVariations[columnIndex][axisTag]`
  - Calls `updateFontVariation()` to apply changes
  - Calls `checkAndSyncPreset()` to sync dropdown

- **Input `keydown` event (arrow keys):**
  - Updates variations after value changes
  - Formats and syncs with slider

- **Input `blur` event:**
  - Final update when field loses focus
  - Ensures variations are applied

#### C. Named Variations Dropdown Handler
- **Select `change` event:**
  - Gets selected variation index
  - Retrieves variation coordinates from `fontData.namedVariations[selectedIndex]`
  - Updates `currentVariations[columnIndex]` with all coordinates
  - Updates all sliders and inputs to match preset values
  - Calls `updateFontVariation()` to apply changes

#### D. Reset Button Handler
- **Reset button click:**
  - Calls `resetVariableAxes(columnIndex)`
  - Resets all axes to default values
  - Updates all sliders and inputs
  - Clears named variations dropdown
  - Applies default variations to preview

---

## 11. PRESET SYNC FUNCTION

### Sync Function
- **`checkAndSyncPreset(columnIndex)`** - Syncs dropdown with current slider values
  - Compares `currentVariations[columnIndex]` with all named variations
  - Finds matching preset (within tolerance):
    - Weight axis (wght): 1.0 tolerance
    - Other axes: 0.01 tolerance
  - Updates dropdown to show matching preset
  - Clears dropdown if no match

---

## 12. RESET FUNCTIONS

### Reset Functions
- **`resetVariableAxes(columnIndex)`** - Resets axes to defaults
  - Gets default values from `fontData.variableAxes[].default`
  - Updates `currentVariations[columnIndex]` with defaults
  - Updates all slider and input values
  - Clears named variations dropdown
  - Applies default variations to preview
  - Calls `checkAndSyncPreset()` to verify

---

## 13. COMPLETE FLOW DIAGRAM

```
1. USER UPLOADS FONT
   ↓
2. handleFiles(fileList)
   ↓
3. processFontFile(file)
   ├─→ fontkit.create(arrayBuffer)
   ├─→ opentype.parse(arrayBuffer)
   └─→ extractMetadata(fontkitFont, file)
       ├─→ isVariableFont(font) → fontData.isVariable
       ├─→ extractVariableAxes(font) → fontData.variableAxes[]
       └─→ extractNamedVariations(font) → fontData.namedVariations[]
   ↓
4. Font data stored in fonts[] array
   ↓
5. USER SELECTS FONT
   ↓
6. updateComparison() → renderComparison()
   ↓
7. createUnifiedPreviewPanel(fontData, columnIndex, fontFaceName)
   ├─→ createVariableAxesSectionForPreview() [if isVariable]
   │   ├─→ calculateTicks(axis) for each axis
   │   ├─→ formatAxisValue() for display
   │   └─→ Creates slider + input for each axis
   └─→ createNamedVariationsSection() [if has namedVariations]
       └─→ Creates dropdown with preset options
   ↓
8. attachVariableControlHandlers()
   ├─→ Slider input handlers
   ├─→ Input field handlers
   ├─→ Dropdown change handler
   └─→ Reset button handler
   ↓
9. USER INTERACTS WITH CONTROLS
   ├─→ Slider moved → updateFontVariation() → checkAndSyncPreset()
   ├─→ Input changed → updateFontVariation() → checkAndSyncPreset()
   ├─→ Preset selected → updateFontVariation()
   └─→ Reset clicked → resetVariableAxes() → updateFontVariation()
   ↓
10. updateFontVariation(columnIndex, variations)
    └─→ Applies CSS font-variation-settings to preview element
```

---

## 14. KEY DATA STRUCTURES

### Font Data Object (after extraction)
```javascript
{
  // ... other metadata ...
  isVariable: boolean,
  variableAxes: [
    {
      tag: 'wght',
      name: 'Weight',
      min: 100,
      max: 900,
      default: 400
    },
    // ... more axes ...
  ],
  namedVariations: [
    {
      name: 'Light',
      coordinates: {
        'wght': 300,
        'wdth': 100
      }
    },
    // ... more variations ...
  ]
}
```

### Current Variations State
```javascript
currentVariations[columnIndex] = {
  'wght': 400,
  'wdth': 100,
  'opsz': 14
}
```

---

## 15. CSS APPLICATION

### Font Variation Settings
The variations are applied via CSS:
```css
font-variation-settings: "wght" 400, "wdth" 100, "opsz" 14;
```

Applied to preview text element:
```javascript
previewElement.style.fontVariationSettings = 
  Object.entries(variations)
    .map(([tag, value]) => `"${tag}" ${value}`)
    .join(', ');
```

---

## Notes

- All variable font extraction is wrapped in try-catch to prevent errors from breaking font loading
- Variations are initialized with default values when font is first selected
- Preset dropdown automatically syncs when sliders are moved manually
- Sliders use datalist elements for visual tick marks
- Input fields constrain values to axis min/max ranges
- Reset functions restore all axes to their default values
