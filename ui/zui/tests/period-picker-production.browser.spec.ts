import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import PeriodPickerProductionFixture from './PeriodPickerProductionFixture.svelte';
import { resetForm } from './form-reset.js';

async function openDialog(root: HTMLElement): Promise<HTMLElement> {
	const trigger = root.querySelector<HTMLButtonElement>('[data-slot="trigger"]')!;
	await userEvent.click(trigger);
	await tick();
	return document.getElementById(trigger.getAttribute('aria-controls')!)!;
}

function cell(dialog: ParentNode, label: string): HTMLButtonElement {
	const result = [...dialog.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')].find(
		(button) =>
			button.getAttribute('aria-label')?.includes(label) ||
			button.textContent?.trim().includes(label)
	);
	if (!result) throw new Error(`Missing period cell ${label}.`);
	return result;
}

describe('ZPeriodPicker production contracts', () => {
	it('keeps confirm selections draft-only, cancel discards and same-value confirm commits', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="period-picker-form"]')!;
			const root = target.querySelector<HTMLElement>('[data-testid="period-picker-single"]')!;
			expect(root.querySelector('[data-slot="trigger"]')?.id).toBe('period-single-trigger');
			let dialog = await openDialog(root);
			await userEvent.click(cell(dialog, 'June'));
			expect(new FormData(form).get('month')).toBe('2026-05');
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2026-05|0|0|true'
			);
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="footer"] button:first-child')!
			);
			await tick();
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2026-05|0|0|false'
			);

			dialog = await openDialog(root);
			await userEvent.click(cell(dialog, 'June'));
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="footer"] button:last-child')!
			);
			await tick();
			expect(new FormData(form).get('month')).toBe('2026-06');
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2026-06|1|1|false'
			);

			dialog = await openDialog(root);
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="footer"] button:last-child')!
			);
			await tick();
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2026-06|1|2|false'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps immediate multiple open, preserves order and serializes fiscal identity', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="period-picker-form"]')!;
			const root = target.querySelector<HTMLElement>('[data-testid="period-picker-multiple"]')!;
			expect(root.textContent).not.toContain('@fs=');
			const dialog = await openDialog(root);
			expect(dialog.dir).toBe('rtl');
			await userEvent.click(cell(dialog, 'Q2'));
			await tick();
			expect(new FormData(form).getAll('quarters')).toEqual([
				'2026-Q1@fs=04',
				'2026-Q3@fs=04',
				'2026-Q2@fs=04'
			]);
			expect(
				target.querySelector('[data-testid="period-picker-multiple-output"]')?.textContent
			).toBe('2026-Q1@fs=04,2026-Q3@fs=04,2026-Q2@fs=04|1|1|true');
			await userEvent.click(cell(dialog, 'Q1'));
			await tick();
			expect(new FormData(form).getAll('quarters')).toEqual(['2026-Q3@fs=04', '2026-Q2@fs=04']);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('publishes an immediate range partial without commit and commits the complete weekly range', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="period-picker-form"]')!;
			const root = target.querySelector<HTMLElement>('[data-testid="period-picker-range"]')!;
			const dialog = await openDialog(root);
			await userEvent.click(cell(dialog, 'W10'));
			await tick();
			expect(new FormData(form).get('weeks.start')).toBe('2026-W10@fd=sun,md=1');
			expect(new FormData(form).get('weeks.end')).toBeNull();
			expect(target.querySelector('[data-testid="period-picker-range-output"]')?.textContent).toBe(
				'2026-W10@fd=sun,md=1..null|1|0|true'
			);
			await userEvent.click(cell(dialog, 'W12'));
			await tick();
			expect(new FormData(form).get('weeks.end')).toBe('2026-W12@fd=sun,md=1');
			expect(target.querySelector('[data-testid="period-picker-range-output"]')?.textContent).toBe(
				'2026-W10@fd=sun,md=1..2026-W12@fd=sun,md=1|2|1|false'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('projects confirm partial validity and lets allowEmpty commit a partial selection', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const confirmRoot = target.querySelector<HTMLElement>(
				'[data-testid="period-picker-confirm-range"]'
			)!;
			let dialog = await openDialog(confirmRoot);
			await userEvent.click(cell(dialog, '2025'));
			await tick();
			expect(confirmRoot.dataset.invalid).toBe('true');
			expect(
				dialog.querySelector<HTMLButtonElement>('[data-slot="footer"] button:last-child')?.disabled
			).toBe(true);
			await userEvent.click(
				dialog.querySelector<HTMLElement>('[data-slot="footer"] button:first-child')!
			);
			await tick();
			expect(confirmRoot.dataset.invalid).toBeUndefined();

			const partialRoot = target.querySelector<HTMLElement>(
				'[data-testid="period-picker-partial"]'
			)!;
			dialog = await openDialog(partialRoot);
			await userEvent.click(cell(dialog, '2025'));
			await tick();
			expect(
				target.querySelector('[data-testid="period-picker-partial-output"]')?.textContent
			).toBe('2025..null|1|1|true');

			const confirmPartialRoot = target.querySelector<HTMLElement>(
				'[data-testid="period-picker-confirm-partial"]'
			)!;
			dialog = await openDialog(confirmPartialRoot);
			await userEvent.click(cell(dialog, '2025'));
			const confirm = dialog.querySelector<HTMLButtonElement>(
				'[data-slot="footer"] button:last-child'
			)!;
			expect(confirm.disabled).toBe(false);
			await userEvent.click(confirm);
			await tick();
			expect(
				target.querySelector('[data-testid="period-picker-confirm-partial-output"]')?.textContent
			).toBe('2025..null|1|1|false');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('allows required clearing while marking invalid and keeps readonly trigger focusable and closed', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>(
				'[data-testid="period-picker-required-form"]'
			)!;
			const required = target.querySelector<HTMLElement>('[data-testid="period-picker-required"]')!;
			await userEvent.click(required.querySelector<HTMLButtonElement>('[data-slot="clear"]')!);
			await tick();
			expect(new FormData(form).get('period')).toBeNull();
			expect(required.dataset.invalid).toBe('true');
			expect((await component.validateRequired()).valid).toBe(false);
			expect(
				target.querySelector('[data-testid="period-picker-required-output"]')?.textContent
			).toBe('null|1');

			const readonly = target.querySelector<HTMLElement>('[data-testid="period-picker-readonly"]')!;
			const trigger = readonly.querySelector<HTMLButtonElement>('[data-slot="trigger"]')!;
			expect(trigger.disabled).toBe(false);
			trigger.focus();
			expect(document.activeElement).toBe(trigger);
			trigger.click();
			await tick();
			expect(readonly.dataset.state).toBe('closed');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('rolls back rejected owners, applies external values and resets without business callbacks', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			const rejectedForm = target.querySelector<HTMLFormElement>(
				'[data-testid="period-picker-rejected-form"]'
			)!;
			const rejected = target.querySelector<HTMLElement>('[data-testid="period-picker-rejected"]')!;
			const rejectedDialog = await openDialog(rejected);
			await userEvent.click(cell(rejectedDialog, 'June'));
			await tick();
			expect(new FormData(rejectedForm).get('period')).toBe('2026-05');
			expect(rejected.textContent).toContain('May');
			expect(rejected.dataset.state).toBe('open');

			const form = target.querySelector<HTMLFormElement>('[data-testid="period-picker-form"]')!;
			component.setExternalSingle();
			await tick();
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2027-02|0|0|false'
			);
			await resetForm(form);
			expect(target.querySelector('[data-testid="period-picker-single-output"]')?.textContent).toBe(
				'2026-05|0|0|false'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('resolves all five sizes on the picker root', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(PeriodPickerProductionFixture, { target });
		try {
			await tick();
			for (const [size, height] of [
				['xsmall', 24],
				['small', 28],
				['medium', 32],
				['large', 40],
				['xlarge', 48]
			] as const) {
				const root = target.querySelector<HTMLElement>(
					`[data-testid="period-picker-size-${size}"]`
				)!;
				expect(root.dataset.size).toBe(size);
				expect(
					root.querySelector<HTMLElement>('[role="group"]')?.getBoundingClientRect().height
				).toBeCloseTo(height, 1);
			}
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
