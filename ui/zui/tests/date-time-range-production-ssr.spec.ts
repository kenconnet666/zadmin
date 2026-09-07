import { CalendarDateTime } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDateTimeRangePicker from '../src/components/input/ZDateTimeRangePicker.svelte';

describe('ZDateTimeRangePicker SSR contract', () => {
	it('renders two non-participating fields and only the present root business entry', () => {
		const body = render(ZDateTimeRangePicker, {
			props: {
				allowEmpty: true,
				'aria-label': 'Server window',
				defaultValue: { start: new CalendarDateTime(2026, 9, 7, 9, 30), end: null },
				name: 'window'
			}
		}).body;
		expect(body).toContain('aria-label="Server window"');
		expect(body).toContain('name="window.start"');
		expect(body).toContain('value="2026-09-07T09:30:00"');
		expect(body).not.toContain('name="window.end"');
		expect(body.match(/data-slot="(?:start|end)-field"/gu)).toHaveLength(2);
		expect(body).not.toContain('role="dialog"');
	});
});
