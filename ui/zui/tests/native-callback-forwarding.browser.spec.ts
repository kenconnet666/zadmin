import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import NativeCallbackForwardingFixture from './NativeCallbackForwardingFixture.svelte';

function callbackCount(): number {
	return Number(
		document.querySelector<HTMLOutputElement>('[data-testid="callback-count"]')?.textContent
	);
}

function pauseChangeCount(): number {
	return Number(
		document.querySelector<HTMLOutputElement>('[data-testid="pause-change-count"]')?.textContent
	);
}

async function showMode(mode: string): Promise<void> {
	document.querySelector<HTMLButtonElement>(`[data-mode="${mode}"]`)!.click();
	await tick();
}

function transition(element: Element): void {
	element.dispatchEvent(new Event('transitionend', { bubbles: true }));
}

describe('native callback forwarding', () => {
	it('forwards carousel and toast hover/focus callbacks while preserving internal pause state', async () => {
		render(NativeCallbackForwardingFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="carousel"]')!;

		carousel.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await tick();
		expect(carousel.dataset.paused).toBe('true');
		carousel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		await tick();
		carousel.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await tick();
		expect(carousel.dataset.paused).toBe('true');
		carousel.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
		await tick();
		expect(carousel.dataset.paused).toBeUndefined();
		expect(callbackCount()).toBe(4);

		await showMode('toast');
		const toast = document.querySelector<HTMLElement>('[data-testid="toast"]')!;
		toast.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		toast.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		toast.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		toast.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
		await tick();
		expect(callbackCount()).toBe(8);
		expect(pauseChangeCount()).toBe(4);
	});

	it('forwards transitionend callbacks and keeps dialog presence completion guarded by target', async () => {
		render(NativeCallbackForwardingFixture);
		await showMode('dialog');
		const content = document.querySelector<HTMLElement>('[data-testid="dialog-content"]')!;
		const overlay = document.querySelector<HTMLElement>('[data-testid="dialog-overlay"]')!;
		transition(content);
		transition(overlay);
		await tick();
		expect(callbackCount()).toBe(2);

		document.querySelector<HTMLButtonElement>('[data-testid="close-active"]')!.click();
		await tick();
		expect(document.querySelector('[data-testid="dialog-content"]')).not.toBeNull();
		transition(content);
		await tick();
		expect(document.querySelector('[data-testid="dialog-content"]')).toBeNull();
	});

	it('forwards Presence transitionend callbacks for popover, tooltip, accordion and tour', async () => {
		render(NativeCallbackForwardingFixture);
		for (const mode of ['popover', 'tooltip', 'accordion', 'tour']) {
			await showMode(mode);
			const content = document.querySelector<HTMLElement>(`[data-testid="${mode}-content"]`);
			expect(content).not.toBeNull();
			transition(content!);
			await tick();
		}
		expect(callbackCount()).toBe(4);
	});
});
