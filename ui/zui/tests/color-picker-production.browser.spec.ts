import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ColorPickerProductionFixture from './ColorPickerProductionFixture.svelte';
import ColorPickerAllowAlphaFixture from './ColorPickerAllowAlphaFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZColorPicker production contract', () => {
	it('coordinates Field, hex drafts, presets, clear, FormData and reset', async () => {
		render(ColorPickerProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="color-production"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="color-production-form"]')!;
		const trigger = root.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
		const customLabelTrigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="color-production-custom-label"] [aria-haspopup="dialog"]'
		)!;
		const label = document.querySelector<HTMLLabelElement>('label[for]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="color-production-output"]'
		)!;

		expect(trigger.id).toBe(label.htmlFor);
		expect(root.dataset.invalid).toBe('true');
		expect(trigger.getAttribute('aria-invalid')).toBe('true');
		expect(trigger.getAttribute('aria-describedby')).toBeTruthy();
		expect(customLabelTrigger.getAttribute('aria-label')).toBe('Preview #0f766e');
		expect(new FormData(form).get('brand')).toBe('#2563ebcc');
		trigger.click();
		await tick();
		const hex = document.querySelector<HTMLInputElement>('input[aria-label="Hex color"]')!;
		hex.value = '#zzzzzz';
		hex.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(hex.getAttribute('aria-invalid')).toBe('true');
		expect(new FormData(form).get('brand')).toBe('#2563ebcc');

		document.querySelector<HTMLButtonElement>('[aria-label="Success preset"]')?.click();
		await tick();
		expect(output.textContent).toBe('#16a34aff:1');
		expect(new FormData(form).get('brand')).toBe('#16a34aff');

		document.querySelector<HTMLButtonElement>('[data-slot="clear"]')?.click();
		await tick();
		expect(output.textContent).toBe('null:2');
		expect(new FormData(form).get('brand')).toBeNull();

		document.querySelector<HTMLButtonElement>('[data-testid="color-owner-clear"]')?.click();
		await tick();
		expect(output.textContent).toBe('null:2');
		await resetForm(form);
		expect(output.textContent).toBe('#2563ebcc:2');
		expect(new FormData(form).get('brand')).toBe('#2563ebcc');
	});

	it('keeps allowAlpha variants and invalid drafts out of the committed value', async () => {
		render(ColorPickerAllowAlphaFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="color-alpha-form"]')!;
		const opaque = document.querySelector<HTMLElement>('[data-testid="color-opaque"]')!;
		const alpha = document.querySelector<HTMLElement>('[data-testid="color-alpha"]')!;
		const output = document.querySelector<HTMLOutputElement>('[data-testid="color-alpha-output"]')!;
		expect(output.textContent).toBe('#336699:#33669980');
		opaque.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!.click();
		await tick();
		const opaqueHex = document.querySelector<HTMLInputElement>('input[aria-label="Hex color"]')!;
		opaqueHex.value = '#zzzzzz';
		opaqueHex.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		opaqueHex.blur();
		await tick();
		expect(output.textContent).toBe('#336699:#33669980');
		await resetForm(form);
		expect(output.textContent).toBe('#336699:#33669980');
		alpha.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!.click();
		await tick();
		expect(document.querySelector('input[type="range"]')).not.toBeNull();
	});
});
