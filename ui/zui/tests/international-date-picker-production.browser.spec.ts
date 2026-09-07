import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import InternationalDatePickerFixture from './InternationalDatePickerFixture.svelte';

function element<T extends HTMLElement>(testId: string): T {
	return document.querySelector<T>(`[data-testid="${testId}"]`)!;
}

describe('date picker international calendar owners', () => {
	it('keeps Japanese era field synchronization in the parent picker', async () => {
		render(InternationalDatePickerFixture);
		await tick();
		const picker = element('picker-japanese');
		const era = picker.querySelector<HTMLSelectElement>('select')!;
		expect(era.value).toBe('reiwa');
		await userEvent.selectOptions(era, 'heisei');
		await expect
			.poll(() => element('international-picker-output').textContent)
			.toContain('japanese:heisei:8-9-7');
	});

	it('preserves a Hebrew parent owner when a cleared picker mounts Calendar and selects again', async () => {
		const component = render(InternationalDatePickerFixture);
		await tick();
		const picker = element('picker-hebrew');
		component.clearHebrew();
		await tick();
		const trigger = picker.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
		await userEvent.click(trigger);
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="dialog"][aria-label="Choose date"]')?.dataset
						.state
			)
			.toBe('open');
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="Choose date"]'
		)!;
		const focused = dialog.querySelector<HTMLButtonElement>('[data-slot="cell"][tabindex="0"]')!;
		await userEvent.click(focused);
		await expect
			.poll(() => element('international-picker-output').textContent)
			.toContain('|hebrew:AM:');
		expect(
			new FormData(element<HTMLFormElement>('international-picker-form')).get('hebrew')
		).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
	});

	it('preserves the range parent calendar when an empty endpoint is edited', async () => {
		const component = render(InternationalDatePickerFixture);
		await tick();
		const picker = element('picker-hebrew-range');
		component.clearHebrewRange();
		await tick();
		const start = picker.querySelector<HTMLElement>('[data-slot="start-field"]')!;
		const day = start.querySelector<HTMLInputElement>('[aria-label="Day"]')!;
		day.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect
			.poll(() => element('international-picker-output').textContent)
			.toContain('|hebrew:');
		expect(element('international-picker-predicate').textContent).toBe('hebrew');
		expect(
			new FormData(element<HTMLFormElement>('international-picker-form')).get('hebrew-range.start')
		).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
	});
});
