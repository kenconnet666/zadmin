import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';
import FormNumberSegmentAdapterFixture from './FormNumberSegmentAdapterFixture.svelte';
describe('NumberField and Segmented Form model adapters', () => {
	it('blocks incomplete numeric drafts without replacing the canonical value and resets the draft', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormNumberSegmentAdapterFixture, { target });
		try {
			await tick();
			const number = target.querySelector<HTMLInputElement>('[data-testid="model-number"] input')!;
			number.focus();
			number.value = '-';
			number.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await expect.poll(() => component.getState().dirty).toBe(true);
			const result = await component.validate();
			expect(result.valid).toBe(false);
			expect(result.data).toBeUndefined();
			expect(new FormData(number.closest('form')!).get('amount')).toBe('12.5');
			component.resetAmount();
			await expect.poll(() => number.value).toBe('12.5');
			expect(component.getState().dirty).toBe(false);
			expect((await component.validate()).valid).toBe(true);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
	it('keeps typed model, user, rejection, FormData and repeated reset coherent', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormNumberSegmentAdapterFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="number-segment-form"]')!;
			const number = target
				.querySelector<HTMLElement>('[data-testid="model-number"]')!
				.querySelector<HTMLInputElement>('input')!;
			const segmented = target.querySelector<HTMLElement>('[data-testid="model-segmented"]')!;
			component.updateController();
			await tick();
			expect(number.value).toBe('');
			expect(segmented.querySelector('[data-state="selected"]')?.textContent).toContain(
				'String one'
			);
			expect(target.querySelector('[data-testid="number-segment-values"]')?.textContent).toBe(
				'null|1|string|0'
			);
			await userEvent.fill(number, '42.5');
			await userEvent.click(
				[...segmented.querySelectorAll('button')].find((button) =>
					button.textContent?.includes('Number one')
				)!
			);
			expect(new FormData(form).get('amount')).toBe('42.5');
			expect(new FormData(form).get('mode')).toBe('1');
			expect(target.querySelector('[data-testid="number-segment-values"]')?.textContent).toBe(
				'42.5|1|number|2'
			);

			const rejectedNumber = target
				.querySelector<HTMLElement>('[data-testid="rejected-number"]')!
				.querySelector<HTMLInputElement>('input')!;
			await userEvent.fill(rejectedNumber, '99');
			expect(rejectedNumber.value).toBe('7');
			const rejectedSegmented = target.querySelector<HTMLElement>(
				'[data-testid="rejected-segmented"]'
			)!;
			await userEvent.click(
				[...rejectedSegmented.querySelectorAll('button')].find((button) =>
					button.textContent?.includes('Number one')
				)!
			);
			expect(rejectedSegmented.querySelector('[data-state="selected"]')?.textContent).toContain(
				'String one'
			);
			for (let index = 0; index < 2; index += 1) {
				await resetForm(form);
				await resetForm(
					target.querySelector<HTMLFormElement>('[data-testid="number-segment-rejected"]')!
				);
			}
			await expect.poll(() => number.value).toBe('12.5');
			expect(segmented.querySelector('[data-state="selected"]')?.textContent).toContain(
				'Number one'
			);
			expect(target.querySelector('[data-testid="number-segment-values"]')?.textContent).toBe(
				'12.5|1|number|2'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
