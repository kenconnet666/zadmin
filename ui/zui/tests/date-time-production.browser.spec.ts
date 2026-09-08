import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DateFixture from './DateFixture.svelte';
import { resetForm } from './form-reset.js';

function fixture(selector: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(selector);
	if (!element) throw new Error(`Missing production fixture ${selector}.`);
	return element;
}

describe('date and time production contracts', () => {
	it('keeps ZDateField typed segments, ARIA, keyboard, Field ownership and FormData real', async () => {
		// @zui-visual ZDateField segment and group geometry
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const dateField = document.querySelector<HTMLElement>('[aria-label="Date segments"]')!;
		const segments = [...dateField.querySelectorAll<HTMLInputElement>('input')];
		expect(getComputedStyle(dateField).display).toBe('inline-flex');
		// The medium control includes its border in the shared 32px outer height.
		expect(dateField.getBoundingClientRect().height).toBe(32);
		expect(getComputedStyle(segments[0]!).fontFamily).toContain('ui-monospace');
		expect(segments.length).toBeGreaterThanOrEqual(3);
		expect(segments.every((segment) => segment.getAttribute('aria-label'))).toBe(true);
		expect(new FormData(form).get('date')).toBe('2026-08-18');

		const month = segments.find((segment) => segment.getAttribute('aria-label') === 'Month')!;
		month.focus();
		month.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(document.querySelector('[data-testid="date-output"]')?.textContent).toContain(
			'2026-09-18'
		);
		expect(new FormData(form).get('date')).toBe('2026-09-18');
		expect(document.activeElement).toBe(month);
		await resetForm(form);
		await expect.poll(() => new FormData(form).get('date')).toBe('2026-08-18');
	});

	it('replaces a pointer-focused DateField segment before committing its localized FormData', async () => {
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const dateField = document.querySelector<HTMLElement>('[aria-label="Date segments"]')!;
		const month = [...dateField.querySelectorAll<HTMLInputElement>('input')].find(
			(segment) => segment.getAttribute('aria-label') === 'Month'
		)!;

		await userEvent.click(month);
		await userEvent.keyboard('09');
		await expect.poll(() => new FormData(form).get('date')).toBe('2026-09-18');
		expect(month).toHaveValue('09');
	});

	it('defers a composed DateField segment until compositionend before changing FormData', async () => {
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const dateField = document.querySelector<HTMLElement>('[aria-label="Date segments"]')!;
		const segments = [...dateField.querySelectorAll<HTMLInputElement>('input')];
		const month = segments.find((segment) => segment.getAttribute('aria-label') === 'Month')!;
		const day = segments.find((segment) => segment.getAttribute('aria-label') === 'Day')!;

		month.focus();
		month.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		month.value = '09';
		month.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '09',
				inputType: 'insertCompositionText',
				isComposing: true
			})
		);
		await tick();
		expect(month).toHaveValue('09');
		expect(document.activeElement).toBe(month);
		expect(new FormData(form).get('date')).toBe('2026-08-18');

		month.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '09' }));
		await expect.poll(() => new FormData(form).get('date')).toBe('2026-09-18');
		expect(document.activeElement).toBe(day);
	});

	it('does not reclaim externally moved focus or auto-advance an invalid DateField segment', async () => {
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const dateField = document.querySelector<HTMLElement>('[aria-label="Date segments"]')!;
		const segments = [...dateField.querySelectorAll<HTMLInputElement>('input')];
		const month = segments.find((segment) => segment.getAttribute('aria-label') === 'Month')!;
		const reset = form.querySelector<HTMLButtonElement>('button[type="reset"]')!;

		month.focus();
		month.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		month.value = '09';
		month.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '09',
				inputType: 'insertCompositionText',
				isComposing: true
			})
		);
		reset.focus();
		month.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '09' }));
		await expect.poll(() => new FormData(form).get('date')).toBe('2026-09-18');
		expect(document.activeElement).toBe(reset);

		await userEvent.click(month);
		await userEvent.keyboard('13');
		await tick();
		expect(dateField).toHaveAttribute('data-invalid', 'true');
		expect(document.activeElement).toBe(month);
		expect(new FormData(form).get('date')).toBe('2026-09-18');
	});

	it('keeps ZTimeField typed segments, granular keyboard and FormData/reset real', async () => {
		// @zui-visual ZTimeField segment and group geometry
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const timeField = document.querySelector<HTMLElement>('[aria-label="Time segments"]')!;
		const segments = [...timeField.querySelectorAll<HTMLInputElement>('input')];
		expect(getComputedStyle(timeField).display).toBe('inline-flex');
		expect(timeField.getBoundingClientRect().height).toBe(32);
		expect(getComputedStyle(segments[0]!).fontFamily).toContain('ui-monospace');
		expect(segments.length).toBe(3);
		expect(segments.map((segment) => segment.getAttribute('aria-label'))).toEqual([
			'Hour',
			'Minute',
			'Second'
		]);
		expect(new FormData(form).get('time')).toBe('09:30:15');

		const minute = segments[1]!;
		minute.focus();
		minute.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(document.querySelector('[data-testid="date-output"]')?.textContent).toContain(
			'09:31:15'
		);
		expect(new FormData(form).get('time')).toBe('09:31:15');
		await resetForm(form);
		await expect.poll(() => new FormData(form).get('time')).toBe('09:30:15');
	});

	it('keeps ZCalendar grid ARIA, focused-value keyboard navigation, selection and FormData real', async () => {
		await render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const calendar = document.querySelector<HTMLElement>('[role="grid"]')!;
		expect(calendar.getAttribute('aria-label')).toContain('Test calendar');
		expect(calendar.querySelectorAll('[role="gridcell"]').length).toBe(42);
		expect(calendar.querySelector('[aria-selected="true"]')).not.toBeNull();

		const selected = calendar.querySelector<HTMLElement>('[aria-selected="true"]')!;
		selected.focus();
		selected.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(selected.getAttribute('aria-selected')).toBe('true');
		selected.click();
		await tick();
		expect(new FormData(form).get('calendar')).toBeTruthy();
		expect(calendar.querySelector('[aria-selected="true"]')).not.toBeNull();
	});
});
