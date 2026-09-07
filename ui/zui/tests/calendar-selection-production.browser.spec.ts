import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CalendarSelectionProductionFixture from './CalendarSelectionProductionFixture.svelte';

function root(id: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}
function dateButton(calendar: HTMLElement, month: string, dayValue: number): HTMLButtonElement {
	const monthRoot = calendar.querySelector<HTMLElement>(`[data-month="${month}-01"]`)!;
	return [...monthRoot.querySelectorAll<HTMLButtonElement>('[role="gridcell"] button')].find(
		(button) => button.textContent?.trim() === String(dayValue) && button.dataset.outside !== 'true'
	)!;
}

describe('ZCalendar multiple, range and visible-month contracts', () => {
	it('keeps decorative highlighting separate from the actual accessible selection', () => {
		render(CalendarSelectionProductionFixture);
		const calendar = root('calendar-highlight');
		expect(
			calendar.querySelector('[role="grid"]')?.getAttribute('aria-multiselectable')
		).toBeNull();
		expect(calendar.querySelectorAll('[role="gridcell"][aria-selected="true"]')).toHaveLength(1);
		expect(calendar.querySelectorAll('button[data-highlighted="true"]')).toHaveLength(3);
		expect(calendar.querySelectorAll('button[data-selected="true"]')).toHaveLength(1);
	});
	it('keeps one multiple owner, input order, repeated FormData and required empty feedback', async () => {
		render(CalendarSelectionProductionFixture);
		const calendar = root('calendar-multiple');
		const form = root('calendar-selection-form') as HTMLFormElement;
		expect(new FormData(form).getAll('days')).toEqual(['2026-09-10', '2026-09-05']);
		dateButton(calendar, '2026-09', 7).click();
		await tick();
		expect(new FormData(form).getAll('days')).toEqual(['2026-09-10', '2026-09-05', '2026-09-07']);
		for (const value of [10, 5, 7]) {
			dateButton(calendar, '2026-09', value).click();
			await tick();
		}
		expect(new FormData(form).getAll('days')).toEqual([]);
		expect(calendar.dataset.invalid).toBe('true');
	});

	it('shares focus across three months, avoids duplicate outside controls and pages the whole window', async () => {
		render(CalendarSelectionProductionFixture);
		const calendar = root('calendar-multiple');
		expect(calendar.querySelectorAll('[data-slot="grid"]')).toHaveLength(3);
		expect(calendar.querySelectorAll('[data-slot="grid"] thead th').length).toBe(24);
		expect(
			calendar.querySelectorAll<HTMLButtonElement>('button[aria-label*="October 1, 2026"]')
		).toHaveLength(1);
		root('calendar-focus-second').click();
		await tick();
		expect(calendar.querySelectorAll('[data-month="2026-09-01"]')).toHaveLength(1);
		expect(dateButton(calendar, '2026-10', 15).tabIndex).toBe(0);

		dateButton(calendar, '2026-09', 30).focus();
		dateButton(calendar, '2026-09', 30).dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })
		);
		await tick();
		expect(document.activeElement).toBe(dateButton(calendar, '2026-10', 1));
		calendar.querySelectorAll<HTMLButtonElement>('[data-slot="header"] button')[1]!.click();
		await tick();
		expect(calendar.querySelector('[data-month="2026-12-01"]')).not.toBeNull();

		const maximum = root('calendar-maximum');
		expect(maximum.dataset.visibleMonths).toBe('1');
		expect(maximum.querySelectorAll('[data-slot="grid"]')).toHaveLength(1);
		expect(maximum.querySelectorAll('button[aria-label*="December 31, 9999"]')).toHaveLength(1);
		expect(maximum.querySelectorAll('[data-duplicate-outside="true"]').length).toBeGreaterThan(0);
		expect(
			maximum.querySelectorAll<HTMLButtonElement>('[data-slot="header"] button')[1]?.disabled
		).toBe(true);
	});

	it('previews and rejects non-contiguous ranges while the explicit bridge policy accepts them', async () => {
		render(CalendarSelectionProductionFixture);
		const strict = root('calendar-range');
		const form = root('calendar-selection-form') as HTMLFormElement;
		dateButton(strict, '2026-09', 14).click();
		await tick();
		expect(strict.dataset.invalid).toBe('true');
		expect(root('calendar-range-allow-empty').dataset.invalid).toBeUndefined();
		expect(root('calendar-invalid-external').dataset.invalid).toBe('true');
		const sixteenth = dateButton(strict, '2026-09', 16);
		sixteenth.dispatchEvent(new PointerEvent('pointerenter'));
		await tick();
		expect(strict.querySelectorAll('[data-preview-invalid="true"]').length).toBeGreaterThan(0);
		sixteenth.click();
		await tick();
		expect(new FormData(form).get('window.start')).toBe('2026-09-14');
		expect(new FormData(form).get('window.end')).toBeNull();

		const bridge = root('calendar-range-noncontiguous');
		dateButton(bridge, '2026-09', 14).click();
		dateButton(bridge, '2026-09', 16).click();
		await tick();
		expect(new FormData(form).get('bridge.start')).toBe('2026-09-14');
		expect(new FormData(form).get('bridge.end')).toBe('2026-09-16');
	});
});
