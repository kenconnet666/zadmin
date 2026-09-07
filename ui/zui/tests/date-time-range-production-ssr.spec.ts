import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DateTimeRangeSsrFixture from './DateTimeRangeSsrFixture.svelte';

describe('ZDateTimeRangePicker SSR contract', () => {
	it('renders two non-participating fields and only the present root business entry', () => {
		const body = render(DateTimeRangeSsrFixture).body;
		expect(body).toContain('aria-label="Server window"');
		expect(body).toContain('name="window.start"');
		expect(body).toContain('value="2026-09-07T09:30:00"');
		expect(body).not.toContain('name="window.end"');
		expect(body.match(/data-slot="(?:start|end)-field"/gu)).toHaveLength(2);
		expect(body).not.toContain('role="dialog"');
	});
});
