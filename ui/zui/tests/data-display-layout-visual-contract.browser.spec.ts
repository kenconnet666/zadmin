import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DataDisplayLayoutVisualFixture from './DataDisplayLayoutVisualFixture.svelte';

// @zui-visual ZBox root geometry
// @zui-visual ZStack direction and gap geometry
// @zui-visual ZAspectRatio native ratio geometry
// @zui-visual ZList ordered layout geometry
// @zui-visual ZTable overflow owner geometry
// @zui-visual ZDataTable column geometry
// @zui-visual ZVirtualList bounded viewport geometry
describe('data-display and layout visual contracts', () => {
	it('keeps layout primitives honest about direction, gap and ratio', async () => {
		render(DataDisplayLayoutVisualFixture);
		const box = document.querySelector<HTMLElement>('[data-testid="box"]')!;
		expect(box.getBoundingClientRect().width).toBe(240);
		expect(box.getBoundingClientRect().height).toBe(20);
		const stack = document.querySelector<HTMLElement>('[data-testid="stack-row"]')!;
		const children = [...stack.children] as HTMLElement[];
		expect(getComputedStyle(stack).flexDirection).toBe('row');
		expect(getComputedStyle(stack).gap).not.toBe('0px');
		expect(
			children[1].getBoundingClientRect().left - children[0].getBoundingClientRect().right
		).toBeGreaterThan(0);

		const ratio = document.querySelector<HTMLElement>('[data-testid="aspect"]')!;
		expect(ratio.dataset.ratio).toBe('16 / 9');
		expect(ratio.getBoundingClientRect().width / ratio.getBoundingClientRect().height).toBeCloseTo(
			16 / 9,
			1
		);
	});

	it('keeps list and table native structure and horizontal overflow ownership', async () => {
		render(DataDisplayLayoutVisualFixture);
		const list = document.querySelector<HTMLElement>('[data-testid="list"]')!;
		expect(list.tagName).toBe('OL');
		expect(getComputedStyle(list).display).toBe('grid');
		expect(getComputedStyle(list).paddingInlineStart).toBe('24px');
		expect(list.querySelectorAll(':scope > li')).toHaveLength(2);

		const table = document.querySelector<HTMLElement>('[data-testid="table"]')!;
		const tableOwner = table.parentElement!;
		expect(table.querySelector('caption')?.textContent).toContain('Wide table');
		expect(table.querySelectorAll('th')).toHaveLength(2);
		expect(tableOwner.dataset.overflowing).toBe('true');
		expect(tableOwner.getAttribute('role')).toBe('region');
		expect(getComputedStyle(tableOwner).overflowX).toBe('auto');
	});

	it('keeps data table columns and virtual list viewport geometry bounded', async () => {
		render(DataDisplayLayoutVisualFixture);
		const dataTable = document.querySelector<HTMLElement>('[data-testid="data-table"]')!;
		expect(dataTable.querySelectorAll('tbody tr')).toHaveLength(2);
		expect(dataTable.querySelector('th')?.textContent).toContain('Name');
		expect(dataTable.querySelector('th')!.getBoundingClientRect().width).toBeGreaterThan(0);
		const virtual = document.querySelector<HTMLElement>('[data-testid="virtual-list"]')!;
		expect(virtual.getBoundingClientRect().height).toBe(120);
		expect(getComputedStyle(virtual).overflowY).toBe('auto');
		expect(virtual.querySelectorAll('[data-slot="item"]').length).toBeGreaterThan(0);
	});
});
