import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChoiceInputSizeFixture from './ChoiceInputSizeFixture.svelte';

describe('choice input size and virtual accessibility contracts', () => {
	it('resolves Provider, Field, root and explicit Trigger/Item size precedence', async () => {
		render(ChoiceInputSizeFixture);
		await tick();
		expect(
			document.querySelector<HTMLElement>('[data-testid="select-provider-trigger"]')?.dataset.size
		).toBe('small');
		expect(
			document.querySelector<HTMLElement>('[data-testid="select-field-trigger"]')?.dataset.size
		).toBe('large');
		expect(
			document.querySelector<HTMLElement>('[data-testid="select-root-trigger"]')?.dataset.size
		).toBe('small');
		expect(
			document.querySelector<HTMLElement>('[data-testid="multi-field-trigger"]')?.dataset.size
		).toBe('large');
		expect(
			document.querySelector<HTMLElement>('[data-testid="multi-root-trigger"]')?.dataset.size
		).toBe('small');
		expect(document.querySelector<HTMLElement>('[data-testid="radio-field"]')?.dataset.size).toBe(
			'large'
		);
		expect(
			document.querySelector<HTMLInputElement>('[data-testid="radio-field"] input')?.dataset.size
		).toBe('large');
		expect(document.querySelector<HTMLElement>('[data-testid="radio-root"]')?.dataset.size).toBe(
			'small'
		);
		expect(
			document.querySelector<HTMLInputElement>('[data-testid="radio-root"] input')?.dataset.size
		).toBe('small');
		expect(
			document.querySelector<HTMLButtonElement>('[data-testid="select-disabled-trigger"]')?.disabled
		).toBe(true);
		expect(
			document.querySelector<HTMLButtonElement>('[data-testid="multi-disabled-trigger"]')?.disabled
		).toBe(true);
	});

	it('keeps disabled aria semantics identical for virtual and non-virtual Transfer panes', async () => {
		render(ChoiceInputSizeFixture);
		await tick();
		const regular = document.querySelector('[data-testid="transfer-disabled"] [role="listbox"]');
		const virtual = document.querySelector(
			'[data-testid="transfer-disabled-virtual"] [role="listbox"]'
		);
		expect(regular?.getAttribute('aria-disabled')).toBe('true');
		expect(virtual?.getAttribute('aria-disabled')).toBe('true');
	});
});
