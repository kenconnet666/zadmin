import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DateTimeFieldFixture from './DateTimeFieldFixture.svelte';

describe('ZDateTimeField SSR contract', () => {
	it('renders one form owner for each discriminated value and stable display-zone text', () => {
		const body = render(DateTimeFieldFixture).body;
		expect(body.match(/name="local"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-09-07T09:30:00"');
		expect(body.match(/name="zoned"/gu)).toHaveLength(1);
		expect(body).toContain('[America/Los_Angeles]');
		expect(body).toContain('data-mode="local"');
		expect(body).toContain('data-mode="zoned"');
		expect(body).toMatch(/E(?:D|S)T/u);
	});
});
