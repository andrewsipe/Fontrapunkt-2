---
name: zustand-fontrapunkt
description: Zustand state management for Fontrapunkt. Use when adding or changing global state, stores in src/stores/, or when the user mentions state, stores, or Zustand. Complements React local state and useMemo for derived state.
---

# Zustand (Fontrapunkt)

Zustand 5.0.9 is used for global state. Local and derived state use React primitives.

## When to Apply

- Adding or modifying global state
- Working in `src/stores/` or components that use `useStore`
- Deciding where state should live (global vs local vs derived)

## Patterns

- **Global state**: Zustand stores in `src/stores/`. Use for app-wide data (e.g. font state, UI preferences).
- **Local state**: `useState` for component-only state (e.g. form fields, open/closed).
- **Derived state**: `useMemo` for values computed from state; avoid storing derived data in stores.

## Usage

```ts
import { useStore } from '@/stores/useStore'

// In component: read and update via store selectors/actions
```

## Rules

- Keep stores focused; split by domain if a store grows large.
- Do not put derived data in stores when it can be computed with `useMemo`.
- Heavy parsed data (e.g. font parsing) is cached in Zustand; parsing runs in Web Workers via Comlink.
