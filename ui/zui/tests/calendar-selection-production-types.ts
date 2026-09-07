import { CalendarDate } from '@internationalized/date';

import type {
	CalendarCellContext,
	CalendarHeaderContext,
	ZCalendarProps
} from '../src/components/input/ZCalendar.svelte';
import type { ZDatePickerProps } from '../src/components/input/ZDatePicker.svelte';
import type { ZDateRangePickerProps } from '../src/components/input/ZDateRangePicker.svelte';

declare const dateCell: NonNullable<ZCalendarProps['dateCell']>;
declare const header: NonNullable<ZCalendarProps['header']>;

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
const customized = { dateCell, header, value: null } satisfies ZCalendarProps;
const customizedPicker = {
	calendarHeader: header,
	dateCell,
	value: new CalendarDate(2026, 9, 7)
} satisfies ZDatePickerProps;
const customizedRangePicker = {
	calendarHeader: header,
	dateCell,
	value: { start: new CalendarDate(2026, 9, 7), end: null }
} satisfies ZDateRangePickerProps;
const cellContext: CalendarCellContext = Object.freeze({
	date: new CalendarDate(2026, 9, 7),
	direction: 'ltr',
	disabled: false,
	focused: true,
	highlighted: false,
	outside: false,
	preview: false,
	previewInvalid: false,
	readonly: false,
	selected: true,
	size: 'medium',
	today: false,
	unavailable: false
});
const headerContext: CalendarHeaderContext = Object.freeze({
	direction: 'ltr',
	goToNextPage() {},
	goToPreviousPage() {},
	label: 'September 2026',
	nextDisabled: false,
	previousDisabled: false,
	size: 'medium',
	visibleMonths: Object.freeze([new CalendarDate(2026, 9, 1)])
});
// @ts-expect-error Calendar snippet contexts are readonly snapshots.
cellContext.selected = false;
// @ts-expect-error Multiple values require the multiple discriminator.
const missingMultipleMode = { value: [new CalendarDate(2026, 9, 7)] } satisfies ZCalendarProps;
const missingRangeEndCandidate = {
	selectionMode: 'range',
	value: { start: new CalendarDate(2026, 9, 7) }
} as const;
// @ts-expect-error Range mode values require both nullable endpoint keys.
const missingRangeEnd: ZCalendarProps = missingRangeEndCandidate;
const rangeInSingleCandidate = {
	selectionMode: 'single',
	value: { start: new CalendarDate(2026, 9, 7), end: null }
} as const;
// @ts-expect-error Single mode cannot receive a range value.
const rangeInSingle: ZCalendarProps = rangeInSingleCandidate;

void [
	single,
	multiple,
	range,
	highlighted,
	customized,
	customizedPicker,
	customizedRangePicker,
	cellContext,
	headerContext,
	missingMultipleMode,
	missingRangeEnd,
	rangeInSingle
];
