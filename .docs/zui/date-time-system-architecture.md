# ZUI Date and Time System

## Scope and model

This stage productionizes `ZCalendar`, `ZDateField`, `ZTimeField`, `ZDatePicker`, and
`ZDateRangePicker`. Values remain the immutable `CalendarDate` and `Time` types from
`@internationalized/date`; date-only and wall-clock values are not converted through the host
`Date` constructor. `null` is the explicit controlled empty value. `undefined` only means that a
Svelte binding was not supplied and may therefore select `defaultValue` during initialization.

`CalendarRangeValue` intentionally permits start-only and end-only field drafts. When both endpoints
exist, `normalizeRangeValue` guarantees chronological order. FormData contains only existing
endpoints as `name.start` and `name.end`.

## Benchmark decisions

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
- Picker roots own `value`, `open`, FormData, reset, Field projection, and focus restoration.
- Nested `ZDateField` and `ZCalendar` use `formParticipation="none"`; they never create duplicate
  hidden inputs or reset listeners.
- `ZPopover` resolves portal, motion, observers, dismissal, and focus from the actual trigger realm.
  Picker microtasks resolve from the root owner Window.
- `ZCalendar` owns `focusedValue` separately from selection. Moving focus does not select, and
  externally changing selection does not create a user callback.

## Keyboard and range contracts

- Date/time segments: logical Left/Right plus Home/End navigation, Up/Down cycle, Enter commit, and
  Escape draft rollback. The DOM order is produced by `Intl.DateTimeFormat.formatToParts`, including
  day-period placement.
- Calendar: RTL-aware horizontal arrows, vertical week movement, Home/End week boundaries,
  PageUp/PageDown month movement, Shift+Page year movement, and Enter/Space selection. Navigation
  skips unavailable dates along the requested direction and stops at min/max.
- Range Picker publishes a start-only value after the first Calendar choice and a normalized complete
  value after the second. Focused dates preview the prospective range without becoming a second value
  owner.

## Deliberate deferrals

The public contract does not promise multi-month grids, month/quarter/year panels, presets, drag range
selection, recurring rules, non-Gregorian editing, date-time or time-range pickers, DST fold/gap
resolution, or mobile modal variants. These need separate interaction and value-model design; they are
not hidden behind incomplete props. Calendar systems other than Gregorian may format through Intl but
are not yet editable value calendars.
