import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';
import FormNumericAdapterFixture from './FormNumericAdapterFixture.svelte';

describe('numeric Form model adapters', () => {
	it('synchronizes controller, user, FormData, rejected writes and repeated reset', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormNumericAdapterFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="numeric-form"]')!;
			const slider = target.querySelector<HTMLInputElement>('[data-testid="numeric-slider"]')!;
			const range = target.querySelector<HTMLElement>('[data-testid="numeric-range"]')!;
			const rating = target.querySelector<HTMLElement>('[data-testid="numeric-rating"]')!;
			component.updateController();
			await tick();
			expect(slider.valueAsNumber).toBe(70);
			expect(
				[...range.querySelectorAll<HTMLInputElement>('input')].map((input) => input.valueAsNumber)
			).toEqual([30, 60]);
			expect(rating.querySelectorAll('input:checked')).toHaveLength(0);
			expect(new FormData(form).getAll('range')).toEqual(['30', '60']);
			slider.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => slider.valueAsNumber).toBe(71);
			expect(new FormData(form).get('slider')).toBe('71');
			await userEvent.click(rating.querySelector<HTMLInputElement>('input[value="3.5"]')!);
			expect(new FormData(form).get('rating')).toBe('3.5');

			const rejectedSlider = target.querySelector<HTMLInputElement>(
				'[data-testid="rejected-slider"]'
			)!;
			rejectedSlider.value = '90';
			rejectedSlider.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(rejectedSlider.valueAsNumber).toBe(40);
			const rejectedRating = target.querySelector<HTMLElement>('[data-testid="rejected-rating"]')!;
			const rejectedRange = target.querySelector<HTMLElement>('[data-testid="rejected-range"]')!;
			const rejectedLower = rejectedRange.querySelector<HTMLInputElement>('input')!;
			rejectedLower.value = '60';
			rejectedLower.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(
				[...rejectedRange.querySelectorAll<HTMLInputElement>('input')].map(
					(input) => input.valueAsNumber
				)
			).toEqual([25, 75]);
			await userEvent.click(rejectedRating.querySelector<HTMLInputElement>('input[value="4"]')!);
			expect(rejectedRating.querySelector<HTMLInputElement>('input:checked')?.value).toBe('3');
			for (let index = 0; index < 2; index += 1) {
				await resetForm(form);
				await resetForm(
					target.querySelector<HTMLFormElement>('[data-testid="numeric-rejected-form"]')!
				);
			}
			await expect.poll(() => slider.valueAsNumber).toBe(35);
			expect(
				[...range.querySelectorAll<HTMLInputElement>('input')].map((input) => input.valueAsNumber)
			).toEqual([20, 80]);
			expect(rating.querySelector<HTMLInputElement>('input:checked')?.value).toBe('2.5');
			expect(rejectedSlider.valueAsNumber).toBe(40);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
