import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { mount, unmount } from './browser-lifecycle.js';

import MenuFamilyProductionFixture from './MenuFamilyProductionFixture.svelte';

async function finishPresence(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 140));
	await tick();
}

describe('production ZMenu / ZDropdownMenu / ZContextMenu family', () => {
	it('ZMenu uses logical order for roving focus, locale typeahead and dynamic nearest recovery', async () => {
		render(MenuFamilyProductionFixture);
		const first = document.querySelector<HTMLElement>('[data-testid="menu-first"]')!;
		const middle = document.querySelector<HTMLElement>('[data-testid="menu-middle"]')!;
		first.focus();
		first.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(middle);

		document
			.querySelector<HTMLButtonElement>('[data-testid="menu-remove"]')!
			.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect
			.poll(() => document.activeElement)
			.toBe(document.querySelector<HTMLElement>('[data-testid="menu-last"]'));

		(document.activeElement as HTMLElement).dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'a' })
		);
		expect(document.activeElement).toBe(first);
	});

	it('ZMenu projects checkbox, mixed, typed radio, real link and cancellable action contracts', async () => {
		render(MenuFamilyProductionFixture);
		const checkbox = document.querySelector<HTMLElement>('[data-testid="menu-check"]')!;
		expect(checkbox.getAttribute('role')).toBe('menuitemcheckbox');
		expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
		await userEvent.click(checkbox);
		expect(checkbox.getAttribute('aria-checked')).toBe('true');
		const blocked = document.querySelector<HTMLElement>('[data-testid="menu-check-blocked"]')!;
		await userEvent.click(blocked);
		expect(blocked.getAttribute('aria-checked')).toBe('false');

		await userEvent.click(document.querySelector('[data-testid="menu-radio-number"]')!);
		expect(
			document.querySelector('[data-testid="menu-radio-number"]')?.getAttribute('aria-checked')
		).toBe('true');
		await userEvent.click(document.querySelector('[data-testid="menu-radio-string"]')!);
		expect(
			document.querySelector('[data-testid="menu-radio-string"]')?.getAttribute('aria-checked')
		).toBe('true');

		const previousHash = location.hash;
		await userEvent.click(document.querySelector('[data-testid="menu-link-cancelled"]')!);
		expect(location.hash).toBe(previousHash);
		expect(document.querySelector('[data-testid="menu-state"]')?.textContent).toContain(':1');
		expect(document.querySelector('[data-slot="shortcut"]')?.tagName).toBe('KBD');
	});

	it('ZDropdownMenu opens from both arrow edges and preserves close-on-select policy', async () => {
		render(MenuFamilyProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="dropdown-trigger"]')!;
		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(document.activeElement).toBe(
			document.querySelector<HTMLElement>('[data-testid="dropdown-last"]')
		);
		const content = document.querySelector<HTMLElement>('[data-testid="dropdown-content"]')!;
		expect(getComputedStyle(content).overflowY).toBe('auto');
		await expect
			.poll(() => content.style.getPropertyValue('--zui-floating-available-height'))
			.toMatch(/px$/u);

		await userEvent.click(document.querySelector('[data-testid="dropdown-check"]')!);
		expect(document.querySelector('[data-testid="dropdown-content"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await finishPresence();
		expect(document.activeElement).toBe(trigger);
	});

	it('ZDropdownMenu coordinates nested layers, RTL submenu keys, action bubbling and trigger focus restore', async () => {
		render(MenuFamilyProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="dropdown-trigger"]')!;
		await userEvent.click(trigger);
		let subTrigger = document.querySelector<HTMLElement>('[data-testid="dropdown-sub-trigger"]')!;
		subTrigger.focus();
		subTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(
			document.querySelector<HTMLElement>('[data-testid="dropdown-sub-item"]')
		);

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await finishPresence();
		expect(document.querySelector('[data-testid="dropdown-sub-content"]')).toBeNull();
		expect(document.querySelector('[data-testid="dropdown-content"]')).not.toBeNull();
		expect(document.activeElement).toBe(subTrigger);

		subTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await finishPresence();
		expect(document.querySelector('[data-testid="dropdown-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);

		await userEvent.click(trigger);
		subTrigger = document.querySelector<HTMLElement>('[data-testid="dropdown-sub-trigger"]')!;
		subTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		await userEvent.click(document.querySelector('[data-testid="dropdown-sub-item"]')!);
		await finishPresence();
		expect(document.querySelector('[data-testid="dropdown-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(document.querySelector('[data-testid="menu-state"]')?.textContent).toContain(
			'dropdown:mail'
		);
	});

	it('ZContextMenu anchors at pointer and RTL keyboard logical start while exposing shortcuts', async () => {
		render(MenuFamilyProductionFixture);
		const target = document.querySelector<HTMLElement>('[data-testid="context-trigger"]')!;
		expect(target.getAttribute('aria-keyshortcuts')).toBe('ContextMenu Shift+F10');
		target.dispatchEvent(
			new MouseEvent('contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: 34,
				clientY: 56
			})
		);
		await tick();
		const anchor = document.querySelector<HTMLElement>(
			`[data-zui-context-menu-anchor="${target.getAttribute('aria-controls')}"]`
		)!;
		expect(anchor.style.left).toBe('34px');
		expect(anchor.style.top).toBe('56px');
		expect(document.activeElement).toBe(
			document.querySelector<HTMLElement>('[data-testid="context-first"]')
		);

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await finishPresence();
		expect(document.activeElement).toBe(target);

		const rtl = document.querySelector<HTMLElement>('[data-testid="context-rtl-trigger"]')!;
		const rect = rtl.getBoundingClientRect();
		rtl.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'F10',
				shiftKey: true
			})
		);
		await tick();
		expect(
			document.querySelector<HTMLElement>(
				`[data-zui-context-menu-anchor="${rtl.getAttribute('aria-controls')}"]`
			)?.style.left
		).toBe(`${rect.right}px`);
	});

	it('ZContextMenu keeps keyboard, Portal, dismiss and focus ownership in an iframe owner realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument;
		const ownerWindow = frame.contentWindow;
		if (!ownerDocument || !ownerWindow) throw new Error('Expected a same-origin iframe realm.');
		const ownerGlobals = ownerWindow as Window & typeof globalThis;
		const fixture = mount(MenuFamilyProductionFixture, { target: ownerDocument.body });
		await tick();
		const target = ownerDocument.querySelector<HTMLElement>('[data-testid="context-trigger"]')!;
		target.dispatchEvent(
			new ownerGlobals.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ContextMenu'
			})
		);
		await tick();
		expect(ownerDocument.activeElement).toBe(
			ownerDocument.querySelector<HTMLElement>('[data-testid="context-first"]')
		);
		ownerDocument.dispatchEvent(
			new ownerGlobals.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
		);
		await finishPresence();
		expect(ownerDocument.activeElement).toBe(target);
		await unmount(fixture);
		frame.remove();
	});
});
