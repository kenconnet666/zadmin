import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import DataTableProductionFixture from './DataTableProductionFixture.svelte';

describe('ZDataTable production SSR contracts', () => {
	it('renders a bounded typed-key virtual window without DOM globals', () => {
		const body = render(DataTableProductionFixture).body;
		expect(body).toContain('data-testid="data-table-virtual"');
		expect(body).toContain('data-virtualized="true"');
		expect(body).toContain('data-range-start="0"');
		expect(body).toContain('data-range-end="7"');
		expect(body).toContain('aria-rowcount="301"');
		expect(body).toContain('Virtual 0');
		expect(body).not.toContain('Virtual 299');
	});
});
