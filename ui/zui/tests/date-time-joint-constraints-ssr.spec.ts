import { CalendarDateTime } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DateTimePickerPanel from '../src/components/input/DateTimePickerPanel.svelte';

describe('date-time joint panel SSR', () => {
	it('renders a readonly boundary-day panel as navigable listboxes without evaluating presets', () => {
		let lazyCalls = 0;
		const placeholderValue = new CalendarDateTime(2026, 9, 7, 9);
		const body = render(DateTimePickerPanel, {
			props: {
				calendarLabel: 'Boundary date and time',
				confirmLabel: 'Confirm',
				direction: 'ltr',
				disabled: false,
				disambiguation: 'compatible',
				granularity: 'hour',
				hourCycle: 24,
				idBase: 'joint-ssr',
				invalidDateTimeLabel: 'Unavailable date and time',
				locale: 'en-US',
				maxValue: new CalendarDateTime(2026, 9, 7, 10, 45, 15, 250),
				minValue: new CalendarDateTime(2026, 9, 7, 10, 30, 15, 125),
				minuteStep: 1,
				mode: 'local',
				nextLabel: 'Next month',
				noAvailableTimeLabel: 'No available time',
				nowLabel: 'Now',
				onConfirm: () => undefined,
				onControllerChange: () => undefined,
				onValueChange: () => undefined,
				placeholderValue,
				presets: [
					{
						label: 'Lazy',
						value: () => {
							lazyCalls += 1;
							return new CalendarDateTime(2026, 9, 7, 10, 30, 15, 125);
						}
					}
				],
				previousLabel: 'Previous month',
				readonly: true,
				secondStep: 1,
				size: 'medium',
				timeZone: 'America/New_York',
				toggleDayPeriodLabel: 'Toggle day period',
				value: null
			}
		}).body;

		expect(body).toContain('data-readonly="true"');
		expect(body).toContain('role="listbox"');
		expect(body).toContain('aria-readonly="true"');
		expect(body).not.toContain('No available time');
		expect(lazyCalls).toBe(0);
	});
});
