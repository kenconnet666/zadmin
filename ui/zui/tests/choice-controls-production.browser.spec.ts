import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { ZRadioGroup, ZSegmented } from '../src/entrypoints/index.js';
import ChoiceControlsCollectionFixture from './ChoiceControlsCollectionFixture.svelte';

async function settle(): Promise<void> {
	await Promise.resolve();
	await tick();
}

describe('ZRadioGroup, ZRadioGroupItem and ZSegmented production contracts', () => {
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

		document.querySelector<HTMLButtonElement>('[data-testid="collection-radio-reset"]')?.click();
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
		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-segmented-reset"]')
			?.click();
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
		segments[1]?.click();
		await settle();
		expect(segments[0]?.getAttribute('aria-checked')).toBe('true');
		expect(segments[1]?.getAttribute('aria-checked')).toBe('false');
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
