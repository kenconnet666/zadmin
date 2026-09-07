import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import CalendarContentFixture from './CalendarContentFixture.svelte';

describe('Calendar typed content snippets', () => {
	async function openPicker(root: HTMLElement): Promise<HTMLElement> {
		const trigger = root.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;
		await userEvent.click(trigger);
		await tick();
		const contentId = trigger.getAttribute('aria-controls');
		expect(contentId).toBeTruthy();
		return document.getElementById(contentId!)!;
	}

	it('customizes only content while retaining date focus, selection, constraints and navigation', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(CalendarContentFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="calendar-content-form"]')!;
			const calendar = target.querySelector<HTMLElement>('[data-testid="calendar-content"]')!;
			const selected = calendar.querySelector<HTMLElement>('[data-custom-date="2026-09-15"]')!;
			expect(selected.dataset.selected).toBe('true');
			expect(selected.dataset.focused).toBe('true');
			expect(selected.dataset.contextFrozen).toBe('true');
			expect(selected.dataset.direction).toBe('rtl');
			expect(selected.dataset.size).toBe('large');
			const dateHeader = calendar.querySelector<HTMLElement>('[data-custom-calendar-label]')!;
			expect(dateHeader.dataset.direction).toBe('rtl');
			expect(dateHeader.dataset.size).toBe('large');
			expect(
				calendar.querySelector('[data-custom-date="2026-09-10"]')?.getAttribute('data-highlighted')
			).toBe('true');
			const unavailable = calendar.querySelector<HTMLElement>('[data-custom-date="2026-09-20"]')!;
			expect(unavailable.dataset.unavailable).toBe('true');
			expect(unavailable.closest('button')?.disabled).toBe(true);
			expect(calendar.querySelector('[data-outside="true"]')).not.toBeNull();
			expect(selected.closest('button')?.getAttribute('aria-label')).toContain(
				'September 15, 2026'
			);

			await userEvent.click(calendar.querySelector<HTMLElement>('[data-custom-calendar-next]')!);
			await tick();
			expect(calendar.querySelector('[data-custom-calendar-label]')?.textContent).toContain(
				'October 2026'
			);
			expect(new FormData(form).get('date')).toBe('2026-09-15');
			expect(target.querySelector('[data-testid="calendar-content-output"]')?.textContent).toBe(
				'2026-09-15|2026-05|0|0'
			);
			await userEvent.click(
				calendar.querySelector<HTMLElement>('[aria-label*="October 16, 2026"]')!
			);
			await tick();
			expect(new FormData(form).get('date')).toBe('2026-10-16');
			expect(
				calendar.querySelector('[data-custom-date="2026-10-16"]')?.getAttribute('data-selected')
			).toBe('true');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps the period owner and roving grid while custom header pages and custom cells select', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(CalendarContentFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="calendar-content-form"]')!;
			const calendar = target.querySelector<HTMLElement>(
				'[data-testid="period-calendar-content"]'
			)!;
			const selected = calendar.querySelector<HTMLElement>('[data-custom-period="2026-05"]')!;
			expect(selected.dataset.selected).toBe('true');
			expect(selected.dataset.focused).toBe('true');
			expect(selected.dataset.direction).toBe('rtl');
			expect(selected.dataset.size).toBe('small');
			const periodHeader = calendar.querySelector<HTMLElement>('[data-custom-period-label]')!;
			expect(periodHeader.dataset.direction).toBe('rtl');
			expect(periodHeader.dataset.size).toBe('small');
			expect(calendar.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
			await userEvent.click(calendar.querySelector<HTMLElement>('[data-custom-period-next]')!);
			await tick();
			expect(calendar.querySelector('[data-custom-period-label]')?.textContent).toContain('2027');
			expect(new FormData(form).get('period')).toBe('2026-05');
			const february = calendar.querySelector<HTMLElement>('[data-custom-period="2027-02"]')!;
			expect(february.textContent?.trim()).toBe('Feb');
			expect(february.closest('button')?.getAttribute('aria-label')).toContain('February 2027');
			await userEvent.click(february.closest('button')!);
			await tick();
			expect(new FormData(form).get('period')).toBe('2027-02');
			expect(target.querySelector('[data-testid="calendar-content-output"]')?.textContent).toBe(
				'2026-09-15|2027-02|0|1'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('forwards typed Calendar content through date, range and period pickers', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(CalendarContentFixture, { target });
		try {
			await tick();
			const datePicker = target.querySelector<HTMLElement>('[data-testid="custom-date-picker"]')!;
			const dateContent = await openPicker(datePicker);
			expect(dateContent.querySelector('[data-custom-calendar-label]')).not.toBeNull();
			expect(dateContent.querySelector('[data-custom-date="2026-09-15"]')).not.toBeNull();
			await userEvent.click(datePicker.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!);

			const rangePicker = target.querySelector<HTMLElement>(
				'[data-testid="custom-date-range-picker"]'
			)!;
			const rangeContent = await openPicker(rangePicker);
			expect(rangeContent.querySelector('[data-custom-calendar-label]')).not.toBeNull();
			expect(rangeContent.querySelector('[data-custom-date="2026-09-10"]')).not.toBeNull();
			await userEvent.click(rangePicker.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!);

			const periodPicker = target.querySelector<HTMLElement>(
				'[data-testid="custom-period-picker"]'
			)!;
			const periodContent = await openPicker(periodPicker);
			expect(periodContent.querySelector('[data-custom-period-label]')).not.toBeNull();
			expect(periodContent.querySelector('[data-custom-period="2026-05"]')).not.toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
