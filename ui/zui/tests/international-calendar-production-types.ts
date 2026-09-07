import { CalendarDate, createCalendar } from '@internationalized/date';

import type { ZCalendarProps } from '../src/components/input/ZCalendar.svelte';
import type { ZMiniCalendarProps } from '../src/components/input/ZMiniCalendar.svelte';

const hebrew = new CalendarDate(createCalendar('hebrew'), 5784, 13, 29);
const japanese = new CalendarDate(createCalendar('japanese'), 'heisei', 31, 4, 30);
const persianStrip = {
	defaultFocusedValue: new CalendarDate(2026, 3, 21),
	locale: 'fa-IR-u-ca-persian',
	selectionMode: 'single',
	value: new CalendarDate(2026, 3, 21),
	view: 'strip',
	visibleDays: 7
} satisfies ZCalendarProps<'single', 'strip'>;
const hebrewCalendar = {
	locale: 'he-IL-u-ca-hebrew',
	value: hebrew
} satisfies ZCalendarProps<'single', 'month'>;
const japaneseMini = {
	locale: 'ja-JP-u-ca-japanese',
	value: japanese,
	visibleDays: 7
} satisfies ZMiniCalendarProps;
const invalidValueCandidate = { value: '2026-03-21' } as const;
// @ts-expect-error Calendar model values remain typed CalendarDate objects.
const invalidValue: ZMiniCalendarProps = invalidValueCandidate;

void [persianStrip, hebrewCalendar, japaneseMini, invalidValue];
