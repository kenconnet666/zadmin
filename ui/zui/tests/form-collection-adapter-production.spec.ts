import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormCollectionAdapterFixture from './FormCollectionAdapterFixture.svelte';

describe('collection Form adapters server contract', () => {
	it('renders one group owner per model field and repeated hidden FormData entries', () => {
		const body = render(FormCollectionAdapterFixture).body;
		expect(body).toContain('data-testid="collection-tags"');
		expect(body).toContain('data-testid="collection-select-trigger"');
		expect(body).toContain('data-testid="collection-multi-trigger"');
		expect(body.match(/name="tags"/gu)).toHaveLength(2);
		expect(body.match(/name="target"/gu)).toHaveLength(2);
		expect(body.match(/name="scopes"/gu)).toHaveLength(2);
		expect(body).toContain('value="alpha"');
		expect(body).toContain('value="b"');
		expect(body).toContain('value="read"');
	});
});
