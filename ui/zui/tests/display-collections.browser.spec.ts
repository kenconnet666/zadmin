import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DisplayCollectionsProductionFixture from './DisplayCollectionsProductionFixture.svelte';

describe('production display collections', () => {
	it('keeps typed List keys, native list elements and child-owned actions', async () => {
		render(DisplayCollectionsProductionFixture);
		const list = document.querySelector<HTMLElement>('[data-testid="display-list"]')!;
		expect(list.tagName).toBe('UL');
		expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
		expect(list.textContent).toContain('number');
		expect(list.textContent).toContain('string');
		expect(document.querySelector('[data-testid="display-ordered"]')?.tagName).toBe('OL');
		await userEvent.click(list.querySelector<HTMLButtonElement>('button')!);
		expect(
			document.querySelector('[data-testid="display-collections-output"]')?.textContent?.trim()
		).toBe('1:UL:DL');
	});

	it('keeps manual nested ul/li and dl/dt/dd structures intact', () => {
		render(DisplayCollectionsProductionFixture);
		const manualList = document.querySelector<HTMLElement>('[data-testid="display-manual-list"]')!;
		const manualDescriptions = document.querySelector<HTMLElement>(
			'[data-testid="display-manual-descriptions"]'
		)!;
		expect(manualList.querySelectorAll(':scope > li')).toHaveLength(1);
		expect(manualList.querySelector(':scope > li > ul')).not.toBeNull();
		expect(manualDescriptions.querySelectorAll(':scope > dt')).toHaveLength(1);
		expect(manualDescriptions.querySelectorAll(':scope > dd')).toHaveLength(1);
	});

	it('keeps empty and loading feedback outside semantic item counts', () => {
		render(DisplayCollectionsProductionFixture);
		for (const testId of ['display-empty-list', 'display-loading-list']) {
			const root = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
			expect(root.querySelectorAll('li')).toHaveLength(0);
			expect(root.nextElementSibling?.getAttribute('data-slot')).toBe('status');
			expect(root.getAttribute('aria-describedby')).toContain(root.nextElementSibling?.id);
		}
		for (const testId of ['display-empty-descriptions', 'display-loading-descriptions']) {
			const root = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
			expect(root.querySelectorAll('dt, dd')).toHaveLength(0);
			expect(root.nextElementSibling?.getAttribute('data-slot')).toBe('status');
			expect(root.getAttribute('aria-describedby')).toContain(root.nextElementSibling?.id);
		}
		expect(
			document.querySelectorAll(
				'[data-testid="display-loading-list"] + [data-slot="status"] [aria-hidden="true"]'
			)
		).toHaveLength(2);
	});

	it('renders rich DescriptionList content responsively without physical RTL assumptions', () => {
		render(DisplayCollectionsProductionFixture);
		const descriptions = document.querySelector<HTMLElement>(
			'[data-testid="display-descriptions"]'
		)!;
		const rtl = document.querySelector<HTMLElement>('[data-testid="display-rtl-descriptions"]')!;
		const owner = document.querySelector<HTMLElement>('[data-testid="display-rtl-owner"]')!;
		expect(descriptions.tagName).toBe('DL');
		expect(descriptions.querySelectorAll(':scope > [data-slot="item"]')).toHaveLength(2);
		expect(descriptions.querySelectorAll('dt')).toHaveLength(2);
		expect(descriptions.querySelectorAll('dd')).toHaveLength(2);
		expect(getComputedStyle(rtl).gridTemplateColumns).not.toBe('none');
		expect(rtl.getBoundingClientRect().width).toBeLessThanOrEqual(
			owner.getBoundingClientRect().width
		);
		expect(getComputedStyle(rtl.querySelector('dd')!).overflowWrap).toBe('anywhere');
	});
});
