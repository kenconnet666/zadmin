import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import TagTableSsrFixture from './TagTableSsrFixture.svelte';

describe('ZTag and ZTable production SSR contracts', () => {
	it('renders localized native Tag and Table semantics without browser globals', () => {
		const result = render(TagTableSsrFixture).body;
		expect(result).toMatch(/data-testid="ssr-tag"[^>]*data-size="medium"/u);
		expect(result).toContain('aria-label="移除标签 生产"');
		expect(result).toContain('data-testid="ssr-tag-static"');
		expect(result).toMatch(/<div(?=[^>]*data-slot="wrapper")(?=[^>]*data-scroll="auto")[^>]*>/u);
		expect(result).not.toMatch(/data-slot="wrapper"[^>]*tabindex/u);
		expect(result).toMatch(
			/<table(?=[^>]*data-native="true")(?=[^>]*data-testid="ssr-table")[^>]*>/u
		);
		expect(result).toContain('<caption');
		expect(result).toContain('<thead');
		expect(result).toContain('<tbody');
		expect(result).toContain('scope="col"');
		expect(result).toContain('scope="row"');
		expect(result).toContain('Hidden SSR caption');
	});
});
