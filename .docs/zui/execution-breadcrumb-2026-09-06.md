# ZBreadcrumb execution record — 2026-09-06

## Implemented baseline

`ui/zui/src/components/navigation/ZBreadcrumb.svelte` establishes the first implemented breadcrumb contract. Its metadata is intentionally `experimental` until generated contracts and CI evidence are accepted.

- `items` is a required typed array with stable `SelectionKey`, text `label`, optional real `href`, and at most one explicit `current: true` item; otherwise the last item is current.
- The rendered hierarchy is a named native `nav > ol > li`; genuine URLs render through `ZLink`, while entries without href render as text. Both forms preserve component-owned `aria-current="page"`.
- Default and custom separators are placed in an `aria-hidden` slot. The component owns list items and separator accessibility even when `item` or `separator` snippets replace visible content.
- ICSS uses the existing builder callback `s`, logical layout, and purpose-level theme tokens (`textMuted`, spacing) for wrapping-friendly width, gap, and separator tone. The component accepts native nav attributes, `class`, `style`, ICSS variables, and a bindable `HTMLElement` ref.
- Runtime guards reject missing/non-finite keys, duplicate keys, non-string labels, invalid key types and more than one explicit current entry. Rich-content snippets do not take over link/current semantics.

## Evidence authored for CI

- SSR contract: `ui/zui/tests/breadcrumb-production.spec.ts` checks native structure, link/current boundaries, decorative separators, and invalid current ownership.
- Browser contract: `ui/zui/tests/breadcrumb-production.browser.spec.ts` checks real anchors, current text, hidden separators, long-label wrapping, and RTL flex wrapping.
- Type contract: `ui/zui/tests/breadcrumb-production-types.ts` checks required typed keys and text labels.
- Docs: four demos cover default route hierarchy, `item`/`separator` snippets, narrow long paths, and RTL.

No test, build, typecheck, browser run, or CI wait was performed in this work package, per the execution constraint. These contracts are authored for the next repository CI cycle.

## Deliberately deferred capability

Long-path collapse is not represented by a partial `maxItems` API. The repository has no reusable SSR-safe measurement/overflow collection primitive that can hide ancestors without changing tab order or losing accessible paths. A complete follow-up should first deliver that primitive (for Breadcrumb, Tabs, Toolbar, and AvatarGroup), then add a separate controlled collapse contract with:

- `maxItems`/collapsed-item selection based on actual container measurements after hydration, with a deterministic complete SSR initial state;
- a keyboard-accessible disclosure/menu for omitted ancestors, preserving every original real link and typed key;
- resize, font-load, RTL, narrow-width, focus-restoration, and reduced-motion regression evidence.

## Required integration owned by the parent workstream

This package intentionally did **not** change generated facts, public entrypoints, metadata exports, Docs catalog, loaders, or manifests. The integrating change must add:

1. `ZBreadcrumb`, `BreadcrumbItem`, and `ZBreadcrumbProps` to `ui/zui/src/entrypoints/index.ts`.
2. `breadcrumbMetadata` to `ui/zui/src/entrypoints/metadata.ts`.
3. The generated API fact update that creates `breadcrumbApiFacts` in `apps/docs/src/framework/component-api.generated.ts`.
4. `breadcrumbDoc` in `apps/docs/src/framework/catalog.ts`, plus its generated loader/catalog/maturity/support artifacts through the existing repository generator workflow.
