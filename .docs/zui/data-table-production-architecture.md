# ZDataTable production architecture

## Outcome

`ZTable` remains the small native-table visual shell. `ZDataTable` is the production admin-table
surface that composes existing ZUI state primitives rather than introducing a second grid engine:

- `LogicalCollection<TRowKey, TRow>` owns typed business identity and duplicate/invalid key checks;
- `SelectionModel` owns single/multiple row-selection policy while `ControllableState` keeps the
  `selectedKeys / defaultSelectedKeys / onSelectionChange` contract;
- `KeyedVirtualizer` owns SSR-bounded row rendering, dynamic row/detail measurement, scroll anchors,
  and imperative scroll/focus handshakes;
- `ZTable`, native `button`, `checkbox`, `radio`, `table`, `th`, and `td` retain browser semantics.

The component is still experimental until real Chrome and CI behavior/SSR checks pass. API surface
completion alone is not a stable graduation.

## Mature-library decisions

| Concern        | Adopted                                                                                                                                   | Deliberately not copied                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sorting        | Ant/MUI-style three-state header cycle and explicit `sortingMode="server"`; stable local sort                                             | Multi-sort DSL, filter operator registry, hidden request layer                                                         |
| Remote data    | TanStack-style manual owner: caller owns filter/page/query/cache/URL; `rowIndexOffset` and `totalRowCount` preserve global ARIA positions | Fetching, retries, cache invalidation, page-reset policy inside the table                                              |
| Selection      | Naive/Ant-style per-row disabled selection and select-current-snapshot; typed keys preserve off-page selections                           | Implicit index keys or pruning unknown server-page keys                                                                |
| Expanded rows  | Controlled/default/onChange keys, row eligibility, typed detail snippet, accessible button relationship                                   | Tree/group row model and recursive aggregation                                                                         |
| Columns        | Sparse visibility model, controlled widths, pointer and keyboard separator, logical `start/end` sticky, min/max width, ellipsis           | Column reorder, group headers, column virtualizer, pinned-row engine                                                   |
| Virtualization | TanStack separation of row model and virtualizer; typed measurements survive reorder/prepend; SSR estimate                                | Claiming virtualization replaces server pagination, or mixing an unbounded column virtualizer into native table layout |
| Status         | Component renders `aria-busy`, loading, error and empty surfaces while retaining stale rows                                               | Owning request lifecycle or manufacturing placeholder business rows                                                    |

References used for the decision:

- Ant Design Table: <https://ant.design/components/table/>
- MUI Table: <https://mui.com/material-ui/react-table/>
- MUI X Data Grid: <https://mui.com/x/react-data-grid/>
- TanStack Table overview: <https://tanstack.com/table/latest/docs/overview>
- TanStack client/server ownership: <https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side>
- TanStack virtualization guide: <https://tanstack.com/table/latest/docs/framework/react/guide/virtualization>
- Naive UI selection example: <https://github.com/tusen-ai/naive-ui/blob/main/src/data-table/demos/enUS/select.demo.vue>

## State ownership

| State             | Uncontrolled seed         | Controlled value   | User notification          |
| ----------------- | ------------------------- | ------------------ | -------------------------- |
| Sort              | `defaultSort`             | `sort`             | `onSortChange`             |
| Row selection     | `defaultSelectedKeys`     | `selectedKeys`     | `onSelectionChange`        |
| Expanded rows     | `defaultExpandedKeys`     | `expandedKeys`     | `onExpandedChange`         |
| Column visibility | `defaultColumnVisibility` | `columnVisibility` | `onColumnVisibilityChange` |
| Column widths     | `defaultColumnWidths`     | `columnWidths`     | `onColumnWidthsChange`     |

`undefined` is a real cleared sort after the first concrete value or user write. This is why the sort
state opts into `ControllableState.undefinedIsValue`; otherwise a cleared controlled sort would
silently reactivate `defaultSort`.

## Accessibility and focus boundary

- Caption is required and remains in the accessibility tree.
- Sort state is exposed on `th[aria-sort]`; only a named button mutates it.
- Selection stays native checkbox/radio. Expanded rows use named buttons with `aria-expanded` and
  `aria-controls`.
- Column resize handles are focusable separators with `aria-valuemin/max/now`, arrows, Home and End.
- Server snapshots use `rowIndexOffset` and `totalRowCount` to express global positions.
- The table does not declare `role="grid"` and does not steal cell arrow keys. Tab order remains native.
  A product requiring cell roving focus, editing, clipboard, pivot, or selection rectangles needs the
  independent DataGrid/X track.
- When a focused row disappears, the controller targets the nearest surviving typed key. Virtual
  scroll mounts that key before attempting to restore its row control focus.

## Validation boundary

Local acceptance is intentionally limited to WebStorm error inspections, deterministic source/API
generators, Prettier, and diff checks. Dedicated unit/browser specifications encode sort clearing,
server ownership, typed-key identity, selection/expansion, visibility/resize/sticky, dynamic
virtualization, focus restoration, status semantics, and owner-realm observers for CI. Real Chrome
and complete Vitest/Playwright/build validation remain CI or parent-session acceptance work.
