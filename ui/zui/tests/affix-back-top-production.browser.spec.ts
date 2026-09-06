import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import AffixBackTopFixture from './AffixBackTopFixture.svelte';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

describe('ZAffix and ZBackTop production contract', () => {
	it('uses native sticky by default and projects an explicit scroll owner through a real placeholder', async () => {
		const target = host();
		const component = mount(AffixBackTopFixture, { target });
		await tick();
		const native = target.querySelector<HTMLElement>('[data-testid="native-affix"]')!;
		const nativeContent = target.querySelector<HTMLElement>(
			'[data-testid="native-affix-content"]'
		)!;
		const projected = target.querySelector<HTMLElement>('[data-testid="projected-affix"]')!;
		const projectedContent = target.querySelector<HTMLElement>(
			'[data-testid="projected-affix-content"]'
		)!;
		const scroller = target.querySelector<HTMLElement>('[data-testid="affix-scroller"]')!;
		expect(native.dataset.mode).toBe('sticky');
		expect(getComputedStyle(nativeContent.parentElement!).position).toBe('sticky');
		expect(getComputedStyle(nativeContent.parentElement!).top).toBe('8px');
		expect(projected.dataset.mode).toBe('fixed');
		expect(projected.dataset.affixed).toBeUndefined();

		const sourceContainer = projectedContent.parentElement!;
		const sourceTypography = getComputedStyle(sourceContainer);
		const naturalHeight = projected.getBoundingClientRect().height;
		const naturalContentHeight = sourceContainer.getBoundingClientRect().height;
		const expectedTypography = {
			color: sourceTypography.color,
			fontFamily: sourceTypography.fontFamily,
			fontSize: sourceTypography.fontSize,
			fontWeight: sourceTypography.fontWeight,
			letterSpacing: sourceTypography.letterSpacing,
			lineHeight: sourceTypography.lineHeight
		};
		expect(expectedTypography.color).toBe('rgb(170, 20, 30)');
		expect(expectedTypography.fontSize).toBe('11px');
		expect(expectedTypography.fontWeight).toBe('600');
		expect(expectedTypography.letterSpacing).toBe('1px');
		expect(expectedTypography.lineHeight).toBe('17px');
		component.scrollAffix(80);
		await expect.poll(() => projected.dataset.affixed).toBe('true');
		const fixed = projectedContent.parentElement!;
		const fixedRect = fixed.getBoundingClientRect();
		const placeholderRect = projected.getBoundingClientRect();
		const scrollerRect = scroller.getBoundingClientRect();
		expect(projectedContent.parentElement?.parentElement).toBe(document.body);
		const fixedStyle = getComputedStyle(fixed);
		expect(fixedStyle.position).toBe('fixed');
		expect(fixedRect.top).toBeCloseTo(scrollerRect.top + scroller.clientTop + 6, 0);
		expect(fixedRect.left).toBeCloseTo(placeholderRect.left, 0);
		expect(fixedRect.width).toBeCloseTo(placeholderRect.width, 0);
		expect(fixedRect.height).toBeCloseTo(naturalContentHeight, 0);
		expect(placeholderRect.height).toBeCloseTo(naturalHeight, 0);
		expect({
			color: fixedStyle.color,
			fontFamily: fixedStyle.fontFamily,
			fontSize: fixedStyle.fontSize,
			fontWeight: fixedStyle.fontWeight,
			letterSpacing: fixedStyle.letterSpacing,
			lineHeight: fixedStyle.lineHeight
		}).toEqual(expectedTypography);
		expect(target.querySelector('[data-testid="affix-output"]')?.textContent).toContain('true:DIV');
		const previousTop = fixedRect.top;
		component.scrollAffixAncestor(40);
		await expect
			.poll(() => fixed.getBoundingClientRect().top)
			.toBeCloseTo(scroller.getBoundingClientRect().top + scroller.clientTop + 6, 0);
		expect(fixed.getBoundingClientRect().top).toBeCloseTo(previousTop - 40, 0);

		component.scrollAffix(0);
		await expect.poll(() => projected.dataset.affixed).toBeUndefined();
		expect(projected.contains(projectedContent)).toBe(true);
		await unmount(component);
		target.remove();
	});

	it('reveals BackTop from HTMLElement scroll, honors reduced motion and lets onclick cancel', async () => {
		const target = host();
		const component = mount(AffixBackTopFixture, { target });
		expect(target.querySelector('[data-testid="back-top-primary"]')).toBeNull();
		await tick();
		component.scrollBackTop(140);
		await expect
			.poll(() => document.querySelector<HTMLButtonElement>('[data-testid="back-top-primary"]'))
			.not.toBeNull();
		const primary = document.querySelector<HTMLButtonElement>('[data-testid="back-top-primary"]')!;
		const cancelled = document.querySelector<HTMLButtonElement>(
			'[data-testid="back-top-cancelled"]'
		)!;
		const fullMotion = document.querySelector<HTMLButtonElement>(
			'[data-testid="back-top-full-motion"]'
		)!;
		const scroller = target.querySelector<HTMLElement>('[data-testid="back-top-scroller"]')!;
		expect(primary.getAttribute('aria-label')).toBe('Return to start');
		expect(primary.closest<HTMLElement>('[data-slot="positioner"]')?.dataset.reducedMotion).toBe(
			'true'
		);
		await userEvent.click(cancelled);
		expect(scroller.scrollTop).toBe(140);
		expect(target.querySelector('[data-testid="back-top-output"]')?.textContent).toBe('none:0:1');

		await userEvent.click(primary);
		await tick();
		expect(scroller.scrollTop).toBe(0);
		await expect
			.poll(() => fullMotion.closest<HTMLElement>('[data-slot="positioner"]')?.inert)
			.toBe(true);
		const exiting = fullMotion.closest<HTMLElement>('[data-slot="positioner"]')!;
		expect(exiting.getAttribute('aria-hidden')).toBe('true');
		expect(target.querySelector('[data-testid="back-top-output"]')?.textContent).toBe(
			'instant:1:1'
		);
		await expect.poll(() => document.querySelector('[data-testid="back-top-primary"]')).toBeNull();
		expect(document.activeElement).toBe(scroller);
		await unmount(component);
		target.remove();
	});

	it('uses logical RTL placement and projects all five Button sizes', async () => {
		const target = host();
		const component = mount(AffixBackTopFixture, { target });
		await tick();
		component.scrollBackTop(140);
		await expect
			.poll(() => document.querySelector('[data-testid="back-top-primary"]'))
			.not.toBeNull();
		await expect
			.poll(() => document.querySelector('[data-testid="back-top-cancelled"]'))
			.not.toBeNull();
		const primary = document.querySelector<HTMLButtonElement>('[data-testid="back-top-primary"]')!;
		const cancelled = document.querySelector<HTMLButtonElement>(
			'[data-testid="back-top-cancelled"]'
		)!;
		const primaryPosition = getComputedStyle(
			primary.closest<HTMLElement>('[data-slot="positioner"]')!
		);
		const cancelledPosition = getComputedStyle(
			cancelled.closest<HTMLElement>('[data-slot="positioner"]')!
		);
		expect(primaryPosition.right).toBe('16px');
		expect(cancelledPosition.left).toBe('16px');

		for (const [size, height] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const button = document.querySelector<HTMLButtonElement>(`[data-testid="back-top-${size}"]`)!;
			expect(button.dataset.size).toBe(size);
			expect(button.getBoundingClientRect().height).toBe(height);
			expect(button.getBoundingClientRect().width).toBe(height);
		}
		await unmount(component);
		target.remove();
	});

	it('disconnects target listeners and clears bindable button refs on unmount', async () => {
		const target = host();
		const component = mount(AffixBackTopFixture, { target });
		await tick();
		component.scrollBackTop(140);
		await expect
			.poll(() => document.querySelector('[data-testid="back-top-primary"]'))
			.not.toBeNull();
		await unmount(component);
		expect(target.childElementCount).toBe(0);
		expect(document.querySelector('[data-testid="back-top-primary"]')).toBeNull();
		target.remove();
	});
});
