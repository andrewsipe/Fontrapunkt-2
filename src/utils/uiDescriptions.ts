/**
 * UI Element Descriptions
 * Provides descriptions for proofing buttons, menu items, and other UI elements
 * Used in Popover components for contextual help
 */

export interface UIDescription {
  title: string;
  description: string;
  details?: string;
}

/**
 * Proofing text button descriptions
 */
export const PROOFING_DESCRIPTIONS: Record<string, UIDescription> = {
  title: {
    title: "Title",
    description:
      "Loads a random book or article title. Useful for testing how your font handles short text at large sizes.",
    details:
      "Titles are typically displayed at larger sizes and require careful attention to letter spacing and character shapes.",
  },
  pangram: {
    title: "Pangram",
    description:
      "Loads a random pangram - a sentence containing every letter of the alphabet at least once.",
    details:
      "Pangrams are excellent for quickly checking that all letters are present and readable. Examples include 'The quick brown fox jumps over the lazy dog' and variations.",
  },
  gutenberg: {
    title: "Gutenberg Text",
    description:
      "Fetches a random passage from Project Gutenberg, a collection of public domain books.",
    details:
      "Gutenberg text provides longer-form content for testing readability, line breaks, and paragraph spacing. Great for evaluating body text performance.",
  },
  quote: {
    title: "Quote",
    description: "Fetches a random inspirational quote from the Quotable API.",
    details:
      "Quotes are typically short to medium length, making them ideal for testing how your font handles common words and phrases in various contexts.",
  },
  wikipedia: {
    title: "Wikipedia",
    description: "Fetches a random paragraph from Wikipedia articles.",
    details:
      "Wikipedia text includes diverse vocabulary, proper nouns, and technical terms, making it useful for testing how your font handles a wide range of content.",
  },
};

/**
 * View mode descriptions
 */
export const VIEW_DESCRIPTIONS: Record<string, UIDescription> = {
  plain: {
    title: "Plain View",
    description:
      "Standard text editing view with a single canvas. Edit text directly, adjust typography settings, and see real-time changes.",
    details:
      "This is the primary view for testing and editing text. Supports direct text editing, variable font axes, OpenType features, and all typography controls.",
  },
  waterfall: {
    title: "Waterfall View",
    description: "Displays the same text at multiple sizes simultaneously, from large to small.",
    details:
      "Perfect for evaluating how your font performs across different sizes. Helps identify issues with legibility, spacing, and character shapes at various scales.",
  },
  styles: {
    title: "Styles View",
    description: "Shows all named variation instances (styles) of a variable font side-by-side.",
    details:
      "Useful for comparing different weight, width, or other axis combinations. Each style card can be double-clicked to copy its CSS.",
  },
  glyphs: {
    title: "Glyphs View",
    description: "Displays all available glyphs in the font, organized by category.",
    details:
      "Browse the complete character set, search for specific glyphs, and copy individual characters. Organized by categories like Latin, Numbers, Punctuation, etc.",
  },
  present: {
    title: "Present View",
    description: "Fullscreen presentation mode with sidebar and controls hidden.",
    details:
      "Focuses attention on the text without distractions. Perfect for presentations or when you need a clean view of your typography.",
  },
};

/**
 * Get description for a proofing button
 */
export function getProofingDescription(key: string): UIDescription | null {
  return PROOFING_DESCRIPTIONS[key.toLowerCase()] || null;
}

/**
 * Get description for a view mode
 */
export function getViewDescription(key: string): UIDescription | null {
  return VIEW_DESCRIPTIONS[key.toLowerCase()] || null;
}

/**
 * Section label descriptions
 */
export const SECTION_DESCRIPTIONS: Record<string, UIDescription> = {
  alignment: {
    title: "Alignment",
    description:
      "Controls horizontal text alignment (left, center, right) and auto-fit/trim options.",
    details:
      "Left/Center/Right controls horizontal alignment. Auto Fit scales text to fill the canvas. Trim removes excess whitespace above/below text.",
  },
  orientation: {
    title: "Orientation",
    description: "Controls vertical alignment of text within the canvas (top, center, bottom).",
    details:
      "Top aligns text to the top of the canvas. Center vertically centers the text. Bottom aligns text to the bottom.",
  },
  case: {
    title: "Case",
    description: "Controls text case transformation (uppercase, sentence case, lowercase).",
    details:
      "Uppercase converts all letters to capitals. Sentence case preserves original capitalization. Lowercase converts all letters to lowercase.",
  },
  "variable axes": {
    title: "Variable Axes",
    description:
      "Adjust variable font axes to change weight, width, slant, and other design dimensions.",
    details:
      "Variable fonts allow continuous adjustment of design parameters. Each axis (like Weight, Width, or Italic) can be adjusted independently to create custom font variations.",
  },
  color: {
    title: "Color",
    description:
      "Set foreground and background colors using the OKLCH color space for perceptually uniform color selection.",
    details:
      "OKLCH (Lightness, Chroma, Hue) provides perceptually uniform colors, meaning equal changes in values produce equal visual changes. Better than RGB or HSL for color manipulation.",
  },
  "opentype features": {
    title: "OpenType Features",
    description:
      "Enable or disable OpenType typographic features like ligatures, stylistic sets, and figure styles.",
    details:
      "OpenType features enhance typography with ligatures, alternate characters, small caps, oldstyle figures, and more. Features are disabled by default - enable them to see their effects.",
  },
  proofing: {
    title: "Proofing",
    description:
      "Load sample text, glyph sets, or proof sets for testing your font in various contexts.",
    details:
      "Sample Text provides real-world content. Glyph Sets show specific character ranges. Proof Sets are designed to test specific typographic features like ligatures, kerning, or case pairs.",
  },
  "text controls": {
    title: "Text Controls",
    description:
      "Adjust typography settings including font size, letter spacing, line height, alignment, and text transformation.",
    details:
      "Control all aspects of text rendering: size, spacing, alignment, direction (LTR/RTL), case transformation, and vertical positioning.",
  },
};

/**
 * Get description for a section label
 */
export function getSectionDescription(key: string): UIDescription | null {
  return SECTION_DESCRIPTIONS[key.toLowerCase()] || null;
}
