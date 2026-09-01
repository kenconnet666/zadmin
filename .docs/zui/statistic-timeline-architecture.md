# ZUI Statistic and Timeline Production Architecture

Status: implemented P1 production increment, 2026-09-02.

## Scope

This increment closes two non-interactive data-display boundaries:

- `ZStatistic` presents one static numeric fact with a name, machine value, locale formatting, optional
  affixes, trend and loading placeholder.
- `ZTimeline` presents chronological business events as a real ordered list with stable typed identity,
  time, status, optional custom regions and a bounded unfinished tail.

Neither component owns data fetching. Statistic does not own elapsed time or number tweening. Timeline
does not own selection, focus movement, step activation, routing or process navigation.

## Mature-library comparison and choices

- [Ant Design Statistic](https://ant.design/components/statistic/) provides `precision`, `formatter`,
  `prefix`, `suffix` and `loading`. ZUI adopts those responsibilities but makes `Intl.NumberFormat` and
  locale explicit, accepts `bigint`, constrains tone, and keeps a machine-readable `data` value. Ant's
  legacy Countdown is deprecated and Timer is a separate API; ZUI likewise does not add Countdown or
  NumberAnimation to Statistic.
- [Ant Design Timeline](https://ant.design/components/timeline/) uses items, content/icon, loading,
  reverse and start/alternate/end layouts. Ant v6 deprecates the root pending shortcut in favor of an
  item loading flag. ZUI retains one bounded `pending` tail because it is a useful loading composition,
  but does not add arbitrary per-item loading owners, horizontal mode, title span arithmetic, styles maps
  or placement overrides.
- [MUI Timeline](https://mui.com/material-ui/react-timeline/) separates content, marker, connector and
  opposite content and demonstrates alternate placement. ZUI adopts the visual separation while keeping
  one component and three snippets instead of publishing a large compound component family. MUI Timeline
  remains a Lab component; ZUI therefore avoids treating its surface as a compatibility target.
- [Naive UI Timeline source](https://github.com/tusen-ai/naive-ui/tree/main/src/timeline) informed the
  Vue/Svelte render-slot comparison, while its [RTL tracking issue](https://github.com/tusen-ai/naive-ui/issues/97)
  is useful evidence that RTL needs explicit component coverage. ZUI keeps Svelte snippets, logical
  properties and typed identities rather than copying Vue render functions, theme override objects or
  position-specific CSS APIs.

## Statistic contract

### Static value and formatting

`value` is `number | bigint`. Number values must be finite; formatted strings are rejected because they
would erase the raw machine value and locale ownership. The DOM is a real `dl` with `dt`, `dd` and
`data[value]`.

Resolution is deterministic:

1. `locale` prop, otherwise the current `ZProvider` locale.
2. Caller `formatOptions`.
3. When present, integer `precision` from 0 through 100 overrides both minimum and maximum fraction
   digits.
4. A caller `formatter(value, context)` may produce the final string from the frozen resolved context;
   otherwise `Intl.NumberFormat` formats the value.

Applications performing SSR must give the server and browser the same explicit or provider locale. ZUI
does not inspect browser language during rendering.

### Affixes, tone and trend

`prefix` and `suffix` are bounded snippets around the formatted value. They are appropriate for a Lucide
icon, currency mark or unit, but they do not replace the required label.

`tone` is independent of trend and limited to `default | muted | primary | success | danger`. `trend` is
a finite percentage number: `12.4` means positive 12.4 percent and is formatted from `trend / 100` with
an explicit sign. A custom `trendLabel` can localize business wording. Direction is always retained in
text, so color is only redundant emphasis.

### Loading and lifecycle

`loading` sets `aria-busy` on the stable `dl` and substitutes a `ZSkeleton` for the value row. It hides
stale affixes/value/trend and does not create a live region. The request owner decides when to replace
loading, whether and how often to announce changes, and whether previous data should remain elsewhere.
There is no timer, interval, animation frame or effect owner in Statistic.

## Timeline contract

### Native semantics and typed identity

The root is always a named `ol`; every event and the optional pending record is a direct `li`. Marker and
connector nodes are decorative. Default timestamps use a real `time[datetime]`.

New items use `key: SelectionKey`; deprecated `id` remains an exclusive pre-1.0 migration alias. Number
`1` and string `"1"` are distinct. Duplicate same-type keys, non-finite numbers, negative zero, missing
identity and simultaneous key/id fail before an item row is emitted. `data-key-type` preserves test and
debug evidence without changing Map identity.

### Content regions and state

The stable `li` exposes bounded regions:

- `content(item, originalIndex)` replaces the default title/description body.
- `icon(item, originalIndex)` replaces the decorative status dot.
- `time(item, originalIndex)` replaces the default time region.
- deprecated `item(item)` is a migration alias for content and cannot be combined with `content`.

Status is `done | current | pending | error`; absence stays neutral instead of being mislabeled pending,
and an explicit finite `tone` may override the status visual mapping. Current events use
`aria-current="true"`. No event becomes focusable or clickable by default.
Business actions remain real ZButton/ZLink controls inside content.

### Pending and reverse

`pending` creates exactly one unfinished tail and marks the ordered list busy. Its marker uses a
decorative `ZSpinner` unless `pendingIcon` is supplied. A visible pending snippet is required, so loading
is never represented by an icon alone.

Pending is the logical chronological tail. Normal order appends it. `reverse` reverses completed/current
events and moves the pending tail to the visual beginning. Snippets still receive the original source
index, avoiding index changes when the display order changes.

### Alternate, responsive layout and RTL

`mode="start"` is the default two-column axis/body grid. `mode="alternate"` uses content-before, axis,
content-after logical columns and alternates by visual row. CSS grid line numbering and logical text
alignment mirror the placement under RTL. At a 30rem viewport the alternate layout collapses to the
same single-axis form without changing DOM or reading order. `minmax(0, 1fr)` and `min-width: 0` allow
long CJK content to wrap within the owner.

`end`, per-item placement, horizontal layout, fixed title spans and arbitrary colors are deliberately
omitted. Those increase collision with long/localized content and duplicate Steps-style layout without a
proven ZUI requirement.

## Separation from Steps and animated metrics

- Timeline is historical/read-only. A wizard, active process navigator or keyboard-selectable workflow
  belongs to a future Steps component built on collection navigation.
- Statistic is a render of current state. Count-up/down and animated transitions need clock ownership,
  reduced-motion handling, visibility pausing, cleanup and SSR fallback; they belong to separate
  components or application composition.
- Neither component adds a service API, portal, field bridge or global configuration surface.

## Acceptance assets and integration

Dedicated browser, SSR and type sources cover Intl locale/precision, bigint/formatter, raw values,
loading, trends, real ordered-list semantics, typed key identity, legacy id migration, custom snippets,
status/tone, pending/reverse, alternate RTL, long content and invalid input failures.

The component entrypoint must export the newly public Statistic formatter/value/tone types and Timeline
mode/tone types. The root integration pass owns that shared edit plus regeneration of component API facts
and production audit output. Until regeneration, documentation teaching supplements only names already
present in the checked-in generated facts; all new names remain fully described in component metadata.

Local validation for this batch is intentionally limited to Prettier, WebStorm `errorsOnly`, diff
whitespace checks and fast static audits. Browser/SSR specs are source evidence for CI/CD and are not run
locally.
