import { CalendarDateTime } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DateTimePickerPanel from '../src/components/input/DateTimePickerPanel.svelte';

describe('DateTimePickerPanel SSR contract', () => {
	it('renders Calendar and time columns without form ownership or eager preset evaluation', () => {
		let lazyCalls = 0;
		const value = new CalendarDateTime(2026, 9, 7, 9, 30, 15, 125);
		const body = render(DateTimePickerPanel, {
			props: {
				calendarLabel: 'Choose date and time',
				confirmLabel: 'Confirm',
				direction: 'ltr',
				disabled: false,
				disambiguation: 'compatible',
				granularity: 'second',
				hourCycle: 24,
				idBase: 'ssr-date-time',
				invalidDateTimeLabel: 'Unavailable date and time',
				locale: 'en-US',
				minuteStep: 1,
				mode: 'local',
				nextLabel: 'Next month',
				noAvailableTimeLabel: 'No available time',
				nowLabel: 'Now',
				onConfirm: () => undefined,
				onControllerChange: () => undefined,
				onValueChange: () => undefined,
				placeholderValue: value,
				presets: [
					{
						label: 'Lazy preset',
						value: () => {
							lazyCalls += 1;
							return new CalendarDateTime(2026, 9, 8, 10);
						}
					}
				],
				previousLabel: 'Previous month',
				secondStep: 1,
				showNow: true,
				size: 'medium',
				timeZone: 'UTC',
				toggleDayPeriodLabel: 'Toggle day period',
				value
			}
		}).body;
		expect(body).toContain('data-slot="date-time-panel"');
		expect(body).toContain('role="grid"');
		expect(body).toContain('role="listbox"');
		expect(body).not.toContain('data-zui-form-value');
		expect(lazyCalls).toBe(0);
	});
});
