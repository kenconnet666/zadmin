import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormControllerSsrFixture from './FormControllerSsrFixture.svelte';

describe('ZFormController SSR contract', () => {
	it('does not execute subscribeField effects during SSR', () => {
		const result = render(FormControllerSsrFixture).body;
		expect(result).toContain('data-testid="form-controller-ssr"');
		expect(result).toContain('name="email"');
	});
});
