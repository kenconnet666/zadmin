import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DateFixture from './DateFixture.svelte';

function fixture(selector: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(selector);
	if (!element) throw new Error(`Missing production fixture ${selector}.`);
	return element;
}

describe('date and time production contracts', () => {
	it('keeps ZDateField typed segments, ARIA, keyboard, Field ownership and FormData real', async () => {
		render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const dateField = document.querySelector<HTMLElement>('[aria-label="Date segments"]')!;
		const segments = [...dateField.querySelectorAll<HTMLInputElement>('input')];
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
		form.reset();
		await expect.poll(() => new FormData(form).get('date')).toBe('2026-08-18');
	});

	it('keeps ZTimeField typed segments, granular keyboard and FormData/reset real', async () => {
		render(DateFixture);
		const form = fixture('[data-testid="date-form"]') as HTMLFormElement;
		const timeField = document.querySelector<HTMLElement>('[aria-label="Time segments"]')!;
		const segments = [...timeField.querySelectorAll<HTMLInputElement>('input')];
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
		form.reset();
		await expect.poll(() => new FormData(form).get('time')).toBe('09:30:15');
	});

	it('keeps ZCalendar grid ARIA, focused-value keyboard navigation, selection and FormData real', async () => {
		render(DateFixture);
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
