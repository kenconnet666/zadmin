import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ResultEmptySsrFixture from './ResultEmptySsrFixture.svelte';

describe('ZResult and ZEmpty production SSR contract', () => {
	it('renders stable labelled sections, true heading levels and decorative icons', () => {
		const result = render(ResultEmptySsrFixture).body;
		expect(result).toMatch(
			/<section(?=[^>]*data-testid="ssr-result")(?=[^>]*aria-labelledby="[^"]+")/u
		);
		expect(result).toContain('<h1');
		expect(result).toContain('<h6');
		expect(result).toContain('<h3');
		expect(result).toContain('<h5');
		expect(result).toContain('data-slot="description"');
		expect(result).toContain('data-slot="content"');
		expect(result.match(/data-slot="icon"/gu)).toHaveLength(2);
		expect(result).not.toContain('role="alert"');
		expect(result).not.toContain('role="status"');
		expect(result).not.toContain('aria-busy');
	});
});
