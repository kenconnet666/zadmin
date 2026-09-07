import { CalendarDateTime, parseZonedDateTime } from '@internationalized/date';

import type { ZDateTimeRangePickerProps } from '../src/components/input/ZDateTimeRangePicker.svelte';
import type {
	DateTimeRangePreset,
	LocalDateTimeRangeValue,
	ZonedDateTimeRangeValue
} from '../src/runtime/date-time-range.js';

const localRange = {
	start: new CalendarDateTime(2026, 9, 7, 9),
	end: new CalendarDateTime(2026, 9, 7, 17)
} satisfies LocalDateTimeRangeValue;
const zonedRange = {
	start: parseZonedDateTime('2026-09-07T09:00-04:00[America/New_York]'),
	end: parseZonedDateTime('2026-09-07T17:00-04:00[America/New_York]')
} satisfies ZonedDateTimeRangeValue;
const localPreset = {
	label: 'Workday',
	value: () => localRange
} satisfies DateTimeRangePreset<'local'>;
const local = {
	dir: 'auto',
	mode: 'local',
	onCommit: (value: LocalDateTimeRangeValue | null) => value?.end?.hour,
	order: 'swap',
	presets: [localPreset],
	value: localRange
} satisfies ZDateTimeRangePickerProps;
const zoned = {
	mode: 'zoned',
	onValueChange: (value: ZonedDateTimeRangeValue | null) => value?.start?.timeZone,
	value: zonedRange
} satisfies ZDateTimeRangePickerProps;
// @ts-expect-error Local mode endpoints must be CalendarDateTime.
const localWithZoned = { mode: 'local', value: zonedRange } satisfies ZDateTimeRangePickerProps;
// @ts-expect-error Zoned mode endpoints must be ZonedDateTime.
const zonedWithLocal = { mode: 'zoned', value: localRange } satisfies ZDateTimeRangePickerProps;
// @ts-expect-error Both nullable endpoint keys are required.
const missingEnd = { value: { start: localRange.start } } satisfies ZDateTimeRangePickerProps;
// @ts-expect-error Order is a closed, explicit policy.
const preserve = { order: 'preserve' } satisfies ZDateTimeRangePickerProps;

void [local, zoned, localWithZoned, zonedWithLocal, missingEnd, preserve];
