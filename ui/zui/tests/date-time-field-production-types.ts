import { CalendarDate, CalendarDateTime, parseZonedDateTime } from '@internationalized/date';

import type { ZDateTimeFieldProps } from '../src/components/input/ZDateTimeField.svelte';

const local = {
	mode: 'local',
	value: new CalendarDateTime(2026, 9, 7, 9, 30),
	onValueChange: (value: CalendarDateTime | null) => value?.hour
} satisfies ZDateTimeFieldProps;
const defaultLocal = { value: null } satisfies ZDateTimeFieldProps;
const explicitDirection = { dir: 'rtl', value: null } satisfies ZDateTimeFieldProps;
const automaticDirection = { dir: 'auto', value: null } satisfies ZDateTimeFieldProps;
const zoned = {
	mode: 'zoned',
	value: parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]'),
	onValueChange: (value: ReturnType<typeof parseZonedDateTime> | null) => value?.timeZone
} satisfies ZDateTimeFieldProps;
const dateOnly = {
	mode: 'local',
	// @ts-expect-error Local mode requires CalendarDateTime, not a date-only CalendarDate.
	value: new CalendarDate(2026, 9, 7)
} satisfies ZDateTimeFieldProps;
const zonedWithLocal = {
	mode: 'zoned',
	// @ts-expect-error Zoned mode requires ZonedDateTime.
	value: new CalendarDateTime(2026, 9, 7, 9, 30)
} satisfies ZDateTimeFieldProps;
const mismatchedCallback = {
	mode: 'local',
	// @ts-expect-error Local callbacks cannot receive ZonedDateTime.
	onValueChange: (value: ReturnType<typeof parseZonedDateTime> | null) => value?.timeZone
} satisfies ZDateTimeFieldProps;

void [
	local,
	defaultLocal,
	explicitDirection,
	automaticDirection,
	zoned,
	dateOnly,
	zonedWithLocal,
	mismatchedCallback
];
