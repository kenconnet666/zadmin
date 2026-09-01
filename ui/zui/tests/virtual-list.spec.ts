import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import VirtualListFixture from './VirtualListFixture.svelte';

describe('ZVirtualList SSR', () => {
	it('uses the explicit estimated viewport without reading DOM measurements', () => {
		const result = render(VirtualListFixture).body;
		expect(result).toContain('role="listbox"');
		expect(result).toContain('aria-setsize="200"');
		expect(result).toContain('data-dynamic="true"');
		expect(result).toContain('data-range-start="0"');
		expect(result).toContain('data-range-end="6"');
		expect(result).toContain('data-measurement="estimated"');
		expect(result).not.toContain('data-measured="true"');
		expect(result).toContain('aria-busy="true"');
		expect(result).toContain('Loading deployment records');
	});
});
