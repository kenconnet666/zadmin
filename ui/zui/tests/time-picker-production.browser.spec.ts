import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TimePickerProductionFixture from './TimePickerProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}
function trigger(testId: string): HTMLButtonElement {
	return root(testId).querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
}

describe('ZTimePicker production contracts', () => {
	it('keeps one Time owner, bounded columns, active-descendant keyboard, FormData and reset real', async () => {
		// @zui-visual ZTimePicker field, action and bounded column geometry
		await render(TimePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-picker-form"]')!;
		const fieldLabel = [...form.querySelectorAll<HTMLLabelElement>('label')].find((label) =>
			label.textContent?.includes('Deployment time')
		)!;
		const fieldInput = document.getElementById(fieldLabel.htmlFor) as HTMLInputElement;
		expect(fieldInput.required).toBe(true);
		expect(new FormData(form).getAll('deployment')).toEqual(['09:30:15']);
		expect(trigger('time-picker-disabled').disabled).toBe(true);
		expect(new FormData(form).has('disabled-time')).toBe(false);
		expect(trigger('time-picker-readonly').disabled).toBe(true);
		expect(
			root('time-picker-readonly').querySelector<HTMLButtonElement>('[data-slot="clear"]')?.disabled
		).toBe(true);
		expect(new FormData(form).get('readonly-time')).toBe('06:45:00');

		trigger('time-picker').click();
		await tick();
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Choose time"]'
		)!;
		const columns = [...dialog.querySelectorAll<HTMLElement>('[role="listbox"]')];
		expect(columns).toHaveLength(3);
		expect(columns.every((column) => column.querySelectorAll('[role="option"]').length <= 60)).toBe(
			true
		);
		const hours = columns[0]!;
		hours.focus();
		expect(hours.getAttribute('aria-activedescendant')).toBeTruthy();
		hours.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		hours.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="time-picker-output"]')?.textContent).toBe(
			'10:30:15'
		);
		expect(new FormData(form).getAll('deployment')).toEqual(['10:30:15']);
		expect(trigger('time-picker').getAttribute('aria-expanded')).toBe('false');

		await resetForm(form);
		await expect.poll(() => new FormData(form).get('deployment')).toBe('09:30:15');
		expect(document.querySelector('[data-testid="time-picker-output"]')?.textContent).toBe(
			'09:30:15'
		);
	});

	it('finds constrained empty references, exact predicate values and reports a truly empty domain', async () => {
		await render(TimePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-picker-form"]')!;
		trigger('time-picker-bounded').click();
		await tick();
		let dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Bounded time"]')!;
		expect(
			dialog
				.querySelector('[role="listbox"][aria-label="Hour"] [aria-selected="true"]')
				?.textContent?.trim()
		).toBe('10');
		expect(
			dialog
				.querySelector('[role="listbox"][aria-label="Minute"] [aria-selected="true"]')
				?.textContent?.trim()
		).toBe('30');
		dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')!.click();
		await tick();
		expect(new FormData(form).get('bounded')).toBe('10:30:00');

		trigger('time-picker-exact').click();
		await tick();
		dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Exact time"]')!;
		dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')!.click();
		await tick();
		expect(new FormData(form).get('exact')).toBe('10:30:00');

		trigger('time-picker-empty').click();
		await tick();
		dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Unavailable time"]')!;
		expect(dialog.querySelector('[data-slot="empty"]')?.textContent).toBe('No available time');
		expect(dialog.querySelectorAll('[role="listbox"]')).toHaveLength(0);
		expect(dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')?.disabled).toBe(
			true
		);
	});

	it('keeps xlarge 12-hour second columns inside the available viewport width', async () => {
		await render(TimePickerProductionFixture);
		trigger('time-picker-narrow').click();
		await tick();
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Narrow time"]'
		)!;
		const columns = [...dialog.querySelectorAll<HTMLElement>('[role="listbox"]')];
		expect(columns).toHaveLength(4);
		expect(columns.every((column) => column.getBoundingClientRect().width > 0)).toBe(true);
		expect(dialog.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
		expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
		expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
	});

	it('keeps instance direction through the portal and lets InputGroup own disabled opacity', async () => {
		await render(TimePickerProductionFixture);
		trigger('time-picker-instance-rtl').click();
		await tick();
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Instance RTL time"]'
		)!;
		expect(dialog.dir).toBe('rtl');
		const columns = [...dialog.querySelectorAll<HTMLElement>('[role="listbox"]')];
		columns[0]!.focus();
		columns[0]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		expect(document.activeElement).toBe(columns[1]);

		const disabled = root('time-picker-disabled');
		const group = disabled.querySelector<HTMLElement>('[data-slot="input-group"]')!;
		expect(Number(getComputedStyle(group).opacity)).toBeLessThan(1);
		expect(getComputedStyle(trigger('time-picker-disabled')).opacity).toBe('1');
	});

	it('keeps presets and Now as live panel drafts and announces rejected candidates', async () => {
		await render(TimePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-picker-form"]')!;
		trigger('time-picker-actions').click();
		await tick();
		let dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Action time"]')!;
		const lazyPreset = [...dialog.querySelectorAll<HTMLButtonElement>('button')].find(
			(button) => button.textContent?.trim() === 'Lazy preset'
		)!;
		lazyPreset.click();
		await tick();
		expect(document.querySelector('[data-testid="time-picker-actions-output"]')?.textContent).toBe(
			'07:15:10.5:1'
		);
		expect(new FormData(form).get('actions')).toBe('07:15:10.5');
		expect(
			dialog
				.querySelector('[role="listbox"][aria-label="Hour"] [aria-selected="true"]')
				?.textContent?.trim()
		).toBe('11');
		dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')!.click();
		await tick();
		expect(document.querySelector('[data-testid="time-picker-actions-output"]')?.textContent).toBe(
			'11:22:33.001:1'
		);
		expect(new FormData(form).get('actions')).toBe('11:22:33.001');

		trigger('time-picker-actions').click();
		await tick();
		dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Action time"]')!;
		[...dialog.querySelectorAll<HTMLButtonElement>('button')]
			.find((button) => button.textContent?.trim() === 'Lazy preset')!
			.click();
		await tick();
		expect(document.querySelector('[data-testid="time-picker-actions-output"]')?.textContent).toBe(
			'11:22:33.001:2'
		);
		dialog.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();

		trigger('time-picker-now-invalid').click();
		await tick();
		dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Invalid current time"]'
		)!;
		[...dialog.querySelectorAll<HTMLButtonElement>('button')]
			.find((button) => button.textContent?.trim() === 'Now')!
			.click();
		await tick();
		expect(dialog.querySelector('[data-slot="feedback"]')?.textContent?.trim()).toBe(
			'Current time is outside the allowed range'
		);
		expect(dialog.querySelector('[data-slot="feedback"]')?.getAttribute('role')).toBe('status');
		expect(dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')?.disabled).toBe(
			true
		);
	});

	it('reconciles an external Time update into an open panel while preserving hidden milliseconds', async () => {
		await render(TimePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-picker-form"]')!;
		trigger('time-picker').click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="time-picker-external"]')!.click();
		await tick();
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Choose time"]'
		)!;
		const selected = [...dialog.querySelectorAll<HTMLElement>('[aria-selected="true"]')].map(
			(option) => option.textContent?.trim()
		);
		expect(selected).toEqual(['14', '45', '30']);
		expect(document.querySelector('[data-testid="time-picker-output"]')?.textContent).toBe(
			'14:45:30.125'
		);
		expect(new FormData(form).get('deployment')).toBe('14:45:30.125');
	});

	it('discards Escape drafts, keeps clear singular and does not close for a rejecting value owner', async () => {
		await render(TimePickerProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-picker-form"]')!;
		trigger('time-picker').click();
		await tick();
		let dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Choose time"]')!;
		const hourTen = [
			...dialog.querySelectorAll<HTMLElement>('[role="listbox"][aria-label="Hour"] [role="option"]')
		].find((option) => option.textContent?.trim() === '10')!;
		hourTen.click();
		dialog.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(new FormData(form).get('deployment')).toBe('09:30:15');

		root('time-picker').querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(new FormData(form).getAll('deployment')).toEqual([]);

		const rejectedHour = root('time-picker-rejected').querySelector<HTMLInputElement>(
			'input[aria-label="Hour"]'
		)!;
		rejectedHour.focus();
		rejectedHour.value = '10';
		rejectedHour.dispatchEvent(new InputEvent('input', { bubbles: true }));
		form.querySelector<HTMLButtonElement>('button[type="reset"]')!.focus();
		await tick();
		expect(rejectedHour.value).toBe('09');
		expect(document.querySelector('[data-testid="time-picker-rejected-output"]')?.textContent).toBe(
			'09:30:15:1'
		);
		expect(new FormData(form).getAll('rejected')).toEqual(['09:30:15']);

		trigger('time-picker-rejected').click();
		await tick();
		dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Rejected time"]')!;
		[...dialog.querySelectorAll<HTMLButtonElement>('button')]
			.find((button) => button.textContent?.trim() === 'Rejected preset')!
			.click();
		dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button')!.click();
		await tick();
		expect(document.querySelector('[data-testid="time-picker-rejected-output"]')?.textContent).toBe(
			'09:30:15:2'
		);
		expect(new FormData(form).getAll('rejected')).toEqual(['09:30:15']);
		expect(trigger('time-picker-rejected').getAttribute('aria-expanded')).toBe('true');

		const rejectedHours = dialog.querySelector<HTMLElement>('[role="listbox"][aria-label="Hour"]')!;
		rejectedHours.focus();
		rejectedHours.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		rejectedHours.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="time-picker-rejected-output"]')?.textContent).toBe(
			'09:30:15:3'
		);
		expect(new FormData(form).getAll('rejected')).toEqual(['09:30:15']);
		expect(trigger('time-picker-rejected').getAttribute('aria-expanded')).toBe('true');
	});
});
