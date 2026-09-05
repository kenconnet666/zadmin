import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DocsCompositionContractFixture from './DocsCompositionContractFixture.svelte';

describe('DocsComposition component contracts', () => {
	it('keeps link button geometry aligned with same-size ZButton references and navigation semantics', () => {
		// @zui-visual ZLink button and navigation geometry
		render(DocsCompositionContractFixture);
		const small = document.querySelector<HTMLElement>('[data-testid="link-button-small"]')!;
		const large = document.querySelector<HTMLElement>('[data-testid="link-button-large"]')!;
		const medium = document.querySelector<HTMLElement>('[data-testid="link-button-medium"]')!;
		const smallReference = document.querySelector<HTMLElement>(
			'[data-testid="button-small-reference"]'
		)!;
		const mediumReference = document.querySelector<HTMLElement>(
			'[data-testid="button-medium-reference"]'
		)!;
		const largeReference = document.querySelector<HTMLElement>(
			'[data-testid="button-large-reference"]'
		)!;
		const current = document.querySelector<HTMLElement>('[data-testid="link-navigation-current"]')!;
		const inactive = document.querySelector<HTMLElement>(
			'[data-testid="link-navigation-inactive"]'
		)!;
		const falseCurrent = document.querySelector<HTMLElement>(
			'[data-testid="link-navigation-false"]'
		)!;
		const disabled = document.querySelector<HTMLAnchorElement>('[data-testid="link-disabled"]')!;
		const styles = ['height', 'fontSize', 'paddingInline', 'borderRadius'] as const;

		expect(small.tagName).toBe('A');
		expect(small.dataset.appearance).toBe('button');
		expect(small.dataset.size).toBe('small');
		expect(large.dataset.size).toBe('large');
		for (const [link, button] of [
			[small, smallReference],
			[medium, mediumReference],
			[large, largeReference]
		] as const) {
			for (const property of styles)
				expect(getComputedStyle(link)[property]).toBe(getComputedStyle(button)[property]);
		}
		expect(large.getBoundingClientRect().height).toBeGreaterThan(
			small.getBoundingClientRect().height
		);
		expect(current.dataset.appearance).toBe('navigation');
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(getComputedStyle(current).color).not.toBe(getComputedStyle(inactive).color);
		expect(getComputedStyle(inactive).fontWeight).not.toBe('600');
		expect(getComputedStyle(falseCurrent).color).toBe(getComputedStyle(inactive).color);
		disabled.click();
		expect(disabled.hasAttribute('href')).toBe(false);
		expect(disabled.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector('[data-testid="disabled-output"]')?.textContent).toBe('0');
	});

	it('applies bodyPadding only to the Card body region', () => {
		render(DocsCompositionContractFixture);
		const none = document.querySelector<HTMLElement>(
			'[data-testid="card-padding-none"] [data-slot="body"]'
		)!;
		const large = document.querySelector<HTMLElement>(
			'[data-testid="card-padding-large"] [data-slot="body"]'
		)!;

		expect(getComputedStyle(none).paddingInline).toBe('0px');
		expect(getComputedStyle(none).paddingBlock).toBe('0px');
		expect(getComputedStyle(large).paddingInline).not.toBe('0px');
		expect(getComputedStyle(large).paddingBlock).not.toBe('0px');
		expect(
			getComputedStyle(document.querySelector('[data-testid="card-none-header"]')!.parentElement!)
				.paddingInline
		).toBe(
			getComputedStyle(document.querySelector('[data-testid="card-large-header"]')!.parentElement!)
				.paddingInline
		);
		expect(
			getComputedStyle(document.querySelector('[data-testid="card-none-footer"]')!.parentElement!)
				.paddingInline
		).toBe(
			getComputedStyle(document.querySelector('[data-testid="card-large-footer"]')!.parentElement!)
				.paddingInline
		);
	});

	it('creates and removes an accessible focusable region as real table overflow changes', async () => {
		render(DocsCompositionContractFixture);
		const overflow = document.querySelector<HTMLElement>('[data-testid="table-overflow"]')!;
		const overflowOwner = overflow.parentElement!;
		const compact = document.querySelector<HTMLElement>('[data-testid="table-no-overflow"]')!;
		const tiny = document.querySelector<HTMLElement>(
			'[data-testid="table-one-pixel"]'
		)!.parentElement!;
		await expect.poll(() => tiny.scrollWidth - tiny.clientWidth).toBe(1);
		await expect.poll(() => tiny.getAttribute('role')).toBe('region');
		expect(tiny.tabIndex).toBe(0);
		const compactOwner = compact.parentElement!;

		expect(overflowOwner.dataset.overflowing).toBe('true');
		expect(overflowOwner.getAttribute('role')).toBe('region');
		expect(overflowOwner.tabIndex).toBe(0);
		expect(overflowOwner.getAttribute('aria-labelledby')).toBe('table-scroll-title');
		expect(overflowOwner.getAttribute('aria-describedby')).toBe('table-scroll-description');
		expect(compactOwner.dataset.overflowing).not.toBe('true');
		expect(compactOwner.hasAttribute('role')).toBe(false);
		expect(compactOwner.tabIndex).toBe(-1);
		const viewport = overflowOwner.parentElement!;
		viewport.style.inlineSize = '80rem';
		await expect.poll(() => overflowOwner.dataset.overflowing).toBeUndefined();
		await expect.poll(() => overflowOwner.getAttribute('role')).toBeNull();
		expect(overflowOwner.tabIndex).toBe(-1);
		viewport.style.inlineSize = '32rem';
		await expect.poll(() => overflowOwner.dataset.overflowing).toBe('true');
		await expect.poll(() => overflowOwner.getAttribute('role')).toBe('region');
		expect(overflowOwner.tabIndex).toBe(0);
	});
});
