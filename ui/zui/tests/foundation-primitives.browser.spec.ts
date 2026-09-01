import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FoundationPrimitivesFixture from './FoundationPrimitivesFixture.svelte';

describe('small foundation primitives', () => {
	it('keeps Separator semantic, decorative, named and orientation contracts', () => {
		render(FoundationPrimitivesFixture);
		const named = document.querySelector<HTMLElement>('[data-testid="separator-named"]')!;
		const decorative = document.querySelector<HTMLElement>('[data-testid="separator-decorative"]')!;
		const vertical = document.querySelector<HTMLElement>('[data-testid="separator-vertical"]')!;
		expect(named.tagName).toBe('HR');
		expect(named.getAttribute('aria-label')).toBe('Named boundary');
		expect(decorative.getAttribute('role')).toBe('presentation');
		expect(decorative.getAttribute('aria-hidden')).toBe('true');
		expect(vertical.tagName).toBe('DIV');
		expect(vertical.getAttribute('role')).toBe('separator');
		expect(vertical.getAttribute('aria-orientation')).toBe('vertical');
		expect(getComputedStyle(named).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
	});

	it('keeps VisuallyHidden accessible and Kbd native/nestable without platform logic', () => {
		render(FoundationPrimitivesFixture);
		const hidden = document.querySelector<HTMLElement>('[data-testid="visually-hidden"]')!;
		const combination = document.querySelector<HTMLElement>('[data-testid="kbd-combination"]')!;
		expect(hidden.getAttribute('aria-hidden')).toBeNull();
		expect(hidden.getAttribute('role')).toBe('status');
		expect(getComputedStyle(hidden).position).toBe('absolute');
		expect(hidden.getBoundingClientRect().width).toBe(1);
		expect(document.querySelector('[data-testid="kbd-single"]')?.tagName).toBe('KBD');
		expect(combination.querySelectorAll('kbd')).toHaveLength(2);
		expect(combination.textContent).toContain('Ctrl + K');
	});

	it('validates responsive AspectRatio and border-box nested Container geometry', () => {
		render(FoundationPrimitivesFixture);
		const ratio = document.querySelector<HTMLElement>('[data-testid="aspect-ratio"]')!;
		const empty = document.querySelector<HTMLElement>('[data-testid="aspect-ratio-empty"]')!;
		const outer = document.querySelector<HTMLElement>('[data-testid="container-outer"]')!;
		const inner = document.querySelector<HTMLElement>('[data-testid="container-inner"]')!;
		expect(getComputedStyle(ratio).aspectRatio).toBe('16 / 9');
		expect(empty.childElementCount).toBe(0);
		expect(outer.dataset.size).toBe('full');
		expect(outer.dataset.gutter).toBe('large');
		expect(inner.dataset.size).toBe('small');
		expect(getComputedStyle(outer).boxSizing).toBe('border-box');
		expect(outer.scrollWidth).toBeLessThanOrEqual(outer.clientWidth);
	});
});
