import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import ResponsiveGridFixture from './ResponsiveGridFixture.svelte';

it('coordinates native container tracks, spans and axis overrides while resizing without JS measurement', async () => {
	// @zui-visual ZGrid responsive CSS track geometry
	// @zui-visual ZGridItem clamped span and start geometry
	render(ResponsiveGridFixture);
	const grid = document.querySelector<HTMLElement>('[data-testid="responsive-grid"]')!;
	const first = document.querySelector<HTMLElement>('[data-testid="clamped-span"]')!;
	const second = document.querySelector<HTMLElement>('[data-testid="clamped-start"]')!;
	const full = document.querySelector<HTMLElement>('[data-testid="full-span"]')!;
	const stack = document.querySelector<HTMLElement>('[data-testid="responsive-stack"]')!;
	await expect.poll(() => getComputedStyle(grid).gridTemplateColumns.split(' ').length).toBe(4);
	expect(first.getBoundingClientRect().width).toBe(320);
	expect(second.getBoundingClientRect().width).toBe(74);
	expect(full.getBoundingClientRect().width).toBe(320);
	expect(getComputedStyle(stack).flexDirection).toBe('row');
	expect(getComputedStyle(stack).rowGap).toBe('3px');
	expect(getComputedStyle(stack).columnGap).toBe('5px');
	document.querySelector<HTMLButtonElement>('[data-testid="resize-grid"]')!.click();
	await tick();
	await expect.poll(() => getComputedStyle(grid).gridTemplateColumns.split(' ').length).toBe(8);
	expect(first.getBoundingClientRect().width).toBe(235);
	expect(full.getBoundingClientRect().width).toBe(640);
	expect(getComputedStyle(stack).rowGap).toBe('3px');
	expect(getComputedStyle(stack).columnGap).toBe('5px');
	expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
});
