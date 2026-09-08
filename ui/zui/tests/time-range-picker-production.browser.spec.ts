import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TimeRangePickerProductionFixture from './TimeRangePickerProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}
function trigger(testId: string): HTMLButtonElement {
	return root(testId).querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
}
function dialog(label: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[role="dialog"][aria-label="${label}"]`)!;
}

describe('ZTimeRangePicker production contracts', () => {
	it('keeps one owner, partial FormData, external sync, clear and owner-realm reset real', async () => {
		// @zui-visual ZTimeRangePicker resolved range InputGroup geometry
		await render(TimeRangePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-range-form"]')!;
		const range = root('time-range');
		expect(range.querySelectorAll('[data-zui-composite-control]')).toHaveLength(2);
		expect(
			range.querySelector<HTMLElement>('[data-slot="range-inputs"]')?.getBoundingClientRect().height
		).toBe(40);
		expect(new FormData(form).getAll('deployment.start')).toEqual(['09:30:00']);
		expect(new FormData(form).getAll('deployment.end')).toEqual(['10:30:00']);
		expect(new FormData(form).get('partial.start')).toBeNull();
		expect(new FormData(form).get('partial.end')).toBe('17:00:00');
		expect(new FormData(form).get('readonly-window.start')).toBe('09:30:00');
		expect(new FormData(form).get('disabled-window.start')).toBeNull();
		expect(
			[...range.querySelectorAll<HTMLInputElement>('input')].every((input) => input.required)
		).toBe(true);
		expect(trigger('time-range-readonly').disabled).toBe(true);
		expect(root('time-range-readonly').querySelector<HTMLInputElement>('input')?.readOnly).toBe(
			true
		);
		expect(trigger('time-range-disabled').disabled).toBe(true);
		const disabledGroup = root('time-range-disabled').querySelector<HTMLElement>(
			'[data-slot="range-inputs"]'
		)!;
		expect(Number(getComputedStyle(disabledGroup).opacity)).toBeLessThan(1);
		expect(getComputedStyle(trigger('time-range-disabled')).opacity).toBe('1');

		root('time-range-external').click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('08:00:00');
		expect(document.querySelector('[data-testid="time-range-output"]')?.textContent).toContain(
			'|0|0'
		);

		range.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBeNull();
		expect(document.querySelector('[data-testid="time-range-output"]')?.textContent).toContain(
			'|1|1'
		);

		await resetForm(form);
		await expect.poll(() => new FormData(form).get('deployment.start')).toBe('09:30:00');
		expect(new FormData(form).get('deployment.end')).toBe('10:30:00');
		expect(trigger('time-range').getAttribute('aria-expanded')).toBe('false');
	});

	it('keeps panel edits draft-only, cancel discards and confirm commits the complete range', async () => {
		await render(TimeRangePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-range-form"]')!;
		trigger('time-range').click();
		await tick();
		let popup = dialog('Choose time range');
		const startHours = popup.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		const hourEight = [...startHours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === '08'
		)!;
		hourEight.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('09:30:00');
		popup.querySelector<HTMLButtonElement>('[data-slot="cancel"]')!.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('09:30:00');

		trigger('time-range').click();
		await tick();
		popup = dialog('Choose time range');
		const partButtons = popup.querySelectorAll<HTMLButtonElement>(
			'[data-slot="range-parts"] button'
		);
		partButtons[1]!.click();
		await tick();
		const endHours = popup.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		const unavailableTwelve = [...endHours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === '12'
		)!;
		expect(unavailableTwelve.getAttribute('aria-disabled')).toBe('true');
		const hourEleven = [...endHours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === '11'
		)!;
		hourEleven.click();
		await tick();
		popup.querySelector<HTMLButtonElement>('[data-slot="footer"] button:last-child')!.click();
		await tick();
		expect(new FormData(form).get('deployment.end')).toBe('11:30:00');
		expect(document.querySelector('[data-testid="time-range-output"]')?.textContent).toContain(
			'|1|1'
		);
	});

	it('rejects an ordered cross-midnight field draft atomically and restores both business entries on Escape', async () => {
		await render(TimeRangePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-range-form"]')!;
		const range = root('time-range');
		const endHour = range.querySelector<HTMLInputElement>('[data-slot="end-field"] input')!;

		await userEvent.click(endHour);
		await userEvent.keyboard('08');
		await tick();
		expect(range).toHaveAttribute('data-invalid', 'true');
		expect(endHour).toHaveValue('08');
		expect(new FormData(form).getAll('deployment.start')).toEqual(['09:30:00']);
		expect(new FormData(form).getAll('deployment.end')).toEqual(['10:30:00']);

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => endHour.value).toBe('10');
		expect(range).not.toHaveAttribute('data-invalid');
		expect(new FormData(form).get('deployment.start')).toBe('09:30:00');
		expect(new FormData(form).get('deployment.end')).toBe('10:30:00');
	});

	it('discards an open panel draft during form reset without committing either endpoint', async () => {
		await render(TimeRangePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-range-form"]')!;
		trigger('time-range').click();
		await tick();
		const popup = dialog('Choose time range');
		const startHours = popup.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		const hourEight = [...startHours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === '08'
		)!;
		hourEight.click();
		await tick();
		expect(new FormData(form).get('deployment.start')).toBe('09:30:00');

		await resetForm(form);
		await expect.poll(() => trigger('time-range').getAttribute('aria-expanded')).toBe('false');
		await expect
			.poll(() => document.querySelector('[role="dialog"][aria-label="Choose time range"]'))
			.toBeNull();
		expect(new FormData(form).get('deployment.start')).toBe('09:30:00');
		expect(new FormData(form).get('deployment.end')).toBe('10:30:00');
		expect(document.querySelector('[data-testid="time-range-output"]')?.textContent).toContain(
			'|0|0'
		);
	});

	it('keeps range presets draft-only, overnight order explicit and instance direction authoritative', async () => {
		await render(TimeRangePickerProductionFixture);
		const overnight = root('time-range-overnight');
		expect(overnight.dataset.overnight).toBe('true');
		expect(overnight.dir).toBe('ltr');
		trigger('time-range-overnight').click();
		await expect
			.poll(() => document.querySelector('[role="dialog"][aria-label="选择时间范围"]'))
			.not.toBeNull();
		const popup = dialog('选择时间范围');
		expect(popup.dir).toBe('ltr');
		const columns = [...popup.querySelectorAll<HTMLElement>('[role="listbox"]')];
		columns[0]!.focus();
		columns[0]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(columns[1]);
		popup.querySelector<HTMLButtonElement>('[data-slot="range-presets"] button')!.click();
		await tick();
		expect(
			overnight.querySelector<HTMLInputElement>('[data-slot="start-field"] input')?.value
		).toBe('23');
		popup.querySelector<HTMLButtonElement>('[data-slot="footer"] button:last-child')!.click();
		await tick();
		expect(overnight.dataset.overnight).toBe('true');
		expect(
			overnight.querySelector<HTMLInputElement>('[data-slot="start-field"] input')?.value
		).toBe('22');
		expect(overnight.querySelectorAll('[data-zui-form-value]')).toHaveLength(0);
	});

	it('resynchronizes both fields and keeps the popover open when a controlled owner rejects confirm', async () => {
		await render(TimeRangePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-range-form"]')!;
		trigger('time-range-rejected').click();
		await tick();
		const popup = dialog('Choose time range');
		popup.querySelectorAll<HTMLButtonElement>('[data-slot="range-parts"] button')[1]!.click();
		await tick();
		const hours = popup.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		const eleven = [...hours.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === '11'
		)!;
		eleven.click();
		await tick();
		popup.querySelector<HTMLButtonElement>('[data-slot="footer"] button:last-child')!.click();
		await tick();
		expect(
			document.querySelector('[data-testid="time-range-rejected-output"]')?.textContent
		).toContain('|1');
		expect(trigger('time-range-rejected').getAttribute('aria-expanded')).toBe('true');
		expect(
			root('time-range-rejected').querySelector<HTMLInputElement>('[data-slot="end-field"] input')
				?.value
		).toBe('10');
		expect(new FormData(form).get('rejected.start')).toBe('09:30:00');
		expect(new FormData(form).get('rejected.end')).toBe('10:30:00');

		root('time-range-rejected').querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(
			document.querySelector('[data-testid="time-range-rejected-output"]')?.textContent
		).toContain('|2');
		expect(new FormData(form).get('rejected.start')).toBe('09:30:00');
		expect(new FormData(form).get('rejected.end')).toBe('10:30:00');
		expect(trigger('time-range-rejected').getAttribute('aria-expanded')).toBe('true');
	});
});
