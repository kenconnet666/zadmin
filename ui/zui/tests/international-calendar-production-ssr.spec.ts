import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import InternationalCalendarFixture from './InternationalCalendarFixture.svelte';

describe('ZCalendar international calendar SSR', () => {
	it('renders display calendars while retaining each model owner and strip contract', () => {
		const body = render(InternationalCalendarFixture).body;
		expect(body.match(/data-calendar="hebrew"/gu).length).toBeGreaterThan(1);
		expect(body).toContain('data-calendar="japanese"');
		expect(body.match(/data-calendar="persian"/gu).length).toBeGreaterThan(1);
		expect(body).toContain('data-context-month="13"');
		expect(body).toContain('data-context-era="heisei"');
		expect(body.match(/data-view="strip"/gu)).toHaveLength(2);
		expect(body.match(/data-visible-days="7"/gu)).toHaveLength(2);
		expect(body.match(/name="gregorian"/gu)).toHaveLength(1);
		expect(body.match(/name="hebrew"/gu)).toHaveLength(1);
		expect(body.match(/name="japanese"/gu)).toHaveLength(1);
		expect(body.match(/name="strip"/gu)).toHaveLength(1);
		expect(body.match(/name="mini"/gu)).toHaveLength(1);
		expect(body).toContain('gregory:AD:2024-4-8|0');
		expect(body).toContain('hebrew:AM:5784-13-29|0');
		expect(body).toContain('japanese:heisei:31-4-30|0');
	});
});
