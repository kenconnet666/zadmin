import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DateTimeRangePickerProductionFixture from './DateTimeRangePickerProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function root(id: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}
function trigger(id: string): HTMLButtonElement {
	return root(id).querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
}
function dialog(): HTMLElement {
	return document.querySelector<HTMLElement>(
		'[role="dialog"][aria-label="Choose date and time range"]'
	)!;
}

describe('ZDateTimeRangePicker production contracts', () => {
	it('restores a directly edited endpoint when its form model rejects the write', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const target = root('date-time-range-rejected');
		const form = root('date-time-range-rejected-form') as HTMLFormElement;
		const day = target.querySelector<HTMLInputElement>(
			'[data-slot="start-field"] input[id$="-day"]'
		)!;
		day.focus();
		day.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		await expect.poll(() => day.value).toBe('07');
		expect(new FormData(form).get('window.start')).toBe('2026-09-07T09:30:00');
		expect(root('date-time-range-rejected-output').textContent).toBe('0:0');

		const clear = target.querySelector<HTMLButtonElement>('[data-slot="clear"]');
		expect(clear).not.toBeNull();
		clear!.click();
		await tick();
		expect(new FormData(form).getAll('window.start')).toEqual(['2026-09-07T09:30:00']);
		expect(new FormData(form).getAll('window.end')).toEqual(['2026-09-08T17:30:00']);
		expect(root('date-time-range-rejected-output').textContent).toBe('0:0');
	});
	it('keeps one root owner, partial FormData, disabled/readonly semantics and reset real', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const form = root('date-time-range-form') as HTMLFormElement;
		expect(new FormData(form).get('deployment.start')).toBe('2026-09-07T09:30:00');
		expect(new FormData(form).get('deployment.end')).toBe('2026-09-08T17:30:00');
		expect(new FormData(form).get('partial.start')).toBe('2026-09-07T09:30:00');
		expect(new FormData(form).get('partial.end')).toBeNull();
		expect(new FormData(form).get('readonly-window.start')).toBe('2026-09-07T09:30:00');
		expect(new FormData(form).get('disabled-window.start')).toBeNull();
		expect(trigger('date-time-range-readonly').disabled).toBe(true);
		expect(trigger('date-time-range-disabled').disabled).toBe(true);
		const disabledGroup = root('date-time-range-disabled').querySelector<HTMLElement>(
			'[data-slot="end-field"] > [data-slot="input-group"]'
		)!;
		expect(Number(getComputedStyle(disabledGroup).opacity)).toBeLessThan(1);
		expect(getComputedStyle(trigger('date-time-range-disabled')).opacity).toBe('1');
		await resetForm(form);
		await expect.poll(() => new FormData(form).get('deployment.start')).toBe('2026-09-07T09:30:00');
	});

	it('allows readonly inline range navigation without writing either endpoint', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const form = root('date-time-range-form') as HTMLFormElement;
		const inline = root('date-time-range-inline-readonly');
		const parts = inline.querySelectorAll<HTMLButtonElement>('[data-slot="range-parts"] button');
		const clear = inline.querySelector<HTMLButtonElement>('[data-slot="clear"]')!;
		const confirm = inline.querySelector<HTMLButtonElement>(
			'[data-slot="date-time-footer"] button:last-child'
		)!;

		expect(inline.dataset.presentation).toBe('inline');
		expect(inline.dataset.rangePart).toBe('start');
		expect(parts[1]?.disabled).toBe(false);
		parts[1]!.click();
		await tick();
		expect(inline.dataset.rangePart).toBe('end');
		expect(parts[1]?.getAttribute('aria-pressed')).toBe('true');
		const readableDate = [
			...inline.querySelectorAll<HTMLButtonElement>('[role="gridcell"] button')
		].find((button) => button.dataset.outside !== 'true')!;
		expect(readableDate.isConnected).toBe(true);
		expect(clear.disabled).toBe(true);
		expect(confirm.disabled).toBe(true);
		readableDate.click();
		clear.click();
		confirm.click();
		await tick();
		expect(new FormData(form).getAll('inline-readonly-window.start')).toEqual([
			'2026-09-07T09:30:00'
		]);
		expect(new FormData(form).getAll('inline-readonly-window.end')).toEqual([
			'2026-09-08T17:30:00'
		]);
	});

	it('keeps raw field drafts out of the owner and rolls both composite fields back on Escape', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const picker = root('date-time-range');
		const day = picker.querySelector<HTMLInputElement>(
			'[data-slot="start-field"] input[aria-label="Day"]'
		)!;
		day.value = '1';
		day.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(picker.dataset.invalid).toBe('true');
		expect(
			new FormData(root('date-time-range-form') as HTMLFormElement).get('deployment.start')
		).toBe('2026-09-07T09:30:00');
		day.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(day.value).toBe('07');
		expect(picker.dataset.invalid).toBeUndefined();
	});

	it('keeps confirm presets draft-only until footer confirmation and cancel discards', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const form = root('date-time-range-form') as HTMLFormElement;
		trigger('date-time-range').click();
		await tick();
		let popup = dialog();
		popup.querySelector<HTMLButtonElement>('[data-slot="range-presets"] button')!.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('2026-09-07T09:30:00');
		popup.querySelector<HTMLButtonElement>('[data-slot="cancel"]')!.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('2026-09-07T09:30:00');

		trigger('date-time-range').click();
		await tick();
		popup = dialog();
		popup.querySelector<HTMLButtonElement>('[data-slot="range-presets"] button')!.click();
		await tick();
		popup
			.querySelector<HTMLButtonElement>('[data-slot="date-time-footer"] button:last-child')!
			.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('2026-09-11T08:00:00');
		expect(root('date-time-range-output').textContent).toContain('|1|1');
	});

	it('commits immediate presets without closing and preserves zoned instants plus instance direction', async () => {
		await render(DateTimeRangePickerProductionFixture);
		trigger('date-time-range-immediate').click();
		await tick();
		const popup = dialog();
		popup.querySelector<HTMLButtonElement>('[data-slot="range-presets"] button')!.click();
		await tick();
		expect(root('date-time-range-immediate-output').textContent).toContain('2026-09-11T08:00:00');
		expect(root('date-time-range-immediate-output').textContent).toContain('|1');
		expect(trigger('date-time-range-immediate').getAttribute('aria-expanded')).toBe('true');

		const zoned = root('date-time-range-zoned');
		expect(zoned.dir).toBe('ltr');
		expect(zoned.dataset.mode).toBe('zoned');
		expect(zoned.textContent).toContain('EDT');
		expect(
			new FormData(root('date-time-range-zoned-form') as HTMLFormElement).get('zoned-window.start')
		).toBe('2026-11-01T01:30:00-04:00[America/New_York]');
	});

	it('keeps a boundary-day draft when its carried time is invalid so a valid time remains reachable', async () => {
		await render(DateTimeRangePickerProductionFixture);
		const form = root('date-time-range-form') as HTMLFormElement;
		trigger('date-time-range-boundary').click();
		await tick();
		const popup = dialog();
		const daySeven = [
			...popup.querySelectorAll<HTMLButtonElement>('[role="gridcell"] button')
		].find((button) => button.textContent?.trim() === '7' && button.dataset.outside !== 'true')!;
		daySeven.click();
		await tick();
		expect(new FormData(form).get('boundary.start')).toBe('2026-09-08T09:30:00');
		expect(
			popup.querySelector<HTMLButtonElement>('[data-slot="range-parts"] button')?.textContent
		).toContain('09/07/2026');
		expect(
			popup.querySelector<HTMLButtonElement>('[data-slot="range-parts"] button')?.textContent
		).toContain('9:30');

		const hours = popup.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		const hourTen = [...hours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(option) => option.textContent?.trim() === '10'
		)!;
		expect(hourTen.getAttribute('aria-disabled')).not.toBe('true');
		hourTen.click();
		popup
			.querySelector<HTMLButtonElement>('[data-slot="date-time-footer"] button:last-child')!
			.click();
		await tick();
		expect(new FormData(form).get('boundary.start')).toBe('2026-09-07T10:30:00');
	});
});
