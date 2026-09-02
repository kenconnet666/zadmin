import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import ChoiceCollectionFixture from './ChoiceCollectionFixture.svelte';

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
});
