import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import GroupCenterSpacerFixture from './GroupCenterSpacerFixture.svelte';

describe('ZGroup, ZCenter and ZSpacer production contracts', () => {
	it('keeps Group children in DOM order with declared grow, equal-width and shrink boundaries', () => {
		// @zui-visual ZGroup native flex item sizing
		render(GroupCenterSpacerFixture);
		const defaultGroup = document.querySelector<HTMLElement>('[data-testid="group-default"]')!;
		const grow = document.querySelector<HTMLElement>('[data-testid="group-grow"]')!;
		const equal = document.querySelector<HTMLElement>('[data-testid="group-equal"]')!;
		const rtl = document.querySelector<HTMLElement>('[data-testid="group-rtl"]')!;
		expect(defaultGroup.children).toHaveLength(2);
		expect(defaultGroup.textContent).toContain('First');
		expect(defaultGroup.dataset.itemSizing).toBe('auto');
		expect(grow.dataset.itemSizing).toBe('grow');
		expect(grow.dataset.preventGrowOverflow).toBe('true');
		for (const child of [...grow.children] as HTMLElement[]) {
			expect(getComputedStyle(child).flexGrow).toBe('1');
			expect(getComputedStyle(child).minInlineSize).toBe('0px');
		}
		for (const child of [...equal.children] as HTMLElement[]) {
			expect(getComputedStyle(child).flexGrow).toBe('1');
			expect(getComputedStyle(child).flexBasis).toBe('0px');
		}
		const first = equal.children[0]!.getBoundingClientRect();
		const second = equal.children[1]!.getBoundingClientRect();
		expect(first.width).toBeGreaterThan(0);
		expect(Math.abs(first.width - second.width)).toBeLessThan(1);
		expect(getComputedStyle(rtl).direction).toBe('rtl');
		expect(getComputedStyle(rtl).justifyContent).toBe('space-between');
	});

	it('centers both axes and applies fixed or theme spacer dimensions without changing parent gap', () => {
		// @zui-visual ZCenter measured two-axis alignment
		// @zui-visual ZSpacer actual logical dimensions
		render(GroupCenterSpacerFixture);
		const center = document.querySelector<HTMLElement>('[data-testid="center-block"]')!;
		const centerRect = center.getBoundingClientRect();
		const childRect = center.firstElementChild!.getBoundingClientRect();
		expect(
			Math.abs(childRect.left + childRect.width / 2 - centerRect.left - centerRect.width / 2)
		).toBeLessThan(1);
		expect(
			Math.abs(childRect.top + childRect.height / 2 - centerRect.top - centerRect.height / 2)
		).toBeLessThan(1);
		const inline = document.querySelector<HTMLElement>('[data-testid="center-inline"]')!;
		const fixed = document.querySelector<HTMLElement>('[data-testid="spacer-fixed"]')!;
		const defaultSpacer = document.querySelector<HTMLElement>('[data-testid="spacer-default"]')!;
		expect(getComputedStyle(center).display).toBe('flex');
		expect(getComputedStyle(center).alignItems).toBe('center');
		expect(getComputedStyle(center).justifyContent).toBe('center');
		expect(getComputedStyle(inline).display).toBe('inline-flex');
		expect(getComputedStyle(fixed).inlineSize).toBe('20px');
		expect(getComputedStyle(fixed).blockSize).toBe('12px');
		expect(getComputedStyle(defaultSpacer).inlineSize).toBe('8px');
		expect(getComputedStyle(defaultSpacer).blockSize).toBe('0px');
		expect(getComputedStyle(fixed).flexShrink).toBe('0');
	});
});

it('forwards changing native styles through Group to its single Stack DOM owner', async () => {
	render(GroupCenterSpacerFixture);
	const group = document.querySelector<HTMLElement>('[data-testid="group-reactive-style"]')!;
	expect(group.getBoundingClientRect().width).toBe(240);
	document.querySelector<HTMLButtonElement>('[data-testid="group-width-toggle"]')!.click();
	await tick();
	expect(group.getBoundingClientRect().width).toBe(300);
});
