import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import InputFoundationProductionFixture from './InputFoundationProductionFixture.svelte';
import { activateFormReset } from './form-reset.js';

describe('ZInput, ZTextarea and ZInputGroup production contracts', () => {
	it('preserves native input attrs and resolves Provider defaults across text controls', async () => {
		render(InputFoundationProductionFixture);
		const input = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-control"]'
		)!;
		const textarea = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-foundation-control"]'
		)!;
		const group = document.querySelector<HTMLElement>('[data-testid="input-foundation-group"]')!;
		const groupInput = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-group-control"]'
		)!;
		const largeInputStyle = getComputedStyle(input);
		const smallInput = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-explicit-small"]'
		)!;
		const smallInputStyle = getComputedStyle(smallInput);
		const textareaStyle = getComputedStyle(textarea);
		const prefix = group.querySelector<HTMLElement>('[data-slot="prefix"]')!;
		const suffix = group.querySelector<HTMLElement>('[data-slot="suffix"]')!;
		const fieldGroup = document.querySelector<HTMLElement>(
			'[data-testid="input-foundation-field-group"]'
		)!;
		const fieldGroupInput = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-field-group-control"]'
		)!;

		const nativeInput = document.querySelector<HTMLInputElement>(
			'[data-testid="native-autocomplete-reference"]'
		)!;
		expect(input.getAttribute('autocomplete')).toBe('username');
		// Firefox's IDL getter can normalize supported autofill tokens differently;
		// the component must preserve the attribute and match the native control.
		expect(input.autocomplete).toBe(nativeInput.autocomplete);
		expect(input.maxLength).toBe(12);
		expect(input.required).toBe(true);
		expect(input.dataset.size).toBe('large');
		expect(textarea.dataset.size).toBe('large');
		expect(group.dataset.size).toBe('large');
		expect(groupInput.dataset.size).toBe('large');
		expect(fieldGroup.dataset.size).toBe('small');
		expect(fieldGroupInput.dataset.size).toBe('small');
		expect(input.getBoundingClientRect().height).toBeGreaterThan(
			smallInput.getBoundingClientRect().height
		);
		expect(Number.parseFloat(largeInputStyle.fontSize)).toBeGreaterThan(
			Number.parseFloat(smallInputStyle.fontSize)
		);
		expect(Number.parseFloat(largeInputStyle.paddingInlineStart)).toBeGreaterThan(
			Number.parseFloat(smallInputStyle.paddingInlineStart)
		);
		expect(textareaStyle.fontSize).toBe('18px');
		expect(textareaStyle.paddingInlineStart).toBe('16px');
		expect(getComputedStyle(groupInput).fontSize).toBe('18px');
		expect(getComputedStyle(groupInput).paddingInlineStart).toBe('24px');
		expect(groupInput.getBoundingClientRect().height).toBe(input.getBoundingClientRect().height);
		expect(prefix.clientWidth).toBeLessThan(prefix.scrollWidth);
		expect(suffix.clientWidth).toBeLessThan(suffix.scrollWidth);
		expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);

		await userEvent.fill(input, 'changed');
		await userEvent.fill(textarea, 'changed notes');
		await tick();
		expect(
			document.querySelector('[data-testid="input-foundation-output"]')?.textContent
		).toContain('changed:changed notes:1:1');
	});

	it('projects inherited disabled and readonly states without replacing native controls', () => {
		render(InputFoundationProductionFixture);
		const disabled = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-disabled"]'
		)!;
		const readonly = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-readonly"]'
		)!;

		expect(disabled.disabled).toBe(true);
		expect(disabled.dataset.disabled).toBe('true');
		expect(getComputedStyle(disabled).opacity).not.toBe('1');
		expect(readonly.readOnly).toBe(true);
		expect(readonly.dataset.readonly).toBe('true');
		for (const prefix of ['input', 'textarea']) {
			const group = document.querySelector<HTMLElement>(
				`[data-testid="${prefix}-foundation-disabled-group"]`
			)!;
			const control = document.querySelector<HTMLInputElement>(
				`[data-testid="${prefix}-foundation-disabled-group-control"]`
			)!;
			expect(control.disabled).toBe(true);
			expect(getComputedStyle(group).opacity).toBe('0.5');
			expect(getComputedStyle(control).opacity).toBe('1');
		}
	});

	it('resets input and textarea state through the native form without user callbacks', async () => {
		render(InputFoundationProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="input-foundation-form"]')!;
		const input = document.querySelector<HTMLInputElement>(
			'[data-testid="input-foundation-control"]'
		)!;
		const textarea = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-foundation-control"]'
		)!;

		await userEvent.fill(input, 'changed');
		await userEvent.fill(textarea, 'changed notes');
		await tick();
		await activateFormReset(form);
		expect(input.value).toBe('seed');
		expect(textarea.value).toBe('notes');
		expect(
			document.querySelector('[data-testid="input-foundation-output"]')?.textContent
		).toContain('notes:1:1');
	});
});
