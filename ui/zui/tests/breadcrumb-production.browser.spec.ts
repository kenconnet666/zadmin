import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BreadcrumbFixture from './BreadcrumbFixture.svelte';

describe('ZBreadcrumb production contract', () => {
	it('keeps native hierarchy and makes only non-current routed entries anchors', () => {
		render(BreadcrumbFixture);
		const navigation = document.querySelector<HTMLElement>('[aria-label="Fixture breadcrumb"]')!;
		const items = navigation.querySelectorAll<HTMLLIElement>('ol > li');
		expect(navigation.tagName).toBe('NAV');
		expect(items).toHaveLength(3);
		expect(items[0]?.querySelector('a')?.getAttribute('href')).toBe('/workspace');
		expect(items[1]?.querySelector('a')?.getAttribute('href')).toBe('/workspace/projects');
		expect(items[2]?.querySelector('a')).toBeNull();
		expect(items[2]?.querySelector('[aria-current="page"]')?.textContent).toBe('交付详情');
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
		expect(getComputedStyle(rtl.querySelector('ol')!).flexWrap).toBe('wrap');
	});
});
