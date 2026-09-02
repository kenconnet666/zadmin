import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';

import { ZBox, ZIcon, ZStack } from '../src/entrypoints/index.js';

describe('stable foundation production contracts: ZBox, ZIcon and ZStack', () => {
	it('keeps ZBox as a real div while forwarding native attributes and style', () => {
		render(ZBox, {
			'aria-label': 'Stable surface',
			class: 'consumer-box',
			style: 'color: rgb(12, 34, 56)'
		});
		const box = document.querySelector<HTMLDivElement>('.consumer-box')!;
		expect(box.tagName).toBe('DIV');
		expect(box.getAttribute('aria-label')).toBe('Stable surface');
		expect(box.classList.contains('consumer-box')).toBe(true);
		expect(box.style.color).toBe('rgb(12, 34, 56)');
	});

	it('keeps ZIcon as a real SVG with decorative and named accessibility contracts', () => {
		render(ZIcon, { name: 'check', size: 20, style: 'color: rgb(12, 34, 56)' });
		const decorative = document.querySelector<SVGSVGElement>('svg')!;
		expect(decorative.tagName).toBe('svg');
		expect(decorative.getAttribute('aria-hidden')).toBe('true');
		expect(decorative.getAttribute('role')).toBeNull();
		expect(getComputedStyle(decorative).width).toBe('20px');
		expect(getComputedStyle(decorative).height).toBe('20px');
		expect(decorative.getAttribute('stroke')).toBe('currentColor');
	});

	it('keeps a named ZIcon discoverable as an image with a stable label', () => {
		render(ZIcon, { 'aria-label': 'Success', name: 'check' });
		const icon = document.querySelector<SVGSVGElement>('svg')!;
		expect(icon.getAttribute('role')).toBe('img');
		expect(icon.getAttribute('aria-label')).toBe('Success');
		expect(icon.getAttribute('aria-hidden')).toBeNull();
	});

	it('keeps ZStack as a native flex owner with explicit logical layout tokens', () => {
		render(ZStack, {
			'aria-label': 'Stable actions',
			class: 'consumer-stack',
			direction: 'row',
			gap: 6,
			wrap: true
		});
		const stack = document.querySelector<HTMLDivElement>('.consumer-stack')!;
		expect(stack.tagName).toBe('DIV');
		expect(stack.getAttribute('aria-label')).toBe('Stable actions');
		expect(getComputedStyle(stack).display).toBe('flex');
		expect(getComputedStyle(stack).flexDirection).toBe('row');
		expect(getComputedStyle(stack).flexWrap).toBe('wrap');
		expect(getComputedStyle(stack).gap).toBe('6px');
	});
});
