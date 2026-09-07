import { CalendarDate, createCalendar } from '@internationalized/date';

import type { DateSegment, ZDateFieldProps } from '../src/components/input/ZDateField.svelte';
import type { CalendarValue, SupportedDisplayCalendarIdentifier } from '../src/runtime/date.js';

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

// @ts-expect-error Unknown calendar identifiers are not part of the implemented display boundary.
const unsupported: SupportedDisplayCalendarIdentifier = 'chinese';

void [props, era, calendar, value, unsupported];
