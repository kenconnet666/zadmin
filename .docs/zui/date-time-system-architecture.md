# ZUI Date and Time System

## Scope and model

The system includes `ZCalendar`, `ZDateField`, `ZTimeField`, `ZDatePicker`,
`ZDateRangePicker`, and the experimental `ZTimePicker`, `ZTimeRangePicker`, `ZDateTimeField`, `ZDateTimePicker`, `ZDateTimeRangePicker`, `ZPeriodCalendar`, and `ZPeriodPicker`. Date/time values remain the immutable `CalendarDate`, `Time`, `CalendarDateTime`, and `ZonedDateTime` types from
`@internationalized/date`; date-only and wall-clock values are not converted through the host
`Date` constructor. `null` is the explicit controlled empty value. `undefined` only means that a
Svelte binding was not supplied and may therefore select `defaultValue` during initialization.

In model mode, a missing field (`undefined`) projects to an empty value without using the component's
defaultValue. FormModel copies and freezes the supported immutable date values and compares their
declared fields, so equivalent new CalendarDate/Time instances share value semantics. Arbitrary
class instances and native Date objects retain identity semantics. Composite children explicitly opt
out of model participation; an absent scope argument and an explicit opt-out are distinct.

`CalendarRangeValue` intentionally permits start-only and end-only field drafts. When both endpoints
exist, `normalizeRangeValue` guarantees chronological order. FormData contains only existing
endpoints as `name.start` and `name.end`.

`ZCalendar` now discriminates `single`, `multiple`, and `range` values. Multiple arrays are frozen,
deduplicated without changing input/append order, and serialize as repeated names. Range partials
remain representable; `allowEmpty` controls intrinsic validity, while `allowNonContiguousRange`
controls whether a complete range may cross a business-unavailable day. The former visual-only
`range` prop is now `highlightRange`; it projects `data-highlighted` without changing
`aria-selected`/`data-selected` and does not become a second selection owner. Date and DateTime range
panels share this path; DateTime drafts first project their active endpoint through the display time
zone to a CalendarDate.

Month, year, quarter, and week selection use frozen plain Period records rather than encoding a
period as an arbitrary day. `WeekPeriod` stores its first-day/minimal-days rules and `QuarterPeriod`
stores the fiscal-year start. `ZPeriodCalendar` and `ZPeriodPicker` share one period runtime and one
selection/FormData protocol across the four granularities.

## Benchmark decisions

E12 adds a shared TimePickerPanel below the single and range pickers. DateTimeField composes the existing
date/time fields rather than nesting two pickers. Its local/zoned discriminated API keeps the display
time zone separate from the zoned value's original owner zone; only Gregorian editing is supported.
Time ranges never reorder endpoints implicitly: ordered requires end >= start, overnight explicitly
permits crossing midnight. Partial endpoints remain representable, with allowEmpty controlling validity.

E13 composes `DateTimePickerPanel` from the existing Calendar and TimePickerPanel, keeping field,
panel draft, canonical value, open request, FormData and commit events separately owned. E14 extends
the same date foundation rather than adding parallel engines: Calendar multi-month views share one
focusedValue/selection owner, and locale/ISO week numbers call the Period runtime. Multiple visible
grids are projections; adjacent outside dates and representational clamp duplicates never gain a
second interactive node.

E15 adds `popover` and `inline` presentations to the same DateTimePicker and DateTimeRangePicker
roots. Inline rendering removes the Portal, popup trigger and popup-only props; it does not introduce
a second value, field, panel draft, FormData bridge or commit protocol. Calendar and PeriodCalendar
cell/header snippets replace content inside owned controls or request navigation through a read-only
context. DateTime pickers forward these snippets to the shared Calendar rather than copying its grid.
TimeGrid and TimeValue candidates continue the same boundary: TimeGrid selects typed `Time` slots
through shared collection/form primitives, while TimeValue reuses ZText and owns formatting only.

Raw drafts participate in FormControlState through FormControlDraftState even when no valid canonical
value has changed. Form validation blocks stale-value submission, excludes disabled native controls,
and returns no successful data for invalid/outdated results. Child fields opt out of model/FormData
ownership while forwarding intrinsic draft feedback and sharing rollback behavior.

- React Aria supplies the primary accessibility decomposition: editable segments, a separately named
  calendar trigger, one grid roving-focus owner, `focusedValue`, locale-derived field order, and
  independent disabled/read-only semantics.
- MUI X reinforces shared validation across fields and calendar views, explicit timezone rendering,
  controlled/uncontrolled lifecycles, and role-aware range validation. ZUI keeps one
  `isDateUnavailable` callback instead of copying every month/year view callback because this stage
  has only a day grid.
- Ant Design and Naive UI informed close-on-select, range draft, clear, first-day, outside-date, and
  endpoint-specific constraint ergonomics. ZUI keeps immutable typed values instead of timestamp or
  date-library adapter unions.

Primary references:

- <https://react-aria.adobe.com/DateField>
- <https://react-aria.adobe.com/Calendar>
- <https://react-aria.adobe.com/DatePicker>
- <https://mui.com/x/react-date-pickers/validation/>
- <https://mui.com/x/react-date-pickers/timezone/>
- <https://ant.design/components/date-picker/>
- <https://github.com/tusen-ai/naive-ui/tree/main/src/date-picker>

## Ownership graph

- Standalone fields and Calendar own one `ControllableState` and one `FormValueBridge`.
- Calendar selection mode changes the typed value and serialization, not the number of state owners;
  `visibleMonths` changes only the number of projected grids.
- PeriodCalendar owns one period selection; PeriodPicker owns one open request and optional draft
  while reusing PeriodCalendar with form participation disabled.
- Picker roots own `value`, `open`, FormData, reset, Field projection, and focus restoration.
- Inline picker roots own the same value and draft protocol without an open-state owner; presentation
  changes containment only. Confirm keeps the inline surface mounted and Cancel restores the draft.
- Nested `ZDateField` and `ZCalendar` use `formParticipation="none"`; they never create duplicate
  hidden inputs or reset listeners.
- `ZPopover` resolves portal, motion, observers, dismissal, and focus from the actual trigger realm.
  Picker microtasks resolve from the root owner Window.
- `ZCalendar` owns `focusedValue` separately from selection. Moving focus does not select, and
  externally changing selection does not create a user callback.

## Keyboard and range contracts

TimePicker reuses TimeField, InputGroup, Popover, Button, ScrollArea and the collection navigation
primitives. Its finite columns hold a panel draft; Space/click updates the draft, Enter/Confirm commits,
and Escape discards it. Existing hidden time units survive edits at coarser granularity. Empty pickers
may search a legal reference under precise constraints. Date/time inputs inherit InputGroup name,
label, state and size, and the enclosing group owns disabled opacity once.

DateTime joint constraints disable only calendar days proven outside date-level min/max bounds. A
boundary day remains reachable when its carried time is unavailable; the time panel then validates
complete candidates, including hidden minute/second and min/max millisecond precision. DST gaps use
the declared disambiguation policy and keep a repairable date draft, while an unchanged resolved fold
preserves its original instant, owner time zone and offset. Read-only inline calendars and time columns
remain focusable and navigable but do not select, run presets/Now, or confirm a new value.

- Date/time segments: logical Left/Right plus Home/End navigation, Up/Down cycle, Enter commit, and
  Escape draft rollback. The DOM order is produced by `Intl.DateTimeFormat.formatToParts`, including
  day-period placement.
- Calendar: RTL-aware horizontal arrows, vertical week movement, Home/End week boundaries,
  PageUp/PageDown month movement, Shift+Page year movement, and Enter/Space selection. Navigation
  skips unavailable dates along the requested direction and stops at min/max. Arrows cross visible
  month grids through one roving map; header navigation pages by `visibleMonths`. A focused date
  already inside the second or later visible month does not force that month to the first position.
- Range Picker publishes a start-only value after the first Calendar choice and a normalized complete
  value after the second. Focused dates preview the prospective range without becoming a second value
  owner.

## Deliberate deferrals

The current public source includes multi-month Calendar grids, month/year/quarter/week period panels,
time/date-time range pickers, presets, and explicit DST fold/gap handling. These remain experimental
or otherwise subject to their declared metadata and current remote evidence; inclusion here does not
promote them to stable.

Still deferred are drag range selection, recurring rules, MiniCalendar, complete non-Gregorian
editing, mobile modal variants, and the full assistive-technology/forced-colors matrix. Cell/header
customization and inline DateTime source contracts are now present, but their current candidate still
requires remote and assistive-technology acceptance. Calendar systems other than Gregorian may format
through Intl, and era/calendar identity is preserved at representational boundaries, but editable
non-Gregorian value calendars are not yet claimed.
