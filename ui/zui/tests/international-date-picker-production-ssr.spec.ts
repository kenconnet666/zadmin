import { CalendarDate, createCalendar } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';

describe('date picker international calendar SSR owners', () => {
	it('renders Japanese era fields and Hebrew range ISO entries without changing model calendars', () => {
		const japanese = render(ZDatePicker, {
			props: {
				locale: 'ja-JP-u-ca-japanese',
				name: 'release',
				value: new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7)
			}
		}).body;
		expect(japanese).toContain('<select');
		expect(japanese).toContain('name="release"');
		expect(japanese).toContain('value="2026-09-07"');

		const range = render(ZDateRangePicker, {
			props: {
				locale: 'en-US-u-ca-hebrew',
				name: 'billing',
				value: {
					start: new CalendarDate(createCalendar('hebrew'), 5784, 6, 15),
					end: new CalendarDate(createCalendar('hebrew'), 5784, 7, 15)
				}
			}
		}).body;
		expect(range).toContain('name="billing.start"');
		expect(range).toContain('name="billing.end"');
		expect(range.match(/data-calendar="hebrew"/gu)).toHaveLength(2);
	});
});
