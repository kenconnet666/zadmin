import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FoundationPrimitivesSsrFixture from './FoundationPrimitivesSsrFixture.svelte';

describe('small foundation primitives SSR contract', () => {
	it('renders native semantics and deterministic layout attributes without browser globals', () => {
		const result = render(FoundationPrimitivesSsrFixture).body;
		expect(result).toContain('<hr');
		expect(result).toContain('aria-label="Server boundary"');
		expect(result).toContain('role="presentation"');
		expect(result).toContain('role="status"');
		expect(result.match(/<kbd/gu)).toHaveLength(3);
		expect(result).toContain('--zui-aspect-ratio:4 / 3');
		expect(result).toContain('aria-label="Empty ratio"');
		expect(result).toContain('data-size="full"');
		expect(result).toContain('data-gutter="none"');
	});
});
