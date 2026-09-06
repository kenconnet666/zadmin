import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import FormChoiceAdapterFixture from './FormChoiceAdapterFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

describe('Switch and RadioGroup Form model adapters', () => {
	it('keeps typed model changes, native FormData and external form owners coherent', async () => {
		const target = host();
		const component = mount(FormChoiceAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="choice-form"]')!;
		const externalForm = target.querySelector<HTMLFormElement>(
			'[data-testid="choice-external-form"]'
		)!;
		const control = target.querySelector<HTMLInputElement>('[data-testid="choice-switch"]')!;
		const radio = target.querySelector<HTMLElement>('[data-testid="choice-radio"]')!;
		const radios = radio.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		const external = target.querySelector<HTMLInputElement>(
			'[data-testid="choice-external-switch"]'
		)!;
		const values = target.querySelector<HTMLOutputElement>('[data-testid="choice-values"]')!;
		const counts = target.querySelector<HTMLOutputElement>('[data-testid="choice-counts"]')!;

		expect(values.textContent).toBe('true:1:true');
		expect(counts.textContent).toBe('0:0');
		expect(control.checked).toBe(true);
		expect(radios[0]?.checked).toBe(true);
		expect(new FormData(form).get('enabled')).toBe('yes');
		expect(new FormData(form).get('choice')).toBe('1');
		expect(new FormData(form).get('external')).toBeNull();
		expect(new FormData(externalForm).get('external')).toBe('external-on');

		await userEvent.click(control);
		await userEvent.click(radios[1]!);
		await userEvent.click(external);
		expect(values.textContent).toBe('false:2:false');
		expect(counts.textContent).toBe('3:3');
		expect(new FormData(form).get('enabled')).toBeNull();
		expect(new FormData(form).get('choice')).toBe('2');
		expect(new FormData(externalForm).get('external')).toBeNull();
		await unmount(component);
		target.remove();
	});

	it('preserves RTL keyboard, readonly browsing, disabled state and Field size', async () => {
		const target = host();
		const component = mount(FormChoiceAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="choice-form"]')!;
		const control = target.querySelector<HTMLInputElement>('[data-testid="choice-switch"]')!;
		const radio = target.querySelector<HTMLElement>('[data-testid="choice-radio"]')!;
		const radios = radio.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		const values = target.querySelector<HTMLOutputElement>('[data-testid="choice-values"]')!;
		expect(control.dataset.size).toBe('large');
		expect(radio.dataset.size).toBe('large');
		expect(radios[0]?.dataset.size).toBe('large');

		radios[0]!.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(radios[1]);
		expect(values.textContent).toBe('true:2:true');

		component.setReadonly(true);
		await tick();
		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe(radios[0]);
		expect(values.textContent).toBe('true:2:true');
		expect(control.getAttribute('aria-readonly')).toBe('true');
		expect(new FormData(form).get('enabled')).toBe('yes');
		expect(new FormData(form).get('choice')).toBe('2');

		component.setReadonly(false);
		component.setDisabled(true);
		await tick();
		expect(control.matches(':disabled')).toBe(true);
		expect(radios[0]?.matches(':disabled')).toBe(true);
		expect(radios[1]?.matches(':disabled')).toBe(true);
		expect(new FormData(form).get('enabled')).toBeNull();
		expect(new FormData(form).get('choice')).toBeNull();
		await unmount(component);
		target.remove();
	});

	it('maps model undefined to empty required controls without user callbacks', async () => {
		const target = host();
		const component = mount(FormChoiceAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="choice-form"]')!;
		const control = target.querySelector<HTMLInputElement>('[data-testid="choice-switch"]')!;
		const radio = target.querySelector<HTMLElement>('[data-testid="choice-radio"]')!;
		const radios = radio.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		component.clearChoices();
		await tick();
		expect(control.checked).toBe(false);
		expect([...radios].every((item) => !item.checked)).toBe(true);
		expect(new FormData(form).get('enabled')).toBeNull();
		expect(new FormData(form).get('choice')).toBeNull();
		expect(form.checkValidity()).toBe(false);
		expect(target.querySelector('[data-testid="choice-counts"]')?.textContent).toBe('2:0');
		await unmount(component);
		target.remove();
	});

	it('projects external state, repeats baseline reset and rolls back a rejecting owner', async () => {
		const target = host();
		const component = mount(FormChoiceAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="choice-form"]')!;
		const control = target.querySelector<HTMLInputElement>('[data-testid="choice-switch"]')!;
		const radios = target
			.querySelector<HTMLElement>('[data-testid="choice-radio"]')!
			.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		const rejectedForm = target.querySelector<HTMLFormElement>(
			'[data-testid="choice-rejected-form"]'
		)!;
		const rejectedSwitch = target.querySelector<HTMLInputElement>(
			'[data-testid="choice-rejected-switch"]'
		)!;
		const rejectedRadios = target
			.querySelector<HTMLElement>('[data-testid="choice-rejected-radio"]')!
			.querySelectorAll<HTMLInputElement>('input[type="radio"]');

		component.mutateExternal();
		await expect.poll(() => control.checked).toBe(false);
		expect(radios[1]?.checked).toBe(true);
		expect(target.querySelector('[data-testid="choice-counts"]')?.textContent).toBe('0:0');

		await resetForm(form);
		await expect.poll(() => control.checked).toBe(true);
		expect(radios[0]?.checked).toBe(true);
		await resetForm(form);
		await expect.poll(() => control.checked).toBe(true);
		expect(radios[0]?.checked).toBe(true);

		await userEvent.click(rejectedSwitch);
		await userEvent.click(rejectedRadios[1]!);
		expect(rejectedSwitch.checked).toBe(true);
		expect(rejectedRadios[0]?.checked).toBe(true);
		expect(rejectedRadios[1]?.checked).toBe(false);
		rejectedSwitch.checked = false;
		rejectedRadios[0]!.checked = false;
		rejectedRadios[1]!.checked = true;
		await resetForm(rejectedForm);
		await expect.poll(() => rejectedSwitch.checked).toBe(true);
		expect(rejectedRadios[0]?.checked).toBe(true);
		expect(rejectedRadios[1]?.checked).toBe(false);
		await resetForm(rejectedForm);
		expect(rejectedSwitch.checked).toBe(true);
		expect(rejectedRadios[0]?.checked).toBe(true);
		await unmount(component);
		target.remove();
	});
});
