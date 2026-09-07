import { CalendarDateTime, parseZonedDateTime } from '@internationalized/date';

import type {
	ZDateTimeRangePickerLocalProps,
	ZDateTimeRangePickerZonedProps
} from '../src/components/input/ZDateTimeRangePicker.svelte';
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
} satisfies ZDateTimeRangePickerLocalProps;
const zoned = {
	mode: 'zoned',
	onValueChange: (value: ZonedDateTimeRangeValue | null) => value?.start?.timeZone,
	value: zonedRange
} satisfies ZDateTimeRangePickerZonedProps;
const invalidLocal = { mode: 'local', value: zonedRange } as const;
// @ts-expect-error Local mode endpoints must be CalendarDateTime.
const localWithZoned: ZDateTimeRangePickerLocalProps = invalidLocal;
const invalidZoned = { mode: 'zoned', value: localRange } as const;
// @ts-expect-error Zoned mode endpoints must be ZonedDateTime.
const zonedWithLocal: ZDateTimeRangePickerZonedProps = invalidZoned;
// @ts-expect-error Both nullable endpoint keys are required.
const missingEnd = { value: { start: localRange.start } } satisfies ZDateTimeRangePickerLocalProps;
// @ts-expect-error Order is a closed, explicit policy.
const preserve = { order: 'preserve' } satisfies ZDateTimeRangePickerLocalProps;

void [local, zoned, localWithZoned, zonedWithLocal, missingEnd, preserve];
