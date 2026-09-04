import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FieldSizeFixture from './FieldSizeFixture.svelte';

describe('ZProvider, ZField, ZInput and ZTextarea production size contract', () => {
	it('resolves explicit control, Field and Provider density in priority order', async () => {
		// @zui-visual ZProvider density propagation geometry
		// @zui-visual ZField size spacing geometry
		render(FieldSizeFixture);
		await tick();
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
		const providerField = document.querySelector<HTMLElement>(
			'[data-testid="field-owner-provider"]'
		)!;
		const largeField = document.querySelector<HTMLElement>('[data-testid="field-owner-large"]')!;
		expect(getComputedStyle(providerField).display).toBe('grid');
		expect(getComputedStyle(providerField).gap).toBe('4px');
		expect(getComputedStyle(largeField).gap).toBe('8px');
		expect(providerField.querySelector('label')!.getBoundingClientRect().width).toBeGreaterThan(0);
	});
});
