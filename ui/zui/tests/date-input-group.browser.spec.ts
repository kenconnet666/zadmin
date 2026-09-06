import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import DateInputGroupFixture from './DateInputGroupFixture.svelte';

describe('date and time input-group ownership', () => {
	it('inherits name, label, size and disabled while applying opacity at one visible owner', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DateInputGroupFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('form')!;
			expect([...new FormData(form).entries()]).toEqual([
				['date', '2026-09-07'],
				['time', '09:30:00']
			]);
			for (const kind of ['date', 'time']) {
				const control = target.querySelector<HTMLElement>(`[data-testid="${kind}-control"]`)!;
				const first = control.querySelector<HTMLInputElement>('input')!;
				expect(control.dataset.size).toBe('large');
				const label = target.querySelector<HTMLLabelElement>(`label[for="${first.id}"]`)!;
				label.click();
				expect(document.activeElement).toBe(first);
			}
			component.disable();
			await tick();
			expect([...new FormData(form).entries()]).toEqual([]);
			for (const kind of ['date', 'time']) {
				const control = target.querySelector<HTMLElement>(`[data-testid="${kind}-control"]`)!;
				const group = target.querySelector<HTMLElement>(`[data-testid="${kind}-group"]`)!;
				expect(control.querySelector<HTMLInputElement>('input')!.disabled).toBe(true);
				expect(getComputedStyle(control).opacity).toBe('1');
				expect(Number(getComputedStyle(group).opacity)).toBeLessThan(1);
			}
			expect(
				getComputedStyle(target.querySelector<HTMLElement>('[data-testid="time-control"] button')!)
					.opacity
			).toBe('1');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
