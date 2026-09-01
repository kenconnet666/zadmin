import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ToastProductionFixture from './ToastProductionFixture.svelte';

describe('Toast production browser contract', () => {
	it('keeps partial updates and task generations on one visual instance', async () => {
		render(ToastProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-update"]')?.click();
		await tick();
		const portal = document.querySelector<HTMLElement>('[data-testid="toast-production-portal"]')!;
		const original = portal.querySelector<HTMLElement>('article');
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

	it('deduplicates same-instance updates and throttles assertive announcements', async () => {
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
