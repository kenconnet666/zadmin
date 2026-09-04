import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DisplayCollectionsProductionFixture from './DisplayCollectionsProductionFixture.svelte';
import LinkProductionFixture from './LinkProductionFixture.svelte';
import PaginationFixture from './PaginationFixture.svelte';
import StatisticTimelineProductionFixture from './StatisticTimelineProductionFixture.svelte';

describe('visual evidence audit for mature display contracts', () => {
	it('ZLink keeps long targets inside their owner geometry', () => {
		// @zui-visual ZLink bounded long-target geometry
		render(LinkProductionFixture);
		const owner = document.querySelector<HTMLElement>('[data-testid="link-long-owner"]')!;
		const long = document.querySelector<HTMLAnchorElement>('[data-testid="link-long"]')!;
		expect(getComputedStyle(long).overflowWrap).toBe('anywhere');
		expect(long.getBoundingClientRect().width).toBeLessThanOrEqual(
			owner.getBoundingClientRect().width
		);
	});

	it('ZDescriptionList keeps RTL descriptions within the collection width', () => {
		// @zui-visual ZDescriptionList responsive description geometry
		render(DisplayCollectionsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="display-rtl-descriptions"]')!;
		const description = root.querySelector<HTMLElement>('dd')!;
		expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(getComputedStyle(description).overflowWrap).toBe('anywhere');
		expect(description.getBoundingClientRect().width).toBeLessThanOrEqual(
			root.getBoundingClientRect().width
		);
	});

	it('ZTimeline keeps alternate items inside the RTL timeline owner', () => {
		// @zui-visual ZTimeline alternate item geometry
		render(StatisticTimelineProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="timeline-alternate"]')!;
		const item = root.querySelector<HTMLElement>(':scope > li')!;
		expect(getComputedStyle(item).gridTemplateColumns).not.toBe('none');
		expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(
			root.getBoundingClientRect().width
		);
	});

	it('ZStatistic renders a non-zero visual value region', () => {
		// @zui-visual ZStatistic value geometry
		render(StatisticTimelineProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="statistic-intl"]')!;
		const value =
			root.querySelector<HTMLElement>('[data-slot="value"]') ?? root.querySelector('data')!;
		expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(value.getBoundingClientRect().width).toBeGreaterThan(0);
	});

	it('ZPagination keeps navigation controls measurable within the nav owner', () => {
		// @zui-visual ZPagination navigation geometry
		render(PaginationFixture);
		const root = document.querySelector<HTMLElement>('[aria-label="Fixture pagination"]')!;
		const controls = [...root.querySelectorAll<HTMLButtonElement>('button')];
		expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(controls.length).toBeGreaterThan(0);
		expect(controls.every((control) => control.getBoundingClientRect().height > 0)).toBe(true);
	});
});
