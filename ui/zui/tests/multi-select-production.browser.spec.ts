import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import MultiSelectCollectionFixture from './MultiSelectCollectionFixture.svelte';

describe('ZMultiSelect production contract', () => {
	it('preserves typed values and orphan labels through filtering, clear/reset, readonly and virtual navigation', async () => {
		render(MultiSelectCollectionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="multi-collection-form"]')!;
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-collection-trigger"]'
		)!;
		expect(new FormData(form).getAll('choice')).toEqual(['1', '1', 'orphan']);
		document.querySelector<HTMLButtonElement>('[data-testid="multi-empty-options"]')?.click();
		expect(trigger.textContent).toContain('Number one');
		expect(new FormData(form).getAll('choice')).toEqual(['1', '1', 'orphan']);
		form.reset();
		await expect.poll(() => new FormData(form).getAll('choice')).toEqual(['1', '1', 'orphan']);
		document.querySelector<HTMLButtonElement>('[data-testid="multi-virtual-trigger"]')?.click();
		await tick();
		const listbox = document.querySelector<HTMLElement>(
			'[data-testid="multi-virtual-content"] [role="listbox"]'
		)!;
		listbox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		const active = listbox.getAttribute('aria-activedescendant');
		expect(active).toBeTruthy();
		expect(listbox.querySelector(`#${active}`)?.textContent).toContain('Virtual 200');
	});
});
