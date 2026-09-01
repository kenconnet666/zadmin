import { tick } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';

import ReadonlyControlsFixture from './ReadonlyControlsFixture.svelte';

async function settleReset(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await tick();
}

describe('readonly native choice and range controls', () => {
	it('keeps controls focusable and successful while suppressing user mutations and callbacks', async () => {
		render(ReadonlyControlsFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="readonly-controls-form"]')!;
		const checkbox = document.querySelector<HTMLInputElement>('[data-testid="readonly-checkbox"]')!;
		const slider = document.querySelector<HTMLInputElement>('[data-testid="readonly-slider"]')!;
		const radioGroup = document.querySelector<HTMLElement>('[data-testid="readonly-radio-group"]')!;
		const radioBeta = document.querySelector<HTMLInputElement>('[data-testid="readonly-radio-b"]')!;
		const radioDelta = document.querySelector<HTMLInputElement>(
			'[data-testid="readonly-radio-d"]'
		)!;
		const segmented = document.querySelector<HTMLElement>('[data-testid="readonly-segmented"]')!;
		const segmentBeta = segmented.querySelector<HTMLButtonElement>('[aria-checked="true"]')!;
		const segmentDelta = [...segmented.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
			(item) => item.textContent === 'Delta'
		)!;
		const events = document.querySelector<HTMLOutputElement>(
			'[data-testid="readonly-control-events"]'
		)!;

		expect(checkbox.disabled).toBe(false);
		expect(checkbox.required).toBe(true);
		expect(checkbox.getAttribute('aria-invalid')).toBe('true');
		expect(checkbox.getAttribute('aria-readonly')).toBe('true');
		expect(checkbox.dataset.readonly).toBe('true');
		expect(slider.disabled).toBe(false);
		expect(slider.required).toBe(true);
		expect(slider.getAttribute('aria-invalid')).toBe('true');
		expect(slider.getAttribute('aria-readonly')).toBe('true');
		expect(slider.dir).toBe('rtl');
		expect(radioGroup.getAttribute('aria-invalid')).toBe('true');
		expect(radioGroup.getAttribute('aria-readonly')).toBe('true');
		expect(radioBeta.disabled).toBe(false);
		expect(radioBeta.required).toBe(true);
		expect(segmented.getAttribute('aria-readonly')).toBe('true');
		expect([...new FormData(form).entries()]).toEqual([
			['consent', 'yes'],
			['threshold', '35'],
			['choice', 'b'],
			['period', 'b']
		]);

		checkbox.focus();
		checkbox.click();
		checkbox.checked = false;
		checkbox.dispatchEvent(new Event('change', { bubbles: true }));
		expect(document.activeElement).toBe(checkbox);
		expect(checkbox.checked).toBe(true);

		slider.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
		const sliderKey = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowLeft'
		});
		slider.dispatchEvent(sliderKey);
		slider.value = '90';
		slider.dispatchEvent(new InputEvent('input', { bubbles: true }));
		slider.dispatchEvent(new Event('change', { bubbles: true }));
		expect(sliderKey.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(slider);
		expect(slider.valueAsNumber).toBe(35);

		radioBeta.focus();
		radioBeta.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(radioDelta);
		expect(radioBeta.checked).toBe(true);
		expect(radioDelta.checked).toBe(false);
		radioDelta.click();
		radioDelta.checked = true;
		radioDelta.dispatchEvent(new Event('change', { bubbles: true }));
		expect(radioBeta.checked).toBe(true);
		expect(radioDelta.checked).toBe(false);

		segmentBeta.focus();
		segmentBeta.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(document.activeElement).toBe(segmentDelta);
		expect(segmentBeta.getAttribute('aria-checked')).toBe('true');
		segmentDelta.click();
		expect(segmentBeta.getAttribute('aria-checked')).toBe('true');
		expect([...new FormData(form).entries()]).toEqual([
			['consent', 'yes'],
			['threshold', '35'],
			['choice', 'b'],
			['period', 'b']
		]);
		expect(events.textContent).toBe('0:0:0|0:0:0:0:0|0:0:0:0|0:0');
	});

	it('accepts owner updates and reset without synthesizing user callbacks', async () => {
		render(ReadonlyControlsFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="readonly-controls-form"]')!;
		const values = document.querySelector<HTMLOutputElement>(
			'[data-testid="readonly-control-values"]'
		)!;
		const events = document.querySelector<HTMLOutputElement>(
			'[data-testid="readonly-control-events"]'
		)!;

		document.querySelector<HTMLButtonElement>('[data-testid="readonly-owner-update"]')?.click();
		await tick();
		expect(values.textContent).toBe('false:55:d:d');
		expect([...new FormData(form).entries()]).toEqual([
			['threshold', '55'],
			['choice', 'd'],
			['period', 'd']
		]);
		expect(events.textContent).toBe('0:0:0|0:0:0:0:0|0:0:0:0|0:0');

		document.querySelector<HTMLButtonElement>('[data-testid="readonly-reset"]')?.click();
		await settleReset();
		expect(values.textContent).toBe('true:35:b:b');
		expect([...new FormData(form).entries()]).toEqual([
			['consent', 'yes'],
			['threshold', '35'],
			['choice', 'b'],
			['period', 'b']
		]);
		expect(events.textContent).toBe('0:0:0|0:0:0:0:0|0:0:0:0|0:0');
	});

	it('does not let explicit false bypass inherited Field readonly safety boundaries', async () => {
		render(ReadonlyControlsFixture);
		const checkbox = document.querySelector<HTMLInputElement>('[data-testid="boundary-checkbox"]')!;
		const slider = document.querySelector<HTMLInputElement>('[data-testid="boundary-slider"]')!;
		const radioGroup = document.querySelector<HTMLElement>('[data-testid="boundary-radio-group"]')!;
		const radioBeta = document.querySelector<HTMLInputElement>('[data-testid="boundary-radio-b"]')!;
		const segmented = document.querySelector<HTMLElement>('[data-testid="boundary-segmented"]')!;
		const segmentBeta = [...segmented.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
			(item) => item.textContent === 'Beta'
		)!;
		const values = document.querySelector<HTMLOutputElement>(
			'[data-testid="readonly-boundary-values"]'
		)!;

		expect(checkbox.getAttribute('aria-readonly')).toBe('true');
		expect(slider.getAttribute('aria-readonly')).toBe('true');
		expect(radioGroup.getAttribute('aria-readonly')).toBe('true');
		expect(segmented.getAttribute('aria-readonly')).toBe('true');
		checkbox.click();
		slider.value = '20';
		slider.dispatchEvent(new InputEvent('input', { bubbles: true }));
		radioBeta.click();
		segmentBeta.click();
		await tick();
		expect(values.textContent).toBe('false:10:a:a');
	});
});
