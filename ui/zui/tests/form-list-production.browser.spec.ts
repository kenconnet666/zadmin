import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import FormListFixture from './FormListFixture.svelte';
describe('ZFormList production contract', () => {
	it('keeps stable keyed DOM and focus through equal-value move, remove and readonly', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormListFixture, { target });
		try {
			await tick();
			const rows = [...target.querySelectorAll<HTMLElement>('[data-row-id]')];
			const first = rows[0]!,
				second = rows[1]!;
			const firstInput = first.querySelector<HTMLInputElement>('input')!;
			const secondInput = second.querySelector<HTMLInputElement>('input')!;
			const baselineIds = rows.map((row) => row.dataset.rowId);
			component.seedState();
			firstInput.focus();
			firstInput.setSelectionRange(1, 3);
			expect(component.state(0)?.touched).toBe(false);
			target.querySelector<HTMLButtonElement>('[data-testid="move-rows"]')!.click();
			await tick();
			await expect.poll(() => target.querySelectorAll('[data-row-id]')[1]).toBe(first);
			expect(document.activeElement).toBe(firstInput);
			expect([firstInput.selectionStart, firstInput.selectionEnd]).toEqual([1, 3]);
			expect(component.state(1)?.touched).toBe(false);
			expect(target.querySelectorAll('[data-row-id]')[0]).toBe(second);
			expect(component.state(1)?.errors).toEqual(['Server row zero']);
			expect(component.state(1)?.warnings).toEqual(['Manual row zero']);
			expect(component.state(1)?.dirty).toBe(false);
			expect(component.formState()?.dirty).toBe(false);
			await userEvent.click(first.querySelector<HTMLButtonElement>('button')!);
			await expect.poll(() => target.querySelectorAll('[data-row-id]')).toHaveLength(1);
			expect(document.activeElement).toBe(secondInput);
			await userEvent.click(target.querySelector<HTMLButtonElement>('button[type="reset"]')!);
			await expect.poll(() => target.querySelectorAll('[data-row-id]')).toHaveLength(2);
			expect(
				[...target.querySelectorAll<HTMLElement>('[data-row-id]')].map((row) => row.dataset.rowId)
			).toEqual(baselineIds);
			const moveButton = target.querySelector<HTMLButtonElement>('[data-testid="move-rows"]')!;
			await userEvent.click(moveButton);
			expect(document.activeElement).toBe(moveButton);
			await userEvent.click(target.querySelector<HTMLButtonElement>('button[type="reset"]')!);
			await expect
				.poll(() =>
					[...target.querySelectorAll<HTMLElement>('[data-row-id]')].map((row) => row.dataset.rowId)
				)
				.toEqual(baselineIds);
			component.setReadonly(true);
			await tick();
			await userEvent.click(target.querySelector<HTMLButtonElement>('[data-testid="append-row"]')!);
			expect(target.querySelectorAll('[data-row-id]')).toHaveLength(2);
			expect(target.querySelector('[data-testid="list-operation"]')?.textContent).toBe('false');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
	it('drops late schema results for removed rows', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormListFixture, { target });
		try {
			await tick();
			component.startValidation();
			await component.waitValidationStarted();
			await userEvent.click(target.querySelector<HTMLButtonElement>('[data-remove]')!);
			const result = await component.finishValidation();
			expect(result?.outdated).toBe(true);
			expect(component.state(0)?.errors).not.toContain('Late row error');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
	it('preserves conditional model value and state while native FormData follows mounted controls', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormListFixture, { target });
		try {
			await tick();
			component.seedPreserved();
			const form = target.querySelector<HTMLFormElement>('[data-testid="list-form"]')!;
			expect(new FormData(form).get('preserved')).toBe('keep');
			component.togglePreserved();
			await tick();
			expect(component.preservedValue()).toBe('keep');
			expect(new FormData(form).get('preserved')).toBeNull();
			component.togglePreserved();
			await tick();
			expect(target.querySelector<HTMLInputElement>('[data-testid="preserved-input"]')?.value).toBe(
				'keep'
			);
			expect(component.preservedState()?.warnings).toEqual(['Keep warning']);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
	it('keeps DOM identity and focus when a controlled owner rejects remove', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormListFixture, { target });
		try {
			await tick();
			const rows = [...target.querySelectorAll<HTMLElement>('[data-rejected-row]')];
			const input = rows[0]!.querySelector<HTMLInputElement>('input')!;
			component.seedRejectedState();
			const beforeState = component.rejectedState();
			input.focus();
			target.querySelector<HTMLButtonElement>('[data-testid="rejected-remove"]')!.click();
			await tick();
			expect(target.querySelector('[data-testid="rejected-result"]')?.textContent).toBe('false');
			expect([...target.querySelectorAll('[data-rejected-row]')]).toEqual(rows);
			expect(document.activeElement).toBe(input);
			expect(component.rejectedState()).toEqual(beforeState);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
