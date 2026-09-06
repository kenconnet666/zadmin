# ZGroup, ZCenter, ZSpacer execution record — 2026-09-06

## Implemented baseline

All three new layout conveniences are `experimental` with `since: 'unreleased'`, keep native `div` roots, and add no semantic roles, focus handling, observers, or browser geometry state.

- `ZGroup` delegates its responsive row layout, gap, alignment, justification, wrapping, native attributes, and ref behavior to `ZStack`. Its only owned CSS is the closed `itemSizing` visual axis: `auto` ordinary content sizing, `grow` (`flex: 1 1 auto`), or `equal` (`flex: 1 1 0`). `preventGrowOverflow` defaults to true and gives direct children `min-inline-size: 0` plus `max-inline-size: 100%`; it does not conceal or truncate their content.
- `ZCenter` has a native flex baseline with both `align-items` and `justify-content` centered. `inline` changes only its external formatting from flex to inline-flex.
- `ZSpacer` owns a fixed logical inline/block-sized box. It uses only the common `none`/xsmall…xlarge Theme space scale, never component-specific tokens such as `switchInset`. Numbers are non-negative px values. Strings are either plain CSS lengths or balanced `var()`, `calc()`, `min()`, `max()`, or `clamp()` sizing expressions that CSS must resolve to lengths. It is not a parent `gap` proxy or a flex-fill primitive.

## Evidence authored for CI

Parent integration removes the Group wrapper's initial-only style snapshot: native style and ICSS carrier updates flow directly to the single ZStack DOM owner. Spacer is an empty layout primitive and no longer accepts children; CSS length validation is shared with SimpleGrid through `cssLengthExpression`.

- `ui/zui/tests/group-center-spacer-production.spec.ts` covers SSR roots, invalid Group sizing, and invalid Spacer dimensions.
- `ui/zui/tests/group-center-spacer-production.browser.spec.ts` with `GroupCenterSpacerFixture.svelte` covers DOM-order children, grow/equal flex values, overflow boundaries, RTL, two-axis centering, inline formatting, and fixed/default spacer sizes.
- `ui/zui/tests/group-center-spacer-production-types.ts` covers responsive Group/Spacer values, fixed Group direction, and invalid Spacer types.
- The three Docs pages cover normal and responsive Group behavior, block and inline Center, and independent Spacer logical axes.

No test, build, typecheck, browser execution, or CI wait was performed for this package. Prettier and repository whitespace checks are the planned local-only validation.

## Required integration owned by the parent workstream

This package does not change public entrypoints, metadata exports, generated API facts, Docs catalog/loaders, or generated artifacts. Integration needs public exports and metadata for `ZGroup`, `ZCenter`, and `ZSpacer`; generated API facts (`groupApiFacts`, `centerApiFacts`, `spacerApiFacts`); and registration of their Docs pages and standard generated artifacts.
