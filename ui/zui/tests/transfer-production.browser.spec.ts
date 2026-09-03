import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TransferProductionFixture from './TransferProductionFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZTransfer production contract', () => {
	it('keeps ZTransfer typed identity, filter-scoped select-all, source/target movement and FormData reset real', async () => {
		render(TransferProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-production"]')!;
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="transfer-production-form"]'
		)!;
		const source = root.querySelector<HTMLElement>('[role="listbox"][aria-label="Available"]')!;
		const target = root.querySelector<HTMLElement>('[role="listbox"][aria-label="Selected"]')!;
		const filter = root.querySelector<HTMLInputElement>(
			'input[aria-label="Available: Filter items"]'
		)!;
		expect(source.getAttribute('aria-multiselectable')).toBe('true');
		expect(target.getAttribute('aria-multiselectable')).toBe('true');
		expect(new FormData(form).getAll('channel')).toEqual(['1', 'orphan']);
		expect(source.textContent).toContain('Number one');
		expect(target.textContent).toContain('String one');
		await userEvent.fill(filter, 'Alpha');
		await tick();
		expect(source.querySelectorAll('[role="option"]')).toHaveLength(1);
		source.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', ctrlKey: true }));
		await tick();
		root.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')!.click();
		await tick();
		expect(target.textContent).toContain('Alpha');
		expect(new FormData(form).getAll('channel')).toEqual(['1', 'alpha', 'orphan']);
		await resetForm(form);
		await expect.poll(() => new FormData(form).getAll('channel')).toEqual(['1', 'orphan']);
	});

	it('keeps ZTransfer orphan/loading and readonly boundaries explicit', async () => {
		render(TransferProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="transfer-empty-items"]')!.click();
		await tick();
		expect(document.body.textContent).toContain('2 selected items are not loaded');
		document.querySelector<HTMLButtonElement>('[data-testid="transfer-loading"]')!.click();
		await tick();
		expect(
			document.querySelector('[data-testid="transfer-production"]')?.getAttribute('aria-busy')
		).toBe('true');
		const readonly = document.querySelector<HTMLElement>('[data-testid="transfer-readonly"]')!;
		expect(readonly.querySelector('[role="listbox"][aria-readonly="true"]')).not.toBeNull();
		expect(
			readonly.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')?.disabled
		).toBe(true);
	});
});
