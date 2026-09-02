import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import ChoiceCollectionFixture from './ChoiceCollectionFixture.svelte';
import ComboboxFixture from './ComboboxFixture.svelte';

describe('ZCombobox production contract', () => {
	it('keeps typed keys, filtering, active descendant selection, readonly and form ownership coherent', async () => {
		render(ChoiceCollectionFixture);
		const input = document.querySelector<HTMLInputElement>('[data-testid="typed-combobox-input"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="choice-collection-form"]')!;
		input.focus();
		input.value = 'string';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="typed-combobox-content"]')!;
		const option = content.querySelector<HTMLElement>('[role="option"]')!;
		expect(document.activeElement).toBe(input);
		expect(content.querySelectorAll('[role="option"]')).toHaveLength(1);
		await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(option.id);
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(new FormData(form).get('combo-choice')).toBe('1');
		expect(
			document.querySelector<HTMLInputElement>('[data-testid="readonly-combobox-input"]')?.readOnly
		).toBe(true);
	});

	it('keeps ZComboboxInput, ZComboboxContent and ZComboboxItem ARIA, keyboard and form boundaries real', async () => {
		render(ComboboxFixture, { defaultOpen: true });
		const input = document.querySelector<HTMLInputElement>('[data-testid="combobox-input"]')!;
		const content = document.querySelector<HTMLElement>('[data-testid="combobox-content"]')!;
		const items = [...content.querySelectorAll<HTMLElement>('[role="option"]')];
		expect(input.getAttribute('role')).toBe('combobox');
		expect(input.getAttribute('aria-haspopup')).toBe('listbox');
		expect(input.getAttribute('aria-controls')).toBe(content.id);
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-autocomplete')).toBe('list');
		expect(content.getAttribute('role')).toBe('listbox');
		expect(content.getAttribute('aria-label')).toBe('Choices');
		expect(items).toHaveLength(4);
		expect(items[1]?.getAttribute('aria-selected')).toBe('true');
		expect(items[2]?.getAttribute('aria-disabled')).toBe('true');

		input.focus();
		const activeBeforeKeyboard = input.getAttribute('aria-activedescendant');
		expect(activeBeforeKeyboard).toBe(items[1]?.id);
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(input);
	});
});
