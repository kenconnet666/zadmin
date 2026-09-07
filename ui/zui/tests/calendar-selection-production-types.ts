import { CalendarDate } from '@internationalized/date';

import type { ZCalendarProps } from '../src/components/input/ZCalendar.svelte';

const single = { dir: 'auto', value: new CalendarDate(2026, 9, 7) } satisfies ZCalendarProps;
const multiple = {
	selectionMode: 'multiple',
	value: [new CalendarDate(2026, 9, 7)],
	onValueChange: (value: readonly CalendarDate[]) => value.length,
	visibleMonths: 3
} satisfies ZCalendarProps;
const range = {
	selectionMode: 'range',
	value: { start: new CalendarDate(2026, 9, 7), end: null },
	onValueChange: (value: { start: CalendarDate | null; end: CalendarDate | null } | null) =>
		value?.start
} satisfies ZCalendarProps;
const highlighted = {
	highlightRange: { start: new CalendarDate(2026, 9, 7), end: new CalendarDate(2026, 9, 9) },
	value: null
} satisfies ZCalendarProps;
// @ts-expect-error Multiple values require the multiple discriminator.
const missingMultipleMode = { value: [new CalendarDate(2026, 9, 7)] } satisfies ZCalendarProps;
// @ts-expect-error Range mode values require both nullable endpoint keys.
const missingRangeEnd = {
	selectionMode: 'range',
	value: { start: new CalendarDate(2026, 9, 7) }
} satisfies ZCalendarProps;
// @ts-expect-error Single mode cannot receive a range value.
const rangeInSingle = {
	selectionMode: 'single',
	value: { start: new CalendarDate(2026, 9, 7), end: null }
} satisfies ZCalendarProps;

void [single, multiple, range, highlighted, missingMultipleMode, missingRangeEnd, rangeInSingle];
