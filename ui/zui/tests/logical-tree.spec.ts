import { describe, expect, it } from 'vitest';

import { LogicalTree } from '../src/runtime/tree.js';

describe('LogicalTree', () => {
	it('normalizes typed hierarchy independently from expansion and DOM state', () => {
		const tree = new LogicalTree([
			{ key: 1, label: 'Numeric root' },
			{ key: '1', label: 'String child', parentKey: 1, selectionDisabled: true },
			{ hasChildren: true, key: 'lazy', label: 'Lazy root' }
		]);
		const collapsed = tree.view(new Set());
		const expanded = tree.view(new Set([1]));

		expect(collapsed.keys).toEqual([1, 'lazy']);
		expect(expanded.keys).toEqual([1, '1', 'lazy']);
		expect(expanded.get('1')).toMatchObject({
			level: 2,
			parentKey: 1,
			posInSet: 1,
			selectionDisabled: true,
			setSize: 1
		});
		expect(collapsed.get('lazy')).toMatchObject({ childCount: 0, hasChildren: true });
		expect(tree.pathTo('1').map(({ key }) => key)).toEqual([1, '1']);
		expect(tree.isDescendant('1', 1)).toBe(true);
		expect(tree.collection.full.keys).toEqual([1, '1', 'lazy']);
	});

	it('rejects invalid keys, missing parents and cycles before exposing a view', () => {
		expect(() => new LogicalTree([{ key: Number.NaN, label: 'Invalid' }])).toThrow(/finite/u);
		expect(() => new LogicalTree([{ key: -0, label: 'Invalid' }])).toThrow(/-0/u);
		expect(
			() =>
				new LogicalTree([
					{ key: 'same', label: 'One' },
					{ key: 'same', label: 'Two' }
				])
		).toThrow(/Duplicate tree key/u);
		expect(() => new LogicalTree([{ key: 'child', label: 'Child', parentKey: 'missing' }])).toThrow(
			/Missing tree parent/u
		);
		expect(
			() =>
				new LogicalTree([
					{ key: 'a', label: 'A', parentKey: 'b' },
					{ key: 'b', label: 'B', parentKey: 'a' }
				])
		).toThrow(/cycle/u);
	});

	it('normalizes and flattens deeply nested data without recursive call-stack ownership', () => {
		const nodes = Array.from({ length: 2000 }, (_, index) => ({
			key: index,
			label: `Node ${index}`,
			parentKey: index === 0 ? undefined : index - 1
		}));
		const tree = new LogicalTree(nodes);
		const view = tree.view(new Set(nodes.map(({ key }) => key)));
		expect(view.entries).toHaveLength(2000);
		expect(view.entries.at(-1)).toMatchObject({ key: 1999, level: 2000 });
	});
});
