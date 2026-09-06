import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';
import CheckboxGroupProductionFixture from './CheckboxGroupProductionFixture.svelte';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

describe('ZCheckboxGroup production contract', () => {
	it('keeps ordinary Tab stops, max/min constraints, mixed select-all and repeated FormData', async () => {
		const target = host();
		const component = mount(CheckboxGroupProductionFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="checkbox-group-form"]')!;
		const group = target.querySelector<HTMLElement>('[data-testid="checkbox-group-main"]')!;
		const selectAll = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-all"]')!;
		const read = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-read"]')!;
		const write = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-write"]')!;
		const share = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-share"]')!;
		const admin = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-admin"]')!;
		const output = target.querySelector<HTMLOutputElement>(
			'[data-testid="checkbox-group-output"]'
		)!;

		expect(group.role).toBe('group');
		expect(group.getAttribute('aria-labelledby')).toBeTruthy();
		expect(group.dataset.size).toBe('large');
		expect(group.dataset.tone).toBe('success');
		expect(read.dataset.size).toBe('large');
		expect(read.dataset.tone).toBe('success');
		expect(admin.disabled).toBe(true);
		expect(selectAll.name).toBe('');
		expect([read.name, write.name, share.name, admin.name]).toEqual([
			'permission',
			'permission',
			'permission',
			'permission'
		]);
		expect(Array.from(new FormData(form).getAll('permission'))).toEqual(['read']);
		expect(selectAll.checked).toBe(false);
		expect(selectAll.indeterminate).toBe(true);

		selectAll.focus();
		await userEvent.tab();
		expect(document.activeElement).toBe(read);
		await userEvent.tab();
		expect(document.activeElement).toBe(write);
		await userEvent.tab();
		expect(document.activeElement).toBe(share);

		await userEvent.click(selectAll);
		await expect.poll(() => output.textContent).toBe('read,write|1|1');
		expect(Array.from(new FormData(form).getAll('permission'))).toEqual(['read', 'write']);
		expect(selectAll.checked).toBe(true);
		expect(selectAll.indeterminate).toBe(false);

		await userEvent.click(share);
		expect(share.checked).toBe(false);
		expect(share.getAttribute('aria-checked')).toBe('false');
		expect(share.closest('label')?.dataset.state).toBe('unchecked');
		expect(output.textContent).toBe('read,write|1|1');

		await userEvent.click(read);
		expect(output.textContent).toBe('write|1|2');
		await userEvent.click(write);
		expect(write.checked).toBe(true);
		expect(write.getAttribute('aria-checked')).toBe('true');
		expect(write.closest('label')?.dataset.state).toBe('checked');
		expect(output.textContent).toBe('write|1|2');
		expect(Array.from(new FormData(form).getAll('permission'))).toEqual(['write']);

		await resetForm(form);
		await expect.poll(() => output.textContent).toBe('read|1|2');
		expect(Array.from(new FormData(form).getAll('permission'))).toEqual(['read']);
		await unmount(component);
		target.remove();
	});

	it('preserves readonly values, honors native fieldset disabled and prunes a removed compound item silently', async () => {
		const target = host();
		const component = mount(CheckboxGroupProductionFixture, { target });
		const read = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-read"]')!;
		const write = target.querySelector<HTMLInputElement>('[data-testid="checkbox-group-write"]')!;
		const fieldsetInput = target.querySelector<HTMLInputElement>(
			'[data-testid="checkbox-group-fieldset"] input'
		)!;
		const output = target.querySelector<HTMLOutputElement>(
			'[data-testid="checkbox-group-output"]'
		)!;

		component.setReadonly(true);
		await tick();
		await userEvent.click(write);
		expect(output.textContent).toBe('read|1|0');
		expect(write.checked).toBe(false);
		expect(read.getAttribute('aria-readonly')).toBe('true');

		component.setReadonly(false);
		await tick();
		await userEvent.click(write);
		expect(output.textContent).toBe('read,write|1|1');
		component.removeWrite();
		await tick();
		await Promise.resolve();
		expect(output.textContent).toBe('read|1|1');

		component.setFieldsetDisabled(true);
		await tick();
		expect(fieldsetInput.matches(':disabled')).toBe(true);
		fieldsetInput.checked = false;
		fieldsetInput.dispatchEvent(new Event('change', { bubbles: true }));
		expect(fieldsetInput.checked).toBe(true);

		const partialAll = target.querySelector<HTMLInputElement>(
			'[data-testid="checkbox-group-partial-all"]'
		)!;
		const partialDisabled = target.querySelector<HTMLInputElement>(
			'[data-testid="checkbox-group-partial-disabled"]'
		)!;
		const partialEnabled = target.querySelector<HTMLInputElement>(
			'[data-testid="checkbox-group-partial-enabled"]'
		)!;
		await userEvent.click(partialAll);
		expect(partialDisabled.matches(':disabled')).toBe(true);
		expect(partialDisabled.checked).toBe(false);
		expect(partialEnabled.checked).toBe(true);
		expect(target.querySelector('[data-testid="checkbox-group-partial-output"]')?.textContent).toBe(
			'enabled'
		);
		await unmount(component);
		target.remove();
	});

	it('keeps typed option values, group required and all five checkbox sizes', async () => {
		const target = host();
		const component = mount(CheckboxGroupProductionFixture, { target });
		await tick();
		const options = target.querySelector<HTMLElement>('[data-testid="checkbox-group-options"]')!;
		const optionInputs = options.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
		const required = target.querySelector<HTMLElement>('[data-testid="checkbox-group-required"]')!;
		const requiredForm = target.querySelector<HTMLFormElement>(
			'[data-testid="checkbox-group-required-form"]'
		)!;
		const requiredInputs = required.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
		const output = target.querySelector<HTMLOutputElement>(
			'[data-testid="checkbox-group-output"]'
		)!;

		expect(required.dataset.required).toBe('true');
		expect(required.hasAttribute('aria-required')).toBe(false);
		expect(required.dataset.selectionInvalid).toBe('true');
		expect(requiredInputs[0]?.required).toBe(true);
		expect(requiredInputs[1]?.required).toBe(false);
		expect(requiredForm.checkValidity()).toBe(false);
		await userEvent.click(requiredInputs[0]!);
		expect(requiredForm.checkValidity()).toBe(false);
		await userEvent.click(requiredInputs[1]!);
		expect(requiredForm.checkValidity()).toBe(true);
		component.overflowRequired();
		await tick();
		expect(requiredForm.checkValidity()).toBe(false);
		expect(requiredInputs[0]?.validationMessage).toBe('Choose two permissions.');
		await userEvent.click(optionInputs[1]!);
		expect(output.textContent).toBe('read|1,2|1');

		for (const [size, indicatorSize] of [
			['xsmall', 12],
			['small', 14],
			['medium', 16],
			['large', 20],
			['xlarge', 24]
		] as const) {
			const input = target.querySelector<HTMLInputElement>(
				`[data-testid="checkbox-group-${size}"] input`
			)!;
			const item = input.closest<HTMLLabelElement>('label')!;
			const inputRect = input.getBoundingClientRect();
			const itemRect = item.getBoundingClientRect();
			expect(input.dataset.size).toBe(size);
			expect(input.dataset.tone).toBe('info');
			expect(inputRect.width).toBe(indicatorSize);
			expect(inputRect.height).toBe(indicatorSize);
			// The full implicit label is the pointer target; the native indicator remains token-sized.
			expect(itemRect.width).toBeGreaterThan(inputRect.width);
			expect(itemRect.height).toBeGreaterThanOrEqual(inputRect.height);
		}
		await unmount(component);
		target.remove();
	});
});
