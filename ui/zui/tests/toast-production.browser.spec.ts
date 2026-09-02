import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CoverageFixture from './CoverageFixture.svelte';
import ToastProductionFixture from './ToastProductionFixture.svelte';

describe('ZToast and ZToaster production browser contract', () => {
	it('ZToast keeps standalone announcement, tone, action and dismiss boundaries real', async () => {
		render(CoverageFixture);
		const danger = document.querySelector<HTMLElement>('[data-testid="coverage-toast-danger"]')!;
		const action = document.querySelector<HTMLElement>('[data-testid="coverage-toast-action"]')!;

		expect(danger.tagName).toBe('ARTICLE');
		expect(danger.dataset.tone).toBe('danger');
		expect(danger.querySelector('[data-slot="announcement"]')?.getAttribute('role')).toBe('alert');
		expect(danger.querySelector('[data-slot="actions"]')).toBeNull();
		action.querySelector<HTMLButtonElement>('button')!.click();
		await tick();
		expect(
			document.querySelector('[data-testid="coverage-output"]')?.textContent?.split(':')[3]
		).toBe('1');
	});

	it('ZToast keeps one visual instance for content, action, update and Presence', async () => {
		render(ToastProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-update"]')?.click();
		await tick();
		const portal = document.querySelector<HTMLElement>('[data-testid="toast-production-portal"]')!;
		const original = portal.querySelector<HTMLElement>('article');
		expect(original?.dataset.phase).toBe('visible');
		expect(original?.dataset.presence).toBe('entered');
		expect(
			[...original!.querySelectorAll<HTMLButtonElement>('button')].some(
				(button) => button.textContent?.trim() === 'Review'
			)
		).toBe(true);
		document.querySelector<HTMLButtonElement>('[data-testid="toast-update"]')?.click();
		await tick();
		expect(portal.querySelector<HTMLElement>('article')).toBe(original);
		expect(original?.textContent).toContain('Updated title');
		expect(original?.textContent).toContain('Preserve this description');

		document.querySelector<HTMLButtonElement>('[data-testid="toast-start-tasks"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="toast-resolve-new"]')?.click();
		await Promise.resolve();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="toast-resolve-old"]')?.click();
		await Promise.resolve();
		await tick();
		expect(
			document.querySelector<HTMLOutputElement>('[data-testid="toast-production-output"]')
				?.textContent
		).toContain('task-target:Task ready new:success:polite:visible');
	});

	it('ZToaster connects the caller queue to viewport, FIFO visibility and live regions', async () => {
		render(ToastProductionFixture);
		const viewport = document.querySelector<HTMLElement>('[data-slot="viewport"]')!;
		expect(viewport.getAttribute('aria-label')).toBe('Production notifications');
		expect(viewport.dataset.queued).toBe('0');
		expect(document.querySelector('[data-slot="polite-announcer"]')).not.toBeNull();
		expect(document.querySelector('[data-slot="assertive-announcer"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-overflow"]')?.click();
		await tick();
		const visible = [...viewport.querySelectorAll<HTMLElement>('article')];
		expect(visible).toHaveLength(4);
		expect(visible.map((toast) => toast.textContent)).toEqual([
			expect.stringContaining('FIFO 1'),
			expect.stringContaining('FIFO 2'),
			expect.stringContaining('FIFO 3'),
			expect.stringContaining('FIFO 4')
		]);
		expect(viewport.textContent).not.toContain('FIFO 5');
		expect(viewport.dataset.queued).toBe('1');
	});

	it('ZToaster deduplicates same-id updates, pauses/resumes and throttles assertive announcements', async () => {
		render(ToastProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-alert"]')?.click();
		await tick();
		const assertive = document.querySelector<HTMLElement>('[data-slot="assertive-announcer"]')!;
		const polite = document.querySelector<HTMLElement>('[data-slot="polite-announcer"]')!;
		expect(assertive.textContent).toContain('Critical one');
		const firstAnnouncement = assertive.textContent;

		document.querySelector<HTMLButtonElement>('[data-testid="toast-update-alert"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-second-alert"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-success"]')?.click();
		await tick();
		expect(assertive.textContent).toBe(firstAnnouncement);
		expect(polite.textContent).toContain('Saved');
		await new Promise((resolve) => window.setTimeout(resolve, 1050));
		await tick();
		expect(assertive.textContent).toContain('Critical two');

		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-timed"]')?.click();
		await tick();
		const timed = [...document.querySelectorAll<HTMLElement>('article')].find((toast) =>
			toast.textContent?.includes('Timed notification')
		)!;
		timed.dispatchEvent(new MouseEvent('mouseenter'));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
		expect(document.body.contains(timed)).toBe(true);
		timed.dispatchEvent(new MouseEvent('mouseleave'));
		await expect.poll(() => document.body.contains(timed)).toBe(false);

		const updated = document
			.querySelector<HTMLElement>('[data-testid="toast-production-portal"]')
			?.querySelector<HTMLElement>('article');
		const close = updated?.querySelector<HTMLButtonElement>('button[aria-label]');
		close?.focus();
		close?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(updated?.dataset.phase).toBe('exiting');
	});
});
