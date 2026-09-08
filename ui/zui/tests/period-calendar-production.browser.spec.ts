import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { mount, unmount } from './browser-lifecycle.js';
import PeriodCalendarProductionFixture from './PeriodCalendarProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function cell(testId: string, label: string): HTMLButtonElement {
	return [...root(testId).querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')].find(
		(button) =>
			button.getAttribute('aria-label')?.includes(label) ||
			button.textContent?.trim().includes(label)
	)!;
}

describe('ZPeriodCalendar production contracts', () => {
	it('keeps one owner, independent roving focus, discriminated FormData and reset', async () => {
		// @zui-visual ZPeriodCalendar header, finite grid, selection, range and week geometry
		await render(PeriodCalendarProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="period-form"]')!;
		const month = root('period-month');
		const may = cell('period-month', 'May');
		expect(month.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(new FormData(form).get('month')).toBe('2026-05');
		expect(new FormData(form).getAll('quarters')).toEqual(['2026-Q1@fs=04', '2026-Q3@fs=04']);
		expect(new FormData(form).getAll('years.start')).toEqual(['2025']);
		expect(new FormData(form).getAll('years.end')).toEqual([]);
		expect(new FormData(form).getAll('weeks')).toEqual(['2026-W10@fd=sun,md=1']);
		expect(new FormData(form).has('ignored')).toBe(false);
		expect(new FormData(form).has('disabled-period')).toBe(false);
		expect(new FormData(form).get('readonly-period')).toBe('2026-05');
		expect(root('period-disabled').dataset.invalid).toBeUndefined();

		may.focus();
		may.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement?.getAttribute('aria-label')).toContain('June');
		expect(new FormData(form).get('month')).toBe('2026-05');
		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
		);
		await tick();
		expect(new FormData(form).get('month')).toBe('2026-06');
		expect(document.querySelector('[data-testid="period-values"]')?.textContent).toContain(
			'2026-6|'
		);

		await resetForm(form);
		await expect.poll(() => new FormData(form).get('month')).toBe('2026-05');
		expect(document.querySelector('[data-testid="period-values"]')?.textContent).toContain(
			'2026-5|'
		);
	});

	it('aligns visual grids with keyboard columns, wraps weekly cells and keeps month text compact', async () => {
		await render(PeriodCalendarProductionFixture);
		await tick();
		for (const [testId, columns, rows] of [
			['period-month', 4, 3],
			['period-quarter', 2, 2],
			['period-year-range', 4, 3],
			['period-week', 1, 12]
		] as const) {
			const calendar = root(testId);
			const rowElements = [...calendar.querySelectorAll<HTMLElement>('[data-slot="row"]')];
			expect(rowElements).toHaveLength(rows);
			for (const row of rowElements) {
				expect(getComputedStyle(row).display).toBe('grid');
				expect(row.children).toHaveLength(columns);
				expect(getComputedStyle(row).gridTemplateColumns.split(' ')).toHaveLength(columns);
				for (const gridCell of row.children) {
					const button = gridCell.querySelector<HTMLButtonElement>('[data-slot="cell"]')!;
					expect(button.getBoundingClientRect().width).toBeCloseTo(
						(gridCell as HTMLElement).getBoundingClientRect().width,
						1
					);
				}
			}
		}

		const may = cell('period-month', 'May');
		expect(may.textContent?.trim()).toBe('May');
		expect(may.getAttribute('aria-label')).toContain('May 2026');
		for (const week of root('period-week').querySelectorAll<HTMLButtonElement>(
			'[data-slot="cell"]'
		)) {
			expect(week.getBoundingClientRect().height).toBeGreaterThanOrEqual(32);
			expect(week.scrollHeight).toBeLessThanOrEqual(week.clientHeight + 1);
		}
	});

	it('keeps the year-one page stable and derives navigation icons from rendered direction', async () => {
		await render(PeriodCalendarProductionFixture);
		await tick();
		const boundary = root('period-year-boundary');
		const labels = [...boundary.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')].map(
			(button) => button.textContent?.trim()
		);
		expect(labels.at(0)).toBe('1');
		expect(labels.at(-1)).toBe('12');
		expect(boundary.querySelector<HTMLButtonElement>('[data-slot="header"] button')?.disabled).toBe(
			true
		);

		const automatic = root('period-auto-direction');
		expect(getComputedStyle(automatic).direction).toBe('rtl');
		const icons = automatic.querySelectorAll<SVGElement>('[data-slot="header"] svg');
		expect(icons[0]?.getAttribute('class')).toContain('chevron-right');
		expect(icons[1]?.getAttribute('class')).toContain('chevron-left');
	});

	it('toggles multiple values, previews a contiguous range and keeps week cells semantically weekly', async () => {
		await render(PeriodCalendarProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="period-form"]')!;
		cell('period-quarter', 'Q2').click();
		await tick();
		expect(new FormData(form).getAll('quarters')).toEqual([
			'2026-Q1@fs=04',
			'2026-Q3@fs=04',
			'2026-Q2@fs=04'
		]);

		const range = root('period-year-range');
		expect(range.dataset.invalid).toBe('true');
		const year2027 = cell('period-year-range', '2027');
		year2027.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await tick();
		expect(range.querySelectorAll('[data-range-preview="true"]')).toHaveLength(3);
		year2027.click();
		await tick();
		expect(range.dataset.invalid).toBeUndefined();
		expect(new FormData(form).get('years.start')).toBe('2025');
		expect(new FormData(form).get('years.end')).toBe('2027');

		const week = root('period-week');
		const weekCells = week.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]');
		expect(weekCells).toHaveLength(12);
		expect(week.querySelectorAll('[role="gridcell"]')).toHaveLength(12);
		expect(week.querySelectorAll('[data-slot="week-range"]')).toHaveLength(12);
		expect(weekCells[0]?.getAttribute('aria-label')).toMatch(/^W\d{2} 2026/u);
	});

	it('rejects unavailable interior periods unless a range explicitly allows non-contiguity', async () => {
		await render(PeriodCalendarProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="period-form"]')!;
		const strict = root('period-year-range-strict');
		const nonContiguous = root('period-year-range-noncontiguous');
		const strict2027 = cell('period-year-range-strict', '2027');
		const nonContiguous2027 = cell('period-year-range-noncontiguous', '2027');

		expect(cell('period-year-range-strict', '2026').disabled).toBe(true);
		expect(cell('period-year-range-noncontiguous', '2026').disabled).toBe(true);
		for (const year of ['2024', '2028']) {
			expect(cell('period-year-range-strict', year)).toBeDisabled();
			expect(cell('period-year-range-noncontiguous', year)).toBeDisabled();
		}
		strict2027.click();
		await tick();
		expect(new FormData(form).getAll('strict-years.start')).toEqual(['2025']);
		expect(new FormData(form).getAll('strict-years.end')).toEqual([]);
		expect(strict.querySelector('[data-slot="feedback"]')).not.toBeNull();

		nonContiguous2027.click();
		await tick();
		expect(new FormData(form).getAll('noncontiguous-years.start')).toEqual(['2025']);
		expect(new FormData(form).getAll('noncontiguous-years.end')).toEqual(['2027']);
		expect(nonContiguous.querySelector('[data-range-edge="end"]')?.textContent).toContain('2027');
	});

	it('keeps focusedValue independent when an external owner replaces the selected period', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(PeriodCalendarProductionFixture, { target: host });
		try {
			await tick();
			const form = host.querySelector<HTMLFormElement>('[data-testid="period-form"]')!;
			const may = cell('period-month', 'May');
			may.focus();
			may.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
			await tick();
			const focusedJune = document.activeElement;
			expect(focusedJune?.getAttribute('aria-label')).toContain('June');

			component.setExternalMonth();
			await tick();
			expect(new FormData(form).get('month')).toBe('2027-02');
			expect(document.activeElement).toBe(focusedJune);
			expect(host.querySelector('[data-testid="period-values"]')?.textContent).toContain('|0:1|');
		} finally {
			await unmount(component);
			host.remove();
		}
	});

	it('keeps readonly and controlled rejection authoritative while required still permits clearing', async () => {
		await render(PeriodCalendarProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="period-form"]')!;
		cell('period-readonly', 'June').click();
		cell('period-rejected', 'June').click();
		await tick();
		expect(new FormData(form).get('readonly-period')).toBe('2026-05');
		expect(root('period-rejected').querySelector('[data-selected="true"]')?.textContent).toContain(
			'May'
		);
		expect(document.querySelector('[data-testid="period-values"]')?.textContent).toContain(
			'|2026-5:1'
		);

		cell('period-month', 'May').click();
		await tick();
		expect(new FormData(form).has('month')).toBe(false);
		expect(root('period-month').dataset.invalid).toBe('true');
	});
});
