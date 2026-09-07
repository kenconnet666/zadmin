import { CalendarDateTime, createCalendar } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDateTimeField from '../src/components/input/ZDateTimeField.svelte';

describe('Persian DateTimeField locale numeral SSR contract', () => {
	it('renders Persian date and time digits with one ISO owner value', () => {
		const body = render(ZDateTimeField, {
			props: {
				granularity: 'second',
				hourCycle: 24,
				locale: 'fa-IR-u-ca-persian',
				name: 'meeting',
				value: new CalendarDateTime(createCalendar('persian'), 'AP', 1403, 1, 1, 13, 5, 9, 125)
			}
		}).body;
		expect(body).toContain('value="۱۴۰۳"');
		expect(body).toContain('value="۱۳"');
		expect(body).toContain('value="۰۵"');
		expect(body).toContain('value="۰۹"');
		expect(body).toContain('name="meeting"');
		expect(body).toContain('value="2024-03-20T13:05:09.125"');
	});
});
