import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FieldSizeFixture from './FieldSizeFixture.svelte';

describe('Field control size inheritance', () => {
	it('resolves explicit control, Field and Provider density in priority order', () => {
		render(FieldSizeFixture);
		expect(
			document.querySelector('[data-testid="field-size-provider"]')?.getAttribute('data-size')
		).toBe('small');
		expect(
			document.querySelector('[data-testid="field-size-explicit"]')?.getAttribute('data-size')
		).toBe('small');
		for (const id of ['textarea', 'switch', 'checkbox', 'slider']) {
			expect(
				document.querySelector(`[data-testid="field-size-${id}"]`)?.getAttribute('data-size')
			).toBe('large');
		}
	});
});
