import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import MiniCalendarProductionFixture from './MiniCalendarProductionFixture.svelte';

describe('ZMiniCalendar SSR contract', () => {
	it('renders the strip Calendar and its unique FormData owner without browser globals', () => {
		const body = render(MiniCalendarProductionFixture).body;
		expect(body.match(/data-view="strip"/gu)).toHaveLength(6);
		expect(body).toContain('data-testid="mini-calendar"');
		expect(body).toContain('data-visible-days="5"');
		expect(body.match(/name="delivery"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-09-15"');
		expect(body).not.toContain('name="disabled-date"');
		expect(body).not.toContain('name="ignored-date"');
		expect(body.match(/role="grid"/gu)).toHaveLength(6);
		expect(body).toContain('data-testid="mini-calendar-provider-size"');
		expect(body).toContain('data-testid="mini-calendar-field-size"');
		expect(body).toContain('aria-label="Delivery dates"');
		expect(body).toContain('aria-selected="true"');
	});
});
