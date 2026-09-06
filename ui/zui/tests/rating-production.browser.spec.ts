import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import RatingFixture from './RatingFixture.svelte';
import { settleFormReset } from './form-reset.js';

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});
function element<T extends HTMLElement>(id: string): T {
	return document.querySelector<T>('[data-testid="' + id + '"]')!;
}
function radio(root: HTMLElement, value: number): HTMLInputElement {
	return root.querySelector<HTMLInputElement>('input[value="' + value + '"]')!;
}

describe('ZRating production contract', () => {
	it('uses native fraction radios for Field labels, hover preview, clear, FormData and reset', async () => {
		render(RatingFixture);
		await tick();
		const root = element('rating-main');
		const form = element<HTMLFormElement>('rating-form');
		expect(root.getAttribute('role')).toBe('radiogroup');
		expect(root.getAttribute('aria-labelledby')).toBeTruthy();
		expect(root.getAttribute('aria-label')).toBeNull();
		expect(root.querySelectorAll('input[type="radio"]')).toHaveLength(10);
		expect(root.querySelectorAll('input:checked')).toHaveLength(1);
		expect(radio(root, 2.5).getAttribute('aria-label')).toBe('2.5 of 5 stars');
		expect(new FormData(form).get('rating')).toBe('2.5');

		const preview = radio(root, 3.5).closest('label')!;
		await userEvent.hover(preview);
		await expect.poll(() => root.dataset.preview).toBe('3.5');
		expect(root.dataset.value).toBe('2.5');
		expect(element('rating-output').textContent).toBe('2.5|0|3.5|1|0');
		expect(root.querySelector<HTMLElement>('[data-index="4"]')?.dataset.fill).toBe('50');
		await userEvent.unhover(preview);
		await expect.poll(() => root.dataset.preview).toBe('0');
		expect(root.dataset.value).toBe('2.5');

		await userEvent.click(radio(root, 4.5));
		await expect.poll(() => root.dataset.value).toBe('4.5');
		expect(new FormData(form).get('rating')).toBe('4.5');
		await userEvent.click(radio(root, 4.5));
		await expect.poll(() => root.dataset.value).toBe('0');
		expect(new FormData(form).get('rating')).toBeNull();
		await userEvent.click(element('rating-reset'));
		await settleFormReset(form);
		expect(root.dataset.value).toBe('2.5');
		expect(new FormData(form).get('rating')).toBe('2.5');
		expect(element('rating-output').textContent).toBe('2.5|2|0|2|1');
	});

	it('selects by real keyboard in LTR and RTL while keeping one Tab stop', async () => {
		render(RatingFixture);
		await tick();
		const root = element('rating-main');
		radio(root, 2.5).focus();
		expect(root.querySelectorAll('input[tabindex="0"]')).toHaveLength(1);
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => root.dataset.value).toBe('3');
		expect(document.activeElement).toBe(radio(root, 3));
		await userEvent.keyboard('{End}');
		expect(root.dataset.value).toBe('5');
		await userEvent.keyboard('{Home}');
		expect(root.dataset.value).toBe('0.5');
		await userEvent.keyboard(' ');
		await expect.poll(() => root.dataset.value).toBe('0');

		const rtl = element('rating-rtl');
		radio(rtl, 2).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => rtl.dataset.value).toBe('1.5');
		expect(document.activeElement).toBe(radio(rtl, 1.5));
	});

	it('keeps readonly submitted and honors Field plus native fieldset disabledness', async () => {
		render(RatingFixture);
		await tick();
		const readonly = element('rating-readonly');
		await userEvent.click(radio(readonly, 4));
		expect(readonly.dataset.value).toBe('3.5');
		expect(
			new FormData(element<HTMLFormElement>('rating-readonly-form')).get('readonly-rating')
		).toBe('3.5');
		await userEvent.hover(radio(readonly, 4).closest('label')!);
		expect(readonly.dataset.preview).toBe('0');
		const disabled = element('rating-disabled');
		expect(
			[...disabled.querySelectorAll<HTMLInputElement>('input')].every((input) => input.disabled)
		).toBe(true);
		expect(
			new FormData(element<HTMLFormElement>('rating-disabled-form')).get('disabled-rating')
		).toBeNull();
		const legend = element('rating-legend');
		const fieldset = element('rating-fieldset');
		expect(radio(legend, 1).matches(':disabled')).toBe(false);
		expect(radio(fieldset, 1).matches(':disabled')).toBe(true);
		expect(Number(getComputedStyle(fieldset).opacity)).toBeLessThan(1);
	});

	it('uses five Theme sizes and exposes frozen custom item contexts', async () => {
		// @zui-visual ZRating five-size geometry, tone and custom symbols
		render(RatingFixture);
		await tick();
		for (const [size, pixels] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const root = element('rating-size-' + size);
			expect(root.dataset.size).toBe(size);
			expect(
				root.querySelector<HTMLElement>('[data-slot="item"]')?.getBoundingClientRect().width
			).toBeCloseTo(pixels, 0);
		}
		const custom = element('rating-custom');
		expect(custom.querySelectorAll('[data-custom-index]')).toHaveLength(6);
		expect(
			[...custom.querySelectorAll<HTMLElement>('[data-custom-index]')].every(
				(entry) => entry.dataset.customFrozen === 'true'
			)
		).toBe(true);
		expect(element('rating-main').dataset.tone).toBe('warning');
	});
});
