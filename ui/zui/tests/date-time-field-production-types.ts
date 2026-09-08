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
const auxiliary = { formParticipation: 'none', value: null } satisfies ZDateTimeFieldProps;
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
	value: new CalendarDateTime(2026, 9, 7, 9, 30)
	// @ts-expect-error Zoned mode requires ZonedDateTime.
} satisfies ZDateTimeFieldProps;
const mismatchedCallback = {
	mode: 'local',
	onValueChange: (value: ReturnType<typeof parseZonedDateTime> | null) => value?.timeZone
	// @ts-expect-error Local callbacks cannot receive ZonedDateTime.
} satisfies ZDateTimeFieldProps;
const localWithZonedValue = {
	mode: 'local',
	value: parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')
} as const;
// @ts-expect-error The concrete local generic branch cannot accept a ZonedDateTime value.
const exactLocalWithZonedValue: ZDateTimeFieldProps<'local'> = localWithZonedValue;
const exactZoned = {
	mode: 'zoned',
	value: parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')
} satisfies ZDateTimeFieldProps<'zoned'>;

void [
	local,
	defaultLocal,
	explicitDirection,
	automaticDirection,
	auxiliary,
	zoned,
	dateOnly,
	zonedWithLocal,
	mismatchedCallback,
	exactLocalWithZonedValue,
	exactZoned
];
