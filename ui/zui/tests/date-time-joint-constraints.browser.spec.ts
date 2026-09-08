import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DateTimeJointConstraintsFixture from './DateTimeJointConstraintsFixture.svelte';

function panel(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

describe('date-time joint panel constraints', () => {
	it('keeps an empty same-day boundary reachable at hidden minute, second and millisecond precision', async () => {
		await render(DateTimeJointConstraintsFixture);
		const target = panel('joint-boundary-panel');
		const hour = target.querySelector<HTMLElement>('[role="listbox"] [aria-selected="true"]')!;
		expect(hour.textContent?.trim()).toBe('10');
		hour.click();
		await tick();
		expect(document.querySelector('[data-testid="joint-boundary-output"]')?.textContent).toBe(
			'2026-09-07T10:30:15.125|1'
		);
	});

	it('keeps readonly time columns focusable and navigable while blocking every write action', async () => {
		await render(DateTimeJointConstraintsFixture);
		const target = panel('joint-readonly-panel');
		const hourColumn = target.querySelector<HTMLElement>('[role="listbox"]')!;
		expect(hourColumn.tabIndex).toBe(0);
		expect(hourColumn.getAttribute('aria-readonly')).toBe('true');
		hourColumn.focus();
		hourColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		hourColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		target.querySelector<HTMLElement>('[role="option"][aria-selected="false"]')?.click();
		for (const button of target.querySelectorAll<HTMLButtonElement>(
			'[data-slot="date-time-actions"] button'
		))
			expect(button.disabled).toBe(true);
		expect(
			target.querySelector<HTMLButtonElement>('[data-slot="date-time-footer"] button:last-child')
				?.disabled
		).toBe(true);
		await tick();
		expect(document.querySelector('[data-testid="joint-readonly-output"]')?.textContent).toBe(
			'2026-09-07T10:30:15.125|0:0'
		);
	});

	it('evaluates a controlled preset once and returns to the unchanged parent value', async () => {
		await render(DateTimeJointConstraintsFixture);
		const target = panel('joint-controlled-panel');
		const preset = [...target.querySelectorAll<HTMLButtonElement>('button')].find(
			(button) => button.textContent?.trim() === 'Rejected preset'
		)!;
		preset.click();
		await tick();
		await Promise.resolve();
		expect(document.querySelector('[data-testid="joint-controlled-output"]')?.textContent).toBe(
			'1:1'
		);
		expect(
			target
				.querySelector<HTMLButtonElement>('[role="grid"] [aria-selected="true"]')
				?.textContent?.trim()
		).toBe('7');
	});
});
