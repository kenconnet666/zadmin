import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import NumberFieldProductionFixture from './NumberFieldProductionFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZNumberField production contract', () => {
	it('keeps ZNumberField draft parsing, spinbutton ARIA, precision step and Field FormData real', async () => {
		render(NumberFieldProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="number-production-form"]')!;
		const field = document.querySelector<HTMLElement>('[data-testid="locale-number"]')!;
		const control = field.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
		expect(control.getAttribute('aria-valuemin')).toBe('0');
		expect(control.getAttribute('aria-valuemax')).toBe('5');
		expect(control.getAttribute('aria-valuenow')).toBe('1.5');
		expect(new FormData(form).get('amount')).toBe('1.5');
		control.focus();
		await userEvent.fill(control, '2,75');
		await tick();
		expect(document.querySelector('[data-testid="locale-value"]')?.textContent).toBe('2.75');
		control.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(control.value).toBe('3');
		expect(new FormData(form).get('amount')).toBe('3');
		await resetForm(form);
		await expect.poll(() => new FormData(form).get('amount')).toBe('1.5');
	});
});
