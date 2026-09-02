import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ZPagination from '../src/components/navigation/ZPagination.svelte';
import PaginationFixture from './PaginationFixture.svelte';

describe('ZPagination production contract', () => {
	it('keeps ZPagination page/count bounds, current ARIA, first/last window and keyboard focus real', async () => {
		render(PaginationFixture);
		const navigation = document.querySelector<HTMLElement>('[aria-label="Fixture pagination"]')!;
		const current = navigation.querySelector<HTMLButtonElement>('[aria-current="page"]')!;
		expect(navigation.tagName).toBe('NAV');
		expect(navigation.dataset.page).toBe('6');
		expect(current.getAttribute('aria-label')).toContain('6');
		expect(navigation.querySelector('[data-slot="ellipsis"]')).not.toBeNull();
		const first = navigation.querySelector<HTMLButtonElement>('[data-page-number="1"]')!;
		first.click();
		await tick();
		expect(navigation.dataset.page).toBe('1');
		expect(first.getAttribute('aria-current')).toBe('page');
		expect(
			navigation.querySelector<HTMLButtonElement>('[data-pagination-control="previous"]')?.disabled
		).toBe(true);
		navigation.querySelector<HTMLButtonElement>('[data-pagination-control="next"]')!.click();
		await tick();
		expect(navigation.dataset.page).toBe('2');
		const pageTwo = navigation.querySelector<HTMLButtonElement>('[data-page-number="2"]')!;
		pageTwo.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(navigation.querySelector('[data-page-number="3"]'));
	});

	it('keeps ZPagination controlled page-size changes, dynamic count clamping and RTL direction real', async () => {
		render(PaginationFixture);
		const dynamic = document.querySelector<HTMLElement>('[aria-label="Dynamic pagination"]')!;
		const focused = dynamic.querySelector<HTMLButtonElement>('[data-page-number="6"]')!;
		focused.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="pagination-shrink"]')!.click();
		await tick();
		expect(dynamic.dataset.page).toBe('2');
		expect(document.activeElement?.getAttribute('data-page-number')).toBe('2');
		const sized = document.querySelector<HTMLElement>('[aria-label="Sized pagination"]')!;
		const size = sized.querySelector<HTMLSelectElement>('[data-slot="size-select"]')!;
		size.value = '50';
		size.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		expect(sized.dataset.pageSize).toBe('50');
		expect(sized.dataset.page).toBe('2');
		expect(sized.querySelectorAll('option')).toHaveLength(3);

		render(ZPagination, {
			'aria-label': 'RTL pagination',
			dir: 'rtl',
			page: 2,
			totalPages: 3
		});
		const rtl = document.querySelector<HTMLElement>('[aria-label="RTL pagination"]')!;
		const rtlPageTwo = rtl.querySelector<HTMLButtonElement>('[data-page-number="2"]')!;
		rtlPageTwo.focus();
		rtlPageTwo.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(rtl.querySelector('[data-page-number="1"]'));
	});
});
