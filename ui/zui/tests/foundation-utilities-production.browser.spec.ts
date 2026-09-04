import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FoundationPrimitivesFixture from './FoundationPrimitivesFixture.svelte';

describe('foundation utility production contracts', () => {
	it('ZSeparator and ZVisuallyHidden preserve semantic and visual-only boundaries', () => {
		// @zui-visual ZVisuallyHidden clipped one-pixel geometry
		render(FoundationPrimitivesFixture);
		const named = document.querySelector<HTMLElement>('[data-testid="separator-named"]')!;
		const decorative = document.querySelector<HTMLElement>('[data-testid="separator-decorative"]')!;
		const vertical = document.querySelector<HTMLElement>('[data-testid="separator-vertical"]')!;
		const hidden = document.querySelector<HTMLElement>('[data-testid="visually-hidden"]')!;

		expect(named.tagName).toBe('HR');
		expect(named.getAttribute('aria-label')).toBe('Named boundary');
		expect(named.getAttribute('aria-orientation')).toBe('horizontal');
		expect(decorative.getAttribute('role')).toBe('presentation');
		expect(decorative.getAttribute('aria-hidden')).toBe('true');
		expect(vertical.getAttribute('role')).toBe('separator');
		expect(vertical.getAttribute('aria-orientation')).toBe('vertical');

		expect(hidden.getAttribute('role')).toBe('status');
		expect(hidden.textContent).toBe('Hidden status');
		const hiddenStyle = getComputedStyle(hidden);
		expect(hiddenStyle.position).toBe('absolute');
		expect(hiddenStyle.width).toBe('1px');
		expect(hiddenStyle.height).toBe('1px');
		expect(hiddenStyle.clipPath).toBe('inset(50%)');
	});

	it('ZAspectRatio and ZContainer preserve native layout contracts without observers', () => {
		render(FoundationPrimitivesFixture);
		const ratio = document.querySelector<HTMLElement>('[data-testid="aspect-ratio"]')!;
		const emptyRatio = document.querySelector<HTMLElement>('[data-testid="aspect-ratio-empty"]')!;
		const outer = document.querySelector<HTMLElement>('[data-testid="container-outer"]')!;
		const inner = document.querySelector<HTMLElement>('[data-testid="container-inner"]')!;

		expect(ratio.dataset.ratio).toBe('16 / 9');
		expect(getComputedStyle(ratio).aspectRatio).toBe('16 / 9');
		expect(emptyRatio.dataset.ratio).toBe('1.5');
		expect(emptyRatio.getAttribute('aria-label')).toBe('Empty ratio');
		expect(getComputedStyle(emptyRatio).aspectRatio).toBe('1.5 / 1');

		expect(outer.dataset.size).toBe('full');
		expect(outer.dataset.gutter).toBe('large');
		expect(getComputedStyle(outer).maxWidth).toBe('100%');
		expect(getComputedStyle(outer).paddingInline).toBe('16px');
		expect(inner.dataset.size).toBe('small');
		expect(inner.dataset.gutter).toBe('small');
		expect(getComputedStyle(inner).maxWidth).toBe('640px');
		expect(getComputedStyle(inner).paddingInline).toBe('4px');
	});
});
