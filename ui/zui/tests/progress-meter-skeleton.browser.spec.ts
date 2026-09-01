import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ProgressMeterSkeletonFixture from './ProgressMeterSkeletonFixture.svelte';

describe('Progress Meter and Skeleton production contracts', () => {
	it('keeps native linear and semantic circular Progress on one normalized range contract', async () => {
		render(ProgressMeterSkeletonFixture);
		await tick();
		const line = document.querySelector<HTMLProgressElement>(
			'[data-testid="progress-line-production"]'
		)!;
		const circle = document.querySelector<HTMLElement>(
			'[data-testid="progress-circle-production"]'
		)!;
		expect(line.tagName).toBe('PROGRESS');
		expect(line.max).toBe(10);
		expect(line.value).toBe(7);
		expect(line.getAttribute('aria-valuemin')).toBe('10');
		expect(line.getAttribute('aria-valuemax')).toBe('20');
		expect(line.getAttribute('aria-valuetext')).toBe('7/10 shards');
		expect(line.dataset.tone).toBe('warning');
		expect(circle.getAttribute('role')).toBe('progressbar');
		expect(circle.hasAttribute('aria-valuenow')).toBe(false);
		expect(circle.getAttribute('aria-valuetext')).toBe('Waiting for worker');
		expect(circle.querySelector('[data-slot="track"]')?.getAttribute('stroke')).toBe(
			'currentColor'
		);
		expect(circle.querySelectorAll('svg circle')).toHaveLength(2);
	});

	it('preserves native Meter thresholds, formatter and description relationship', () => {
		render(ProgressMeterSkeletonFixture);
		const meter = document.querySelector<HTMLMeterElement>('[data-testid="meter-production"]')!;
		expect(meter.tagName).toBe('METER');
		expect(meter.min).toBe(0);
		expect(meter.max).toBe(100);
		expect(meter.low).toBe(35);
		expect(meter.high).toBe(80);
		expect(meter.optimum).toBe(20);
		expect(meter.value).toBe(72);
		expect(meter.dataset.state).toBe('suboptimal');
		expect(meter.getAttribute('aria-valuetext')).toBe('72/100 suboptimal');
		expect(meter.getAttribute('aria-describedby')).toBe('meter-production-description');
	});

	it('renders finite Skeleton lines and disables animation for static or reduced owners', async () => {
		render(ProgressMeterSkeletonFixture);
		await tick();
		const lines = document.querySelector<HTMLElement>('[data-testid="skeleton-lines-production"]')!;
		const staticSkeleton = document.querySelector<HTMLElement>(
			'[data-testid="skeleton-static-production"]'
		)!;
		const reducedSkeleton = document.querySelector<HTMLElement>(
			'[data-testid="skeleton-reduced-production"]'
		)!;
		const reducedProgress = document.querySelector<HTMLElement>(
			'[data-testid="progress-reduced-production"]'
		)!;
		expect(lines.querySelectorAll('[data-slot="line"]')).toHaveLength(3);
		expect(lines.getAttribute('aria-hidden')).toBe('true');
		expect(staticSkeleton.dataset.static).toBe('true');
		expect(staticSkeleton.getAnimations()).toHaveLength(0);
		expect(reducedSkeleton.dataset.reducedMotion).toBe('true');
		expect(reducedSkeleton.getAnimations()).toHaveLength(0);
		expect(reducedProgress.dataset.reducedMotion).toBe('true');
		expect(reducedProgress.querySelector('svg')?.getAnimations()).toHaveLength(0);
	});
});
