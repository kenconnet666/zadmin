# ZUI Typography Architecture

## Ownership and semantics

ZUI separates two responsibilities that mature typography systems often combine:

- `ZText` owns body and inline text semantics from a deliberately small element set: `span`, `p`,
  `small`, `strong`, and `label`.
- `ZHeading` owns document headings and always renders one of the real native `h1`–`h6` elements.

`ZHeading.level` is semantic and `ZHeading.size` is visual. Changing `size` never changes the HTML
outline, and changing `level` never silently selects a different Theme font-size token. The component
does not expose an arbitrary `as` escape hatch because that would make it easy to style a heading while
publishing the wrong accessibility tree.

Shared typography axes are expressed through Theme tokens:

- `size` → `fontSize`
- `weight` → `fontWeight`
- `lineHeight` → `lineHeight`
- `tone` → semantic text color

The internal `typography.ts` helper owns public typography types plus runtime validation for heading
levels and overflow behavior. Components keep their own recipes so metadata, HMR ownership, and public
component styling remain explicit.

## Overflow and numeric text

`ZText.truncate` is the single-line contract: hidden overflow, no wrapping, and ellipsis. The caller
must provide a width or a shrinkable layout context.

`ZText.lineClamp` is the multi-line contract. It requires a positive integer and emits the currently
interoperable CSS line-clamp declarations (`display: -webkit-box`, vertical box orientation,
`-webkit-line-clamp`, and hidden overflow). The complete text remains in the DOM and accessibility tree.
ZUI does not automatically add a Tooltip, title, expand button, or alternate accessible name.

`truncate` and `lineClamp` are mutually exclusive and fail immediately instead of relying on CSS source
order. This prevents an ambiguous public state that would otherwise combine `white-space: nowrap` with
a multi-line box.

`tabularNumbers` applies `font-variant-numeric: tabular-nums`. It stabilizes glyph widths for metrics,
amounts, durations, and tables, but it does not format numbers. Locale-aware grouping, currency, units,
and digits remain the responsibility of `Intl.NumberFormat` or the application formatter.

## Reference decisions

- MUI Typography exposes `variantMapping`, demonstrating why semantic element and visual variant need
  explicit separation. ZUI uses two components instead of a large configurable mapping table:
  <https://mui.com/material-ui/api/typography/>
- Chakra Heading separates rendered element and visual size. ZUI adopts the separation but removes the
  arbitrary `as` override from Heading so `level` remains authoritative:
  <https://next.chakra-ui.com/docs/components/heading>
- Ant Design Typography provides ellipsis, editing, copying, and expansion. ZUI adopts the clear
  single-line/multi-line distinction but deliberately leaves editing, copying, measurement callbacks,
  expansion state, and Tooltip composition to dedicated components:
  <https://ant.design/components/typography/>
- React Spectrum's semantic primitives reinforce using real document elements rather than inferring
  semantics from visual tokens: <https://react-spectrum.adobe.com/>

## Deliberate non-goals

- No automatic heading-level inference from component nesting.
- No visual-size-to-heading-level mapping.
- No editable or copyable typography state.
- No JavaScript text measurement, ResizeObserver ellipsis detection, or expandable clamp runtime.
- No automatic Tooltip for truncated content.
- No arbitrary HTML tag polymorphism on `ZHeading`.

These behaviors require application-specific content, interaction, or document-outline decisions and
should be composed explicitly rather than hidden inside the typography primitive.
