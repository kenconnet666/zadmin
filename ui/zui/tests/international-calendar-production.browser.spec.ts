import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import InternationalCalendarFixture from './InternationalCalendarFixture.svelte';

function selected(root: ParentNode): HTMLButtonElement {
	return root.querySelector<HTMLButtonElement>('[data-slot="cell"][data-selected="true"]')!;
}

function context(button: HTMLButtonElement): HTMLElement {
	return button.querySelector<HTMLElement>('[data-context-calendar]')!;
}

describe('ZCalendar international calendar ownership', () => {
	it('switches Hebrew to Persian display locale without writing the Gregorian owner', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(InternationalCalendarFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="calendar-locale-switch"]')!;
			expect(root.dataset.calendar).toBe('hebrew');
			expect(context(selected(root)).dataset.contextCalendar).toBe('hebrew');
			expect(
				target.querySelector('[data-testid="calendar-locale-switch-output"]')?.textContent
			).toBe('gregory:AD:2024-4-8|0');

			component.showPersian();
			await tick();
			expect(root.dataset.calendar).toBe('persian');
			expect(context(selected(root)).dataset.contextCalendar).toBe('persian');
			expect(
				target.querySelector('[data-testid="calendar-locale-switch-output"]')?.textContent
			).toBe('gregory:AD:2024-4-8|0');

			const next = [...root.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')].find(
				(button) =>
					!button.disabled &&
					button.dataset.outside !== 'true' &&
					button.dataset.selected !== 'true'
			)!;
			await userEvent.click(next);
			await tick();
			expect(
				target.querySelector('[data-testid="calendar-locale-switch-output"]')?.textContent
			).toMatch(/^gregory:AD:\d+-\d+-\d+\|1$/u);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('crosses Hebrew leap month and preserves the remembered owner through clear and reselect', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(InternationalCalendarFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="calendar-hebrew-owner"]')!;
			const initial = selected(root);
			expect(context(initial).dataset).toMatchObject({
				contextCalendar: 'hebrew',
				contextMonth: '13',
				contextYear: '5784'
			});
			initial.focus();
			await userEvent.keyboard('{ArrowRight}{Enter}');
			await tick();
			const newYear = context(selected(root));
			expect(newYear.dataset).toMatchObject({
				contextCalendar: 'hebrew',
				contextDay: '1',
				contextMonth: '1',
				contextYear: '5785'
			});
			expect(target.querySelector('[data-testid="calendar-hebrew-output"]')?.textContent).toBe(
				'hebrew:AM:5785-1-1|1'
			);

			await userEvent.keyboard('{Delete}');
			await tick();
			expect(target.querySelector('[data-testid="calendar-hebrew-output"]')?.textContent).toBe(
				'null|2'
			);
			await userEvent.keyboard('{Enter}');
			await tick();
			expect(target.querySelector('[data-testid="calendar-hebrew-output"]')?.textContent).toBe(
				'hebrew:AM:5785-1-1|3'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('publishes the Japanese era boundary in the original Japanese owner calendar', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(InternationalCalendarFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="calendar-japanese-owner"]')!;
			const initial = selected(root);
			expect(context(initial).dataset).toMatchObject({
				contextCalendar: 'japanese',
				contextEra: 'heisei',
				contextYear: '31'
			});
			initial.focus();
			await userEvent.keyboard('{ArrowRight}{Enter}');
			await tick();
			expect(context(selected(root)).dataset).toMatchObject({
				contextCalendar: 'japanese',
				contextDay: '1',
				contextEra: 'reiwa',
				contextMonth: '5',
				contextYear: '1'
			});
			expect(target.querySelector('[data-testid="calendar-japanese-output"]')?.textContent).toBe(
				'japanese:reiwa:1-5-1|1'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('shares the Persian display projection between strip Calendar and MiniCalendar', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(InternationalCalendarFixture, { target });
		try {
			await tick();
			const strip = target.querySelector<HTMLElement>('[data-testid="calendar-persian-strip"]')!;
			const mini = target.querySelector<HTMLElement>('[data-testid="calendar-persian-mini"]')!;
			for (const root of [strip, mini]) {
				expect(root.dataset.view).toBe('strip');
				expect(root.dataset.visibleDays).toBe('7');
				expect(root.dataset.calendar).toBe('persian');
				expect(context(selected(root)).dataset.contextCalendar).toBe('persian');
			}
			expect(context(selected(mini)).dataset).toMatchObject({
				contextDay: context(selected(strip)).dataset.contextDay,
				contextMonth: context(selected(strip)).dataset.contextMonth,
				contextYear: context(selected(strip)).dataset.contextYear
			});
			const next = [...mini.querySelectorAll<HTMLButtonElement>('[data-slot="cell"]')].find(
				(button) => button.dataset.selected !== 'true'
			)!;
			await userEvent.click(next);
			await tick();
			expect(target.querySelector('[data-testid="calendar-mini-output"]')?.textContent).toMatch(
				/^gregory:AD:\d+-\d+-\d+\|1$/u
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
