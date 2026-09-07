import { Time } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZTimeValue from '../src/components/data-display/ZTimeValue.svelte';
import ZTimeGrid from '../src/components/input/ZTimeGrid.svelte';

const slots = [
	{ value: new Time(8) },
	{ label: 'Standup', value: new Time(9, 30) },
	{ disabled: true, value: new Time(10) }
] as const;

describe('ZTimeGrid and ZTimeValue SSR contracts', () => {
	it('renders a finite typed radiogroup and its single FormData bridge without browser globals', () => {
		const body = render(ZTimeGrid, {
			props: {
				'aria-label': 'Appointment time',
				name: 'appointment',
				slots,
				value: new Time(9, 30)
			}
		}).body;
		expect(body).toContain('role="radiogroup"');
		expect(body.match(/role="radio"/gu)).toHaveLength(3);
		expect(body.match(/tabindex="0"/gu)).toHaveLength(1);
		expect(body.match(/data-selected="true"/gu)).toHaveLength(1);
		expect(body).toContain('Standup');
		expect(body).toContain('name="appointment"');
		expect(body).toContain('value="09:30:00"');
	});

	it('omits the form bridge in none mode and rejects string model values', () => {
		const none = render(ZTimeGrid, {
			props: {
				formParticipation: 'none',
				name: 'ignored',
				slots,
				value: new Time(9, 30)
			}
		}).body;
		expect(none).not.toContain('name="ignored"');
		expect(none).not.toContain('data-zui-form-value');
		expect(
			() =>
				render(ZTimeGrid, {
					props: { slots, value: '09:30' as never }
				}).body
		).toThrow(/must be a Time/u);
	});

	it('renders localized Time text with full machine-readable precision', () => {
		const body = render(ZTimeValue, {
			props: {
				granularity: 'second',
				hourCycle: 24,
				locale: 'en-US',
				value: new Time(13, 5, 9, 125)
			}
		}).body;
		expect(body).toContain('<time');
		expect(body).toContain('datetime="13:05:09.125"');
		expect(body).toContain('data-granularity="second"');
		expect(body).toContain('>13:05:09</time>');
	});
});
