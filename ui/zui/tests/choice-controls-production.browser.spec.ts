import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { ZRadioGroup, ZSegmented } from '../src/entrypoints/index.js';
import ChoiceControlsCollectionFixture from './ChoiceControlsCollectionFixture.svelte';
import RadioGroupFixture from './RadioGroupFixture.svelte';
import { activateFormReset, resetForm } from './form-reset.js';

async function settle(): Promise<void> {
	await Promise.resolve();
	await tick();
}

describe('ZRadioGroup, ZRadioGroupItem and ZSegmented production contracts', () => {
	it('does not reconcile a focused RadioGroup after its owner is unmounted', async () => {
		const { unmount: unmountRendered } = await render(RadioGroupFixture);
		const beta = document.querySelector<HTMLInputElement>('[data-testid="radio-b"]')!;
		beta.focus();
		// Child action teardown queues nearest-focus recovery. Unmounting the owner
		// in the same turn must cancel that callback before it reads derived view.
		await unmountRendered();
		await settle();
	});

	it('does not reconcile a focused Segmented option after its owner is unmounted', async () => {
		const { unmount: unmountRendered } = await render(ChoiceControlsCollectionFixture);
		await settle();
		const segment = document.querySelector<HTMLButtonElement>(
			'[data-testid="collection-segmented"] [role="radio"]'
		)!;
		segment.focus();
		await unmountRendered();
		await settle();
	});

	it('keeps composed ZRadioGroupItem native selection, disabled state and reset ownership real', async () => {
		// @zui-visual ZRadioGroupItem
		render(RadioGroupFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="radio-form"]')!;
		const alpha = form.querySelector<HTMLInputElement>('[data-testid="radio-a"]')!;
		const beta = form.querySelector<HTMLInputElement>('[data-testid="radio-b"]')!;
		const disabled = form.querySelector<HTMLInputElement>('[data-testid="radio-c"]')!;
		const delta = form.querySelector<HTMLInputElement>('[data-testid="radio-d"]')!;

		expect(beta.checked).toBe(true);
		expect(beta.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(beta.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(getComputedStyle(beta).accentColor).not.toBe('auto');
		expect(getComputedStyle(beta).boxSizing).toBe('border-box');
		expect(disabled.disabled).toBe(true);
		expect(new FormData(form).get('choice')).toBe('b');
		delta.click();
		await settle();
		expect(delta.checked).toBe(true);
		expect(new FormData(form).get('choice')).toBe('d');
		await resetForm(form);
		await expect.poll(() => beta.checked).toBe(true);
		expect(alpha.checked).toBe(false);
		expect(new FormData(form).get('choice')).toBe('b');
	});

	it('preserves typed identity, native FormData, required/invalid and RTL roving focus', async () => {
		render(ChoiceControlsCollectionFixture);
		await settle();

		const group = document.querySelector<HTMLElement>('[data-testid="collection-radio-group"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="collection-radio-form"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="collection-radio-output"]'
		)!;
		const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

		expect(group.getAttribute('aria-required')).toBe('true');
		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(radios[0]?.checked).toBe(true);
		expect(radios[0]?.tabIndex).toBe(0);
		expect(radios[2]?.disabled).toBe(true);
		expect(new FormData(form).get('radio-choice')).toBe('1');
		expect(output.textContent).toBe('number:1:0');

		radios[0]?.focus();
		radios[0]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await settle();
		expect(document.activeElement).toBe(radios[1]);
		expect(radios[1]?.checked).toBe(true);
		expect(output.textContent).toBe('string:1:1');

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-radio-remove-string"]')
			?.click();
		await settle();
		expect(group.querySelectorAll('input[type="radio"]')).toHaveLength(3);
		expect(new FormData(form).get('radio-choice')).toBeNull();

		await activateFormReset(form);
		await expect.poll(() => new FormData(form).get('radio-choice')).toBe('1');
		expect(output.textContent).toBe('number:1:1');
	});

	it('preserves Segmented typed identity, disabled state and external FormValueBridge reset', async () => {
		render(ChoiceControlsCollectionFixture);
		await settle();

		const group = document.querySelector<HTMLElement>('[data-testid="collection-segmented"]')!;
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="collection-segmented-form"]'
		)!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="collection-segmented-output"]'
		)!;
		const segments = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')];

		expect(group.getAttribute('aria-required')).toBe('true');
		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(segments[0]?.getAttribute('aria-checked')).toBe('true');
		expect(segments[2]?.disabled).toBe(true);
		expect(new FormData(form).get('segment-choice')).toBe('1');
		expect(output.textContent).toBe('number:1:0:0');

		segments[0]?.focus();
		segments[0]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await settle();
		expect(document.activeElement).toBe(segments[1]);
		expect(segments[1]?.getAttribute('aria-checked')).toBe('true');
		expect(output.textContent).toBe('string:1:1:1');

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-segmented-clear"]')
			?.click();
		await settle();
		expect(new FormData(form).get('segment-choice')).toBeNull();
		await activateFormReset(form);
		await expect.poll(() => new FormData(form).get('segment-choice')).toBe('1');
		expect(output.textContent).toBe('number:1:1:1');
	});

	it('keeps readonly RadioGroup selection and callbacks inert', async () => {
		const onValueChange = vi.fn();
		render(ZRadioGroup, {
			'aria-label': 'Readonly radio group',
			onValueChange,
			options: [
				{ label: 'One', value: 1 },
				{ label: 'Two', value: 2 }
			],
			readonly: true,
			value: 1
		});
		const group = document.querySelector<HTMLElement>('[role="radiogroup"]')!;
		const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

		expect(group.getAttribute('aria-readonly')).toBe('true');
		radios[1]?.click();
		await settle();
		expect(radios[0]?.checked).toBe(true);
		expect(radios[1]?.checked).toBe(false);
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('keeps readonly Segmented selection and callbacks inert', async () => {
		// @zui-visual ZSegmented selected item and group geometry
		const onValueChange = vi.fn();
		render(ZSegmented, {
			'aria-label': 'Readonly segmented',
			onValueChange,
			options: [
				{ label: 'One', value: 1 },
				{ label: 'Two', value: 2 }
			],
			readonly: true,
			value: 1
		});
		const group = document.querySelector<HTMLElement>('[role="radiogroup"]')!;
		const segments = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')];

		expect(group.getAttribute('aria-readonly')).toBe('true');
		expect(getComputedStyle(group).display).toBe('inline-flex');
		expect(getComputedStyle(group).borderStyle).toBe('solid');
		expect(getComputedStyle(segments[0]!).backgroundColor).not.toBe(
			getComputedStyle(segments[1]!).backgroundColor
		);
		segments[1]?.click();
		await settle();
		expect(segments[0]?.getAttribute('aria-checked')).toBe('true');
		expect(segments[1]?.getAttribute('aria-checked')).toBe('false');
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
