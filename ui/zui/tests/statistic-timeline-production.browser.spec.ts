import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import StatisticTimelineProductionFixture from './StatisticTimelineProductionFixture.svelte';

describe('Statistic and Timeline production browser contracts', () => {
	it('formats static statistics with deterministic locale, precision and formatter ownership', () => {
		render(StatisticTimelineProductionFixture);
		const statistic = document.querySelector<HTMLElement>('[data-testid="statistic-intl"]')!;
		const expected = new Intl.NumberFormat('de-DE', {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2
		}).format(1234.5);
		expect(statistic.tagName).toBe('DL');
		expect(statistic.querySelector('dt')?.textContent).toBe('Revenue');
		expect(statistic.querySelector('data')?.value).toBe('1234.5');
		expect(statistic.querySelector('data')?.textContent).toBe(expected);
		expect(statistic.querySelector('[data-slot="trend"]')?.textContent).toBe(
			new Intl.NumberFormat('de-DE', {
				maximumFractionDigits: 2,
				signDisplay: 'exceptZero',
				style: 'percent'
			}).format(0.125)
		);
		expect(document.querySelector('[data-testid="statistic-formatter"] data')?.textContent).toBe(
			'#12,345'
		);
	});

	it('keeps loading structure busy without rendering stale values', () => {
		render(StatisticTimelineProductionFixture);
		const loading = document.querySelector<HTMLElement>('[data-testid="statistic-loading"]')!;
		expect(loading.getAttribute('aria-busy')).toBe('true');
		expect(loading.querySelector('data')).toBeNull();
		expect(loading.querySelector('[data-slot="loading"] [aria-hidden="true"]')).not.toBeNull();
	});

	it('keeps number and string keys distinct inside real ordered-list items', () => {
		render(StatisticTimelineProductionFixture);
		const timeline = document.querySelector<HTMLElement>('[data-testid="timeline-typed"]')!;
		const items = [...timeline.querySelectorAll<HTMLElement>(':scope > li')];
		expect(timeline.tagName).toBe('OL');
		expect(timeline.getAttribute('aria-label')).toBe('Typed production timeline');
		expect(items).toHaveLength(2);
		expect(items.map((item) => item.dataset.keyType)).toEqual(['number', 'string']);
		expect(items[1]?.getAttribute('aria-current')).toBe('true');
		expect(timeline.querySelectorAll('time')).toHaveLength(0);
		expect(timeline.textContent).toContain('0:Numeric key');
		expect(timeline.textContent).toContain('at 09:20');
	});

	it('places pending at the reversed chronological edge and retains RTL alternate semantics', () => {
		render(StatisticTimelineProductionFixture);
		const pending = document.querySelector<HTMLElement>('[data-testid="timeline-pending"]')!;
		const alternate = document.querySelector<HTMLElement>('[data-testid="timeline-alternate"]')!;
		expect(pending.getAttribute('aria-busy')).toBe('true');
		expect(pending.querySelector(':scope > li')?.dataset.pending).toBe('true');
		expect(pending.querySelector(':scope > li')?.textContent).toContain('Still processing');
		expect(pending.querySelectorAll(':scope > li')[1]?.textContent).toContain('String key');
		expect(pending.querySelectorAll('time')).toHaveLength(2);
		expect(alternate.closest('[dir="rtl"]')).not.toBeNull();
		expect(alternate.dataset.mode).toBe('alternate');
		expect(getComputedStyle(alternate.querySelector('li')!).gridTemplateColumns).not.toBe('none');
		expect(alternate.querySelector('li')?.getBoundingClientRect().width).toBeLessThanOrEqual(
			alternate.getBoundingClientRect().width
		);
	});
});
