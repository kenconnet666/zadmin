import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { commands, userEvent } from 'vitest/browser';

import TransferDragDropFixture from './TransferDragDropFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

function transfer(target: HTMLElement, testId: string): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function list(root: HTMLElement, label: string): HTMLElement {
	return root.querySelector<HTMLElement>(`[role="listbox"][aria-label="${label}"]`)!;
}

function option(listbox: HTMLElement, label: string): HTMLElement {
	return [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].find(
		(candidate) => candidate.textContent?.trim() === label
	)!;
}

describe('ZTransfer cross-pane drag-drop adapter', () => {
	it('moves an unselected pointer item without clearing other checks or toggling the trailing click', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, { target, props: { scenario: 'immediate' } });
		try {
			const root = transfer(target, 'transfer-drag-immediate');
			const source = list(root, 'Pointer source');
			await userEvent.click(option(source, 'Beta'));
			expect(option(source, 'Beta').getAttribute('aria-selected')).toBe('true');

			await commands.dragElements(
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer source"] [role="option"]:nth-child(1)',
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer target"]'
			);
			await expect.poll(() => list(root, 'Pointer target').textContent).toContain('Number one');
			expect(app.lastImmediateEnd()?.request.source).toBe('pointer');
			expect(app.lastImmediateEnd()?.request.movingKeys).toEqual([1]);
			expect(option(list(root, 'Pointer target'), 'Number one').getAttribute('aria-selected')).toBe(
				'false'
			);
			expect(option(source, 'Beta').getAttribute('aria-selected')).toBe('true');

			await userEvent.click(option(source, 'String one'));
			await commands.dragElements(
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer source"] [role="option"]:nth-child(2)',
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer target"]'
			);
			await expect.poll(() => list(root, 'Pointer target').textContent).toContain('String one');
			expect(app.lastImmediateEnd()?.request.movingKeys).toEqual(['1', 'beta']);
			const anchor = option(list(root, 'Pointer target'), 'Beta');
			expect(list(root, 'Pointer target').getAttribute('aria-activedescendant')).toBe(anchor.id);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('registers virtual option content for pointer moves and restores a mounted active descendant', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, {
			target,
			props: { scenario: 'immediate', virtual: true }
		});
		try {
			const root = transfer(target, 'transfer-drag-immediate');
			const source = list(root, 'Pointer source');
			const number = option(source, 'Number one');
			await commands.dragElements(
				`#${CSS.escape(number.id)}`,
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer target"]'
			);
			await expect.poll(() => app.lastImmediateEnd()?.result).toBe('accepted');
			expect(app.lastImmediateEnd()?.request.movingKeys).toEqual([1]);
			const destination = list(root, 'Pointer target');
			const moved = option(destination, 'Number one');
			await expect.poll(() => destination.getAttribute('aria-activedescendant')).toBe(moved.id);
			expect(moved.isConnected).toBe(true);
			expect(destination.contains(moved)).toBe(true);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('uses the RTL physical shortcut and keeps focus on the listbox', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, { target, props: { scenario: 'rtl' } });
		try {
			const root = transfer(target, 'transfer-drag-rtl');
			const source = list(root, 'RTL source');
			await userEvent.click(option(source, 'Number one'));
			await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
			await expect.poll(() => list(root, 'RTL target').textContent).toContain('Number one');
			expect(app.lastRtlEnd()?.request.source).toBe('keyboard');
			expect(app.lastRtlEnd()?.request.movingKeys).toEqual([1]);
			expect(document.activeElement).toBe(list(root, 'RTL target'));
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('honors a consumer-cancelled keyboard shortcut without issuing a move', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, {
			target,
			props: { cancelShortcut: true, scenario: 'rtl' }
		});
		try {
			const root = transfer(target, 'transfer-drag-rtl');
			const source = list(root, 'RTL source');
			await userEvent.click(option(source, 'Number one'));
			await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
			await tick();
			expect(list(root, 'RTL target').textContent).not.toContain('Number one');
			expect(app.lastRtlEnd()).toBeNull();
			expect(
				new FormData(
					target.querySelector<HTMLFormElement>('[data-testid="transfer-drag-rtl-form"]')!
				).getAll('rtl-transfer')
			).toEqual(['target']);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('routes pointer drop through request mode and remains pending until exact owner echo', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
		try {
			const root = transfer(target, 'transfer-drag-request');
			await commands.dragElements(
				'[data-testid="transfer-drag-request"] [aria-label="Request source"] [role="option"]:nth-child(2)',
				'[data-testid="transfer-drag-request"] [aria-label="Request target"]'
			);
			await expect.poll(() => root.dataset.state).toBe('pending');
			expect(app.lastRequest()?.source).toBe('pointer');
			expect(app.lastRequest()?.movingKeys).toEqual(['1']);
			expect(app.lastRequestEnd()).toBeNull();

			app.echoAndResolveRequest();
			await tick();
			await expect.poll(() => root.dataset.state).toBe('idle');
			expect(app.lastRequestEnd()?.result).toBe('accepted');
			expect(list(root, 'Request target').textContent).toContain('String one');
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('keeps a semantic snapshot clone live but cancels a changed snapshot without issuing a request', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		let app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
		try {
			await commands.dragElements(
				'[data-testid="transfer-drag-request"] [aria-label="Request source"] [role="option"]:nth-child(1)',
				'[data-testid="transfer-drag-request"] [aria-label="Request target"]',
				'[data-testid="clone-transfer-snapshot"]'
			);
			expect(app.wasGestureObserved()).toBe(true);
			await expect
				.poll(() => transfer(target, 'transfer-drag-request').dataset.state)
				.toBe('pending');
			expect(app.lastRequest()?.movingKeys).toEqual([1]);
			await unmount(app);

			target.replaceChildren();
			app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
			await commands.dragElements(
				'[data-testid="transfer-drag-request"] [aria-label="Request source"] [role="option"]:nth-child(2)',
				'[data-testid="transfer-drag-request"] [aria-label="Request target"]',
				'[data-testid="change-transfer-value"]'
			);
			expect(app.wasGestureObserved()).toBe(true);
			await tick();
			expect(transfer(target, 'transfer-drag-request').dataset.state).toBe('idle');
			expect(app.lastRequest()).toBeNull();
			expect(app.lastRequestEnd()).toBeNull();
			await unmount(app);

			target.replaceChildren();
			app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
			await commands.dragElements(
				'[data-testid="transfer-drag-request"] [aria-label="Request source"] [role="option"]:nth-child(1)',
				'[data-testid="transfer-drag-request"] [aria-label="Request target"]',
				'[data-testid="make-transfer-readonly"]'
			);
			expect(app.wasGestureObserved()).toBe(true);
			await tick();
			expect(app.lastRequest()).toBeNull();
			expect(app.lastRequestEnd()).toBeNull();
		} finally {
			await unmount(app);
			target.remove();
		}
	});
});
