import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import MultiSelectCollectionFixture from './MultiSelectCollectionFixture.svelte';
import MultiSelectFixture from './MultiSelectFixture.svelte';

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

	it('keeps ZMultiSelectTrigger, ZMultiSelectContent and ZMultiSelectItem ARIA, keyboard and Field boundaries real', async () => {
		render(MultiSelectFixture, { defaultOpen: true });
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-select-trigger"]'
		)!;
		const content = document.querySelector<HTMLElement>('[data-testid="multi-select-content"]')!;
		const items = [...content.querySelectorAll<HTMLElement>('[role="option"]')];
		expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('role')).toBe('listbox');
		expect(items).toHaveLength(4);
		expect(items[0]?.getAttribute('aria-selected')).toBe('true');
		expect(items[1]?.getAttribute('aria-selected')).toBe('false');
		expect(items[3]?.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector<HTMLLabelElement>('label[for]')?.htmlFor).toBe(trigger.id);

		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }));
		await tick();
		expect(document.querySelector('[data-testid="multi-select-output"]')?.textContent).toMatch(
			/^a:/u
		);
		trigger.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace', ctrlKey: true })
		);
		await tick();
		expect(document.querySelector('[data-testid="multi-select-output"]')?.textContent).toMatch(
			/^:2:/u
		);
	});
});
