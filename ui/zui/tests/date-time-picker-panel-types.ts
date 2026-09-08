import { CalendarDateTime, Time, toZoned } from '@internationalized/date';

import type {
	DateTimePickerPanelController,
	DateTimePickerPanelProps,
	DateTimePickerPreset
} from '../src/components/input/DateTimePickerPanel.svelte';

const props = {
	calendarLabel: 'Choose date and time',
	confirmLabel: 'Confirm',
	direction: 'auto',
	disabled: false,
	disambiguation: 'reject',
	granularity: 'second',
	hourCycle: 24,
	idBase: 'date-time-panel',
	invalidDateTimeLabel: 'Unavailable date and time',
	locale: 'en-US',
	minuteStep: 5,
	mode: 'local',
	nextLabel: 'Next month',
	noAvailableTimeLabel: 'No available time',
	nowLabel: 'Now',
	onConfirm: (value: CalendarDateTime | ReturnType<typeof toZoned>) => {
		void value;
		return undefined;
	},
	onControllerChange: (controller: DateTimePickerPanelController | null) => {
		void controller;
		return undefined;
	},
	onValueChange: (value: CalendarDateTime | ReturnType<typeof toZoned>) => {
		void value;
		return undefined;
	},
	placeholderValue: new CalendarDateTime(2026, 9, 7, 9),
	presets: [
		{ label: 'Local', value: new CalendarDateTime(2026, 9, 7, 9, 30) },
		{
			label: 'Zoned lazy',
			value: () => toZoned(new CalendarDateTime(2026, 9, 7, 9, 30), 'Asia/Shanghai')
		}
	] satisfies readonly DateTimePickerPreset[],
	previousLabel: 'Previous month',
	secondStep: 10,
	showNow: true,
	size: 'medium',
	timeZone: 'Asia/Shanghai',
	toggleDayPeriodLabel: 'Toggle day period',
	value: null
} satisfies DateTimePickerPanelProps;
const timeOnlyPreset = {
	label: 'Time only',
	value: () => new Time(9)
};
// @ts-expect-error DateTime presets cannot resolve to a Time-only value.
const invalidPreset: DateTimePickerPreset = timeOnlyPreset;

void [props, invalidPreset];
