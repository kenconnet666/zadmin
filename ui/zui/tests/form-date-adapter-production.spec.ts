import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormDateAdapterFixture from './FormDateAdapterFixture.svelte';
import FormDateAdapterInvalidFixture from './FormDateAdapterInvalidFixture.svelte';

describe('date Form model adapter server contract', () => {
	it.each([
		['calendar', /ZCalendar model value must be a Gregorian CalendarDate, null or undefined/u],
		['date-field', /ZDateField model value must be a Gregorian CalendarDate, null or undefined/u],
		['time-field', /ZTimeField model value must be a Time, null or undefined/u],
		['picker', /ZDatePicker model value must be a Gregorian CalendarDate, null or undefined/u],
		[
			'range',
			/ZDateRangePicker start model value must be a Gregorian CalendarDate, null or undefined/u
		],
		['range-shape', /CalendarDate range with nullable start and end/u],
		['string', /ZDateField model value must be a Gregorian CalendarDate, null or undefined/u]
	] as const)('rejects an invalid %s model value during SSR', (kind, message) => {
		expect(() => render(FormDateAdapterInvalidFixture, { props: { kind } }).body).toThrow(message);
	});

	it('rejects controlled value and model ownership while preserving one compound owner', () => {
		expect(
			() => render(FormDateAdapterInvalidFixture, { props: { kind: 'conflict' } }).body
		).toThrow(/ZDatePicker cannot combine a controlled value with ZForm model ownership/u);
	});

	it('serializes each root owner once during SSR, including a partial range', () => {
		const body = render(FormDateAdapterFixture).body;
		for (const [name, value] of [
			['calendar', '2026-09-10'],
			['dateField', '2026-09-11'],
			['timeField', '09:30:45.125'],
			['picker', '2026-09-13'],
			['range.start', '2026-09-14'],
			['readonlyDate', '2026-09-15'],
			['disabledDate', '2026-09-12']
		] as const) {
			expect(body.match(new RegExp(`name="${name}"`, 'gu'))).toHaveLength(1);
			expect(body).toContain(`value="${value}"`);
		}
		expect(body).not.toContain('name="range.end"');
		expect(body).not.toContain('name="addedDate"');
		expect(body).not.toContain('name="addedTime"');
		expect(body).not.toContain('name="addedRange.start"');
	});
});
