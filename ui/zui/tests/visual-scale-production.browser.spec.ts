import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { semanticTones } from '../src/theme/semantics.js';
import VisualScaleProductionFixture, {
	visualScaleTheme
} from './VisualScaleProductionFixture.svelte';

function element(id: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}

describe('shared visual scales and semantic colors', () => {
	it('uses five control heights with independent indicator, avatar and badge proportions', async () => {
		render(VisualScaleProductionFixture);
		await tick();
		for (const [size, control, font, indicator, avatar, badge, dot] of [
			['xsmall', 24, 11, 12, 24, 14, 4],
			['small', 28, 12, 14, 32, 16, 6],
			['medium', 32, 14, 16, 40, 20, 8],
			['large', 40, 16, 20, 48, 24, 10],
			['xlarge', 48, 16, 24, 64, 28, 12]
		] as const) {
			for (const kind of ['button', 'loading', 'navigation', 'tag', 'tag-remove']) {
				expect(element(`scale-${kind}-${size}`).getBoundingClientRect().height).toBeCloseTo(
					control,
					1
				);
			}
			expect(getComputedStyle(element(`scale-button-${size}`)).fontSize).toBe(`${font}px`);
			for (const kind of ['icon', 'spinner']) {
				const box = element(`scale-${kind}-${size}`).getBoundingClientRect();
				expect(box.width).toBeCloseTo(indicator, 1);
				expect(box.height).toBeCloseTo(indicator, 1);
			}
			const loading = element(`scale-loading-${size}`).querySelector('[data-slot="indicator"]')!;
			expect(loading.getBoundingClientRect().width).toBeCloseTo(indicator, 1);
			expect(element(`scale-avatar-${size}`).getBoundingClientRect().width).toBeCloseTo(avatar, 1);
			for (const [kind, expected] of [
				['badge', badge],
				['dot', dot]
			] as const) {
				const box = element(`scale-${kind}-${size}`)
					.querySelector('[data-slot="indicator"]')!
					.getBoundingClientRect();
				expect(box.width).toBeCloseTo(expected, 1);
				expect(box.height).toBeCloseTo(expected, 1);
			}
			const maxWidthRem = { xsmall: 24, small: 40, medium: 64, large: 80, xlarge: 96 }[size];
			const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
			expect(
				Number.parseFloat(getComputedStyle(element(`scale-container-${size}`)).maxWidth)
			).toBeCloseTo(maxWidthRem * rootFontSize, 1);
		}
	});

	it('shares eight text sizes while preserving heading semantics and balanced wrapping', () => {
		render(VisualScaleProductionFixture);
		for (const [size, expected] of [
			['xsmall', 11],
			['small', 12],
			['medium', 14],
			['large', 16],
			['xlarge', 20],
			['xxlarge', 24],
			['xxxlarge', 32],
			['xxxxlarge', 40]
		] as const) {
			for (const kind of ['heading', 'text', 'code', 'kbd']) {
				expect(getComputedStyle(element(`scale-${kind}-${size}`)).fontSize).toBe(`${expected}px`);
			}
			const heading = element(`scale-heading-${size}`);
			expect(heading.tagName).toBe('H2');
			expect(getComputedStyle(heading).textWrap).toBe('balance');
		}
	});

	it('preserves all semantic colors across solid, outline, ghost, links and pressed toggles', async () => {
		render(VisualScaleProductionFixture);
		await userEvent.hover(element('trend-improved'));
		for (const tone of ['primary', ...semanticTones] as const) {
			const expected = visualScaleTheme.color[tone];
			for (const kind of ['button', 'link']) {
				const solid = getComputedStyle(element(`tone-${kind}-${tone}-solid`));
				expect(solid.backgroundColor).toBe(expected);
				expect(solid.color).toBe('rgb(250, 250, 249)');
				const outline = getComputedStyle(element(`tone-${kind}-${tone}-outline`));
				expect(outline.color).toBe(expected);
				if (tone !== 'neutral') expect(outline.borderTopColor).toBe(expected);
				const ghost = getComputedStyle(element(`tone-${kind}-${tone}-ghost`));
				expect(ghost.color).toBe(expected);
				expect(ghost.backgroundColor).toBe('rgba(0, 0, 0, 0)');
			}
			const selected = getComputedStyle(element(`tone-toggle-${tone}`));
			expect(selected.backgroundColor).toBe(expected);
			expect(selected.color).toBe('rgb(250, 250, 249)');
		}
		for (const tone of semanticTones) {
			for (const kind of ['text', 'tag']) {
				expect(getComputedStyle(element(`tone-${kind}-${tone}`)).color).toBe(
					tone === 'neutral' ? visualScaleTheme.color.text : visualScaleTheme.color[tone]
				);
			}
			expect(getComputedStyle(element(`tone-result-${tone}`)).color).toBe(
				visualScaleTheme.color[tone]
			);
			for (const kind of ['alert', 'toast']) {
				expect(getComputedStyle(element(`tone-${kind}-${tone}`)).borderTopColor).toBe(
					visualScaleTheme.color[tone]
				);
			}
			const badge = element(`tone-badge-${tone}`).querySelector('[data-slot="indicator"]')!;
			expect(getComputedStyle(badge).backgroundColor).toBe(visualScaleTheme.color[tone]);
			expect(getComputedStyle(badge).color).toBe('rgb(250, 250, 249)');
		}
	});

	it('keeps raw trend direction neutral and lets business meaning color a negative improvement', () => {
		render(VisualScaleProductionFixture);
		const raw = element('trend-neutral').querySelector<HTMLElement>('[data-slot="trend"]')!;
		const improved = element('trend-improved').querySelector<HTMLElement>('[data-slot="trend"]')!;
		expect(raw.dataset.trend).toBe('up');
		expect(raw.dataset.tone).toBe('neutral');
		expect(improved.dataset.trend).toBe('down');
		expect(getComputedStyle(improved).color).toBe(visualScaleTheme.color.success);
		expect(
			getComputedStyle(element('trend-improved').querySelector('[data-slot="value"]')!).fontSize
		).toBe('32px');
	});
});
