import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import TreeProductionFixture from './TreeProductionFixture.svelte';

describe('LogicalTree SSR contracts', () => {
	it('renders hierarchy and normalized form values without dangling active descendants', () => {
		const body = render(TreeProductionFixture).body;
		expect(body).toContain('role="tree"');
		expect(body).toContain('aria-level="1"');
		expect(body).toContain('aria-setsize="1"');
		expect(body).not.toContain('aria-activedescendant=');
		expect(body.match(/name="single-node"/gu)).toHaveLength(1);
		expect(body).toContain('value="alpha"');
		expect(body).toContain('aria-haspopup="tree"');
	});
});
