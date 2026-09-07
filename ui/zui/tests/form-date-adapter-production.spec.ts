import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormDateAdapterFixture from './FormDateAdapterFixture.svelte';
import FormDateAdapterInvalidFixture from './FormDateAdapterInvalidFixture.svelte';

function renderedForm(body: string, testId: string): string {
	const start = body.indexOf(`data-testid="${testId}"`);
	if (start < 0) throw new Error(`Missing SSR form ${testId}.`);
	const end = body.indexOf('</form>', start);
	if (end < 0) throw new Error(`Missing SSR form end for ${testId}.`);
	return body.slice(start, end);
}

describe('date Form model adapter server contract', () => {
	it.each([
		['calendar', /ZCalendar model value must be a CalendarDate, null or undefined/u],
		['date-field', /ZDateField model value must be a CalendarDate, null or undefined/u],
		['time-field', /ZTimeField model value must be a Time, null or undefined/u],
		['picker', /ZDatePicker model value must be a CalendarDate, null or undefined/u],
		['range', /ZDateRangePicker start model value must be a CalendarDate, null or undefined/u],
		['range-shape', /CalendarDate range with nullable start and end/u],
		['string', /ZDateField model value must be a CalendarDate, null or undefined/u]
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
		const modelForm = renderedForm(body, 'date-model-form');
		for (const [name, value] of [
			['calendar', '2026-09-10'],
			['dateField', '2026-09-11'],
			['timeField', '09:30:45.125'],
			['picker', '2026-09-13'],
			['range.start', '2026-09-14'],
			['readonlyDate', '2026-09-15'],
			['disabledDate', '2026-09-12']
		] as const) {
			expect(modelForm.match(new RegExp(`name="${name}"`, 'gu'))).toHaveLength(1);
			expect(modelForm).toContain(`value="${value}"`);
		}
		expect(modelForm).not.toContain('name="range.end"');
		const missingForm = renderedForm(body, 'date-missing-form');
		expect(missingForm).not.toContain('name="addedDate"');
		expect(missingForm).not.toContain('name="addedTime"');
		expect(missingForm).not.toContain('name="addedRange.start"');
	});
});
