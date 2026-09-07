import { Time } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZTimeRangePicker from '../src/components/input/ZTimeRangePicker.svelte';

describe('ZTimeRangePicker SSR contract', () => {
	it('renders partial business entries and both fields without browser globals or a dialog', () => {
		const body = render(ZTimeRangePicker, {
			props: {
				allowEmpty: true,
				'aria-label': 'Server window',
				defaultValue: { start: new Time(9, 30), end: null },
				hourCycle: 24,
				name: 'window'
			}
		}).body;
		expect(body).toContain('aria-label="Server window"');
		expect(body).toContain('name="window.start"');
		expect(body).toContain('value="09:30:00"');
		expect(body).not.toContain('name="window.end"');
		expect(body.match(/data-slot="(?:start|end)-field"/gu)).toHaveLength(2);
		expect(body).not.toContain('role="dialog"');
	});
});
