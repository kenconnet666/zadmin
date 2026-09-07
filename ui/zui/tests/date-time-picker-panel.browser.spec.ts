import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DateTimePickerPanelFixture from './DateTimePickerPanelFixture.svelte';

function panel(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

describe('DateTimePickerPanel production contracts', () => {
	it('reveals each selected time in its own column without moving focus away from the calendar', async () => {
		render(DateTimePickerPanelFixture);
		const target = panel('date-time-panel-local');
		const columns = [...target.querySelectorAll<HTMLElement>('[role="listbox"]')];
		const calendarFocus = target.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]')!;
		calendarFocus.focus({ preventScroll: true });
		await expect
			.poll(() =>
				columns.every((column) => {
					const selected = column.querySelector<HTMLElement>('[aria-selected="true"]');
					if (!selected) return false;
					const item = selected.getBoundingClientRect();
					const viewport = column.getBoundingClientRect();
					return item.top >= viewport.top - 1 && item.bottom <= viewport.bottom + 1;
				})
			)
			.toBe(true);
		expect(document.activeElement).toBe(calendarFocus);
	});
	it('keeps an invalid current time navigable and commits only through the shared footer', async () => {
		render(DateTimePickerPanelFixture);
		const target = panel('date-time-panel-local');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="date-time-panel-values"]'
		)!;
		const columns = [...target.querySelectorAll<HTMLElement>('[role="listbox"]')];
		expect(columns).toHaveLength(3);
		const hourTen = [...columns[0]!.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(option) => option.textContent?.trim() === '10'
		)!;
		hourTen.click();
		await tick();
		expect(output.textContent).toBe('2026-09-07T10:30:15.125|2026-09-07T09:30:15.125|1:0:0:0');
		target
			.querySelector<HTMLButtonElement>('[data-slot="date-time-footer"] button:last-child')!
			.click();
		await tick();
		expect(output.textContent).toBe('2026-09-07T10:30:15.125|2026-09-07T10:30:15.125|1:1:0:0');
	});

	it('evaluates a lazy preset per click as draft intent and lets Cancel restore the parent draft', async () => {
		render(DateTimePickerPanelFixture);
		const target = panel('date-time-panel-local');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="date-time-panel-values"]'
		)!;
		const lazy = [...target.querySelectorAll<HTMLButtonElement>('button')].find(
			(button) => button.textContent?.trim() === 'Lazy date time'
		)!;
		lazy.click();
		await tick();
		expect(output.textContent).toBe('2026-09-09T14:45:30.001|2026-09-07T09:30:15.125|1:0:0:1');
		lazy.click();
		await tick();
		expect(output.textContent).toContain('2026-09-09T14:45:30.002');
		expect(output.textContent).toContain('|2:0:0:2');
		target.querySelector<HTMLButtonElement>('[data-slot="cancel"]')!.click();
		await tick();
		expect(output.textContent).toBe('2026-09-07T09:30:15.125|2026-09-07T09:30:15.125|2:0:1:2');
	});

	it('keeps a DST-gap date in panel navigation so another valid time remains reachable', async () => {
		render(DateTimePickerPanelFixture);
		const target = panel('date-time-panel-dst');
		const marchEight = [...target.querySelectorAll<HTMLButtonElement>('[role="grid"] button')].find(
			(button) => button.getAttribute('aria-label')?.includes('March 8, 2026')
		)!;
		marchEight.click();
		await tick();
		await Promise.resolve();
		expect(
			document.querySelector('[data-testid="date-time-panel-dst-value"]')?.textContent
		).toContain('2026-03-07T02:30:00');
		expect(document.querySelector('[data-testid="date-time-panel-dst-valid"]')?.textContent).toBe(
			'false'
		);
		expect(target.querySelector('[data-slot="date-time-feedback"]')?.textContent?.trim()).toBe(
			'Nonexistent wall time'
		);
		expect(
			target
				.querySelector<HTMLButtonElement>('[role="grid"] [aria-selected="true"]')
				?.textContent?.trim()
		).toBe('8');
		const hourThree = [
			...target.querySelectorAll<HTMLElement>('[role="listbox"][aria-label="Hour"] [role="option"]')
		].find((option) => option.textContent?.trim() === '03')!;
		hourThree.click();
		await tick();
		expect(
			document.querySelector('[data-testid="date-time-panel-dst-value"]')?.textContent
		).toContain('2026-03-08T03:30:00');
		expect(document.querySelector('[data-testid="date-time-panel-dst-valid"]')?.textContent).toBe(
			'true'
		);
		expect(target.querySelector('[data-slot="date-time-feedback"]')).toBeNull();
	});
});
