import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import SimpleGridFixture from './SimpleGridFixture.svelte';

describe('ZSimpleGrid production contract', () => {
	it('keeps ordinary children in fixed equal tracks with independent row and column spacing', async () => {
		await render(SimpleGridFixture);
		const grid = document.querySelector<HTMLElement>('[data-testid="simple-grid-columns"]')!;
		const style = getComputedStyle(grid);
		expect(grid.tagName).toBe('DIV');
		expect(grid.dataset.mode).toBe('columns');
		expect(grid.children).toHaveLength(3);
		expect(style.display).toBe('grid');
		expect(style.gridTemplateColumns.split(' ').length).toBe(3);
		expect(style.columnGap).toBe('12px');
		expect(style.rowGap).toBe('20px');
		for (const child of [...grid.children] as HTMLElement[]) {
			expect(getComputedStyle(child).minWidth).toBe('0px');
		}
	});

	it('uses CSS auto-fit minimum tracks that stay within a narrow owner and inherits RTL', async () => {
		// @zui-visual ZSimpleGrid real auto-fit track geometry
		await render(SimpleGridFixture);
		const owner = document.querySelector<HTMLElement>(
			'[data-testid="simple-grid-adaptive-owner"]'
		)!;
		const adaptive = document.querySelector<HTMLElement>('[data-testid="simple-grid-adaptive"]')!;
		const rtl = document.querySelector<HTMLElement>('[data-testid="simple-grid-rtl"]')!;
		expect(adaptive.dataset.mode).toBe('min-item-width');
		expect(adaptive.getBoundingClientRect().width).toBeLessThanOrEqual(
			owner.getBoundingClientRect().width
		);
		expect(getComputedStyle(adaptive).gridTemplateColumns.split(' ').length).toBe(2);
		expect(getComputedStyle(rtl).direction).toBe('rtl');
		expect(getComputedStyle(rtl).gridTemplateColumns.split(' ').length).toBe(2);
	});
});
