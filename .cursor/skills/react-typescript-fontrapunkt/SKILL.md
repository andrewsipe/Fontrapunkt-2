---
name: react-typescript-fontrapunkt
description: React 19, TypeScript, Vite, and project structure for Fontrapunkt. Use when writing components, hooks, workers, or organizing src/. Covers React 19 patterns, TypeScript strict mode, decomposition, and font processing via Web Workers and Comlink.
---

# React & TypeScript (Fontrapunkt)

React 19.2.0, Vite 7.2.4, TypeScript 5.9.3 (strict). Component decomposition, hooks, and heavy work in Web Workers via Comlink.

## When to Apply

- Writing or refactoring components, hooks, or pages
- Organizing code under `src/`
- Offloading heavy work (e.g. font parsing) to workers
- Choosing TypeScript types or strictness

## Tech Stack

- React 19.2.0, Vite 7.2.4, TypeScript 5.9.3 (strict)
- Icons: Lucide-React 0.562.0
- Testing: Vitest 4.0.16 (unit/component tests). Playwright is not used in this web build; it is used in Good Font Scripts (FontExtractor) only.

## Code Quality

- **Cognitive simplicity**: Flat, scannable code; guard clauses and early returns; intent-based names (e.g. `isMenuCollapsed`, `parseFontMetadata`).
- **Decomposition**: Keep JSX under ~150 lines; break large components early.
- **Logic separation**: Put stateful logic in custom hooks under `src/hooks/`.
- **Props**: Prefer explicit props over spread for component APIs.
- **React 19**: Use concurrent features and modern hooks; avoid legacy patterns.
- **TypeScript**: Strict mode; no `any` without justification.

## Project Structure

- **Feature folders**: Accordion, Canvas, Modals, Sidebar under `src/components/`.
- **Shared**: `src/components/` for shared UI; `src/hooks/` for hooks; `src/types/` for types.
- **Font processing**: Heavy parsing in `src/workers/`; use Comlink for worker communication; cache parsed results in Zustand stores.

## Workers

- Offload font parsing and other heavy work to Web Workers.
- Use Comlink for type-safe worker communication.
- Cache results in Zustand so UI does not re-parse unnecessarily.

## Delivery

- Provide full, copy-pasteable code; no placeholders.
- Address Biome and TypeScript errors before delivery.
