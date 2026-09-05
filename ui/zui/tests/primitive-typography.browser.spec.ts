import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PrimitiveTypographyFixture from './PrimitiveTypographyFixture.svelte';

describe('primitive typography and surface contracts', () => {
	it('uses shared title tokens and exact navigation control heights', () => {
		render(PrimitiveTypographyFixture);
		const style = (id: string) =>
			getComputedStyle(document.querySelector(`[data-testid="${id}"]`)!);
		expect(style('heading-xxlarge').fontSize).toBe('32px');
		expect(style('heading-custom').fontSize).toBe('38px');
		expect(style('text-custom').fontSize).toBe('38px');
		for (const [size, height] of [
			['small', 24],
			['medium', 32],
			['large', 48]
		] as const) {
			expect(
				document.querySelector(`[data-testid="nav-${size}"]`)!.getBoundingClientRect().height
			).toBe(height);
		}
	});
	it('keeps default ZList string labels at normal body weight while preserving description hierarchy', () => {
		render(PrimitiveTypographyFixture);
		const list = document.querySelector<HTMLElement>('[data-testid="primitive-list"]')!;
		const label = list.querySelector<HTMLElement>('[data-slot="content"] > span')!;
		expect(label.tagName).toBe('SPAN');
		expect(getComputedStyle(label).fontWeight).toBe('400');

		const term = document.querySelector<HTMLElement>('[data-testid="primitive-descriptions"] dt')!;
		expect(term.textContent).toBe('Mode');
		expect(getComputedStyle(term).fontSize).toBe('12px');
	});

	it('keeps ZCard bodyPadding none and large as explicit body-region contracts', () => {
		render(PrimitiveTypographyFixture);
		const noneBody = document.querySelector<HTMLElement>(
			'[data-testid="card-padding-none"] [data-slot="body"]'
		)!;
		const largeBody = document.querySelector<HTMLElement>(
			'[data-testid="card-padding-large"] [data-slot="body"]'
		)!;
		expect(getComputedStyle(noneBody).paddingInline).toBe('0px');
		expect(getComputedStyle(noneBody).paddingBlock).toBe('0px');
		expect(getComputedStyle(largeBody).paddingInline).not.toBe('0px');
		expect(getComputedStyle(largeBody).paddingBlock).not.toBe('0px');
	});
});
