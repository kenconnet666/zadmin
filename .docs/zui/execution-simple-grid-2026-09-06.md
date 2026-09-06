# ZSimpleGrid execution record — 2026-09-06

## Implemented baseline

`ui/zui/src/components/layout/ZSimpleGrid.svelte` introduces an `experimental` simple layout primitive with `since: 'unreleased'`.

- It owns one native `div` grid and ordinary children. It intentionally does not create `ZGridItem`, provide grid context, or expose span/start/order placement APIs.
- `columns` defaults to `3` and creates fixed equal `minmax(0, 1fr)` tracks. `minItemWidth` is a mutually exclusive responsive mode that emits `repeat(auto-fit, minmax(min(100%, width), 1fr))` only; when its breakpoint object has no `base`, its deterministic base fallback comes from `Theme.size.gridItemMinWidth` (default `16rem`).
- `gap`, `rowGap`, `columnGap`, and `query` reuse the shared responsive CSS and Theme spacing helpers. Named queries generate CSS `@container` rules and require a matching ancestor `ZContainer queryName`; no observer, browser-global width read, or hydration state exists.
- Numeric minimum widths are finite non-negative px values. String widths accept CSS length literals and balanced var/calc/min/max/clamp expressions. They are resolved by CSS, not JavaScript geometry; runtime guards reject malformed value boundaries.
- The root and direct children have `min-width: 0`; caller content chooses its own wrapping, truncation, semantics, and interaction behavior.

## Evidence authored for CI

- `ui/zui/tests/simple-grid-production.spec.ts` covers the SSR native root, fixed-column state, and invalid mutually exclusive/length inputs.
- `ui/zui/tests/simple-grid-production.browser.spec.ts` and `SimpleGridFixture.svelte` cover fixed tracks, independent row/column gaps, direct-child shrinking, auto-fit inside a constrained owner, and inherited RTL direction.
- `ui/zui/tests/simple-grid-production-types.ts` checks responsive modes and their typed mutual exclusion.
- Docs include fixed equal columns, auto-fit cards, named container query CSS, and long-content RTL composition.

No test, build, typecheck, browser execution, or CI wait was performed in this work package. Prettier and repository diff whitespace checks are the only local validation requested here.

## Required integration owned by the parent workstream

This package does not edit entrypoints, metadata exports, generated API facts, Docs catalog/loaders, or generated manifests. Integration must export `ZSimpleGrid`, `ZSimpleGridProps`, and `ZSimpleGridMinItemWidth`; export `simpleGridMetadata`; generate `simpleGridApiFacts`; and register `simpleGridDoc` with the standard generated Docs artifacts.
