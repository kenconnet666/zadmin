import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TourFixture from './TourFixture.svelte';

describe('ZTour production overlay contract', () => {
	it('ZTour resolves targets, navigates steps and restores focus after close', async () => {
		render(TourFixture);
		const start = document.querySelector<HTMLButtonElement>('#tour-start')!;
		start.focus();
		start.click();
		await tick();
		await Promise.resolve();
		let dialog = document.querySelector<HTMLElement>('[role="dialog"][data-step="summary"]')!;
		expect(dialog.textContent).toContain('Release summary');
		expect(document.querySelectorAll('[data-slot="mask"]')).toHaveLength(4);
		expect(document.querySelector('[data-slot="spotlight"]')).not.toBeNull();
		expect(document.activeElement).toBe(dialog.querySelector('[aria-label="Close tour"]'));
		dialog.querySelector<HTMLButtonElement>('[data-slot="actions"] button:last-child')!.click();
		await expect
			.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')?.dataset.step)
			.toBe('metrics');
		dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
		dialog
			.querySelector<HTMLButtonElement>('[data-slot="actions"] button:nth-last-child(2)')!
			.click();
		await tick();
		expect(document.querySelector('[role="dialog"]')?.dataset.step).toBe('summary');
		document
			.querySelector<HTMLElement>('[role="dialog"] [data-slot="actions"] button:last-child')!
			.click();
		await expect
			.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('data-step'))
			.toBe('metrics');
		document
			.querySelector<HTMLElement>('[role="dialog"] [data-slot="actions"] button:last-child')!
			.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(start);
	});

	it('ZTour keeps missing-target policy, non-modal outside behavior and Escape contracts', async () => {
		render(TourFixture);
		const missingStart = document.querySelector<HTMLButtonElement>('#tour-missing-start')!;
		missingStart.click();
		await tick();
		await Promise.resolve();
		expect(document.querySelector('[data-testid="tour-missing-output"]')?.textContent).toBe(
			'false:1'
		);
		const persistent = document.querySelector<HTMLButtonElement>('#tour-persistent-start')!;
		persistent.focus();
		persistent.click();
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[aria-label="Close persistent tour"]')!.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(persistent);
	});
});
