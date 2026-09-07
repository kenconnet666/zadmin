import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import CalendarContentFixture from './CalendarContentFixture.svelte';

describe('Calendar typed content snippets SSR', () => {
	it('keeps native grid/button and FormData ownership around custom date and period content', () => {
		const body = render(CalendarContentFixture).body;
		expect(body).toContain('data-custom-calendar-label');
		expect(body).toContain('data-custom-period-label');
		expect(body.match(/data-slot="header-label"/gu)).toHaveLength(2);
		expect(body).toContain('data-custom-date="2026-09-15"');
		expect(body).toContain('data-custom-period="2026-05"');
		expect(body.match(/role="grid"/gu)).toHaveLength(2);
		expect(body).toContain('role="gridcell"');
		expect(body.match(/name="date"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-09-15"');
		expect(body.match(/name="period"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-05"');
		expect(body).toContain('data-context-frozen="true"');
	});
});
