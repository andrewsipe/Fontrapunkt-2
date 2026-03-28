/**
 * Generates canvas CSS custom properties from themeConstants.
 * Single source of truth: src/constants/themeConstants.ts
 * Run: npm run generate:canvas (or tsx scripts/generateCanvasCss.ts)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CANVAS_COLORS } from "../src/constants/themeConstants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function oklchCss({ l, c, h }: { l: number; c: number; h: number }): string {
  return `oklch(${l} ${c} ${h})`;
}

const css = `/**
 * CANVAS COLORS — Generated from src/constants/themeConstants.ts
 * Do not edit by hand. Run: npm run generate:canvas
 */

:root {
  --canvas-bg-light: ${oklchCss(DEFAULT_CANVAS_COLORS.LIGHT.background)};
  --canvas-bg-dark: ${oklchCss(DEFAULT_CANVAS_COLORS.DARK.background)};
  --canvas-fg-light: ${oklchCss(DEFAULT_CANVAS_COLORS.LIGHT.foreground)};
  --canvas-fg-dark: ${oklchCss(DEFAULT_CANVAS_COLORS.DARK.foreground)};
  --bg-canvas: light-dark(var(--canvas-bg-light), var(--canvas-bg-dark));
}
`;

const outDir = path.join(root, "src", "styles", "generated");
const outFile = path.join(outDir, "tokens.canvas.generated.css");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, css, "utf8");
console.log("Wrote", path.relative(root, outFile));
