import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DateFixture from './DateFixture.svelte';
import DateProductionFixture from './DateProductionFixture.svelte';

describe('date picker production contracts', () => {
	it('keeps ZDatePicker trigger ARIA, dialog keyboard dismissal, Field owner and FormData real', async () => {
		render(DateFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="date-form"]')!;
		const trigger = [
			...document.querySelectorAll<HTMLButtonElement>('[aria-haspopup="dialog"]')
		].find((button) => button.getAttribute('aria-label')?.startsWith('Pick date'))!;
		const pickedLabel = [...form.querySelectorAll<HTMLLabelElement>('label')].find((label) =>
			label.textContent?.includes('Picked date')
		)!;
		const control = document.getElementById(pickedLabel.htmlFor) as HTMLInputElement;
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-controls')).toBeTruthy();
		expect(control.required).toBe(true);
		expect(new FormData(form).get('picked')).toBe('2026-08-18');

		trigger.click();
		await tick();
		const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(dialog.querySelector('[role="grid"]')).not.toBeNull();
		const nextDay = [
			...dialog.querySelectorAll<HTMLButtonElement>('[role="gridcell"] button')
		].find((button) => button.textContent?.trim() === '19' && button.dataset.outside !== 'true')!;
		nextDay.click();
		await tick();
		expect(new FormData(form).get('picked')).toBe('2026-08-19');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);

		trigger.click();
		await tick();
		const reopened = document.querySelector<HTMLElement>('[role="dialog"]')!;
		reopened.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});

	it('keeps ZDateRangePicker ordered values, partial FormData and reset owner realm real', async () => {
		render(DateProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="date-production-form"]')!;
		const rangeTrigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="production-range-picker"] button[aria-haspopup="dialog"]'
		);
		expect(rangeTrigger).toBeTruthy();
		expect(new FormData(form).get('window.start')).toBe('2026-09-16');
		expect(new FormData(form).get('window.end')).toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="production-reverse"]')!.click();
		await tick();
		expect(new FormData(form).get('window.start')).toBe('2026-09-20');
		expect(new FormData(form).get('window.end')).toBe('2026-09-28');
		document.querySelector<HTMLButtonElement>('[data-testid="production-clear"]')!.click();
		await tick();
		expect(new FormData(form).get('window.start')).toBeNull();
		expect(new FormData(form).get('window.end')).toBeNull();
		form.reset();
		await expect.poll(() => new FormData(form).get('window.start')).toBe('2026-09-16');
	});
});
