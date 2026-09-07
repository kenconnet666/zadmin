import { CalendarDateTime, createCalendar, toCalendar } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDateTimePicker from '../src/components/input/ZDateTimePicker.svelte';
import ZDateTimeRangePicker from '../src/components/input/ZDateTimeRangePicker.svelte';

describe('international DateTime owner SSR', () => {
	it('renders non-Gregorian single and mixed-calendar range owners without normalization', () => {
		const base = new CalendarDateTime(2026, 9, 7, 9, 30);
		const hebrew = toCalendar(base, createCalendar('hebrew'));
		const persian = toCalendar(base.add({ hours: 8 }), createCalendar('persian'));
		const single = render(ZDateTimePicker, {
			props: { presentation: 'inline', value: hebrew }
		}).body;
		const range = render(ZDateTimeRangePicker, {
			props: { presentation: 'inline', value: { start: hebrew, end: persian } }
		}).body;

		expect(single).toContain('data-mode="local"');
		expect(single).toContain('data-presentation="inline"');
		expect(range).toContain('data-range-state="complete"');
		expect(range).toContain('data-presentation="inline"');
	});
});
