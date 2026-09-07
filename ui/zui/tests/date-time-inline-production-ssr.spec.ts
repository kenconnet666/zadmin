import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Fixture from './DateTimeInlineProductionFixture.svelte';

describe('inline date-time SSR ownership', () => {
	it('renders the calendar and time panel directly with one canonical form entry', () => {
		const body = render(Fixture).body;
		expect(body).toContain('data-slot="inline-panel"');
		expect(body).toContain('role="grid"');
		expect(body).toContain('role="listbox"');
		expect(body).not.toContain('role="dialog"');
		expect(body).not.toContain('data-slot="trigger"');
		expect(body.match(/name="appointment"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-09-07T09:30:00"');
		expect(body).toContain('data-state="inline"');
	});
	it('renders both initial endpoints before hydration and serializes each once', () => {
		const body = render(Fixture, { props: { variant: 'range' } }).body;
		expect(body.match(/name="window.start"/gu)).toHaveLength(1);
		expect(body.match(/name="window.end"/gu)).toHaveLength(1);
		expect(body).toContain('value="2026-09-07T09:30:00"');
		expect(body).toContain('value="2026-09-07T18:30:00"');
		expect(body).toContain('data-slot="range-parts"');
		expect(body).not.toContain('role="dialog"');
	});
});
