import { describe, expect, it } from 'vitest';

import { createZuiId, createZuiIdScope } from '../src/runtime/ids.js';
import { CollectionStore } from '../src/runtime/collection.svelte.js';
import { isSelected, selectAll, selectRange, toggleSelection } from '../src/runtime/selection.js';

describe('ZUI foundation runtime', () => {
	it('creates scoped SSR-stable ids and rejects ambiguous parts', () => {
		expect(createZuiId('zui', 's1')).toBe('zui-s1');
		expect(createZuiId('admin', 's1', 'control')).toBe('admin-s1-control');
		const scoped = createZuiIdScope('docs', 's2');
		expect(scoped()).toBe('docs-s2');
		expect(scoped('label')).toBe('docs-s2-label');
		expect(() => createZuiId('', 's1')).toThrow(/prefix/);
		expect(() => createZuiId('zui', 'bad id')).toThrow(/local id/);
		expect(() => createZuiId('zui', 's1', 'bad suffix')).toThrow(/suffix/);
	});

	it('keeps none, single, multiple, all and range selection immutable', () => {
		const source = new Set(['a']);
		expect([...toggleSelection(source, 'b', 'none')]).toEqual([]);
		expect([...toggleSelection(source, 'a', 'single')]).toEqual([]);
		expect([...toggleSelection(source, 'b', 'single')]).toEqual(['b']);
		expect([...toggleSelection(source, 'b', 'multiple')]).toEqual(['a', 'b']);
		expect([...source]).toEqual(['a']);
		expect(toggleSelection('all', 'b', 'multiple', ['a', 'b', 'c'])).toEqual(new Set(['a', 'c']));
		expect(selectAll('multiple')).toBe('all');
		expect([...selectAll('single')]).toEqual([]);
		expect(isSelected('all', 'missing')).toBe(true);
		expect(selectRange(new Set(['x']), ['a', 'b', 'c'], 'b', 'c')).toEqual(
			new Set(['x', 'b', 'c'])
		);
		expect(selectRange('all', ['a', 'b'], 'missing', 'b')).toEqual(new Set(['a', 'b']));
	});

	it('registers dynamic collection items with stable keys and idempotent cleanup', () => {
		const collection = new CollectionStore<{
			disabled?: boolean;
			key: string;
			textValue: string;
		}>();
		let label = 'Alpha';
		const removeA = collection.register(() => ({ key: 'a', textValue: label }));
		const removeB = collection.register(() => ({ disabled: true, key: 'b', textValue: 'Beta' }));
		expect(collection.keys).toEqual(['a', 'b']);
		expect(collection.enabledItems.map(({ key }) => key)).toEqual(['a']);
		label = 'Updated';
		expect(collection.get('a')?.textValue).toBe('Updated');
		expect(() => collection.register(() => ({ key: 'a', textValue: 'Duplicate' }))).toThrow(
			/Duplicate collection key/
		);
		removeA();
		removeA();
		expect(collection.keys).toEqual(['b']);
		removeB();
		expect(collection.items).toEqual([]);
	});
});
