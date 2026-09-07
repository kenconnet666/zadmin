import { CalendarDate, CalendarDateTime, parseZonedDateTime } from '@internationalized/date';

import type { ZDateTimePickerProps } from '../src/components/input/ZDateTimePicker.svelte';

const local = {
	commitMode: 'confirm',
	onCommit: (value: CalendarDateTime | null) => value?.hour,
	presets: [{ label: 'Lunch', value: new CalendarDateTime(2026, 9, 7, 12) }],
	value: new CalendarDateTime(2026, 9, 7, 9, 30)
} satisfies ZDateTimePickerProps;
const zoned = {
	commitMode: 'immediate',
	mode: 'zoned',
	onCommit: (value: ReturnType<typeof parseZonedDateTime> | null) => value?.timeZone,
	presets: [
		{
			label: 'Office',
			value: parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]')
		}
	],
	value: null
} satisfies ZDateTimePickerProps;
const wrongDate = {
	mode: 'local',
	// @ts-expect-error Date-only values cannot enter a DateTimePicker.
	value: new CalendarDate(2026, 9, 7)
} satisfies ZDateTimePickerProps;
const wrongPreset = {
	mode: 'zoned',
	presets: [
		{
			label: 'Local value',
			value: new CalendarDateTime(2026, 9, 7, 9, 30)
		}
	]
	// @ts-expect-error Zoned mode presets must produce ZonedDateTime.
} satisfies ZDateTimePickerProps;
const wrongCommitMode = {
	// @ts-expect-error Commit mode is a closed interaction union.
	commitMode: 'blur'
} satisfies ZDateTimePickerProps;

void [local, zoned, wrongDate, wrongPreset, wrongCommitMode];
