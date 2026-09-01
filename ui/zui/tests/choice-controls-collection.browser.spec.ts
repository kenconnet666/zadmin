import { tick } from 'svelte';
import { cleanup, render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it } from 'vitest';

import ChoiceControlsCollectionFixture from './ChoiceControlsCollectionFixture.svelte';

afterEach(cleanup);

async function settleCollection(): Promise<void> {
	await Promise.resolve();
	await tick();
}

async function settleReset(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await tick();
}

describe('RadioGroup and Segmented logical collection integration', () => {
	it('keeps native RadioGroup typed selection, RTL roving focus and external form ownership coherent', async () => {
		render(ChoiceControlsCollectionFixture);
		const group = document.querySelector<HTMLElement>('[data-testid="collection-radio-group"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="collection-radio-form"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="collection-radio-output"]'
		)!;
		let radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

		expect(group.getAttribute('aria-required')).toBe('true');
		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(radios).toHaveLength(4);
		expect(radios[0]?.id).not.toBe(radios[1]?.id);
		expect(radios[0]?.checked).toBe(true);
		expect(radios[0]?.tabIndex).toBe(0);
		expect(radios.every(({ required }) => required)).toBe(true);
		expect(radios[2]?.disabled).toBe(true);
		expect(new FormData(form).get('radio-choice')).toBe('1');
		expect(form.checkValidity()).toBe(true);
		expect(output.textContent).toBe('number:1:0');

		const fieldLabel = [...document.querySelectorAll<HTMLLabelElement>('label')].find(
			(label) => label.htmlFor === group.id
		);
		fieldLabel?.click();
		expect(document.activeElement).toBe(radios[0]);
		radios[0]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(radios[1]);
		expect(radios[1]?.checked).toBe(true);
		expect(output.textContent).toBe('string:1:1');
		expect(new FormData(form).get('radio-choice')).toBe('1');
		radios[1]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(radios[3]);
		expect(radios[3]?.checked).toBe(true);
		expect(output.textContent).toBe('number:2:2');
		radios[3]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
		);
		await tick();
		expect(document.activeElement).toBe(radios[1]);
		expect(output.textContent).toBe('string:1:3');

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-radio-remove-string"]')
			?.click();
		await settleCollection();
		radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
		expect(radios).toHaveLength(3);
		expect(document.activeElement).toBe(radios[2]);
		expect(radios.every(({ checked }) => !checked)).toBe(true);
		expect(output.textContent).toBe('string:1:3');
		expect(new FormData(form).get('radio-choice')).toBeNull();
		expect(form.checkValidity()).toBe(false);

		document.querySelector<HTMLButtonElement>('[data-testid="collection-radio-clear"]')?.click();
		await tick();
		expect(output.textContent).toBe('undefined');
		expect(new FormData(form).get('radio-choice')).toBeNull();

		document.querySelector<HTMLButtonElement>('[data-testid="collection-radio-reset"]')?.click();
		await settleReset();
		expect(output.textContent).toBe('number:1:3');
		expect(radios[0]?.checked).toBe(true);
		expect(new FormData(form).get('radio-choice')).toBe('1');
		expect(form.checkValidity()).toBe(true);
	});

	it('keeps Segmented typed selection, nearest focus and FormValueBridge ownership coherent', async () => {
		render(ChoiceControlsCollectionFixture);
		const group = document.querySelector<HTMLElement>('[data-testid="collection-segmented"]')!;
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="collection-segmented-form"]'
		)!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="collection-segmented-output"]'
		)!;
		let segments = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')];

		expect(group.getAttribute('aria-required')).toBe('true');
		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(segments).toHaveLength(4);
		expect(segments[0]?.id).not.toBe(segments[1]?.id);
		expect(segments[0]?.getAttribute('aria-checked')).toBe('true');
		expect(segments[0]?.tabIndex).toBe(0);
		expect(segments[2]?.disabled).toBe(true);
		expect(new FormData(form).get('segment-choice')).toBe('1');
		expect(output.textContent).toBe('number:1:0:0');

		const fieldLabel = [...document.querySelectorAll<HTMLLabelElement>('label')].find(
			(label) => label.htmlFor === group.id
		);
		fieldLabel?.click();
		expect(document.activeElement).toBe(segments[0]);
		segments[0]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(segments[1]);
		expect(segments[1]?.getAttribute('aria-checked')).toBe('true');
		expect(output.textContent).toBe('string:1:1:1');
		expect(new FormData(form).get('segment-choice')).toBe('1');
		segments[1]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(segments[3]);
		expect(segments[3]?.getAttribute('aria-checked')).toBe('true');
		expect(output.textContent).toBe('number:2:2:2');
		segments[3]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
		);
		await tick();
		expect(document.activeElement).toBe(segments[1]);
		expect(output.textContent).toBe('string:1:3:3');

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-segmented-remove-string"]')
			?.click();
		await settleCollection();
		segments = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
		expect(segments).toHaveLength(3);
		expect(document.activeElement).toBe(segments[2]);
		expect(segments.every((segment) => segment.getAttribute('aria-checked') === 'false')).toBe(
			true
		);
		expect(output.textContent).toBe('string:1:3:3');
		expect(new FormData(form).get('segment-choice')).toBe('1');

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-segmented-clear"]')
			?.click();
		await tick();
		expect(output.textContent).toBe('undefined:3:3');
		expect(new FormData(form).get('segment-choice')).toBeNull();

		document
			.querySelector<HTMLButtonElement>('[data-testid="collection-segmented-reset"]')
			?.click();
		await settleReset();
		expect(output.textContent).toBe('number:1:3:3');
		expect(segments[0]?.getAttribute('aria-checked')).toBe('true');
		expect(new FormData(form).get('segment-choice')).toBe('1');
	});

	it('removes disabled RadioGroup and Segmented values from successful form controls', () => {
		render(ChoiceControlsCollectionFixture);
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="collection-disabled-form"]'
		)!;
		expect([...new FormData(form).entries()]).toEqual([]);
	});
});
