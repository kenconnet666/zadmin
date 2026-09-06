import { expect, it } from 'vitest';
import { tick } from 'svelte';
import { render } from 'vitest-browser-svelte';
import ScrollAreaFixture from './ScrollAreaFixture.svelte';

const element = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

it('uses one named native viewport with real overflow geometry and an autosize maximum', () => {
	// @zui-visual ZScrollArea native viewport and overflow geometry
	render(ScrollAreaFixture);
	const viewport = element('scroll-vertical');
	expect(viewport.tagName).toBe('DIV');
	expect(viewport.getAttribute('role')).toBe('region');
	expect(viewport.getAttribute('aria-label')).toBe('Fixture scroll');
	expect(viewport.tabIndex).toBe(0);
	expect(viewport.getBoundingClientRect().height).toBe(120);
	expect(viewport.scrollHeight).toBe(600);
	expect(getComputedStyle(viewport).overflowY).toBe('auto');
	expect(getComputedStyle(viewport).overscrollBehavior).toBe('contain');
	const both = element('scroll-both');
	expect(both.scrollWidth).toBe(600);
	expect(both.scrollHeight).toBe(400);
	expect(getComputedStyle(both).overflowX).toBe('auto');
	expect(getComputedStyle(both).overflowY).toBe('auto');
	expect(element('scroll-autosize').getBoundingClientRect().height).toBe(40);
	expect(viewport.querySelector('[role="scrollbar"]')).toBeNull();
});

it('reports original native scroll events and makes reduced-motion commands immediate, releasing its controller', async () => {
	render(ScrollAreaFixture);
	await tick();
	element('scroll-position').click();
	await expect.poll(() => element('scroll-vertical').scrollTop).toBe(80);
	await expect.poll(() => element('scroll-output').textContent).toMatch(/^0:80:[1-9]\d*:0:ready$/u);
	element('scroll-reduced').click();
	await tick();
	expect(element('scroll-vertical').scrollTop).toBe(160);
	expect(element('scroll-output').textContent).toContain(':160:ready');
	expect(getComputedStyle(element('scroll-vertical')).scrollBehavior).toBe('auto');
	element('scroll-unmount').click();
	await tick();
	expect(document.querySelector('[data-testid="scroll-vertical"]')).toBeNull();
	expect(element('scroll-output').textContent).toContain(':released');
});

it('keeps browser RTL scrollLeft semantics rather than changing offsets to positive numbers', async () => {
	render(ScrollAreaFixture);
	const viewport = element('scroll-rtl');
	expect(getComputedStyle(viewport).direction).toBe('rtl');
	expect(viewport.scrollLeft).toBe(0);
	viewport.scrollTo({ left: -100, behavior: 'instant' });
	await expect.poll(() => viewport.scrollLeft).toBe(-100);
});
