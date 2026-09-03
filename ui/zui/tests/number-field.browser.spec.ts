import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import NumberFieldProductionFixture from './NumberFieldProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function fixture(id: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`Missing NumberField fixture "${id}".`);
	return element;
}

function spinbutton(id: string): HTMLInputElement {
	const input = fixture(id).querySelector<HTMLInputElement>('[role="spinbutton"]');
	if (!input) throw new Error(`Missing NumberField spinbutton "${id}".`);
	return input;
}

function button(name: string): HTMLButtonElement {
	const element = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
		(candidate) => candidate.textContent?.trim() === name
	);
	if (!element) throw new Error(`Missing button "${name}".`);
	return element;
}

function input(input: HTMLInputElement, value: string, isComposing = false): void {
	input.value = value;
	input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, isComposing }));
}

describe('NumberField production contracts', () => {
	it('preserves the locale draft on focus, steps with precision and resets through FormValueBridge', async () => {
		render(NumberFieldProductionFixture);
		const field = fixture('locale-number');
		const control = spinbutton('locale-number');
		const form = document.querySelector<HTMLFormElement>('[data-testid="number-production-form"]')!;

		expect(field.dataset.size).toBe('small');
		expect(control.value).toBe('1,50');
		control.focus();
		expect(control.value).toBe('1,5');
		await tick();
		expect(control.value).toBe('1,5');

		input(control, '2,75');
		await tick();
		expect(fixture('locale-value').textContent).toBe('2.75');
		expect(new FormData(form).get('amount')).toBe('2.75');

		control.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'PageUp' }));
		await tick();
		expect(control.value).toBe('3,75');
		expect(fixture('locale-value').textContent).toBe('3.75');

		control.blur();
		await tick();
		expect(control.value).toBe('3,75');
		await resetForm(form);
		await expect.poll(() => control.value).toBe('1,50');
		await expect.poll(() => fixture('locale-value').textContent).toBe('1.5');
		await expect.poll(() => new FormData(form).get('amount')).toBe('1.5');
	});

	it('synchronizes an external undefined clear even while editing', async () => {
		render(NumberFieldProductionFixture);
		const control = spinbutton('controlled-number');
		control.focus();
		await tick();
		expect(control.value).toBe('12.5');

		await userEvent.click(button('Clear controlled'));
		await tick();
		expect(control.value).toBe('');
		expect(fixture('controlled-value').textContent).toBe('empty');
		const form = document.querySelector<HTMLFormElement>('[data-testid="number-production-form"]')!;
		expect(new FormData(form).has('controlled')).toBe(false);

		await userEvent.click(button('Set controlled'));
		await tick();
		expect(control.value).toBe('7.25');
		expect(fixture('controlled-value').textContent).toBe('7.25');
	});

	it('steps from a valid live draft before controlled formatting flushes', async () => {
		render(NumberFieldProductionFixture);
		const control = spinbutton('controlled-number');
		control.focus();
		control.value = '12.75';
		control.dispatchEvent(new InputEvent('input', { bubbles: true }));
		control.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await expect.poll(() => fixture('controlled-value').textContent).toBe('13');
	});

	it('defers IME parsing and supports paired parser and formatter contracts', async () => {
		render(NumberFieldProductionFixture);
		const localeControl = spinbutton('locale-number');
		localeControl.focus();
		localeControl.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		input(localeControl, '3,25', true);
		await tick();
		expect(fixture('locale-value').textContent).toBe('1.5');
		localeControl.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
		await tick();
		expect(fixture('locale-value').textContent).toBe('3.25');

		const customControl = spinbutton('custom-number');
		expect(customControl.value).toBe('25 percent');
		customControl.focus();
		await tick();
		expect(customControl.value).toBe('25%');
		input(customControl, '37.5%');
		await tick();
		expect(fixture('custom-value').textContent).toBe('0.38');
		customControl.blur();
		await tick();
		expect(customControl.value).toBe('38 percent');
	});

	it('retains direct out-of-range input but clamps every step interaction', async () => {
		render(NumberFieldProductionFixture);
		const field = fixture('range-number');
		const control = spinbutton('range-number');
		control.focus();
		input(control, '120');
		control.blur();
		await tick();

		expect(fixture('range-value').textContent).toBe('120');
		expect(field.dataset.outOfRange).toBe('true');
		expect(control.getAttribute('aria-invalid')).toBe('true');
		expect(control.validationMessage).toContain('100');

		control.focus();
		control.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'PageDown' }));
		await tick();
		expect(fixture('range-value').textContent).toBe('95');
		expect(field.dataset.outOfRange).toBeUndefined();
		expect(control.checkValidity()).toBe(true);
	});

	it('keeps readonly values focusable and successful while disabling redundant steppers', () => {
		render(NumberFieldProductionFixture);
		const field = fixture('readonly-number');
		const control = spinbutton('readonly-number');
		const form = document.querySelector<HTMLFormElement>('[data-testid="number-production-form"]')!;

		expect(control.readOnly).toBe(true);
		expect(control.disabled).toBe(false);
		expect(
			[...field.querySelectorAll<HTMLButtonElement>('button')].every((button) => button.disabled)
		).toBe(true);
		expect(new FormData(form).get('replicas')).toBe('4');
	});
});
