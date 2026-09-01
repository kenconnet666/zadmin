import type { Snippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZStatistic from '../src/components/data-display/ZStatistic.svelte';
import ZTimeline from '../src/components/data-display/ZTimeline.svelte';
import StatisticTimelineProductionFixture from './StatisticTimelineProductionFixture.svelte';

describe('Statistic and Timeline production SSR contracts', () => {
	it('keeps locale output, machine values and semantic lists deterministic on the server', () => {
		const first = render(StatisticTimelineProductionFixture).body;
		const second = render(StatisticTimelineProductionFixture).body;
		const expected = new Intl.NumberFormat('de-DE', {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2
		}).format(1234.5);
		expect(first).toContain(`<data`);
		expect(first).toContain(`value="1234.5"`);
		expect(first).toContain(expected);
		expect(first).toContain('<ol');
		expect(first).toContain('<li');
		expect(first).toContain('data-key-type="number"');
		expect(first).toContain('data-key-type="string"');
		expect(first).toContain('aria-current="true"');
		expect(first).toContain('datetime="2026-09-02T09:10:00+08:00"');
		expect(first).toContain('Legacy id migration');
		expect(second).toContain(expected);
	});

	it('rejects invalid static values and precision before emitting misleading markup', () => {
		expect(() => render(ZStatistic, { props: { label: 'Invalid', value: Number.NaN } })).toThrow(
			/value must be finite/u
		);
		expect(() =>
			render(ZStatistic, { props: { label: 'Invalid', precision: 101, value: 1 } })
		).toThrow(/precision must be an integer/u);
		expect(() =>
			render(ZStatistic, { props: { label: 'Invalid', trend: Number.POSITIVE_INFINITY, value: 1 } })
		).toThrow(/trend must be finite/u);
	});

	it('rejects duplicate, non-finite and ambiguous Timeline identities', () => {
		expect(() =>
			render(ZTimeline, {
				props: {
					items: [
						{ key: 'same', title: 'A' },
						{ key: 'same', title: 'B' }
					]
				}
			})
		).toThrow(/Duplicate ZTimeline key/u);
		expect(() =>
			render(ZTimeline, {
				props: { items: [{ key: Number.NaN, title: 'Invalid' }] }
			})
		).toThrow(/numeric keys must be finite/u);
		expect(() =>
			render(ZTimeline, {
				props: { items: [{ id: 'legacy', key: 'current', title: 'Ambiguous' }] } as never
			})
		).toThrow(/cannot provide both key and deprecated id/u);
		const snippet = (() => undefined) as Snippet;
		expect(() =>
			render(ZTimeline, { props: { content: snippet as never, item: snippet as never, items: [] } })
		).toThrow(/either content or deprecated item/u);
		expect(() => render(ZTimeline, { props: { items: [], pendingIcon: snippet } })).toThrow(
			/pendingIcon requires a pending snippet/u
		);
	});
});
