import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { tick } from 'svelte';

import { mount, unmount } from './browser-lifecycle.js';
import OverflowListFixture from './OverflowListFixture.svelte';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function host(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

async function animationFrames(count: number): Promise<void> {
	for (let index = 0; index < count; index += 1) {
		await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
	}
}

function visibleItemCount(root: HTMLElement): number {
	return [...root.querySelectorAll<HTMLElement>(':scope > [data-slot="item"]')].filter(
		(item) => item.dataset.overflowHidden !== 'true'
	).length;
}

describe('ZOverflowList production contract', () => {
	it('keeps one DOM instance per typed item, moves focus to the real overflow entry, and restores it when all items fit', async () => {
		// @zui-visual ZOverflowList measured collapse, hidden item geometry, focus transfer and restore
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const root = target.querySelector<HTMLElement>('[data-testid="overflow-geometry"]')!;
		await expect.poll(() => root.dataset.measured).toBe('true');
		expect(root.dataset.fits).toBe('true');
		expect(root.querySelectorAll('[data-slot="item"]')).toHaveLength(4);
		expect(document.querySelectorAll('#overflow-item-number-1')).toHaveLength(1);
		expect(document.querySelectorAll('#overflow-item-string-1')).toHaveLength(1);

		component.focusGeometry('third');
		expect(document.activeElement?.getAttribute('data-testid')).toBe('geometry-third');
		component.setWidth(320);
		await expect
			.poll(() => root.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden)
			.toBeUndefined();
		const overflow = root.querySelector<HTMLButtonElement>('[data-testid="geometry-overflow"]')!;
		expect(Number(overflow.dataset.overflowCount)).toBeGreaterThan(0);
		await expect.poll(() => document.activeElement).toBe(overflow);
		const hidden = root.querySelector<HTMLElement>(
			'[data-slot="item"][data-overflow-hidden="true"]'
		)!;
		expect(hidden.getAttribute('aria-hidden')).toBe('true');
		expect(hidden.inert).toBe(true);
		expect(hidden.querySelectorAll('[id]').length).toBe(1);

		component.setWidth(640);
		await expect
			.poll(() => root.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden)
			.toBe('true');
		await expect.poll(() => document.activeElement?.getAttribute('data-testid')).toBe('geometry-1');
		await unmount(component);
		target.remove();
	});

	it('retains a measured split while suspended, then responds to width, label and explicit font/style refresh changes', async () => {
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const geometry = target.querySelector<HTMLElement>('[data-testid="overflow-geometry"]')!;
		const labels = target.querySelector<HTMLElement>('[data-testid="overflow-labels"]')!;
		await expect.poll(() => geometry.dataset.measured).toBe('true');
		component.setWidth(320);
		await expect
			.poll(
				() => geometry.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden
			)
			.toBeUndefined();
		const retainedCount = geometry.querySelector('[data-testid="geometry-overflow"]')?.textContent;
		component.setSuspended(true);
		component.setWidth(640);
		await tick();
		expect(geometry.querySelector('[data-testid="geometry-overflow"]')?.textContent).toBe(
			retainedCount
		);
		component.setSuspended(false);
		await expect
			.poll(
				() => geometry.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden
			)
			.toBe('true');

		await expect.poll(() => labels.dataset.measured).toBe('true');
		expect(
			labels.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden
		).toBe('true');
		component.setLongLabels();
		component.notifyFontsChanged();
		component.refreshForFontOrStyleChange();
		await expect
			.poll(
				() => labels.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden
			)
			.toBeUndefined();
		expect(
			Number(
				labels.querySelector('[data-testid="label-overflow"]')?.getAttribute('data-overflow-count')
			)
		).toBeGreaterThan(0);
		await unmount(component);
		target.remove();
	});

	it('keeps source order under RTL and permits two real rows without a fake overflow trigger', async () => {
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const rtl = target.querySelector<HTMLElement>('[data-testid="overflow-rtl"]')!;
		await expect.poll(() => rtl.dataset.measured).toBe('true');
		expect(getComputedStyle(rtl).direction).toBe('rtl');
		expect(rtl.dataset.fits).toBe('true');
		expect(rtl.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden).toBe(
			'true'
		);
		expect(
			[...rtl.querySelectorAll<HTMLElement>('[data-slot="item"]')].map((item) => item.dataset.key)
		).toEqual(['north', 'east', 'south', 'west']);
		await unmount(component);
		target.remove();
	});

	it('reclaims space when the remaining overflow indicator becomes narrower', async () => {
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const owner = target.querySelector<HTMLElement>('[data-testid="overflow-fixed-point-owner"]')!;
		const root = target.querySelector<HTMLElement>('[data-testid="overflow-fixed-point"]')!;
		const indicator = root.querySelector<HTMLElement>('[data-testid="shrinking-overflow"]')!;
		await expect.poll(() => root.dataset.measured).toBe('true');
		expect(owner.getBoundingClientRect().width).toBe(90);
		await expect.poll(() => Number(indicator.dataset.overflowCount)).toBe(3);
		expect(visibleItemCount(root)).toBe(0);
		expect(indicator.getBoundingClientRect().width).toBe(90);

		component.setFixedPointWidth(205);
		await tick();
		expect(owner.getBoundingClientRect().width).toBe(205);
		await expect
			.poll(() => ({
				fits: root.dataset.fits,
				overflow: Number(indicator.dataset.overflowCount),
				visible: visibleItemCount(root)
			}))
			.toEqual({ fits: 'true', overflow: 1, visible: 2 });
		expect(indicator.getBoundingClientRect().width).toBe(20);
		expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
		await unmount(component);
		target.remove();
	});

	it('does not expose a disabled layout as measured while collapse is enabled but suspended', async () => {
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const root = target.querySelector<HTMLElement>('[data-testid="overflow-toggle"]')!;
		expect(root.dataset.measured).toBeUndefined();
		expect(visibleItemCount(root)).toBe(3);

		component.enableCollapseWhileSuspended();
		await animationFrames(2);
		expect(root.dataset.measured).toBeUndefined();
		expect(visibleItemCount(root)).toBe(3);
		expect(root.querySelector<HTMLElement>('[data-slot="overflow"]')?.inert).toBe(true);

		component.releaseCollapseMeasurement();
		await expect.poll(() => root.dataset.measured).toBe('true');
		expect(root.dataset.fits).toBe('true');
		expect(visibleItemCount(root)).toBe(0);
		expect(
			Number(
				root.querySelector<HTMLElement>('[data-testid="fixed-overflow"]')?.dataset.overflowCount
			)
		).toBe(3);
		await unmount(component);
		target.remove();
	});

	it('bounds a non-monotonic indicator cycle and publishes a stable fitting layout', async () => {
		const target = host();
		const component = mount(OverflowListFixture, { target });
		const root = target.querySelector<HTMLElement>('[data-testid="overflow-non-monotonic"]')!;
		const owner = target.querySelector<HTMLElement>(
			'[data-testid="overflow-non-monotonic-owner"]'
		)!;
		const indicator = root.querySelector<HTMLElement>('[data-testid="non-monotonic-overflow"]')!;
		const output = target.querySelector<HTMLOutputElement>(
			'[data-testid="overflow-non-monotonic-output"]'
		)!;
		await animationFrames(8);
		expect(owner.getBoundingClientRect().width).toBe(205);
		expect(root.dataset.measured).toBe('true');
		expect(root.dataset.fits).toBe('true');
		expect(visibleItemCount(root)).toBe(1);
		expect(Number(indicator.dataset.overflowCount)).toBe(2);
		expect(indicator.getBoundingClientRect().width).toBe(20);
		expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
		expect(output.textContent).toBe('1|2|true');
		const settledUpdates = Number(output.dataset.updates);
		expect(settledUpdates).toBeGreaterThan(0);
		await animationFrames(4);
		expect(Number(output.dataset.updates)).toBe(settledUpdates);
		expect(output.textContent).toBe('1|2|true');
		await unmount(component);
		target.remove();
	});
});
