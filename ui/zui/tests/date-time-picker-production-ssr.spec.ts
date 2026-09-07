import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DateTimePickerProductionFixture from './DateTimePickerProductionFixture.svelte';

function renderedForm(body: string, testId: string): string {
	const start = body.indexOf(`data-testid="${testId}"`);
	if (start < 0) throw new Error(`Missing SSR form ${testId}.`);
	const end = body.indexOf('</form>', start);
	if (end < 0) throw new Error(`Missing SSR form end for ${testId}.`);
	return body.slice(start, end);
}

describe('ZDateTimePicker SSR contract', () => {
	it('renders one field chrome and one FormData owner per local or zoned picker', () => {
		const body = render(DateTimePickerProductionFixture).body;
		const form = renderedForm(body, 'date-time-picker-form');
		expect(form.match(/data-slot="input-group"/gu)).toHaveLength(2);
		expect(form.match(/name="appointment"/gu)).toHaveLength(1);
		expect(form).toContain('value="2026-09-07T09:30:00"');
		expect(form.match(/name="zonedAppointment"/gu)).toHaveLength(1);
		expect(form).toContain('[America/Los_Angeles]');
		expect(form).not.toContain('data-slot="date-time-panel"');
	});
});
