import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import FormDateAdapterFixture from './FormDateAdapterFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

async function inputSegment(input: HTMLInputElement, value: string): Promise<void> {
	input.value = value;
	input.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await tick();
}

function dayButton(root: ParentNode, day: string): HTMLButtonElement {
	return [...root.querySelectorAll<HTMLButtonElement>('[role="gridcell"] button')].find(
		(button) => button.textContent?.trim() === day && button.dataset.outside !== 'true'
	)!;
}

async function openDialog(root: ParentNode): Promise<HTMLElement> {
	const trigger = root.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
	await userEvent.click(trigger);
	await tick();
	return document.getElementById(trigger.getAttribute('aria-controls')!)!;
}

describe('date family Form model adapters', () => {
	it('applies date component defaults before input fallback and lets Field size win', async () => {
		const target = host();
		const component = mount(FormDateAdapterFixture, { target });
		try {
			const defaults = target.querySelector<HTMLElement>(
				'[data-testid="date-component-defaults"]'
			)!;
			expect(
				defaults.querySelector<HTMLElement>('[data-testid="default-calendar"]')?.dataset.size
			).toBe('xsmall');
			expect(
				defaults.querySelector<HTMLElement>('[data-testid="default-date-field"]')?.dataset.size
			).toBe('small');
			expect(
				defaults.querySelector<HTMLElement>('[data-testid="default-time-field"]')?.dataset.size
			).toBe('medium');
			const picker = defaults.querySelector<HTMLElement>('[data-testid="default-date-picker"]')!;
			expect(picker.dataset.size).toBe('large');
			expect(picker.querySelector<HTMLElement>('[data-slot="field"]')?.dataset.size).toBe('large');
			const range = defaults.querySelector<HTMLElement>('[data-testid="default-date-range"]')!;
			expect(range.dataset.size).toBe('xlarge');
			expect(
				[...range.querySelectorAll<HTMLElement>('[data-slot$="-field"]')].map(
					(field) => field.dataset.size
				)
			).toEqual(['xlarge', 'xlarge']);
			const override = defaults.querySelector<HTMLElement>(
				'[data-testid="field-override-date-picker"]'
			)!;
			expect(override.dataset.size).toBe('xsmall');
			expect(override.querySelector<HTMLElement>('[data-slot="field"]')?.dataset.size).toBe(
				'xsmall'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('projects controller values without user callbacks and recognizes equivalent baselines', async () => {
		const target = host();
		const component = mount(FormDateAdapterFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-model-form"]')!;
			const values = target.querySelector<HTMLOutputElement>('[data-testid="date-values"]')!;
			const counts = target.querySelector<HTMLOutputElement>('[data-testid="date-counts"]')!;
			const dirty = target.querySelector<HTMLOutputElement>('[data-testid="date-dirty"]')!;

			expect(values.textContent).toBe(
				'2026-09-10|2026-09-11|09:30:45.125|2026-09-13|2026-09-14..null'
			);
			expect(counts.textContent).toBe('0:0');
			expect(dirty.textContent).toBe('false|false|false|false|false|false');

			component.updateThroughController();
			await tick();
			expect(values.textContent).toBe('2026-09-20|null|17:05:06.007|2026-09-21|null..2026-09-22');
			expect(counts.textContent).toBe('5:0');
			const data = new FormData(form);
			expect(data.get('calendar')).toBe('2026-09-20');
			expect(data.get('dateField')).toBeNull();
			expect(data.get('timeField')).toBe('17:05:06.007');
			expect(data.get('picker')).toBe('2026-09-21');
			expect(data.get('range.start')).toBeNull();
			expect(data.get('range.end')).toBe('2026-09-22');

			component.returnEquivalentBaselines();
			await tick();
			expect(values.textContent).toBe(
				'2026-09-10|2026-09-11|09:30:45.125|2026-09-13|2026-09-14..null'
			);
			expect(counts.textContent).toBe('10:0');
			expect(dirty.textContent).toBe('false|false|false|false|false|false');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('maps missing model fields to empty controls and resets newly added dates back to missing', async () => {
		const target = host();
		const component = mount(FormDateAdapterFixture, { target });
		try {
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-missing-form"]')!;
			const dateInputs = target.querySelectorAll<HTMLInputElement>(
				'[data-testid="missing-date-field"] input'
			);
			const timeInput = target.querySelector<HTMLInputElement>(
				'[data-testid="missing-time-field"] input'
			)!;
			const rangeInputs = target.querySelectorAll<HTMLInputElement>(
				'[data-testid="missing-date-range"] [data-slot="start-field"] input'
			);
			const counts = target.querySelector<HTMLOutputElement>(
				'[data-testid="missing-date-counts"]'
			)!;
			expect([...dateInputs, timeInput, ...rangeInputs].map((input) => input.value)).toEqual([
				'',
				'',
				'',
				'',
				'',
				'',
				''
			]);
			expect(counts.textContent).toBe('0:0');
			expect(new FormData(form).get('addedDate')).toBeNull();
			expect(new FormData(form).get('addedTime')).toBeNull();
			expect(new FormData(form).get('addedRange.start')).toBeNull();

			for (const [input, next] of [
				[dateInputs[0]!, '09'],
				[dateInputs[1]!, '21'],
				[dateInputs[2]!, '2026']
			] as const)
				await inputSegment(input, next);
			await inputSegment(timeInput, '10');
			for (const [input, next] of [
				[rangeInputs[0]!, '09'],
				[rangeInputs[1]!, '22'],
				[rangeInputs[2]!, '2026']
			] as const)
				await inputSegment(input, next);
			expect(new FormData(form).get('addedDate')).toBe('2026-09-21');
			expect(new FormData(form).get('addedTime')).toBe('10:00:00');
			expect(new FormData(form).get('addedRange.start')).toBe('2026-09-22');
			expect(new FormData(form).get('addedRange.end')).toBeNull();
			expect(counts.textContent).toBe('3:3');

			await resetForm(form);
			await resetForm(form);
			await expect
				.poll(() => [...dateInputs, timeInput, ...rangeInputs].map((input) => input.value))
				.toEqual(['', '', '', '', '', '', '']);
			expect(new FormData(form).get('addedDate')).toBeNull();
			expect(new FormData(form).get('addedTime')).toBeNull();
			expect(new FormData(form).get('addedRange.start')).toBeNull();
			expect(counts.textContent).toBe('3:3');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps user acceptance, rejection, reset and compound native ownership coherent', async () => {
		const target = host();
		const component = mount(FormDateAdapterFixture, { target });
		try {
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-model-form"]')!;
			const values = target.querySelector<HTMLOutputElement>('[data-testid="date-values"]')!;
			const counts = target.querySelector<HTMLOutputElement>('[data-testid="date-counts"]')!;
			const dirty = target.querySelector<HTMLOutputElement>('[data-testid="date-dirty"]')!;
			const calendar = target.querySelector<HTMLElement>('[data-testid="model-calendar"]')!;
			await userEvent.click(dayButton(calendar, '18'));
			expect(dirty.textContent?.split('|')[1]).toBe('true');
			await userEvent.click(dayButton(calendar, '10'));
			expect(dirty.textContent?.split('|')[1]).toBe('false');

			const dateInputs = target.querySelectorAll<HTMLInputElement>(
				'[data-testid="model-date-field"] input'
			);
			await inputSegment(dateInputs[1]!, '20');
			const timeInput = target.querySelector<HTMLInputElement>(
				'[data-testid="model-time-field"] input'
			)!;
			await inputSegment(timeInput, '10');

			const picker = target.querySelector<HTMLElement>('[data-testid="model-date-picker"]')!;
			const pickerDialog = await openDialog(picker);
			await userEvent.click(dayButton(pickerDialog, '19'));
			const rangeStartInputs = target.querySelectorAll<HTMLInputElement>(
				'[data-testid="model-date-range"] [data-slot="start-field"] input'
			);
			await inputSegment(rangeStartInputs[1]!, '20');

			expect(values.textContent).toBe(
				'2026-09-10|2026-09-20|10:30:45.125|2026-09-19|2026-09-20..null'
			);
			expect(counts.textContent).toBe('6:6');
			const ownedNames = [
				...form.querySelectorAll<HTMLInputElement>('input[data-zui-form-value][name]')
			].map((input) => input.name);
			expect(ownedNames).toEqual([
				'calendar',
				'dateField',
				'timeField',
				'picker',
				'range.start',
				'readonlyDate',
				'disabledDate'
			]);
			expect(form.querySelector<HTMLInputElement>('[name="disabledDate"]')?.disabled).toBe(true);
			expect(new FormData(form).get('disabledDate')).toBeNull();
			expect(
				target.querySelector<HTMLInputElement>('[data-testid="model-readonly-date"] input')
					?.readOnly
			).toBe(true);
			expect(
				target.querySelector<HTMLButtonElement>(
					'[data-testid="model-disabled-date"] button[aria-haspopup="dialog"]'
				)?.disabled
			).toBe(true);

			const rejectedForm = target.querySelector<HTMLFormElement>(
				'[data-testid="date-rejected-form"]'
			)!;
			const rejectedCalendar = target.querySelector<HTMLElement>(
				'[data-testid="rejected-calendar"]'
			)!;
			await userEvent.click(dayButton(rejectedCalendar, '18'));
			expect(new FormData(rejectedForm).get('calendar')).toBe('2026-09-10');
			expect(
				rejectedCalendar.querySelector<HTMLElement>(
					'[data-selected="true"] [data-slot="day-number"]'
				)?.textContent
			).toBe('10');

			const rejectedDateInputs = target.querySelectorAll<HTMLInputElement>(
				'[data-testid="rejected-date-field"] input'
			);
			await inputSegment(rejectedDateInputs[1]!, '20');
			expect(rejectedDateInputs[1]!.value).toBe('11');
			const rejectedTime = target.querySelector<HTMLInputElement>(
				'[data-testid="rejected-time-field"] input'
			)!;
			await inputSegment(rejectedTime, '10');
			expect(rejectedTime.value).toBe('09');

			const rejectedPicker = target.querySelector<HTMLElement>('[data-testid="rejected-picker"]')!;
			const rejectedPickerInputs = rejectedPicker.querySelectorAll<HTMLInputElement>(
				'[data-slot="field"] input'
			);
			await inputSegment(rejectedPickerInputs[1]!, '20');
			expect(rejectedPickerInputs[1]!.value).toBe('13');
			const rejectedPickerDialog = await openDialog(rejectedPicker);
			await userEvent.click(dayButton(rejectedPickerDialog, '20'));
			expect(new FormData(rejectedForm).get('picker')).toBe('2026-09-13');
			expect(
				rejectedPickerDialog
					.querySelector('[data-selected="true"] [data-slot="day-number"]')
					?.textContent?.trim()
			).toBe('13');
			await userEvent.click(rejectedPicker.querySelector('button[aria-haspopup="dialog"]')!);

			const rejectedRange = target.querySelector<HTMLElement>('[data-testid="rejected-range"]')!;
			const rejectedRangeStart = rejectedRange.querySelectorAll<HTMLInputElement>(
				'[data-slot="start-field"] input'
			);
			await inputSegment(rejectedRangeStart[1]!, '20');
			expect(rejectedRangeStart[1]!.value).toBe('14');
			const rejectedRangeEnd = rejectedRange.querySelectorAll<HTMLInputElement>(
				'[data-slot="end-field"] input'
			);
			await inputSegment(rejectedRangeEnd[1]!, '22');
			expect(rejectedRangeEnd[1]!.value).toBe('16');
			const rejectedRangeDialog = await openDialog(rejectedRange);
			await userEvent.click(dayButton(rejectedRangeDialog, '18'));
			expect(new FormData(rejectedForm).get('range.start')).toBe('2026-09-14');
			expect(new FormData(rejectedForm).get('range.end')).toBe('2026-09-16');

			const userCount = counts.textContent;
			await resetForm(form);
			await resetForm(form);
			await expect
				.poll(() => values.textContent)
				.toBe('2026-09-10|2026-09-11|09:30:45.125|2026-09-13|2026-09-14..null');
			expect(counts.textContent).toBe(userCount);
			expect(new FormData(form).get('range.start')).toBe('2026-09-14');
			expect(new FormData(form).get('range.end')).toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
