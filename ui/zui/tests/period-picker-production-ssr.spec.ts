import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import PeriodPickerProductionFixture from './PeriodPickerProductionFixture.svelte';
import ZPeriodPicker from '../src/components/input/ZPeriodPicker.svelte';
import { quarterPeriod, weekPeriod } from '../src/runtime/period.js';

function renderedForm(body: string, testId: string): string {
	const start = body.indexOf(`data-testid="${testId}"`);
	if (start < 0) throw new Error(`Missing SSR form ${testId}.`);
	const end = body.indexOf('</form>', start);
	if (end < 0) throw new Error(`Missing SSR form end for ${testId}.`);
	return body.slice(start, end);
}

describe('ZPeriodPicker SSR contract', () => {
	it('rejects conflicting period rules before a popup is mounted', () => {
		expect(() =>
			render(ZPeriodPicker, {
				props: {
					granularity: 'quarter',
					value: quarterPeriod(2026, 1, 4),
					fiscalYearStartMonth: 1
				}
			})
		).toThrow(/fiscalYearStartMonth/u);
		expect(() =>
			render(ZPeriodPicker, {
				props: {
					granularity: 'week',
					defaultValue: weekPeriod(2026, 1),
					weekRules: { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }
				}
			})
		).toThrow(/weekRules/u);
	});
	it('serializes each single, repeated multiple and range owner once while keeping panels closed', () => {
		const body = render(PeriodPickerProductionFixture).body;
		const form = renderedForm(body, 'period-picker-form');
		expect(form.match(/name="month"/gu)).toHaveLength(1);
		expect(form).toContain('value="2026-05"');
		expect(form).toContain('id="period-single-trigger"');
		expect(form.match(/name="quarters"/gu)).toHaveLength(2);
		expect(form).toContain('value="2026-Q1@fs=04"');
		expect(form).toContain('value="2026-Q3@fs=04"');
		expect(form).not.toContain('name="weeks.start"');
		expect(form).not.toContain('name="weeks.end"');
		expect(form).not.toContain('data-slot="content"');
		const required = renderedForm(body, 'period-picker-required-form');
		expect(required.match(/name="period"/gu)).toHaveLength(1);
		expect(required).toContain('value="2026"');
	});

	it('renders the five resolved sizes and keeps readonly trigger focusable', () => {
		const body = render(PeriodPickerProductionFixture).body;
		for (const size of ['xsmall', 'small', 'medium', 'large', 'xlarge'])
			expect(body).toContain(`data-testid="period-picker-size-${size}"`);
		const readonlyStart = body.indexOf('data-testid="period-picker-readonly"');
		const readonlyEnd = body.indexOf('</div>', readonlyStart);
		const readonly = body.slice(readonlyStart, readonlyEnd);
		expect(readonly).toContain('aria-disabled="true"');
		expect(readonly).not.toMatch(/\sdisabled(?:=|\s|>)/u);
	});

	it('serializes a self-describing weekly range through one Picker root', () => {
		const body = render(ZPeriodPicker, {
			props: {
				granularity: 'week',
				name: 'audit',
				selectionMode: 'range',
				value: {
					end: weekPeriod(2026, 12, {
						firstDayOfWeek: 'sun',
						minimalDaysInFirstWeek: 1
					}),
					start: weekPeriod(2026, 10, {
						firstDayOfWeek: 'sun',
						minimalDaysInFirstWeek: 1
					})
				},
				weekRules: { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }
			}
		}).body;
		expect(body.match(/name="audit.start"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-W10@fd=sun,md=1"');
		expect(body.match(/name="audit.end"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-W12@fd=sun,md=1"');
	});
});
