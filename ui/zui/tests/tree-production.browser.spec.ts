import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { mount, unmount } from './browser-lifecycle.js';

import TreeProductionFixture from './TreeProductionFixture.svelte';
import { activateFormReset } from './form-reset.js';

function activeItem(tree: HTMLElement): HTMLElement | null {
	const id = tree.getAttribute('aria-activedescendant');
	return id ? tree.ownerDocument.getElementById(id) : null;
}

async function settle(): Promise<void> {
	await Promise.resolve();
	await tick();
}

describe('ZTree production contracts', () => {
	it('renders typed and virtual ZTree roots for production evidence', async () => {
		await render(TreeProductionFixture);
		await tick();

		const lazyTree = document.querySelector<HTMLElement>('[data-testid="tree-production-lazy"]');
		const virtualTree = document.querySelector<HTMLElement>(
			'[data-testid="tree-production-virtual"]'
		);

		expect(lazyTree?.getAttribute('role')).toBe('tree');
		expect(lazyTree?.querySelector('[role="treeitem"][data-key="workspace"]')).not.toBeNull();
		expect(virtualTree?.getAttribute('role')).toBe('tree');
		expect(virtualTree?.querySelector('[role="treeitem"][data-key="virtual-0"]')).not.toBeNull();
	});

	it('owns active descendant, lazy retry, strict checkbox selection and nearest recovery', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		await tick();

		const tree = host.querySelector<HTMLElement>('[data-testid="tree-production-lazy"]')!;
		tree.focus();
		expect(document.activeElement).toBe(tree);
		expect(activeItem(tree)?.dataset.key).toBe('workspace');
		expect(tree.getAttribute('aria-busy')).toBe('true');

		host.querySelector<HTMLButtonElement>('[data-testid="tree-production-fail"]')!.click();
		await settle();
		expect(tree.querySelector('[data-slot="load-error"][role="status"]')).not.toBeNull();
		component.renameWorkspace();
		await tick();
		expect(tree.querySelector('[data-slot="load-error"][role="status"]')).not.toBeNull();
		expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
			/:1:[^:]+:0/u
		);
		component.setLazyDisabled(true);
		await tick();
		component.setLazyDisabled(false);
		await tick();
		expect(tree.querySelector('[data-slot="load-error"][role="status"]')).not.toBeNull();
		expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
			/:1:[^:]+:0/u
		);

		tree.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(tree.getAttribute('aria-busy')).toBe('true');
		expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toContain(
			':2:'
		);

		host.querySelector<HTMLButtonElement>('[data-testid="tree-production-resolve"]')!.click();
		await settle();
		const docs = tree.querySelector<HTMLElement>('[role="treeitem"][data-key="docs"]')!;
		docs.click();
		await tick();
		expect(
			new FormData(
				host.querySelector<HTMLFormElement>('[data-testid="tree-production-form"]')!
			).getAll('lazy-node')
		).toEqual(['docs']);

		const archive = tree.querySelector<HTMLElement>('[role="treeitem"][data-key="archive"]')!;
		archive.click();
		await tick();
		expect(
			new FormData(
				host.querySelector<HTMLFormElement>('[data-testid="tree-production-form"]')!
			).getAll('lazy-node')
		).toEqual(['docs']);

		host.querySelector<HTMLButtonElement>('[data-testid="tree-production-remove"]')!.click();
		await tick();
		expect(tree.dataset.activeKey).toBe('archive');
		expect(
			new FormData(
				host.querySelector<HTMLFormElement>('[data-testid="tree-production-single-form"]')!
			).getAll('single-node')
		).toEqual(['alpha']);

		await unmount(component);
		host.remove();
	});

	it('keeps label-only updates but replaces an active lazy loader with a new generation', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		try {
			await tick();
			const tree = host.querySelector<HTMLElement>('[data-testid="tree-production-lazy"]')!;
			const firstSignal = component.currentLoadSignal();
			expect(firstSignal?.aborted).toBe(false);

			component.renameWorkspace();
			await tick();
			expect(firstSignal?.aborted).toBe(false);
			expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
				/:1:[^:]+:0/u
			);

			component.setRetryOnAbort(true);
			component.replaceLoader();
			await expect
				.poll(() => host.querySelector('[data-testid="tree-production-output"]')?.textContent)
				.toContain(':2:');
			expect(component.lastAbortRetryResult()).toBe(true);
			expect(firstSignal?.aborted).toBe(true);
			expect(component.currentLoadSignal()?.aborted).toBe(false);
			expect(tree.getAttribute('aria-busy')).toBe('true');

			host.querySelector<HTMLButtonElement>('[data-testid="tree-production-resolve"]')!.click();
			await settle();
			expect(tree.querySelector('[role="treeitem"][data-key="api"]')).not.toBeNull();
			expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
				/:2:[^:]+:1/u
			);
		} finally {
			await unmount(component);
			host.remove();
		}
	});

	it('does not let an unmount abort listener restart lazy work through a retained controller', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		await tick();
		const signal = component.currentLoadSignal();
		const attempts = component.loadAttemptCount();
		component.setRetryOnAbort(true);

		await unmount(component);
		expect(signal?.aborted).toBe(true);
		expect(component.lastAbortRetryResult()).toBe(false);
		expect(component.retryHeldIdle()).toBe(false);
		expect(component.loadAttemptCount()).toBe(attempts);
		host.remove();
	});

	it('cancels lazy work while disabled and aborts the restarted owner on unmount', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		await tick();
		const tree = host.querySelector<HTMLElement>('[data-testid="tree-production-lazy"]')!;
		const firstSignal = component.currentLoadSignal();
		expect(firstSignal?.aborted).toBe(false);
		component.setLazyDisabled(true);
		await expect.poll(() => firstSignal?.aborted).toBe(true);
		expect(tree.getAttribute('aria-busy')).toBeNull();

		component.setLazyDisabled(false);
		await expect
			.poll(() => host.querySelector('[data-testid="tree-production-output"]')?.textContent)
			.toContain(':2:');
		const restartedSignal = component.currentLoadSignal();
		expect(restartedSignal?.aborted).toBe(false);
		await unmount(component);
		expect(restartedSignal?.aborted).toBe(true);
		host.remove();
	});

	it('preserves a completed empty lazy result across disabled state changes', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		try {
			await tick();
			const tree = host.querySelector<HTMLElement>('[data-testid="tree-production-lazy"]')!;
			component.resolveEmptyLoad();
			await settle();
			expect(tree.getAttribute('aria-busy')).toBeNull();
			expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
				/:1:[^:]+:0/u
			);

			component.setLazyDisabled(true);
			await tick();
			component.setLazyDisabled(false);
			await tick();
			expect(tree.getAttribute('aria-busy')).toBeNull();
			expect(host.querySelector('[data-testid="tree-production-output"]')?.textContent).toMatch(
				/:1:[^:]+:0/u
			);
		} finally {
			await unmount(component);
			host.remove();
		}
	});

	it('forgets a removed preloaded key so a later same-key lazy branch loads', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		try {
			await tick();
			expect(
				host.querySelector('[data-testid="tree-production-preloaded-output"]')?.textContent
			).toBe('0');

			component.removePreloadedBranch();
			await tick();
			component.restorePreloadedLazyBranch();
			await expect
				.poll(
					() => host.querySelector('[data-testid="tree-production-preloaded-output"]')?.textContent
				)
				.toBe('1');
		} finally {
			await unmount(component);
			host.remove();
		}
	});

	it('keeps one virtual focus owner and exposes mounted hierarchy metadata', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		await tick();
		const tree = host.querySelector<HTMLElement>('[data-testid="tree-production-virtual"]')!;
		tree.focus();
		tree.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await settle();

		expect(document.activeElement).toBe(tree);
		expect(tree.dataset.activeKey).toBe('virtual-1999');
		expect(activeItem(tree)?.getAttribute('aria-posinset')).toBe('2000');
		expect(activeItem(tree)?.getAttribute('aria-setsize')).toBe('2000');
		expect(tree.querySelectorAll('[role="treeitem"]').length).toBeLessThan(20);
		tree.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(host.querySelector('[data-testid="tree-production-virtual-output"]')?.textContent).toBe(
			'virtual-1999'
		);

		await unmount(component);
		host.remove();
	});

	// @zui-visual ZTree virtual viewport and item geometry
	it('keeps virtual tree viewport bounded to configured height and item size', async () => {
		await render(TreeProductionFixture);
		await tick();
		const tree = document.querySelector<HTMLElement>('[data-testid="tree-production-virtual"]')!;
		const rect = tree.getBoundingClientRect();
		const item = tree.querySelector<HTMLElement>('[role="treeitem"]')!;
		const itemRect = item.getBoundingClientRect();
		expect(rect.height).toBeGreaterThanOrEqual(180);
		expect(rect.height).toBeLessThan(220);
		expect(itemRect.height).toBeGreaterThanOrEqual(30);
		expect(itemRect.height).toBeLessThan(42);
		expect(tree.scrollHeight).toBeGreaterThan(tree.clientHeight);
	});

	it('reuses Tree inside Popover with Field focus, null clear, reset and RTL arrows', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(TreeProductionFixture, { target: host });
		await tick();

		const label = host.querySelector<HTMLLabelElement>(
			'label[for="tree-production-select-trigger"]'
		)!;
		label.click();
		await tick();
		const trigger = host.querySelector<HTMLButtonElement>('#tree-production-select-trigger')!;
		expect(document.activeElement).toBe(trigger);
		trigger.click();
		await tick();
		const popupTree = document.querySelector<HTMLElement>(
			'[role="tree"][aria-label="Choose deployment node"]'
		)!;
		expect(document.activeElement).toBe(popupTree);
		document.querySelector<HTMLElement>('[role="treeitem"][data-key="beta"]')!.click();
		await settle();
		expect(trigger.textContent?.trim()).toBe('Beta');
		expect(
			new FormData(
				host.querySelector<HTMLFormElement>('[data-testid="tree-production-select-form"]')!
			).get('tree-node')
		).toBe('beta');

		host.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(
			host.querySelector('[data-testid="tree-production-select-output"]')?.textContent
		).toContain('null:false');
		await activateFormReset(
			host.querySelector<HTMLFormElement>('[data-testid="tree-production-select-form"]')
		);
		expect(trigger.textContent?.trim()).toBe('Alpha');

		const rtl = host.querySelector<HTMLElement>('[data-testid="tree-production-rtl"]')!;
		rtl.focus();
		rtl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		expect(rtl.querySelector('[data-key="root"]')?.getAttribute('aria-expanded')).toBe('true');
		rtl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(rtl.querySelector('[data-key="root"]')?.getAttribute('aria-expanded')).toBe('false');

		const readonlyTrigger = host.querySelector<HTMLElement>(
			'[data-testid="tree-production-readonly"] [aria-haspopup="tree"]'
		)!;
		readonlyTrigger.click();
		await tick();
		expect(
			host.querySelector('[data-testid="tree-production-readonly"]')?.getAttribute('data-state')
		).toBe('closed');

		await unmount(component);
		host.remove();
	});

	it('keeps Tree observers, lazy signals and TreeSelect portals in the mounted iframe realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const frameDocument = frame.contentDocument;
		if (!frameDocument?.body) throw new Error('Missing iframe document.');
		const ownerGlobals = frame.contentWindow as (Window & typeof globalThis) | null;
		const component = mount(TreeProductionFixture, { target: frameDocument.body });
		await tick();

		const virtual = frameDocument.querySelector<HTMLElement>(
			'[data-testid="tree-production-virtual"]'
		)!;
		const KeyboardEventConstructor = ownerGlobals?.KeyboardEvent;
		if (!KeyboardEventConstructor) throw new Error('Missing iframe KeyboardEvent.');
		virtual.focus();
		virtual.dispatchEvent(new KeyboardEventConstructor('keydown', { bubbles: true, key: 'End' }));
		await settle();
		expect(virtual.ownerDocument).toBe(frameDocument);
		expect(activeItem(virtual)?.ownerDocument).toBe(frameDocument);

		frameDocument.querySelector<HTMLButtonElement>('#tree-production-select-trigger')!.click();
		await tick();
		const popupTree = frameDocument.querySelector<HTMLElement>(
			'[role="tree"][aria-label="Choose deployment node"]'
		);
		expect(popupTree?.ownerDocument).toBe(frameDocument);
		expect(document.querySelector('[role="tree"][aria-label="Choose deployment node"]')).toBeNull();

		await unmount(component);
		frame.remove();
	});
});
