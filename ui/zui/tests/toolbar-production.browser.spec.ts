import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import ToolbarFixture from './ToolbarFixture.svelte';

function host(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

describe('ZToolbar production contract', () => {
	it('keeps one Tab stop while preserving native activation, links and disabled semantics', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const editor = target.querySelector<HTMLElement>('[aria-label="Editor toolbar"]')!;
		const save = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-save"]')!;
		const middle = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-middle"]')!;
		const disabled = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-disabled"]')!;
		const nativeLink = target.querySelector<HTMLAnchorElement>(
			'[data-testid="toolbar-native-link"]'
		)!;
		const disabledLink = target.querySelector<HTMLAnchorElement>(
			'[data-testid="toolbar-disabled-link"]'
		)!;
		const providerToolbar = target.querySelector<HTMLElement>('[aria-label="Provider toolbar"]')!;

		expect(editor.getAttribute('role')).toBe('toolbar');
		expect(editor.getAttribute('aria-orientation')).toBe('horizontal');
		expect(editor.dataset.size).toBe('small');
		expect(providerToolbar.dataset.size).toBe('large');
		expect(save.dataset.size).toBe('xsmall');
		expect(
			target.querySelector<HTMLElement>('[data-testid="toolbar-provider-command"]')?.dataset.size
		).toBe('large');
		expect(getComputedStyle(editor).gap).toBe('10px');
		expect(editor.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(save.tabIndex).toBe(0);
		expect(middle.tabIndex).toBe(-1);
		expect(disabled.disabled).toBe(true);
		expect(disabled.tabIndex).toBe(-1);
		expect(disabledLink.tagName).toBe('A');
		expect(disabledLink.getAttribute('href')).toBeNull();
		expect(disabledLink.getAttribute('aria-disabled')).toBe('true');
		expect(disabledLink.tabIndex).toBe(-1);

		await userEvent.click(save);
		expect(target.querySelector('[data-testid="toolbar-output"]')?.textContent).toBe('1|0');
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(middle);
		await userEvent.click(nativeLink);
		expect(window.location.hash).toBe('#toolbar-docs');
		window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
		await unmount(component);
		target.remove();
	});

	it('uses native direction and orientation, and lets user handlers cancel internal navigation', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const rtl = target.querySelector<HTMLElement>('[aria-label="RTL toolbar"]')!;
		const rtlFirst = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-rtl-first"]')!;
		const rtlLast = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-rtl-last"]')!;
		const vertical = target.querySelector<HTMLElement>('[aria-label="Vertical toolbar"]')!;
		const verticalFirst = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-vertical-first"]'
		)!;
		const verticalLast = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-vertical-last"]'
		)!;
		const cancelledFirst = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-cancelled-first"]'
		)!;

		expect(rtl.getAttribute('dir')).toBe('rtl');
		expect(rtl.querySelectorAll(':scope > button')).toHaveLength(2);
		expect(rtlFirst.tabIndex).toBe(0);
		expect(rtlLast.tabIndex).toBe(-1);
		await userEvent.click(rtlFirst);
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(rtlLast);
		expect(rtlFirst.tabIndex).toBe(-1);
		expect(rtlLast.tabIndex).toBe(0);
		expect(rtl.querySelectorAll(':scope > button')).toHaveLength(2);

		expect(vertical.getAttribute('aria-orientation')).toBe('vertical');
		await userEvent.click(verticalFirst);
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(verticalLast);
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(verticalLast);
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(verticalFirst);

		await userEvent.click(cancelledFirst);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(cancelledFirst);
		expect(target.querySelector('[data-testid="toolbar-output"]')?.textContent).toBe('0|1');
		await unmount(component);
		target.remove();
	});

	it('keeps a nested Toolbar as a separate physical and logical focus owner', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const outerFirst = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-outer-first"]'
		)!;
		const outerLast = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-outer-last"]'
		)!;
		const innerFirst = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-inner-first"]'
		)!;
		const innerLast = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-inner-last"]'
		)!;
		expect(innerFirst.tabIndex).toBe(0);
		expect(innerLast.tabIndex).toBe(-1);
		expect(
			innerFirst.closest('[role="toolbar"]')?.querySelectorAll(':scope > button')
		).toHaveLength(2);

		await userEvent.click(innerFirst);
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(innerLast);
		expect(innerFirst.tabIndex).toBe(-1);
		expect(innerLast.tabIndex).toBe(0);
		outerFirst.disabled = true;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
		);
		expect(document.activeElement).toBe(innerLast);
		outerFirst.disabled = false;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
		);
		await userEvent.click(outerFirst);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(outerLast);
		await unmount(component);
		target.remove();
	});

	it('preserves conflicting control keys and uses the Toolbar axis for non-conflicting keys', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const number = target.querySelector<HTMLInputElement>('[data-testid="toolbar-number"]')!;
		const after = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-after-input"]')!;
		const search = target.querySelector<HTMLInputElement>('[data-testid="toolbar-search"]')!;

		await userEvent.click(number);
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(number);
		expect(number.value).toBe('6');
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(after);

		await userEvent.click(search);
		search.setSelectionRange(search.value.length, search.value.length);
		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe(search);
		expect(search.selectionStart).toBe(search.value.length - 1);
		await userEvent.keyboard('{Control>}{ArrowLeft}{/Control}');
		expect(document.activeElement).toBe(search);
		await userEvent.keyboard('{Tab}');
		expect(
			target.querySelector('[aria-label="Editor toolbar"]')?.contains(document.activeElement)
		).toBe(false);
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(document.activeElement).toBe(target.querySelector('[data-testid="toolbar-save"]'));
		await unmount(component);
		target.remove();
	});

	it('reconciles focused removal and disablement to the nearest enabled mounted item', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const save = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-save"]')!;
		const middle = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-middle"]')!;
		const number = target.querySelector<HTMLInputElement>('[data-testid="toolbar-number"]')!;

		await userEvent.click(middle);
		component.removeMiddle();
		await expect.poll(() => document.activeElement).toBe(number);
		await userEvent.click(save);
		component.disableSave();
		await expect.poll(() => document.activeElement).toBe(number);
		expect(save.disabled).toBe(true);
		expect(save.tabIndex).toBe(-1);
		await unmount(component);
		target.remove();
	});

	it('does not steal focus back when focus leaves during the removal gap', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const middle = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-middle"]')!;
		const external = target.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-external-focus"]'
		)!;

		await userEvent.click(middle);
		component.removeMiddle();
		external.focus();
		await expect.poll(() => target.querySelector('[data-testid="toolbar-middle"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(external);
		await unmount(component);
		target.remove();
	});

	it('navigates only physically visible OverflowList items and preserves its geometry focus handoff', async () => {
		const target = host();
		const component = mount(ToolbarFixture, { target });
		const list = target.querySelector<HTMLElement>('[data-testid="toolbar-overflow-list"]')!;
		const first = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-overflow-one"]')!;
		const second = target.querySelector<HTMLButtonElement>('[data-testid="toolbar-overflow-two"]')!;
		const trigger = target.querySelector<HTMLButtonElement>(
			'[aria-label="More toolbar actions"][aria-haspopup="dialog"]'
		)!;
		await expect.poll(() => list.dataset.measured).toBe('true');
		await expect.poll(() => Number(trigger.dataset.overflowCount)).toBe(3);
		await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
		expect(first.tabIndex).toBe(0);
		expect(second.closest<HTMLElement>('[data-overflow-hidden="true"]')).not.toBeNull();
		expect(second.tabIndex).toBe(-1);

		await userEvent.click(first);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(trigger);
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(first);
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(trigger);

		await userEvent.click(trigger);
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		expect(document.activeElement?.getAttribute('data-testid')).toBe(
			'toolbar-overflow-menu-action'
		);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(trigger);

		component.setToolbarOverflowWidth(640);
		await expect
			.poll(
				() =>
					target
						.querySelector<HTMLElement>('[data-testid="toolbar-overflow-owner"]')
						?.getBoundingClientRect().width
			)
			.toBeCloseTo(640, 0);
		await expect
			.poll(() => trigger.closest<HTMLElement>('[data-overflow-hidden="true"]'))
			.not.toBeNull();
		await expect.poll(() => document.activeElement).toBe(first);
		expect(list.querySelectorAll('[data-overflow-hidden="true"][data-slot="item"]')).toHaveLength(
			0
		);
		expect(first.tabIndex).toBe(0);
		expect(second.tabIndex).toBe(-1);
		expect(trigger.tabIndex).toBe(-1);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(second);
		await unmount(component);
		target.remove();
	});
});
