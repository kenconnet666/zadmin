import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';
import DateTimeFieldFixture from './DateTimeFieldFixture.svelte';
import { resetForm } from './form-reset.js';

function key(target: HTMLElement, value: string): void {
	target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: value }));
}

describe('ZDateTimeField browser contract', () => {
	it('keeps one canonical form value while navigating and rolling back a partial raw draft', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimeFieldFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="date-time-form"]')!;
			const root = target.querySelector<HTMLElement>('[data-testid="local-date-time"]')!;
			const groups = [...root.querySelectorAll<HTMLElement>('[data-zui-composite-control]')];
			const dateInputs = [...groups[1]!.querySelectorAll<HTMLInputElement>('input')];
			const timeInputs = [...groups[2]!.querySelectorAll<HTMLInputElement>('input')];
			const dayPeriod = groups[2]!.querySelector<HTMLButtonElement>('[data-slot="day-period"]');
			expect(new FormData(form).get('local')).toBe('2026-09-07T09:30:00');

			dateInputs.at(-1)!.focus();
			key(dateInputs.at(-1)!, 'ArrowRight');
			expect(document.activeElement).toBe(timeInputs[0]);
			key(timeInputs[0]!, 'End');
			expect(document.activeElement).toBe(dayPeriod ?? timeInputs.at(-1));
			key(dayPeriod ?? timeInputs.at(-1)!, 'Home');
			expect(document.activeElement).toBe(dateInputs[0]);

			const day = dateInputs.find((input) => input.getAttribute('aria-label') === 'Day')!;
			day.value = '1';
			day.dispatchEvent(new InputEvent('input', { bubbles: true }));
			const minute = timeInputs[1]!;
			minute.value = '7';
			minute.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(root.dataset.invalid).toBe('true');
			expect(new FormData(form).get('local')).toBe('2026-09-07T09:30:00');
			key(minute, 'Escape');
			await tick();
			expect(day.value).toBe('07');
			expect(minute.value).toBe('30');
			expect(root.dataset.invalid).toBeUndefined();
			for (const input of dateInputs) {
				input.value = '';
				input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			}
			await tick();
			expect(root.dataset.invalid).toBe('true');
			expect(new FormData(form).get('local')).toBe('2026-09-07T09:30:00');
			key(dateInputs[0]!, 'Escape');
			await tick();
			expect(day.value).toBe('07');
			await resetForm(form);
			expect(target.querySelector('[data-testid="date-time-reset-output"]')?.textContent).toBe('2');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('reverses logical horizontal movement at the complete RTL segment boundary', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimeFieldFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="rtl-date-time"]')!;
			const groups = [...root.querySelectorAll<HTMLElement>('[data-zui-composite-control]')];
			const dateInputs = [...groups[1]!.querySelectorAll<HTMLInputElement>('input')];
			const timeInputs = [...groups[2]!.querySelectorAll<HTMLInputElement>('input')];
			expect(root.dir).toBe('rtl');
			expect(root.querySelector<HTMLElement>('[data-slot="input-group"]')?.dir).toBe('rtl');
			expect(groups.map((group) => group.dir)).toEqual(['rtl', 'rtl', 'rtl']);
			timeInputs[0]!.focus();
			key(timeInputs[0]!, 'ArrowRight');
			expect(document.activeElement).toBe(dateInputs.at(-1));

			const standaloneDate = target.querySelector<HTMLElement>('[data-testid="rtl-date-field"]')!;
			const standaloneDateInputs = [...standaloneDate.querySelectorAll<HTMLInputElement>('input')];
			standaloneDateInputs[1]!.focus();
			key(standaloneDateInputs[1]!, 'ArrowRight');
			expect(document.activeElement).toBe(standaloneDateInputs[0]);
			expect(standaloneDate.dir).toBe('rtl');

			const standaloneTime = target.querySelector<HTMLElement>('[data-testid="rtl-time-field"]')!;
			const standaloneTimeInputs = [...standaloneTime.querySelectorAll<HTMLInputElement>('input')];
			standaloneTimeInputs[1]!.focus();
			key(standaloneTimeInputs[1]!, 'ArrowRight');
			expect(document.activeElement).toBe(standaloneTimeInputs[0]);
			expect(standaloneTime.dir).toBe('rtl');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('edits in the display zone while emitting the original ZonedDateTime owner zone', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimeFieldFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="zoned-date-time"]')!;
			const groups = [...root.querySelectorAll<HTMLElement>('[data-zui-composite-control]')];
			const timeInputs = [...groups[2]!.querySelectorAll<HTMLInputElement>('input')];
			key(timeInputs[1]!, 'ArrowUp');
			await tick();
			const output = target.querySelector('[data-testid="zoned-date-time-output"]')!.textContent!;
			expect(output).toContain('[America/Los_Angeles]');
			expect(new FormData(target.querySelector('form')!).get('zoned')).toBe(output);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('rolls every composed segment back when a Form model owner rejects the combined value', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateTimeFieldFixture, { target });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="rejected-date-time"]')!;
			const day = root.querySelector<HTMLInputElement>('input[aria-label="Day"]')!;
			day.value = '20';
			day.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(day.value).toBe('11');
			const form = target.querySelector<HTMLFormElement>(
				'[data-testid="date-time-rejected-form"]'
			)!;
			expect(new FormData(form).get('value')).toBe('2026-09-11T10:30:00');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
