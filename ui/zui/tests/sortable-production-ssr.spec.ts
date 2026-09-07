import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import SortableFormListFixture from './SortableFormListFixture.svelte';
import SortableProductionFixture from './SortableProductionFixture.svelte';

const renderSsr = render as unknown as (
	component: typeof SortableProductionFixture | typeof SortableFormListFixture
) => { body: string };

describe('ZSortable production SSR contracts', () => {
	it('renders stable native list semantics, typed zero identities and fallback actions while body is read', () => {
		const body = renderSsr(SortableProductionFixture).body;
		expect(body).toContain('data-testid="sortable-production"');
		expect(body).toMatch(/role="list"/u);
		expect(body.match(/data-slot="row"/gu)?.length).toBeGreaterThanOrEqual(9);
		expect(body).toContain('data-item-key="number:0"');
		expect(body).toContain('data-item-key="string:0"');
		expect(body).toContain('aria-label="Pointer sortable"');
		expect(body).toMatch(
			/aria-label="RTL sortable"[^>]*dir="rtl"|dir="rtl"[^>]*aria-label="RTL sortable"/u
		);
		expect(body).toContain('data-slot="handle"');
		expect(body).toContain('data-slot="move-previous"');
		expect(body).toContain('data-slot="move-next"');
		expect(body).toContain('data-state="idle"');
		expect(body).not.toMatch(/data-(?:slot|testid)="(?:sortable|row|handle)[^"]*"[^>]*\sstyle=/u);
	});

	it('renders the composed FormList owner, native fields and stable sortable rows without browser globals', () => {
		const body = renderSsr(SortableFormListFixture).body;
		expect(body).toContain('data-testid="sortable-form"');
		expect(body).toContain('data-testid="sortable-form-rows"');
		expect(body.match(/data-slot="row"/gu)).toHaveLength(3);
		expect(body.match(/type="text"/gu)).toHaveLength(3);
		expect(body).toContain('name="rows[0].name"');
		expect(body).toContain('name="rows[1].name"');
		expect(body).toContain('name="rows[2].name"');
	});
});
