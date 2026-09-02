import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ProgressMeterSkeletonFixture from './ProgressMeterSkeletonFixture.svelte';
import VirtualListFixture from './VirtualListFixture.svelte';

describe('ZMeter, ZProgress, ZSkeleton and ZVirtualList production contracts', () => {
	it('keeps ZProgress and ZMeter native ranges and accessible value text', async () => {
		render(ProgressMeterSkeletonFixture);
		await tick();
		const progress = document.querySelector<HTMLProgressElement>(
			'[data-testid="progress-line-production"]'
		)!;
		const meter = document.querySelector<HTMLMeterElement>('[data-testid="meter-production"]')!;

		expect(progress.tagName).toBe('PROGRESS');
		expect(progress.max).toBe(10);
		expect(progress.value).toBe(7);
		expect(progress.getAttribute('aria-valuetext')).toBe('7/10 shards');
		expect(meter.tagName).toBe('METER');
		expect(meter.min).toBe(0);
		expect(meter.max).toBe(100);
		expect(meter.value).toBe(72);
		expect(meter.getAttribute('aria-valuetext')).toBe('72/100 suboptimal');
		expect(meter.getAttribute('aria-describedby')).toBe('meter-production-description');
	});

	it('keeps ZSkeleton hidden semantics and reduced-motion animation cleanup', async () => {
		render(ProgressMeterSkeletonFixture);
		await tick();
		const lines = document.querySelector<HTMLElement>('[data-testid="skeleton-lines-production"]')!;
		const staticSkeleton = document.querySelector<HTMLElement>(
			'[data-testid="skeleton-static-production"]'
		)!;
		const reducedSkeleton = document.querySelector<HTMLElement>(
			'[data-testid="skeleton-reduced-production"]'
		)!;

		expect(lines.getAttribute('aria-hidden')).toBe('true');
		expect(lines.querySelector('[data-slot="line"]')).not.toBeNull();
		expect(staticSkeleton.dataset.static).toBe('true');
		expect(staticSkeleton.getAnimations()).toHaveLength(0);
		expect(reducedSkeleton.dataset.reducedMotion).toBe('true');
		expect(reducedSkeleton.getAnimations()).toHaveLength(0);
	});

	it('keeps ZVirtualList keyed focus ownership, bounded window and prepend anchor', async () => {
		render(VirtualListFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-dynamic"]')!;
		await expect.poll(() => viewport.querySelector('[data-measured="true"]')).not.toBeNull();
		expect(viewport.querySelector('[role="option"]')).not.toBeNull();
		expect(viewport.querySelectorAll('[role="option"]').length).toBeLessThan(20);

		document.querySelector<HTMLButtonElement>('[data-testid="virtual-activate"]')?.click();
		await expect
			.poll(() => document.querySelector('[data-testid="virtual-active-output"]')?.textContent)
			.toBe('row-199:virtual-option-200');
		expect(document.querySelector('#virtual-option-200')).not.toBeNull();
		expect(
			document
				.querySelector('[data-testid="virtual-focus-owner"]')
				?.getAttribute('aria-activedescendant')
		).toBe('virtual-option-200');

		viewport.scrollTop = 1600;
		viewport.dispatchEvent(new Event('scroll'));
		await tick();
		const beforeText = viewport.querySelector('[role="option"]')?.textContent?.trim();
		expect(beforeText).toBeTruthy();
		document.querySelector<HTMLButtonElement>('[data-testid="virtual-prepend"]')?.click();
		await tick();
		expect(viewport.querySelector('[role="option"]')?.textContent?.trim()).toBe(beforeText);
	});
});
