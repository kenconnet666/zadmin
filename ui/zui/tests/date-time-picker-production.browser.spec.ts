import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import DateTimePickerProductionFixture from './DateTimePickerProductionFixture.svelte';
import { resetForm } from './form-reset.js';

async function openDialog(root: HTMLElement): Promise<HTMLElement> {
	const trigger = root.querySelector<HTMLButtonElement>('button[data-slot="trigger"]')!;
	await userEvent.click(trigger);
	await tick();
	return document.getElementById(trigger.getAttribute('aria-controls')!)!;
}

describe('ZDateTimePicker browser contract', () => {
	it('separates field changes, confirm commits, same-value confirms and clear commits', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimePickerProductionFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="confirm-date-time-picker"]')!;
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-time-picker-form"]')!;
			const day = root.querySelector<HTMLInputElement>('input[aria-label="Day"]')!;
			day.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
			await tick();
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('2026-09-08T09:30:00|1|0|false');

			let dialog = await openDialog(root);
			await userEvent.click(
				[...dialog.querySelectorAll('button')].find((button) => button.textContent === 'Lunch')!
			);
			await tick();
			expect(new FormData(form).get('appointment')).toBe('2026-09-08T09:30:00');
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="date-time-footer"] button:last-child')!
			);
			await tick();
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('2026-09-12T12:15:00|2|1|false');

			dialog = await openDialog(root);
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="date-time-footer"] button:last-child')!
			);
			await tick();
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('2026-09-12T12:15:00|2|2|false');

			await userEvent.click(root.querySelector<HTMLButtonElement>('button[data-slot="clear"]')!);
			await tick();
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('null|3|3|false');
			expect(new FormData(form).get('appointment')).toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('commits each valid immediate panel action, stays open and preserves the zoned owner', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimePickerProductionFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="immediate-date-time-picker"]')!;
			const dialog = await openDialog(root);
			expect(dialog.dir).toBe('rtl');
			await userEvent.click(
				[...dialog.querySelectorAll('button')].find(
					(button) => button.textContent === 'West coast'
				)!
			);
			await tick();
			expect(
				target.querySelector('[data-testid="immediate-date-time-picker-output"]')?.textContent
			).toBe('2026-09-12T11:45:00-07:00[America/Los_Angeles]|1|1|true');
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="date-time-footer"] button:last-child')!
			);
			await tick();
			expect(
				target.querySelector('[data-testid="immediate-date-time-picker-output"]')?.textContent
			).toBe('2026-09-12T11:45:00-07:00[America/Los_Angeles]|1|2|false');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('resynchronizes an open panel from an external owner and resets without business callbacks', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimePickerProductionFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="confirm-date-time-picker"]')!;
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-time-picker-form"]')!;
			const dialog = await openDialog(root);
			await userEvent.click(
				[...dialog.querySelectorAll('button')].find((button) => button.textContent === 'Lunch')!
			);
			component.writeExternalLocal();
			await tick();
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('2026-10-05T14:20:00|0|0|true');
			expect(root.querySelector<HTMLInputElement>('input[aria-label="Day"]')?.value).toBe('05');
			await resetForm(form);
			expect(
				target.querySelector('[data-testid="confirm-date-time-picker-output"]')?.textContent
			).toBe('2026-09-07T09:30:00|0|0|false');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('rolls field edits and panel confirmation back when the model owner rejects them', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimePickerProductionFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="rejected-date-time-picker"]')!;
			const day = root.querySelector<HTMLInputElement>('input[aria-label="Day"]')!;
			day.value = '20';
			day.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(day.value).toBe('11');
			const dialog = await openDialog(root);
			await userEvent.click(
				[...dialog.querySelectorAll('button')].find(
					(button) => button.textContent === 'Rejected lunch'
				)!
			);
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="date-time-footer"] button:last-child')!
			);
			await tick();
			const form = target.querySelector<HTMLFormElement>(
				'[data-testid="rejected-date-time-picker-form"]'
			)!;
			expect(new FormData(form).get('value')).toBe('2026-09-11T10:30:00');
			expect(root.querySelector<HTMLInputElement>('input[aria-label="Day"]')?.value).toBe('11');
			expect(root.dataset.state).toBe('open');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps requested open independent from the disabled actual-open gate', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimePickerProductionFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="gated-date-time-picker"]')!;
			expect(root.dataset.state).toBe('closed');
			expect(
				target.querySelector('[data-testid="gated-date-time-picker-output"]')?.textContent
			).toBe('true|true|0');
			component.enableGatedPicker();
			await tick();
			expect(root.dataset.state).toBe('open');
			expect(
				target.querySelector('[data-testid="gated-date-time-picker-output"]')?.textContent
			).toBe('true|false|0');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
