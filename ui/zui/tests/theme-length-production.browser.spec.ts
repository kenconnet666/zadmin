import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ThemeLengthProductionFixture from './ThemeLengthProductionFixture.svelte';

describe('display component Theme lengths', () => {
	it.each([false, true])(
		'renders numeric or CSS string lengths (strings=%s)',
		async (stringLengths) => {
			await render(ThemeLengthProductionFixture, { stringLengths });
			await tick();
			const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
			const circle = document.querySelector<HTMLElement>('[data-testid="theme-length-circle"]')!;
			const rectangle = document.querySelector<HTMLElement>(
				'[data-testid="theme-length-rectangle"]'
			)!;
			const lines = document.querySelectorAll<HTMLElement>(
				'[data-testid="theme-length-lines"] [data-slot="line"]'
			);
			const explicit = document.querySelector<HTMLElement>(
				'[data-testid="theme-length-explicit"]'
			)!;
			const axis = document.querySelector<HTMLElement>(
				'[data-testid="theme-length-timeline"] [data-slot="axis"]'
			)!;

			expect(circle.getBoundingClientRect().width).toBeCloseTo(43, 1);
			expect(circle.getBoundingClientRect().height).toBeCloseTo(43, 1);
			expect(rectangle.getBoundingClientRect().height).toBeCloseTo(43, 1);
			expect(lines).toHaveLength(2);
			for (const line of lines) {
				expect(line.getBoundingClientRect().height).toBeCloseTo(stringLengths ? rem * 0.75 : 11, 1);
			}
			expect(explicit.getBoundingClientRect().width).toBeCloseTo(37, 1);
			expect(explicit.getBoundingClientRect().height).toBeCloseTo(23, 1);
			expect(axis.getBoundingClientRect().width).toBeCloseTo(stringLengths ? rem + 9 : 31, 1);
		}
	);
});
