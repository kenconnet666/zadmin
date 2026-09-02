import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import OverlayProductionFixture from './OverlayProductionFixture.svelte';
import PopoverOwnerRealmFixture from './PopoverOwnerRealmFixture.svelte';

describe('ZDialog, ZAlertDialog and ZPopover production contracts', () => {
	it('ZDialog + ZDialogTrigger + ZDialogOverlay + ZDialogContent + ZDialogTitle + ZDialogClose expose real ARIA and focus contracts', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="dialog-production-trigger"]'
		)!;
		expect(trigger.getAttribute('aria-haspopup'), 'ZDialogTrigger aria-haspopup').toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		trigger.click();
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		const content = document.querySelector<HTMLElement>(
			'[data-testid="dialog-production-content"]'
		)!;
		const title = document.querySelector<HTMLElement>('[data-testid="dialog-production-title"]')!;
		const overlay = document.querySelector<HTMLElement>(
			'[data-testid="dialog-production-overlay"]'
		)!;
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(content.parentNode).toBe(document.body);
		expect(overlay.parentNode).toBe(document.body);
		expect(overlay.getAttribute('aria-hidden'), 'ZDialogOverlay aria-hidden').toBe('true');
		expect(overlay.getAttribute('data-state')).toBe('open');
		expect(content.getAttribute('role'), 'ZDialogContent role').toBe('dialog');
		expect(content.getAttribute('aria-modal')).toBe('true');
		expect(content.getAttribute('aria-labelledby'), 'ZDialogTitle registration').toBe(title.id);
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Dialog input');
		expect(content.hasAttribute('aria-labelledby')).toBe(true);
		expect(content.hasAttribute('aria-describedby')).toBe(false);
		const close = document.querySelector<HTMLButtonElement>(
			'[data-testid="dialog-production-close"]'
		);
		expect(close, 'ZDialogClose is mounted as a real button').not.toBeNull();
		close?.click();
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(overlay.getAttribute('data-state')).toBe('closed');
		expect(document.activeElement?.getAttribute('data-testid')).toBe('dialog-production-restore');
	});

	it('ZDialog and ZDialogTrigger/ZDialogOverlay/ZDialogContent dismiss and restore focus as a family', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="dialog-production-trigger"]'
		)!;
		trigger.focus();
		trigger.click();
		await tick();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(
			document
				.querySelector('[data-testid="dialog-production-content"]')
				?.getAttribute('data-state')
		).toBe('closed');
		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(document.querySelector('[data-testid="dialog-production-content"]')).toBeNull();
		expect(document.activeElement?.getAttribute('data-testid')).toBe('dialog-production-restore');
		trigger.click();
		await tick();
		document
			.querySelector<HTMLElement>('[data-testid="dialog-production-overlay"]')
			?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(
			document
				.querySelector('[data-testid="dialog-production-content"]')
				?.getAttribute('data-state')
		).toBe('closed');
		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(document.activeElement?.getAttribute('data-testid')).toBe('dialog-production-restore');
	});

	it('ZAlertDialog + ZAlertDialogTrigger + ZAlertDialogOverlay + ZAlertDialogContent + ZAlertDialogTitle + ZAlertDialogDescription + ZAlertDialogCancel + ZAlertDialogAction enforce modal decision semantics', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-trigger"]'
		)!;
		expect(trigger.getAttribute('aria-haspopup'), 'ZAlertDialogTrigger aria-haspopup').toBe(
			'dialog'
		);
		trigger.click();
		await tick();
		const cancel = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-cancel"]'
		)!;
		const action = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-action"]'
		)!;
		const content = document.querySelector<HTMLElement>(
			'[data-testid="alert-production-content"]'
		)!;
		const title = document.querySelector<HTMLElement>('[data-testid="alert-production-title"]')!;
		const description = document.querySelector<HTMLElement>(
			'[data-testid="alert-production-description"]'
		)!;
		const overlay = document.querySelector<HTMLElement>(
			'[data-testid="alert-production-overlay"]'
		)!;
		expect(content.parentNode).toBe(document.body);
		expect(overlay.parentNode).toBe(document.body);
		expect(content.getAttribute('role'), 'ZAlertDialogContent role').toBe('alertdialog');
		expect(content.getAttribute('aria-labelledby'), 'ZAlertDialogTitle registration').toBe(
			title.id
		);
		expect(content.getAttribute('aria-describedby'), 'ZAlertDialogDescription registration').toBe(
			description.id
		);
		expect(overlay.getAttribute('aria-hidden'), 'ZAlertDialogOverlay aria-hidden').toBe('true');
		expect(overlay.getAttribute('data-state'), 'ZAlertDialogOverlay open state').toBe('open');
		expect(document.activeElement, 'ZAlertDialogCancel initial focus').toBe(cancel);
		action.click();
		await tick();
		expect(action.disabled, 'ZAlertDialogAction pending lock').toBe(true);
		expect(cancel.disabled, 'ZAlertDialogCancel pending lock').toBe(true);
		expect(content?.getAttribute('data-pending')).toBe('true');
		document.querySelector<HTMLButtonElement>('[data-testid="alert-production-resolve"]')?.click();
		await Promise.resolve();
		await tick();
		expect(content.getAttribute('data-state')).toBe('closed');
		expect(
			document
				.querySelector('[data-testid="alert-production-trigger"]')
				?.getAttribute('aria-expanded')
		).toBe('false');
	});

	it('ZAlertDialogAction rejection keeps ZAlertDialogContent open and restores ZAlertDialogAction focus', async () => {
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

	it('ZAlertDialog, ZAlertDialogOverlay and ZAlertDialogContent require ZAlertDialogCancel or ZAlertDialogAction for dismissal', async () => {
		render(OverlayProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-trigger"]'
		)!;
		trigger.focus();
		trigger.click();
		await tick();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(document.querySelector('[data-testid="alert-production-content"]')).not.toBeNull();
		document
			.querySelector<HTMLElement>('[data-testid="alert-production-overlay"]')
			?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="alert-production-content"]')).not.toBeNull();
		const cancel = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-production-cancel"]'
		);
		expect(cancel, 'ZAlertDialogCancel is mounted as a real button').not.toBeNull();
		cancel?.click();
		await tick();
		expect(
			document.querySelector('[data-testid="alert-production-content"]')?.getAttribute('data-state')
		).toBe('closed');
		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(document.activeElement).toBe(trigger);
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
		const ownerWindow = frame.contentWindow as (Window & typeof globalThis) | null;
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
