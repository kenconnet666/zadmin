import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZOverflowList from '../src/components/layout/ZOverflowList.svelte';

const items = [
	{ key: 1, label: 'One' },
	{ key: '1', label: 'String one' },
	{ key: 'third', label: 'Third' }
] as const;

describe('ZOverflowList server contract', () => {
	it('keeps every item in deterministic SSR markup without pretending to measure or collapse', () => {
		const body = render(ZOverflowList<(typeof items)[number], (typeof items)[number]['key']>, {
			props: {
				item: (() => undefined) as never,
				itemKey: (entry: (typeof items)[number]) => entry.key,
				items,
				overflow: (() => undefined) as never
			}
		}).body;
		expect(body).toContain('data-key="1"');
		expect(body).toContain('data-key-type="number"');
		expect(body).toContain('data-key-type="string"');
		expect(body.match(/data-slot="item"/gu)).toHaveLength(3);
		expect(body).not.toContain('data-measured="true"');
		expect(body).not.toMatch(/data-slot="item"[^>]*data-overflow-hidden="true"/u);
	});

	it('validates duplicate keys and impossible count values only after server output is read', () => {
		const props = {
			item: (() => undefined) as never,
			itemKey: (entry: { key: number }) => entry.key,
			items: [{ key: 1 }, { key: 1 }],
			overflow: (() => undefined) as never
		};
		expect(() => render(ZOverflowList<{ key: number }, number>, { props }).body).toThrow(
			'OverflowList requires unique keys.'
		);
		expect(
			() =>
				render(ZOverflowList<{ key: number }, number>, {
					props: { ...props, items: [{ key: 1 }], maxRows: 0 }
				}).body
		).toThrow('maxRows must be a safe integer of at least 1');
	});
});
