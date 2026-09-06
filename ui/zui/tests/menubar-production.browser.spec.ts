import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { mount, unmount } from './browser-lifecycle.js';
import MenubarFixture from './MenubarFixture.svelte';

function trigger(name: string): HTMLButtonElement {
	return document.querySelector<HTMLButtonElement>(`[data-testid="menubar-${name}-trigger"]`)!;
}

describe('ZMenubar production contract', () => {
	it('keeps one root Tab stop and opens first or last Menu item from native trigger keys', async () => {
		render(MenubarFixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="menubar-root"]')!;
		const file = trigger('file');
		expect(root.getAttribute('role')).toBe('menubar');
		expect(root.querySelectorAll('[role="menuitem"][tabindex="0"]')).toHaveLength(1);
		expect(file.tabIndex).toBe(0);

		file.focus();
		await userEvent.keyboard('{ArrowDown}');
		const first = document.querySelector<HTMLElement>('[data-testid="menubar-file-first"]')!;
		await expect.poll(() => document.activeElement).toBe(first);
		expect(file.getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.activeElement).toBe(file);
		expect(file.getAttribute('aria-expanded')).toBe('false');

		await userEvent.keyboard('{ArrowUp}');
		const last = document.querySelector<HTMLElement>('[data-testid="menubar-file-last"]')!;
		await expect.poll(() => document.activeElement).toBe(last);
	});

	it('uses root LTR and RTL navigation while keeping Home and End in DOM order', async () => {
		render(MenubarFixture);
		await tick();
		const file = trigger('file');
		const edit = trigger('edit');
		const view = trigger('view');
		file.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(edit);
		await userEvent.keyboard('{End}');
		await expect.poll(() => document.activeElement).toBe(view);
		await userEvent.keyboard('{Home}');
		await expect.poll(() => document.activeElement).toBe(file);

		const rtlFirst = document.querySelector<HTMLButtonElement>(
			'[data-testid="menubar-rtl-first"]'
		)!;
		const rtlLast = document.querySelector<HTMLButtonElement>('[data-testid="menubar-rtl-last"]')!;
		rtlFirst.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(rtlLast);
	});

	it('switches the single open root from keyboard and pointer without restoring the old trigger', async () => {
		render(MenubarFixture);
		await tick();
		const file = trigger('file');
		const edit = trigger('edit');
		file.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('menubar-file-first');
		await userEvent.keyboard('{ArrowRight}');
		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('menubar-edit-first');
		expect(file.getAttribute('aria-expanded')).toBe('false');
		expect(edit.getAttribute('aria-expanded')).toBe('true');

		edit.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		file.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('menubar-file-first');
		expect(file.getAttribute('aria-expanded')).toBe('true');
		expect(edit.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes the menu and leaves the whole menubar on Tab in either direction', async () => {
		render(MenubarFixture);
		await tick();
		const file = trigger('file');
		const before = document.querySelector<HTMLButtonElement>('[data-testid="menubar-before"]')!;
		const after = document.querySelector<HTMLButtonElement>('[data-testid="menubar-after"]')!;
		file.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => document.activeElement).toBe(after);
		expect(file.getAttribute('aria-expanded')).toBe('false');

		file.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.poll(() => document.activeElement).toBe(before);
		expect(file.getAttribute('aria-expanded')).toBe('false');
	});

	it('keeps nested submenu arrows inside ZMenu and restores its parent item', async () => {
		render(MenubarFixture);
		await tick();
		const view = trigger('view');
		view.focus();
		await userEvent.keyboard('{ArrowDown}');
		const subTrigger = document.querySelector<HTMLElement>('[data-testid="menubar-sub-trigger"]')!;
		await expect.poll(() => document.activeElement).toBe(subTrigger);
		await userEvent.keyboard('{ArrowRight}');
		const compact = document.querySelector<HTMLElement>('[data-testid="menubar-radio-compact"]')!;
		await expect.poll(() => document.activeElement).toBe(compact);
		expect(view.getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement).toBe(subTrigger);
		expect(view.getAttribute('aria-expanded')).toBe('true');
	});

	it('reuses Menu action, checkbox and radio ownership without a second selection engine', async () => {
		render(MenubarFixture);
		await tick();
		const file = trigger('file');
		file.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		const checkbox = document.querySelector<HTMLElement>('[data-testid="menubar-file-check"]')!;
		expect(document.activeElement).toBe(checkbox);
		await userEvent.keyboard(' ');
		await tick();
		expect(checkbox.getAttribute('aria-checked')).toBe('true');
		expect(file.getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{Home}');
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => file.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(file);
		expect(document.querySelector('[data-testid="menubar-output"]')?.textContent).toContain(
			':new:'
		);
	});

	it('closes and reconciles focus when the open root becomes disabled or is removed', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		let component = mount(MenubarFixture, { target: host });
		let edit = host.querySelector<HTMLButtonElement>('[data-testid="menubar-edit-trigger"]')!;
		let view = host.querySelector<HTMLButtonElement>('[data-testid="menubar-view-trigger"]')!;
		edit.focus();
		await userEvent.keyboard('{ArrowDown}');
		component.disableEdit();
		await expect.poll(() => edit.disabled).toBe(true);
		await expect.poll(() => document.activeElement).toBe(view);
		await unmount(component);
		host.replaceChildren();

		component = mount(MenubarFixture, { target: host });
		edit = host.querySelector<HTMLButtonElement>('[data-testid="menubar-edit-trigger"]')!;
		view = host.querySelector<HTMLButtonElement>('[data-testid="menubar-view-trigger"]')!;
		edit.focus();
		await userEvent.keyboard('{ArrowDown}');
		component.removeEdit();
		await expect.poll(() => host.querySelector('[data-testid="menubar-edit-trigger"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(view);
		await unmount(component);
		host.remove();
	});

	it('projects all five sizes through the real root triggers', async () => {
		render(MenubarFixture);
		await tick();
		for (const [size, height] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const item = document.querySelector<HTMLButtonElement>(
				`[data-testid="menubar-size-${size}"]`
			)!;
			expect(item.dataset.size).toBe(size);
			expect(item.getBoundingClientRect().height).toBe(height);
		}
	});
});
