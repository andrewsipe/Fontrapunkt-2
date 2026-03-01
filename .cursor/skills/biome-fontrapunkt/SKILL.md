---
name: biome-fontrapunkt
description: Biome linting and formatting for Fontrapunkt. Use when writing or reviewing TypeScript/JavaScript/CSS/JSON in Fontrapunkt, configuring lint rules, or addressing Biome warnings. Biome is the only linter; no ESLint or Stylelint.
---

# Biome (Fontrapunkt)

Biome 2.3.11 is the only linter and formatter for Fontrapunkt (JS, TS, CSS, JSON). No ESLint or Stylelint; use Biome for all linting and formatting.

## When to Apply

- Writing or editing `.ts`, `.tsx`, `.js`, `.json` in Fontrapunkt
- Addressing lint/format warnings before delivery
- Adding or changing Biome config

## Rules

- **Before delivery**: Fix Biome warnings; do not leave new violations.
- **Config**: Use project Biome config; if suggesting new rules, keep them consistent with existing style.
- **No ESLint or Stylelint**: Do not introduce ESLint or Stylelint; note "Biome is the only linter" if either is mentioned.

## Quick Reference

- Linting: Biome handles TypeScript strictness, imports, naming, React rules, and CSS.
- Formatting: Use Biome formatter; avoid manual style fights.
- If suggesting ESLint/Stylelint: Do not add; Biome is used exclusively for this project.
