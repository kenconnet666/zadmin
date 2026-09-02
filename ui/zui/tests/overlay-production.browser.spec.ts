import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import OverlayProductionFixture from './OverlayProductionFixture.svelte';

describe('Dialog AlertDialog and Popover production contracts', () => {
	it('uses real ARIA registration and explicit initial/restore focus for Dialog', async () => {
		render(OverlayProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="dialog-production-trigger"]')?.click();
		await tick();
		const content = document.querySelector<HTMLElement>(
			'[data-testid="dialog-production-content"]'
		)!;
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Dialog input');
		expect(content.hasAttribute('aria-labelledby')).toBe(true);
		expect(content.hasAttribute('aria-describedby')).toBe(false);
		document.querySelector<HTMLButtonElement>('[data-testid="dialog-production-close"]')?.click();
		await tick();
		expect(document.activeElement?.getAttribute('data-testid')).toBe('dialog-production-restore');
	});

	it('defaults AlertDialog focus to Cancel and locks every decision while pending', async () => {
		render(OverlayProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="alert-production-trigger"]')?.click();
		await tick();
		const cancel = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-cancel"]'
		)!;
		const action = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-action"]'
		)!;
		expect(document.activeElement).toBe(cancel);
		action.click();
		await tick();
		expect(action.disabled).toBe(true);
		expect(cancel.disabled).toBe(true);
		expect(
			document
				.querySelector('[data-testid="alert-production-content"]')
				?.getAttribute('data-pending')
		).toBe('true');
		document.querySelector<HTMLButtonElement>('[data-testid="alert-production-resolve"]')?.click();
		await Promise.resolve();
		await tick();
		expect(
			document.querySelector('[data-testid="alert-production-content"]')?.getAttribute('data-state')
		).toBe('closed');
	});

	it('keeps AlertDialog open and restores Action focus when the current action rejects', async () => {
		render(OverlayProductionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="alert-production-trigger"]')?.click();
		await tick();
		const action = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-action"]'
		)!;
		action.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="alert-production-reject"]')?.click();
		await Promise.resolve();
		await tick();
		expect(document.querySelector('[data-testid="alert-production-content"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="alert-production-output"]')?.textContent).toBe(
			'true:1'
		);
		expect(document.activeElement).toBe(action);
	});

	it('keeps controlled and nested Popover branches independently dismissible', async () => {
		render(OverlayProductionFixture);
		document
			.querySelector<HTMLButtonElement>('[data-testid="popover-production-trigger"]')
			?.click();
		await tick();
		expect(document.querySelector('[data-testid="popover-production-content"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="popover-nested-trigger"]')?.click();
		await tick();
		expect(document.querySelector('[aria-label="Nested popover"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(
			document.querySelector('[aria-label="Nested popover"]')?.getAttribute('data-state')
		).toBe('closed');
		expect(document.querySelector('[data-testid="popover-production-content"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="popover-production-output"]')?.textContent).toBe(
			'true'
		);
	});
});
