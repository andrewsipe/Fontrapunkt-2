---
name: radix-a11y-fontrapunkt
description: Radix UI primitives and accessibility for Fontrapunkt. Use when building or reviewing UI with Dialog, Select, Tabs, Toast, Accordion, Collapsible, ToggleGroup, Tooltip, or VisuallyHidden. Ensures keyboard navigation, ARIA, and focus behavior. WCAG 2.1 AA minimum.
---

# Radix UI & Accessibility (Fontrapunkt)

Radix UI primitives provide accessible, keyboard-friendly components. Use them instead of custom implementations for complex UI. WCAG 2.1 AA is the minimum for web work.

## When to Apply

- Adding or changing modals, dropdowns, tabs, toasts, accordions, tooltips
- Reviewing focus or keyboard behavior
- Choosing between Radix and custom components

## Available Primitives

Accordion, Collapsible, Dialog, Select, Tabs, Toast, ToggleGroup, Tooltip, VisuallyHidden.

## Accessibility Rules

- **Leverage Radix**: Use Radix for Dialog, Select, Tabs, etc.; it handles focus trap, Escape, arrow keys, type-ahead, Home/End.
- **Focus**: All interactive elements must have visible focus indicators.
- **Progressive enhancement**: Core functionality works without JS; enhancements layer on.
- **Do not remove or override** Radix keyboard/ARIA behavior without a strong reason.

## Patterns

- **Dialog**: Trap focus, Escape to close.
- **Select**: Arrow keys, type-ahead search.
- **Tabs**: Arrow navigation, Home/End keys.
- Prefer Radix over custom implementations for consistency and a11y.

## Gaps

- No automated a11y tests yet; add Playwright + axe-core when adding or changing critical UI.
