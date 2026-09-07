import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZPeriodCalendar from '../src/components/input/ZPeriodCalendar.svelte';
import { monthPeriod, weekPeriod, yearPeriod } from '../src/runtime/period.js';

const renderSsr = render as unknown as (
	component: unknown,
	options: { props: unknown }
) => { body: string };

describe('ZPeriodCalendar SSR contract', () => {
	it('renders finite period grids and the discriminated form entry shapes without browser globals', () => {
		const single = renderSsr(ZPeriodCalendar, {
			props: {
				'aria-label': 'Billing month',
				granularity: 'month',
				name: 'month',
				value: monthPeriod(2026, 5)
			}
		}).body;
		expect(single).toContain('role="grid"');
		expect(single.match(/data-slot="cell"/gu)).toHaveLength(12);
		expect(single.match(/tabindex="0"/gu)).toHaveLength(1);
		expect(single).toContain('name="month"');
		expect(single).toContain('value="2026-05"');

		const range = renderSsr(ZPeriodCalendar, {
			props: {
				granularity: 'year',
				name: 'years',
				selectionMode: 'range',
				value: { end: yearPeriod(2027), start: yearPeriod(2025) }
			}
		}).body;
		expect(range).toContain('name="years.start"');
		expect(range).toContain('value="2025"');
		expect(range).toContain('name="years.end"');
		expect(range).toContain('value="2027"');

		const weekNone = renderSsr(ZPeriodCalendar, {
			props: {
				formParticipation: 'none',
				granularity: 'week',
				name: 'ignored',
				selectionMode: 'multiple',
				showWeekNumbers: true,
				value: [weekPeriod(2026, 10)]
			}
		}).body;
		expect(weekNone).toContain('data-slot="week-range"');
		expect(weekNone).not.toContain('name="ignored"');
		expect(weekNone).not.toContain('data-zui-form-value');
	});

	it('rejects explicit week rules that conflict with the self-describing business value', () => {
		expect(
			() =>
				renderSsr(ZPeriodCalendar, {
					props: {
						granularity: 'week',
						value: weekPeriod(2026, 10, {
							firstDayOfWeek: 'sun',
							minimalDaysInFirstWeek: 1
						}),
						weekRules: { firstDayOfWeek: 'mon', minimalDaysInFirstWeek: 4 }
					}
				}).body
		).toThrow(/conflicts with explicit weekRules/u);
	});

	it('inherits empty-selection week rules from minValue before the locale fallback', () => {
		const body = renderSsr(ZPeriodCalendar, {
			props: {
				granularity: 'week',
				locale: 'en-US',
				minValue: weekPeriod(2026, 10, {
					firstDayOfWeek: 'mon',
					minimalDaysInFirstWeek: 4
				})
			}
		}).body;
		expect(body).toContain('data-granularity="week"');
		expect(body.match(/data-slot="cell"/gu)).toHaveLength(12);
	});
});
