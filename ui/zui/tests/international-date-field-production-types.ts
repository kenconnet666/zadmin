import {
	CalendarDate,
	CalendarDateTime,
	createCalendar,
	type Calendar,
	type ZonedDateTime
} from '@internationalized/date';

import type { DateSegment, ZDateFieldProps } from '../src/components/input/ZDateField.svelte';
import {
	preserveCalendarOwner,
	toDisplayCalendar,
	type CalendarValue,
	type SupportedDisplayCalendarIdentifier
} from '../src/runtime/date.js';

const japanese = new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7);
const props = {
	locale: 'ja-JP-u-ca-japanese',
	placeholderValue: japanese,
	segmentLabel: (segment: DateSegment) => segment,
	value: japanese
} satisfies ZDateFieldProps;
const era: DateSegment = 'era';
const calendar: SupportedDisplayCalendarIdentifier = 'hebrew';
const value: CalendarValue = japanese;
const displayCalendar: Calendar = createCalendar('persian');
const local = new CalendarDateTime(2026, 9, 7, 10, 30);
declare const zoned: ZonedDateTime;
const displayedDate: CalendarDate = toDisplayCalendar(japanese, displayCalendar);
const displayedLocal: CalendarDateTime = toDisplayCalendar(local, displayCalendar);
const displayedZoned: ZonedDateTime = toDisplayCalendar(zoned, displayCalendar);
const ownedDate: CalendarDate = preserveCalendarOwner(displayedDate, japanese);
const ownedLocal: CalendarDateTime = preserveCalendarOwner(displayedLocal, local);
const ownedZoned: ZonedDateTime = preserveCalendarOwner(displayedZoned, zoned);

function conversionDropsCallerExtensions(tagged: CalendarDate & { readonly tag: 'caller' }): void {
	const converted = toDisplayCalendar(tagged, displayCalendar);
	const owned = preserveCalendarOwner(tagged, japanese);
	// @ts-expect-error Calendar conversion creates a built-in value and does not retain caller tags.
	converted.tag;
	// @ts-expect-error Owner restoration also creates a built-in value and does not retain caller tags.
	owned.tag;
}

// @ts-expect-error Unknown calendar identifiers are not part of the implemented display boundary.
const unsupported: SupportedDisplayCalendarIdentifier = 'chinese';

void [
	props,
	era,
	calendar,
	value,
	displayedDate,
	displayedLocal,
	displayedZoned,
	ownedDate,
	ownedLocal,
	ownedZoned,
	conversionDropsCallerExtensions,
	unsupported
];
