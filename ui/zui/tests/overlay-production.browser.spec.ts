import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import OverlayProductionFixture from './OverlayProductionFixture.svelte';
import PopoverOwnerRealmFixture from './PopoverOwnerRealmFixture.svelte';

describe('ZDialog, ZAlertDialog and ZPopover production contracts', () => {
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

	it('ZPopover owns controlled open state and collision-aware placement', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="popover-production-trigger"]'
		)!;
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		trigger.click();
		await tick();
		const content = document.querySelector<HTMLElement>(
			'[data-testid="popover-production-content"]'
		)!;
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(content.getAttribute('role')).toBe('dialog');
		expect(content.getAttribute('data-state')).toBe('open');
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(content.style.position).toBe('absolute');
		expect(content.style.left).not.toBe('');
		expect(content.style.top).not.toBe('');
	});

	it('ZPopoverTrigger and ZPopoverContent preserve ARIA identity and focus lifecycle', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="popover-production-trigger"]'
		)!;
		trigger.focus();
		trigger.click();
		await tick();
		const content = document.querySelector<HTMLElement>(
			'[data-testid="popover-production-content"]'
		)!;
		expect(content.getAttribute('aria-label')).toBe('Parent popover');
		expect(content.getAttribute('aria-labelledby')).toBeNull();
		expect(document.activeElement).toBe(
			document.querySelector<HTMLButtonElement>('[data-testid="popover-nested-trigger"]')
		);
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
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 250));
		await tick();
		expect(document.querySelector('[data-testid="popover-production-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('ZPopover family keeps Portal, dismiss, Presence and focus resources in the iframe owner realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerWindow = frame.contentWindow;
		const ownerDocument = frame.contentDocument;
		if (!ownerWindow || !ownerDocument) throw new Error('Expected a same-origin iframe realm.');
		const host = ownerDocument.createElement('div');
		ownerDocument.body.append(host);
		const component = mount(PopoverOwnerRealmFixture, {
			props: { portalContainer: ownerDocument },
			target: host
		});
		try {
			const trigger = ownerDocument.querySelector<HTMLButtonElement>(
				'[data-testid="popover-owner-trigger"]'
			)!;
			trigger.focus();
			trigger.click();
			await tick();
			const content = ownerDocument.querySelector<HTMLElement>(
				'[data-testid="popover-owner-content"]'
			)!;
			expect(content.ownerDocument).toBe(ownerDocument);
			expect(content.parentNode).toBe(ownerDocument.body);
			expect(document.querySelector('[data-testid="popover-owner-content"]')).toBeNull();
			expect(
				ownerDocument.activeElement === content || content.contains(ownerDocument.activeElement)
			).toBe(true);

			ownerDocument.dispatchEvent(
				new ownerWindow.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
			);
			await tick();
			expect(content.getAttribute('data-state')).toBe('closed');
			expect(document.querySelector('[data-testid="popover-owner-content"]')).toBeNull();
			await new Promise((resolve) => ownerWindow.setTimeout(resolve, 250));
			expect(ownerDocument.querySelector('[data-testid="popover-owner-content"]')).toBeNull();
			expect(ownerDocument.activeElement).toBe(trigger);

			trigger.click();
			await tick();
			expect(ownerDocument.querySelector('[data-testid="popover-owner-content"]')).not.toBeNull();
			ownerDocument.body.dispatchEvent(
				new ownerWindow.PointerEvent('pointerdown', { bubbles: true })
			);
			await new Promise((resolve) => ownerWindow.setTimeout(resolve, 250));
			expect(ownerDocument.querySelector('[data-testid="popover-owner-content"]')).toBeNull();
			expect(ownerDocument.activeElement).toBe(trigger);
		} finally {
			await unmount(component);
			await new Promise((resolve) => ownerWindow.setTimeout(resolve, 250));
			expect(ownerDocument.querySelector('[data-testid="popover-owner-content"]')).toBeNull();
			frame.remove();
		}
	});
});
