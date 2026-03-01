# Theme System Documentation

Fontrapunkt-2 uses a centralized, OKLCH-based theme system with proper separation of concerns.

## Architecture

### 1. Constants Layer (`src/constants/themeConstants.ts`)
**Single source of truth** for all theme-related constants:

- `ACCENT_PRESETS` - 16 hand-tuned accent colors (Red, Orange, Amber, Yellow, Lime, Green, Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink, Rose)
- `TONE_SYSTEM` - Tailwind-inspired neutral gray constants:
  - `COOL_HUE: 265` (Slate/Zinc - steely blue)
  - `WARM_HUE: 65` (Stone - yellow-ish, NOT orange/brown)
  - `MAX_CHROMA: 0.022` (matches Tailwind neutral intensity)
  - `NEUTRAL_THRESHOLD: 0.05` (below this = pure neutral with 0 chroma)
- `BASE_CHROMA_MULTIPLIERS` - Light/dark mode chroma adjustments
- `DEFAULT_CANVAS_COLORS` - Bespoke off-white / rich black for font canvas only; aligned with `--canvas-bg-light`/`--canvas-bg-dark` and `--bg-canvas`
- `TEXT_ON_ACCENT_THRESHOLD: 0.55` - Lightness threshold for white vs dark text on accent
- `CONTRAST_RATIOS` - WCAG compliance thresholds (AAA: 7, AA: 4.5, AA_LARGE: 3)
- `SEMANTIC_HUES` - Fixed hues for semantic colors (success, info, warning, danger)

### 2. CSS Variables (design tokens)

**Token system (`tokens.css`)**
- Entry point: `tokens.css` (imported by `global.css`)
- Modular token files in `src/styles/`:
  - `tokens.foundation.css` - Primitives (accent config, opacity, z-index)
  - `tokens.palettes.css` - Neutral tonal palettes (bg/fg layers)
  - `tokens.color.css` - Semantic color tokens (backgrounds, text, borders, accent, semantic)
  - `tokens.typography.css` - Font system
  - `tokens.spacing.css` - Spacing scale, layout, radius
  - `tokens.motion.css` - Transitions and animations
  - `tokens.elevation.css` - Shadows
  - `tokens.components.css` - Component-specific tokens
  - `tokens.icons.css` - Icon sizing

### 3. Application Layer

**Store** (`src/stores/settingsStore.ts`)
- Manages user preferences: `accentColor`, `tonePreference`, `colorScheme`, `canvasTheme`
- Persists to localStorage with Zustand

**Hook** (`src/hooks/useTheme.ts`)
- Applies theme by setting CSS custom properties on document root
- Uses constants from `themeConstants.ts`
- Calculates tone mode (neutral/warm/cool) based on `tonePreference` slider
- Sets text-on-accent color based on accent lightness threshold

**Utils**
- `src/utils/oklchColorUtils.ts` - OKLCH color calculations
- `src/utils/colorUtils.ts` - Color conversions (OKLCH ↔ hex ↔ RGB) using Culori
- `src/utils/contrastUtils.ts` - WCAG contrast ratio calculations
- `src/utils/themeUtils.ts` - Theme preference management

### 4. Dev Tools

Theme/token visualization and contrast checking live in the standalone **theme-viewer-standalone** project (separate repo/app). Use that to inspect `tokens.color.css` and WCAG contrast.

## How It Works

### Tone System (Tailwind-Inspired Neutrals)

The tone preference slider goes from -1 (cool) to +1 (warm):

1. **Neutral** (`|tonePreference| < 0.05`):
   - Hue: 0
   - Chroma: 0
   - Pure achromatic gray

2. **Cool** (`tonePreference < 0`):
   - Hue: 265° (Slate/Zinc - steely blue)
   - Chroma: `|tonePreference| × 0.022`
   - Intensity scales with slider position

3. **Warm** (`tonePreference > 0`):
   - Hue: 65° (Stone - yellow-ish)
   - Chroma: `tonePreference × 0.022`
   - Intensity scales with slider position

Dark mode gets 80% of light mode's base chroma for a "cleaner" look.

### Accent System

Accent colors use OKLCH's perceptual uniformity - the same L/C values work across all hues:

- **Light mode**: Higher chroma (0.3), lower lightness (0.5)
- **Dark mode**: Lower chroma (0.12), higher lightness (0.65)
- **Text-on-accent**: White when accent L < 0.55, dark otherwise

### Semantic Colors (Fixed, Not Accent-Derived)

- **Success**: 140° (green)
- **Info**: 240° (blue)
- **Warning**: 75° (clear amber - NOT muddy brown at 85°)
- **Danger**: 25° (red)

These hues are consistent across themes for recognizability.

## Usage Examples

### Using Constants

```typescript
import { ACCENT_PRESETS, TONE_SYSTEM, CONTRAST_RATIOS } from "@/constants/themeConstants";

// Get a preset
const bluePreset = ACCENT_PRESETS.find(p => p.name === "Blue");

// Check if tonePreference is neutral
if (Math.abs(tonePreference) < TONE_SYSTEM.NEUTRAL_THRESHOLD) {
  // Pure neutral
}

// WCAG compliance
if (contrastRatio >= CONTRAST_RATIOS.AA) {
  // Passes AA
}
```

### Accessing Theme in Components

```typescript
import { useSettingsStore } from "@/stores/settingsStore";

function MyComponent() {
  const accentColor = useSettingsStore(state => state.accentColor);
  const tonePreference = useSettingsStore(state => state.tonePreference);
  
  // Colors are automatically applied via useTheme hook in App.tsx
  // Just use CSS variables in your styles
  
  return (
    <div style={{ 
      background: "var(--bg-surface)",
      color: "var(--text-primary)",
      borderColor: "var(--border-default)"
    }}>
      Current accent: {accentColor.hue}°
    </div>
  );
}
```

### Calculating Contrast

```typescript
import { getContrastResult } from "@/utils/contrastUtils";
import type { OKLCHColor } from "@/utils/colorUtils";

const foreground: OKLCHColor = { l: 0.2, c: 0, h: 0 };
const background: OKLCHColor = { l: 0.99, c: 0, h: 0 };

const result = getContrastResult(foreground, background);
// result.ratio: 16.8
// result.level: "AAA"
// result.passes: true
```

## Files Changed

### Created
- `src/constants/themeConstants.ts` - Centralized constants
- `src/utils/contrastUtils.ts` - WCAG contrast utilities
### Updated
- `src/components/features/SettingsModal/components/AccentPresetGrid.tsx` - Uses `ACCENT_PRESETS` from constants
- `src/hooks/useTheme.ts` - Uses tone constants from `themeConstants.ts`
- `src/utils/themeUtils.ts` - Uses `DEFAULT_CANVAS_COLORS` from constants
- `src/styles/tokens.color.css` - Fixed warning color (hue 75 → 85)

### Removed
- `public/color-palette-viewer.html` - Removed (use standalone theme-viewer app for token inspection)
- `public/tokens/*` - Duplicate token files (tokens now in `src/styles/`)

## Migration Notes

## Follow-up: Accent tint (neutral + accent hue)

**Not yet implemented.** When `tonePreference` is near zero (neutral), the neutral palette currently uses 0 chroma. A future refinement is to imbue the neutral palette with a subtle tint of the user’s accent hue at low intensity, so the neutrals feel aligned with the accent without shifting to full cool/warm. See the note in `src/hooks/useTheme.ts`; implement when refining the accent system (e.g. set base chroma/hue from accent when `|tonePreference| < NEUTRAL_THRESHOLD`).
