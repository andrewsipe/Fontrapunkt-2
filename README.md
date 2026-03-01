# Fontrapunkt-2

> **Repository**: [https://github.com/andrewsipe/Fontrapunkt-2](https://github.com/andrewsipe/Fontrapunkt-2)

Second iteration of Fontrapunkt: a browser-based variable font testing and animation tool, built as a privacy-first single-page application.

## Features

- **Font Upload & Caching**: Upload fonts (TTF, OTF, WOFF, WOFF2) with IndexedDB caching
- **Variable Font Animation**: Animate all axes simultaneously with customizable easing
- **Multiple View Modes**: Plain, Waterfall, Styles, Glyphs, and Present modes
- **OKLCH Color System**: Modern color picker with OKLCH color space
- **OpenType Features**: Toggle OpenType features on/off
- **Export Tools**: Copy CSS, take screenshots, record animations
- **Multi-Tab Support**: Open and compare multiple fonts
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Privacy-First**: All font processing happens client-side

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Base UI** - Accessible primitives
- **Zustand** - State management
- **React Router** - Routing
- **opentype.js** / **fontkit** - Font parsing and metrics
- **culori** - OKLCH color conversions
- **IndexedDB** (idb) - Font caching
- **Biome** - Lint and format
- **Vitest** - Unit tests
- **Playwright** - E2E tests

## Primitives and components

UI is layered as **primitive → component → feature** so layout and styling can be reused and reflowed.

| Layer | Rule | Example |
|-------|------|--------|
| **Primitive** | One job; no chrome; no behavior variants. | `Icon` (glyph at 1em). |
| **Component** | Primitive(s) + chrome + variants (static/interactive, sizes). | `IconContainer` (box + static/interactive). |
| **Feature** | Component + specific content/semantics. | `ResetButton` (IconContainer + RotateCcw + reset). |

**When adding a primitive:** (1) Can it do one thing only? (2) Does the component that uses it own all chrome and variants? (3) Are feature pieces only composing components and domain logic?

**When refactoring a monolithic component:** (1) Identify the primitive. (2) Extract a component that adds container/variants. (3) Keep feature components as thin wrappers.

Apply this to Panel, Slider, and other areas for consistent granularity.

## Optional Server

For static font instance generation, see `server/README.md`.

## Keyboard Shortcuts

- `Cmd/Ctrl + O`: Open font
- `Cmd/Ctrl + W`: Close tab
- `Cmd/Ctrl + T`: New tab
- `Cmd/Ctrl + C`: Copy CSS (when not selecting text)
- `Space`: Play/Pause animation
- `R`: Reset axes
- `F`: Toggle fullscreen (Present mode)
- `Esc`: Exit Present mode or close modals

## Browser Support

- Chrome/Edge 90+
- Firefox 89+
- Safari 14.1+

Requires support for:
- Variable fonts (`font-variation-settings`)
- IndexedDB
- Canvas API
- OKLCH color space (with fallback)

## License

MIT
