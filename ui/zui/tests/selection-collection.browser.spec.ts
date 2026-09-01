import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import ChoiceCollectionFixture from './ChoiceCollectionFixture.svelte';

afterEach(cleanup);

describe('Select and Combobox logical collection integration', () => {
	it('keeps typed keys, mounted active descendants, groups and async orphan labels distinct', async () => {
		render(ChoiceCollectionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="typed-select-trigger"]'
		);
		trigger?.click();
		await tick();
		const select = document.querySelector<HTMLElement>('[data-testid="typed-select-content"]');
		const selectOptions = [...(select?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
		expect(document.activeElement).toBe(select);
		expect(selectOptions).toHaveLength(3);
		expect(selectOptions[0]?.id).not.toBe(selectOptions[1]?.id);
		expect(select?.getAttribute('aria-activedescendant')).toBe(selectOptions[0]?.id);
		select?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		expect(select?.getAttribute('aria-activedescendant')).toBe(selectOptions[1]?.id);
		select?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(
			document.querySelector('[data-testid="choice-collection-output"]')?.textContent
		).toContain('1:string');

		document.querySelector<HTMLButtonElement>('[data-testid="remove-selected"]')?.click();
		await tick();
		expect(trigger?.textContent?.trim()).toBe('String one');

		const input = document.querySelector<HTMLInputElement>('[data-testid="typed-combobox-input"]');
		input?.focus();
		if (input) {
			input.value = 'string';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		const combo = document.querySelector<HTMLElement>('[data-testid="typed-combobox-content"]');
		const comboOption = combo?.querySelector<HTMLElement>('[role="option"]');
		expect(document.activeElement).toBe(input);
		expect(combo?.getAttribute('aria-activedescendant')).toBe(comboOption?.id);
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(
			document.querySelector('[data-testid="choice-collection-output"]')?.textContent
		).toContain('1:string:String one');

		const readonlySelect = document.querySelector<HTMLButtonElement>(
			'[data-testid="readonly-select-trigger"]'
		);
		readonlySelect?.click();
		expect(readonlySelect?.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector('[data-testid="readonly-select-content"]')).toBeNull();
		const readonlyCombo = document.querySelector<HTMLInputElement>(
			'[data-testid="readonly-combobox-input"]'
		);
		readonlyCombo?.focus();
		readonlyCombo?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(readonlyCombo?.readOnly).toBe(true);
		expect(readonlyCombo?.getAttribute('aria-expanded')).toBe('false');
		expect(document.querySelector('[data-testid="readonly-combobox-content"]')).toBeNull();
		const form = document.querySelector<HTMLFormElement>('[data-testid="choice-collection-form"]');
		expect(new FormData(form!).get('readonly-select')).toBe('1');
		expect(new FormData(form!).get('readonly-combo')).toBe('1');
	});
});
