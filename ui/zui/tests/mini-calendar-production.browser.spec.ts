import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';
import MiniCalendarProductionFixture from './MiniCalendarProductionFixture.svelte';

function cells(root: ParentNode): readonly HTMLButtonElement[] {
	return [...root.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')];
}

function cell(root: ParentNode, label: string): HTMLButtonElement {
	const result = cells(root).find((candidate) =>
		candidate.getAttribute('aria-label')?.includes(label)
	);
	if (!result) throw new Error(`Missing MiniCalendar date ${label}.`);
	return result;
}

describe('ZMiniCalendar façade', () => {
	it('reuses one strip Calendar owner for selection, focus, constraints, paging and reset', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(MiniCalendarProductionFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="mini-calendar-form"]')!;
			const root = target.querySelector<HTMLElement>('[data-testid="mini-calendar"]')!;
			expect(root.dataset.view).toBe('strip');
			expect(root.dataset.size).toBe('large');
			expect(cells(root)).toHaveLength(5);
			expect(root.querySelectorAll('[role="grid"]')).toHaveLength(1);
			expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
			expect(cell(root, 'September 15, 2026').dataset.selected).toBe('true');
			const selectedDay = cell(root, 'September 15, 2026');
			expect(getComputedStyle(selectedDay.querySelector('[data-slot="weekday"]')!).color).toBe(
				getComputedStyle(selectedDay).color
			);
			expect(cell(root, 'September 16, 2026').disabled).toBe(true);
			expect(new FormData(form).getAll('delivery')).toEqual(['2026-09-15']);
			expect(target.querySelector('[data-testid="mini-calendar-output"]')?.textContent).toContain(
				'2026-09-15|2026-09-15|0|0|true'
			);

			await userEvent.click(root.querySelector<HTMLButtonElement>('[aria-label="Next dates"]')!);
			await tick();
			expect(cells(root)).toHaveLength(5);
			await userEvent.click(cell(root, 'September 20, 2026'));
			await tick();
			expect(new FormData(form).getAll('delivery')).toEqual(['2026-09-20']);
			expect(target.querySelector('[data-testid="mini-calendar-output"]')?.textContent).toContain(
				'2026-09-20|2026-09-20|1|1|true'
			);

			component.setExternal();
			await tick();
			expect(new FormData(form).get('delivery')).toBe('2026-10-02');
			expect(cell(root, 'October 2, 2026').dataset.selected).toBe('true');
			await resetForm(form);
			expect(new FormData(form).get('delivery')).toBe('2026-09-15');
			expect(target.querySelector('[data-testid="mini-calendar-output"]')?.textContent).toContain(
				'2026-09-15|2026-09-15|1|1|true'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('forwards readonly, disabled and formParticipation without adding another owner', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(MiniCalendarProductionFixture, { target });
		try {
			await tick();
			const readonly = target.querySelector<HTMLElement>('[data-testid="mini-calendar-readonly"]')!;
			const selected = cell(readonly, 'September 15, 2026');
			expect(selected.disabled).toBe(false);
			selected.focus();
			expect(document.activeElement).toBe(selected);
			cell(readonly, 'September 16, 2026').click();
			await tick();
			expect(cell(readonly, 'September 15, 2026').dataset.selected).toBe('true');

			const disabled = target.querySelector<HTMLElement>('[data-testid="mini-calendar-disabled"]')!;
			expect(cells(disabled).every((candidate) => candidate.disabled)).toBe(true);
			expect(target.querySelector('[name="disabled-date"]')).toBeNull();

			const none = target.querySelector<HTMLElement>('[data-testid="mini-calendar-none"]')!;
			expect(cells(none)).toHaveLength(10);
			expect(none.querySelector('[data-mini-calendar-header]')).not.toBeNull();
			expect(none.querySelectorAll('[data-mini-calendar-date]')).toHaveLength(10);
			const rows = [...none.querySelectorAll<HTMLElement>('[role="row"]')].filter((row) =>
				row.querySelector('[data-slot="cell"]')
			);
			expect(rows).toHaveLength(2);
			expect(rows.every((row) => cells(row).length <= 7)).toBe(true);
			expect(none.querySelector('[data-zui-form-value]')).toBeNull();
			expect(target.querySelector('[name="ignored-date"]')).toBeNull();
			expect(
				target.querySelector<HTMLElement>('[data-testid="mini-calendar-provider-size"]')?.dataset
					.size
			).toBe('xlarge');
			expect(
				target.querySelector<HTMLElement>('[data-testid="mini-calendar-field-size"]')?.dataset.size
			).toBe('large');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
