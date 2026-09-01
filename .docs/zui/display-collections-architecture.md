# ZUI Semantic Display Collections Architecture

Status: implemented R6 production increment, 2026-09-02.

## Scope

This stage defines two non-interactive display collection boundaries:

- `ZList`: real `ul` or `ol`, containing real `li` business items.
- `ZDescriptionList`: real `dl`, containing real `dt` and `dd` relationships.

They provide a small typed data convenience layer and a mutually exclusive manual-children mode. They do
not own selection, focus navigation, sorting, filtering, pagination, cell semantics, virtualization or
business loading requests.

## Mature-library comparison

- [MUI List](https://mui.com/material-ui/react-list/) keeps `ul/li` as the default semantic base and
  composes text, icons and secondary actions. ZUI adopts a child-owned action slot but does not create a
  large family of item wrappers.
- [Ant Design List](https://ant.design/components/list/) provides `dataSource`, row keys, renderItem,
  loading, empty, pagination and grid. ZUI adopts typed items, item/action snippets and states, but keeps
  pagination outside, rejects grid mode and directs large data to `ZVirtualList`.
- [Ant Design Descriptions](https://ant.design/components/descriptions/) demonstrates responsive
  read-only fields and rich labels/content. ZUI keeps native `dl/dt/dd`, uses CSS auto-fit only, and does
  not copy bordered table layouts, span arithmetic or column DSLs.
- [Naive UI](https://github.com/tusen-ai/naive-ui/tree/main/src/list) confirms List and Descriptions as
  separate data-display families. ZUI does not copy Vue render functions, arbitrary field mapping or
  theme override objects.

## Typed identity

Both item models use `SelectionKey` (`string | number`). Finite numbers except negative zero are accepted;
numeric `1` and string `"1"` remain distinct. Duplicate keys, `NaN`, infinity and negative zero fail before
item DOM is emitted.

New code uses `key`. The previous exported `id` field remains a deprecated exclusive alternative so
existing consumers can migrate without a workspace-wide atomic rewrite. Runtime resolution never
stringifies before identity comparison.

## Data convenience versus manual semantics

Data mode:

```text
ZList items -> li -> content + optional action
ZDescriptionList items -> div group -> dt + dd(content + optional action)
```

Manual mode:

- `ZList children` must supply real `li` nodes and may nest another List inside an `li`.
- `ZDescriptionList children` must supply valid `dt/dd` sequences or HTML-permitted grouped `div` nodes.

`items` and `children` are a discriminated TypeScript union and are also validated at runtime. The data
mode exposes only bounded snippets:

- List: `item(item, index)` and `action(item, index)`.
- DescriptionList: `term(item, index)`, `description(item, index)` and `action(item, index)`.

There is no `any`, field-name mapping, recursive schema or arbitrary renderer registry.

## Empty and loading semantics

Empty/loading feedback is never emitted as `li`, `dt` or `dd` because it is not a business item. The
semantic root remains mounted and empty, with `aria-busy` and `aria-describedby` pointing to a sibling
status region.

- Default empty uses `ZEmpty` and `localePack.collection.empty`.
- Default loading uses decorative `ZSkeleton` groups and `localePack.collection.loading`.
- `empty` and `loadingContent` replace the complete state presentation without entering item counts.
- `loadingCount` is a positive integer and affects only visual skeleton quantity.

## Layout, RTL and long content

List item content uses `minmax(0, 1fr) auto`: content may wrap while a child-owned action remains at the
logical end. DescriptionList uses CSS `auto-fit` with a fixed structural minimum and falls back to a
single column in narrow containers. Setting `responsive=false` explicitly fixes one column.

Spacing and margins use logical properties. Terms, descriptions and List content use
`overflow-wrap:anywhere`, so resource identifiers and full URLs do not create document-level overflow.
Responsive columns never reorder DOM and therefore do not change reading order in RTL.

## Component boundaries

- A clickable row is composed from a real Link/Button inside the item; `li`, `dt` and `dd` do not become
  implicit controls.
- Selection and keyboard navigation belong to Listbox, Menu, Tree or Grid patterns, not ZList.
- Tabular relationships belong to `ZTable`/`ZDataTable`, not DescriptionList.
- Large semantic lists use `ZVirtualList role="list" itemRole="listitem"`; ZList does not duplicate
  windowing, measurement, anchoring or scroll controllers.
- Header/footer/pagination/loading requests remain application composition around the semantic root.

## Acceptance assets

Dedicated browser, SSR and type sources cover typed identity, native tags, rich actions, manual nesting,
empty/loading item counts, status relationships, responsive RTL wrapping, refs, invalid keys and the
items/children discriminant. Full execution remains a CI/CD responsibility; local validation is limited
to WebStorm error diagnostics, formatting and fast static audit.
