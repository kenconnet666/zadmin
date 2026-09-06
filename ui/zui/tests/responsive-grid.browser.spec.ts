import { afterEach, beforeEach, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import ResponsiveGridFixture from './ResponsiveGridFixture.svelte';

let originalViewport: { width: number; height: number };
beforeEach(async () => {
	originalViewport = { width: window.innerWidth, height: window.innerHeight };
	// Container max-width intentionally prevents a 640px child in Vitest's 414px default viewport.
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

it('coordinates native container tracks, spans and axis overrides while resizing without JS measurement', async () => {
	// @zui-visual ZGrid responsive CSS track geometry
	// @zui-visual ZGridItem clamped span and start geometry
	render(ResponsiveGridFixture);
	const container = document.querySelector<HTMLElement>('[data-testid="query-container"]')!;
	const grid = document.querySelector<HTMLElement>('[data-testid="responsive-grid"]')!;
	const first = document.querySelector<HTMLElement>('[data-testid="clamped-span"]')!;
	const second = document.querySelector<HTMLElement>('[data-testid="clamped-start"]')!;
	const full = document.querySelector<HTMLElement>('[data-testid="full-span"]')!;
	const stack = document.querySelector<HTMLElement>('[data-testid="responsive-stack"]')!;
	expect(getComputedStyle(container).direction).toBe('rtl');
	expect(getComputedStyle(grid).direction).toBe('rtl');
	expect(getComputedStyle(first).direction).toBe('rtl');
	await expect.poll(() => getComputedStyle(grid).gridTemplateColumns.split(' ').length).toBe(4);
	expect(container.style.width).toBe('320px');
	expect(container.getBoundingClientRect().width).toBe(320);
	expect(first.getBoundingClientRect().width).toBe(320);
	expect(second.getBoundingClientRect().width).toBe(74);
	expect(full.getBoundingClientRect().width).toBe(320);
	expect(getComputedStyle(stack).flexDirection).toBe('row');
	expect(getComputedStyle(stack).rowGap).toBe('3px');
	expect(getComputedStyle(stack).columnGap).toBe('5px');
	document.querySelector<HTMLButtonElement>('[data-testid="resize-grid"]')!.click();
	await tick();
	await expect
		.poll(() => ({
			inlineWidth: container.style.width,
			width: container.getBoundingClientRect().width,
			columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length
		}))
		.toEqual({ inlineWidth: '640px', width: 640, columns: 8 });
	expect(first.getBoundingClientRect().width).toBe(235);
	expect(full.getBoundingClientRect().width).toBe(640);
	expect(getComputedStyle(stack).rowGap).toBe('3px');
	expect(getComputedStyle(stack).columnGap).toBe('5px');
	expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
});

it('updates the requested Container width while preserving the narrower viewport boundary', async () => {
	await page.viewport(414, 896);
	render(ResponsiveGridFixture);
	const container = document.querySelector<HTMLElement>('[data-testid="query-container"]')!;
	const grid = document.querySelector<HTMLElement>('[data-testid="responsive-grid"]')!;
	document.querySelector<HTMLButtonElement>('[data-testid="resize-grid"]')!.click();
	await tick();
	expect(container.style.width).toBe('640px');
	expect(container.getBoundingClientRect().width).toBeGreaterThan(320);
	expect(container.getBoundingClientRect().width).toBeLessThanOrEqual(414);
	expect(getComputedStyle(grid).gridTemplateColumns.split(' ').length).toBe(4);
	expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
});
