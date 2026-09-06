import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import BreadcrumbFixture from './BreadcrumbFixture.svelte';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function sourceItem(list: HTMLOListElement, key: string): HTMLLIElement {
	return list.querySelector<HTMLLIElement>(`:scope > li[data-slot="item"][data-key="${key}"]`)!;
}

describe('ZBreadcrumb production contract', () => {
	it('keeps native hierarchy and makes only non-current routed entries anchors', () => {
		render(BreadcrumbFixture);
		const navigation = document.querySelector<HTMLElement>('[aria-label="Fixture breadcrumb"]')!;
		const list = navigation.querySelector<HTMLOListElement>('ol')!;
		const items = list.querySelectorAll<HTMLLIElement>(':scope > li');
		expect(navigation.tagName).toBe('NAV');
		expect(list.tagName).toBe('OL');
		expect(items).toHaveLength(3);
		expect(items[0]?.querySelector('a')?.getAttribute('href')).toBe('/workspace');
		expect(items[1]?.querySelector('a')?.getAttribute('href')).toBe('/workspace/projects');
		expect(items[2]?.querySelector('a')).toBeNull();
		expect(items[2]?.querySelector('[aria-current="page"]')?.textContent).toBe('交付详情');
		expect(navigation.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
		expect(navigation.querySelector('[aria-haspopup="dialog"]')).toBeNull();
		expect(navigation.querySelectorAll('[data-slot="separator"]')).toHaveLength(2);
		for (const separator of navigation.querySelectorAll('[data-slot="separator"]')) {
			expect(separator.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('uses logical layout and wraps long labels within narrow and RTL owners', () => {
		// @zui-visual ZBreadcrumb native path geometry and wrapping
		render(BreadcrumbFixture);
		const longOwner = document.querySelector<HTMLElement>(
			'[data-testid="breadcrumb-long-boundary"]'
		)!;
		const longLink = longOwner.querySelector<HTMLElement>('a')!;
		const rtl = document.querySelector<HTMLElement>('[aria-label="RTL breadcrumb"]')!;
		expect(getComputedStyle(longLink).overflowWrap).toBe('anywhere');
		expect(longLink.getBoundingClientRect().width).toBeLessThanOrEqual(
			longOwner.getBoundingClientRect().width
		);
		expect(rtl.getAttribute('dir')).toBe('rtl');
		expect(getComputedStyle(rtl.querySelector('ol')!).flexWrap).toBe('wrap');
	});

	it('protects the current, last and configured first items while exposing real ancestor links', async () => {
		render(BreadcrumbFixture);
		const navigation = document.querySelector<HTMLElement>('[aria-label="Collapsed breadcrumb"]')!;
		const list = navigation.querySelector<HTMLOListElement>('ol')!;
		await expect.poll(() => list.dataset.measured).toBe('true');

		expect(sourceItem(list, 'home').dataset.overflowHidden).toBeUndefined();
		expect(sourceItem(list, 'release').dataset.overflowHidden).toBeUndefined();
		expect(sourceItem(list, 'latest').dataset.overflowHidden).toBeUndefined();
		expect(sourceItem(list, 'organization').dataset.overflowHidden).toBe('true');
		expect(sourceItem(list, 'projects').dataset.overflowHidden).toBe('true');
		expect(sourceItem(list, 'release').querySelector('[aria-current="page"]')).not.toBeNull();
		expect(sourceItem(list, 'latest').querySelector('a')?.getAttribute('href')).toBe(
			'#breadcrumb-latest'
		);

		const noFirst = document.querySelector<HTMLElement>(
			'[aria-label="Collapsed breadcrumb without first"]'
		)!;
		const noFirstList = noFirst.querySelector<HTMLOListElement>('ol')!;
		await expect.poll(() => noFirstList.dataset.measured).toBe('true');
		expect(sourceItem(noFirstList, 'home').dataset.overflowHidden).toBe('true');
		expect(sourceItem(noFirstList, 'release').dataset.overflowHidden).toBeUndefined();
		expect(sourceItem(noFirstList, 'latest').dataset.overflowHidden).toBeUndefined();

		const trigger = navigation.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
		await userEvent.click(trigger);
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		const dialog = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="More path levels"]'
		)!;
		const ancestor = dialog.querySelector<HTMLAnchorElement>('a[href="#breadcrumb-projects"]')!;
		expect(ancestor).not.toBeNull();
		await userEvent.click(ancestor);
		await expect.poll(() => window.location.hash).toBe('#breadcrumb-projects');
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');

		window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
		await userEvent.click(trigger);
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(trigger);
	});

	it('retains one source item DOM identity while owner width collapses and expands', async () => {
		render(BreadcrumbFixture);
		const owner = document.querySelector<HTMLElement>(
			'[data-testid="breadcrumb-responsive-owner"]'
		)!;
		const navigation = owner.querySelector<HTMLElement>('[aria-label="Responsive breadcrumb"]')!;
		const list = navigation.querySelector<HTMLOListElement>('ol')!;
		await expect.poll(() => list.dataset.measured).toBe('true');
		expect(owner.getBoundingClientRect().width).toBe(720);
		await expect
			.poll(() => list.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden)
			.toBe('true');

		const identities = new Map(
			[...list.querySelectorAll<HTMLLIElement>(':scope > li[data-slot="item"]')].map((item) => [
				item.dataset.key!,
				item
			])
		);
		owner.style.width = '240px';
		expect(owner.getBoundingClientRect().width).toBe(240);
		await expect
			.poll(
				() =>
					[...list.querySelectorAll<HTMLLIElement>(':scope > li[data-slot="item"]')].filter(
						(item) => item.dataset.overflowHidden === 'true'
					).length
			)
			.toBeGreaterThan(0);
		for (const [key, item] of identities) {
			expect(sourceItem(list, key)).toBe(item);
			expect(
				list.querySelectorAll(`:scope > li[data-slot="item"][data-key="${key}"]`)
			).toHaveLength(1);
		}

		owner.style.width = '720px';
		expect(owner.getBoundingClientRect().width).toBe(720);
		await expect
			.poll(() => list.querySelector<HTMLElement>('[data-slot="overflow"]')?.dataset.overflowHidden)
			.toBe('true');
		for (const [key, item] of identities) {
			expect(sourceItem(list, key)).toBe(item);
			expect(item.dataset.overflowHidden).toBeUndefined();
		}
	});

	it('keeps a collapsed RTL breadcrumb inside its mobile owner without horizontal scrolling', async () => {
		await page.viewport(390, 844);
		render(BreadcrumbFixture);
		const owner = document.querySelector<HTMLElement>(
			'[data-testid="breadcrumb-collapse-rtl-owner"]'
		)!;
		const navigation = owner.querySelector<HTMLElement>('[aria-label="Collapsed RTL breadcrumb"]')!;
		const list = navigation.querySelector<HTMLOListElement>('ol')!;
		const ltrOverride = document.querySelector<HTMLElement>(
			'[aria-label="LTR override breadcrumb"]'
		)!;
		await expect.poll(() => list.dataset.measured).toBe('true');

		expect(navigation.getAttribute('dir')).toBe('rtl');
		expect(getComputedStyle(list).direction).toBe('rtl');
		expect(ltrOverride.getAttribute('dir')).toBe('ltr');
		expect(getComputedStyle(ltrOverride.querySelector('ol')!).direction).toBe('ltr');
		expect(owner.getBoundingClientRect().width).toBeLessThanOrEqual(288);
		expect(navigation.scrollWidth).toBeLessThanOrEqual(navigation.clientWidth + 1);
		expect(owner.scrollWidth).toBeLessThanOrEqual(owner.clientWidth + 1);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth + 1
		);
		const ownerRect = owner.getBoundingClientRect();
		for (const item of list.querySelectorAll<HTMLElement>(
			':scope > li:not([data-overflow-hidden="true"])'
		)) {
			const rect = item.getBoundingClientRect();
			expect(rect.left).toBeGreaterThanOrEqual(ownerRect.left - 1);
			expect(rect.right).toBeLessThanOrEqual(ownerRect.right + 1);
		}
	});
});
