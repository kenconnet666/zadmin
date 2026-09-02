import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import InputGroupMultipleFixture from './InputGroupMultipleFixture.svelte';
import InputGroupNestedFixture from './InputGroupNestedFixture.svelte';
import PinInputGroupProductionFixture from './PinInputGroupProductionFixture.svelte';

describe('ZPinInput and ZInputGroup production browser contracts', () => {
	it('projects Field ownership to exactly one grouped control and keeps actions independent', async () => {
		render(PinInputGroupProductionFixture);
		const group = document.querySelector<HTMLElement>('[data-testid="input-group-owner"]')!;
		const control = document.querySelector<HTMLInputElement>(
			'[data-testid="input-group-control"]'
		)!;
		const label = document.querySelector<HTMLLabelElement>(`label[for="${control.id}"]`)!;
		expect(group.dataset.invalid).toBe('true');
		expect(control.getAttribute('aria-invalid')).toBe('true');
		expect(control.name).toBe('endpoint');
		expect(control.required).toBe(true);
		expect(control.dataset.size).toBe('small');
		expect(control.getAttribute('aria-describedby')).toContain('description');
		expect(control.getAttribute('aria-describedby')).toContain('error');
		await userEvent.click(label);
		expect(document.activeElement).toBe(control);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="input-group-affix"]')!
		);
		expect(document.activeElement).toBe(control);
		await userEvent.click(group.querySelector<HTMLButtonElement>('button')!);
		expect(document.querySelector('[data-testid="pin-group-output"]')?.textContent).toContain(
			'api:1'
		);
		const data = new FormData(
			document.querySelector<HTMLFormElement>('[data-testid="input-group-production-form"]')!
		);
		expect(data.getAll('endpoint')).toEqual(['api']);
		await userEvent.fill(control, 'changed');
		await userEvent.click(
			document
				.querySelector<HTMLFormElement>('[data-testid="input-group-production-form"]')!
				.querySelector<HTMLButtonElement>('button[type="reset"]')!
		);
		expect(control.value).toBe('api');
	});

	it('normalizes external values, supports null clear and keeps one external-form value bridge', async () => {
		render(PinInputGroupProductionFixture);
		await Promise.resolve();
		const pin = document.querySelector<HTMLElement>('[data-testid="pin-production"]')!;
		const inputs = [...pin.querySelectorAll<HTMLInputElement>('input')];
		expect(inputs).toHaveLength(6);
		expect(inputs[0]?.getAttribute('autocomplete')).toBe('one-time-code');
		expect(inputs.slice(1).every((input) => input.getAttribute('autocomplete') === 'off')).toBe(
			true
		);
		expect(inputs.every((input) => input.name === '')).toBe(true);
		expect(inputs.map((input) => input.value).join('')).toBe('123456');
		expect(
			document.querySelector<HTMLInputElement>('[data-zui-form-value][name="otp"]')?.value
		).toBe('123456');
		await userEvent.click(document.querySelector<HTMLElement>('[data-testid="pin-clear"]')!);
		expect(inputs.map((input) => input.value).join('')).toBe('');
		await userEvent.click(document.querySelector<HTMLElement>('[data-testid="pin-invalid"]')!);
		await Promise.resolve();
		expect(inputs.map((input) => input.value).join('')).toBe('987654');
		inputs[5]?.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="pin-length"]')!.click();
		await expect.poll(() => pin.querySelectorAll('input').length).toBe(4);
		const finalInput = pin.querySelectorAll<HTMLInputElement>('input')[3]!;
		await expect.poll(() => document.activeElement).toBe(finalInput);
		expect(
			document.querySelector<HTMLInputElement>('[data-zui-form-value][name="otp"]')?.value
		).toBe('9876');
		await userEvent.click(
			document
				.querySelector<HTMLFormElement>('[data-testid="pin-external-production-form"]')!
				.querySelector<HTMLButtonElement>('button[type="reset"]')!
		);
		expect(
			document.querySelector<HTMLInputElement>('[data-zui-form-value][name="otp"]')?.value
		).toBe('2468');
	});

	it('commits one Unicode grapheme after IME composition instead of processing interim input', () => {
		render(PinInputGroupProductionFixture);
		const pin = document.querySelector<HTMLElement>('[data-testid="pin-unicode"]')!;
		const input = pin.querySelectorAll<HTMLInputElement>('input')[2]!;
		input.focus();
		input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '你' }));
		input.value = '你';
		input.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '你',
				inputType: 'insertCompositionText',
				isComposing: true
			})
		);
		expect(pin.querySelectorAll<HTMLInputElement>('input')[2]?.value).toBe('你');
		input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '你' }));
		expect([...pin.querySelectorAll<HTMLInputElement>('input')].map((slot) => slot.value)).toEqual([
			'A',
			'🙂',
			'你'
		]);
	});

	it('rejects multiple business controls and nested InputGroups at component initialization', async () => {
		await expect(Promise.resolve().then(() => render(InputGroupMultipleFixture))).rejects.toThrow(
			/exactly one registered business value control/u
		);
		await expect(Promise.resolve().then(() => render(InputGroupNestedFixture))).rejects.toThrow(
			/cannot be nested/u
		);
	});

	it('keeps RTL and long affixes within the narrow owner width', () => {
		render(PinInputGroupProductionFixture);
		const group = document.querySelector<HTMLElement>('[data-testid="input-group-rtl"]')!;
		expect(group.closest('[dir="rtl"]')).not.toBeNull();
		expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
		expect(
			group.querySelector<HTMLInputElement>('input')!.getBoundingClientRect().width
		).toBeGreaterThan(0);
	});
});
