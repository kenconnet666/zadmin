import { Time } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZTimePicker from '../src/components/input/ZTimePicker.svelte';

describe('ZTimePicker SSR contract', () => {
	it('renders the field and one serialized form value without browser globals', () => {
		let lazyPresetCalls = 0;
		const body = render(ZTimePicker, {
			props: {
				'aria-label': 'Server time',
				defaultValue: new Time(9, 30, 15),
				granularity: 'second',
				hourCycle: 24,
				name: 'server-time',
				presets: [
					{
						label: 'Lazy server preset',
						value: () => {
							lazyPresetCalls += 1;
							return new Time(10, 45);
						}
					}
				],
				showNow: true,
				timeZone: 'Asia/Shanghai'
			}
		}).body;
		expect(body).toContain('aria-label="Server time"');
		expect(body).toContain('name="server-time"');
		expect(body).toContain('value="09:30:15"');
		expect(body.match(/name="server-time"/gu)).toHaveLength(1);
		expect(body).not.toContain('role="dialog"');
		expect(lazyPresetCalls).toBe(0);
	});
});
