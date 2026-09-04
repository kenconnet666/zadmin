import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CarouselFixture from './CarouselFixture.svelte';
import CoverageFixture from './CoverageFixture.svelte';

describe('ZCarousel production contracts', () => {
	it('keeps ZCarousel controlled typed slides, current state and navigation controls synchronized', async () => {
		// @zui-visual ZCarousel bounded slide and control surface geometry
		render(CarouselFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="carousel"]')!;
		const output = document.querySelector<HTMLOutputElement>('[data-testid="carousel-output"]')!;

		expect(carousel.getAttribute('aria-label')).toBe('Release carousel');
		expect(getComputedStyle(carousel).borderStyle).toBe('solid');
		expect(getComputedStyle(carousel).overflow).toBe('hidden');
		expect(
			getComputedStyle(carousel.querySelector<HTMLElement>('[data-slot="slide"]')!).paddingTop
		).toBe('24px');
		expect(
			carousel.querySelectorAll('[data-slot="slide"][role="group"]:not([hidden])')
		).toHaveLength(1);
		expect(carousel.querySelector('[data-active="true"]')).not.toBeNull();
		expect(carousel.querySelector('[aria-current="true"]')?.getAttribute('aria-label')).toContain(
			'Overview'
		);

		carousel.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')?.click();
		await tick();
		expect(output.textContent).toBe('two:1');
		expect(carousel.querySelector('[aria-current="true"]')?.getAttribute('aria-label')).toContain(
			'Metrics'
		);

		carousel.querySelector<HTMLButtonElement>('[aria-label^="Go to slide 3"]')?.click();
		await tick();
		expect(output.textContent).toBe('three:2');
		expect(carousel.querySelector('[data-active="true"]')?.textContent).toContain('Events');
	});

	it('keeps ZCarousel non-looping boundaries and reduced-motion autoplay controls accessible', async () => {
		render(CoverageFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="coverage-carousel"]')!;
		const reducedCarousel = document.querySelector<HTMLElement>(
			'[data-testid="coverage-carousel-reduced"]'
		)!;

		expect(
			carousel.querySelector<HTMLButtonElement>('[aria-label="Previous slide"]')?.disabled
		).toBe(false);
		carousel.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')?.click();
		await tick();
		expect(carousel.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')?.disabled).toBe(
			true
		);
		expect(carousel.querySelector('[aria-current="true"]')?.getAttribute('aria-label')).toContain(
			'Beta'
		);

		expect(reducedCarousel.dataset.reducedMotion).toBe('true');
		expect(
			reducedCarousel.querySelector<HTMLButtonElement>(
				'[aria-label="Automatic rotation disabled by motion preference"]'
			)?.disabled
		).toBe(true);
	});

	it('pauses ZCarousel autoplay through its explicit control without waiting for a timer', async () => {
		render(CoverageFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="coverage-carousel"]')!;

		expect(carousel.dataset.paused).toBeUndefined();
		carousel.querySelector<HTMLButtonElement>('[aria-label="Pause automatic rotation"]')?.click();
		await tick();
		expect(carousel.dataset.paused).toBe('true');
		expect(carousel.querySelector('[aria-label="Start automatic rotation"]')).not.toBeNull();
		expect(carousel.querySelector('[aria-live="polite"]')).not.toBeNull();
	});
});
