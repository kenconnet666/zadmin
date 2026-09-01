import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ProgressMeterSkeletonSsrFixture from './ProgressMeterSkeletonSsrFixture.svelte';

describe('Progress Meter and Skeleton SSR contract', () => {
	it('renders native range elements, semantic SVG geometry and static placeholder structure', () => {
		const result = render(ProgressMeterSkeletonSsrFixture).body;
		expect(result).toContain('<progress');
		expect(result).toContain('aria-valuemin="10"');
		expect(result).toContain('aria-valuetext="Server waiting"');
		expect(result).toContain('role="progressbar"');
		expect(result).toContain('<meter');
		expect(result).toContain('data-state="suboptimal"');
		expect(result.match(/data-slot="line"/gu)).toHaveLength(3);
		expect(result).toContain('data-static="true"');
		expect(result).toContain('aria-hidden="true"');
	});
});
