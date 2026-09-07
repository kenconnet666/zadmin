import { CalendarDate } from '@internationalized/date';
import type { ComponentProps } from 'svelte';

import ZMiniCalendar, {
	type ZMiniCalendarProps
} from '../src/components/input/ZMiniCalendar.svelte';

declare const dateCell: NonNullable<ZMiniCalendarProps['dateCell']>;
declare const header: NonNullable<ZMiniCalendarProps['header']>;

const props = {
	dateCell,
	defaultFocusedValue: new CalendarDate(2026, 9, 15),
	header,
	onFocusedValueChange: (value: CalendarDate) => value.day,
	onValueChange: (value: CalendarDate | null) => value?.day,
	value: new CalendarDate(2026, 9, 15),
	visibleDays: 10
} satisfies ZMiniCalendarProps;
const componentProps = {
	value: null,
	visibleDays: 5
} satisfies ComponentProps<typeof ZMiniCalendar>;

const multipleCandidate = { value: [new CalendarDate(2026, 9, 15)] } as const;
// @ts-expect-error MiniCalendar is a single-date façade.
const multiple: ZMiniCalendarProps = multipleCandidate;

void [props, componentProps, multiple];
