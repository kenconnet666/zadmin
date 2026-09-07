import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import CalendarSelectionSsrFixture from './CalendarSelectionSsrFixture.svelte';
import CalendarSelectionProductionFixture from './CalendarSelectionProductionFixture.svelte';

describe('ZCalendar selection SSR contract', () => {
	it('renders multiple month grids, repeated multiple FormData and locale week numbers', () => {
		const body = render(CalendarSelectionSsrFixture).body;
		expect(body.match(/data-slot="grid"/gu)).toHaveLength(2);
		expect(body.match(/name="days"/gu)).toHaveLength(2);
		expect(body).toContain('value="2026-09-10"');
		expect(body).toContain('value="2026-09-05"');
		expect(body).toContain('data-visible-months="2"');
		expect(body).toContain('Week');
	});

	it('serializes only the present range endpoint', () => {
		const body = render(CalendarSelectionSsrFixture, { props: { kind: 'range' } }).body;
		expect(body).toContain('name="window.start"');
		expect(body).not.toContain('name="window.end"');
	});

	it('renders the maximum Gregorian month once without overflowing week-year calculation', () => {
		const body = render(CalendarSelectionProductionFixture).body;
		expect(body).toContain('data-testid="calendar-maximum"');
		expect(body).toContain('data-visible-months="1"');
		expect(body.match(/December 31, 9999/gu)).toHaveLength(1);
	});
});
