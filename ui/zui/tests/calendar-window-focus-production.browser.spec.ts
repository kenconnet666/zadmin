import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from './CalendarWindowFocusFixture.svelte';

describe('Calendar window focus and era boundaries', () => {
	it('keeps a wholly unavailable month browseable with one grid focus target', async () => {
		render(Fixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="closed-month"]')!;
		root.querySelector<HTMLButtonElement>('[data-slot="header"] button:last-child')!.click();
		await tick();
		const grid = root.querySelector<HTMLTableElement>('[role="grid"]')!;
		expect(grid.getAttribute('aria-label')).toContain('October 2026');
		expect(grid.tabIndex).toBe(0);
		expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		grid.focus();
		grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await tick();
		expect(root.querySelector('[role="grid"]')!.getAttribute('aria-label')).toContain(
			'November 2026'
		);
		expect(document.querySelector('[data-testid="closed-value"]')!.textContent).toBe('2026-09-15');
	});
	it('uses day arithmetic across a Japanese era change inside one month', async () => {
		render(Fixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="era-month"]')!;
		root.querySelector<HTMLButtonElement>('[data-slot="header"] button:last-child')!.click();
		await tick();
		expect(document.querySelector('[data-testid="era-focus"]')!.textContent).toBe('taisho:1-7-30');
		expect(root.querySelector('[data-slot="header"]')!.textContent).toContain('大正');
	});
});
