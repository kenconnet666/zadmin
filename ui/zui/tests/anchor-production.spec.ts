import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ZAnchor from '../src/components/navigation/ZAnchor.svelte';
import { indexAnchorItems, type AnchorItem } from '../src/runtime/navigation-anchor.js';

describe('Anchor SSR and model', () => {
	it('renders real nested lists, typed keys and only an explicitly supplied active location', () => {
		const items: readonly AnchorItem[] = [
			{
				key: 1,
				label: 'One',
				href: '#one',
				children: [{ key: '1', label: 'Child', href: '#child', disabled: true }]
			}
		];
		const body = render(ZAnchor, {
			props: {
				items,
				defaultActiveKey: 1
			}
		}).body;
		expect(body.match(/<nav\b/g)).toHaveLength(1);
		expect(body.match(/<ul\b/g)).toHaveLength(2);
		expect(body.match(/<a\b/g)).toHaveLength(2);
		expect(body.match(/aria-current="location"/g)).toHaveLength(1);
		expect(body).toContain('href="#one"');
		expect(body).not.toContain('href="#child"');
		expect(body).toContain('data-key-type="number"');
		expect(body).toContain('data-key-type="string"');
	});
	it('does not infer an observed active item before browser geometry exists', () => {
		expect(
			render(ZAnchor, { props: { items: [{ key: 'a', label: 'A', href: '#a' }] } }).body
		).not.toContain('aria-current');
	});
	it('rejects cycles, duplicate typed keys, empty names and invalid hrefs', () => {
		const a = { key: 'a', label: 'A', href: '#a', children: [] as AnchorItem[] };
		a.children.push(a);
		expect(() => indexAnchorItems([a])).toThrow(/cycles/);
		expect(() =>
			indexAnchorItems([
				{ key: 1, label: 'A', href: '#a' },
				{ key: 1, label: 'B', href: '#b' }
			])
		).toThrow(/unique/);
		expect(
			() => render(ZAnchor, { props: { items: [{ key: 1, label: ' ', href: '#a' }] } }).body
		).toThrow(/label/);
		expect(() => indexAnchorItems([{ key: 1, label: 'A', href: '' }])).toThrow(/href/);
	});
	it('inherits disabled state across groups without conflating number and string keys', () => {
		const records = indexAnchorItems<string | number>([
			{
				key: 1,
				label: 'A',
				href: '#a',
				disabled: true,
				children: [{ key: '1', label: 'B', href: '#b' }]
			}
		]);
		expect(records.map((entry) => [entry.item.key, entry.depth, entry.disabled])).toEqual([
			[1, 0, true],
			['1', 1, true]
		]);
	});
});
