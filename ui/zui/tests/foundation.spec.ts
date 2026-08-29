import { describe, expect, it, vi } from 'vitest';

import { createZuiId, createZuiIdScope } from '../src/runtime/ids.js';
import { CollectionStore } from '../src/runtime/collection.svelte.js';
import { createFormEntries, serializeFormValue } from '../src/runtime/form-value.js';
import { moveIndex, navigationIntent } from '../src/runtime/list-navigation.js';
import { RovingFocus } from '../src/runtime/roving-focus.svelte.js';
import {
	emptySelection,
	isSelected,
	selectAll,
	selectRange,
	singleSelection,
	toggleSelection
} from '../src/runtime/selection.js';
import { Typeahead } from '../src/runtime/typeahead.js';

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
		expect([...emptySelection()]).toEqual([]);
		expect([...singleSelection('a')]).toEqual(['a']);
		expect([...singleSelection()]).toEqual([]);
		expect(isSelected('all', 'missing')).toBe(true);
		expect(isSelected(new Set(['a']), 'missing')).toBe(false);
		expect([...toggleSelection(new Set(['a', 'b']), 'a', 'multiple')]).toEqual(['b']);
		expect(selectRange(new Set(['x']), ['a', 'b', 'c'], 'b', 'c')).toEqual(
			new Set(['x', 'b', 'c'])
		);
		expect(selectRange(new Set<string>(), ['a', 'b', 'c'], 'c', 'a')).toEqual(
			new Set(['a', 'b', 'c'])
		);
		expect(selectRange('all', ['a', 'b'], 'missing', 'b')).toEqual(new Set(['a', 'b']));
		expect(selectRange(new Set(['a']), ['a', 'b'], 'missing', 'b')).toEqual(new Set(['a']));
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

	it('sorts connected collection elements by DOM position and tolerates disconnected nodes', () => {
		const before = { compareDocumentPosition: vi.fn(() => 4) } as unknown as HTMLElement;
		const after = { compareDocumentPosition: vi.fn(() => 2) } as unknown as HTMLElement;
		const disconnected = { compareDocumentPosition: vi.fn(() => 1) } as unknown as HTMLElement;
		const collection = new CollectionStore();
		collection.register(() => ({ element: after, key: 'after' }));
		collection.register(() => ({ element: before, key: 'before' }));
		collection.register(() => ({ element: disconnected, key: 'disconnected' }));

		expect(collection.keys).toEqual(['before', 'after', 'disconnected']);
		expect(collection.get('missing')).toBeUndefined();
	});

	it('maps directional keys and moves indexes with RTL and loop contracts', () => {
		expect(navigationIntent('ArrowRight', 'horizontal')).toBe('next');
		expect(navigationIntent('ArrowRight', 'horizontal', 'rtl')).toBe('previous');
		expect(navigationIntent('ArrowDown', 'vertical')).toBe('next');
		expect(navigationIntent('ArrowUp', 'vertical')).toBe('previous');
		expect(navigationIntent('ArrowLeft', 'vertical')).toBeUndefined();
		expect(navigationIntent('ArrowLeft', 'both')).toBe('previous');
		expect(navigationIntent('Home', 'both')).toBe('first');
		expect(navigationIntent('End', 'both')).toBe('last');
		expect(moveIndex(3, 2, 'next')).toBe(0);
		expect(moveIndex(3, 2, 'next', false)).toBe(2);
		expect(moveIndex(3, -1, 'previous')).toBe(2);
		expect(moveIndex(3, 99, 'next')).toBe(0);
		expect(moveIndex(3, 0, 'previous', false)).toBe(0);
		expect(moveIndex(0, 0, 'next')).toBe(-1);
		expect(() => moveIndex(-1, 0, 'next')).toThrow(/non-negative integer/);
	});

	it('matches locale-aware typeahead with timeout, cycling and disabled filtering', () => {
		let now = 0;
		const typeahead = new Typeahead<string>({ locale: 'en', now: () => now, timeout: 500 });
		const items = [
			{ key: 'apple', textValue: 'Apple' },
			{ disabled: true, key: 'apricot', textValue: 'Apricot' },
			{ key: 'banana', textValue: 'Banana' },
			{ key: 'blueberry', textValue: 'Blueberry' }
		];
		expect(typeahead.search('b', items)).toBe('banana');
		expect(typeahead.buffer).toBe('b');
		now = 100;
		expect(typeahead.search('b', items, 'banana')).toBe('blueberry');
		typeahead.clear();
		expect(typeahead.search('a', items)).toBe('apple');
		now = 200;
		expect(typeahead.search('p', items)).toBe('apple');
		now = 800;
		expect(typeahead.search('b', items)).toBe('banana');
		expect(typeahead.search(' ', items)).toBeUndefined();
		typeahead.clear();
		expect(typeahead.search('z', items)).toBeUndefined();
		expect(typeahead.search('a', [])).toBeUndefined();
		expect(() => new Typeahead({ timeout: 0 })).toThrow(/must be positive/);
		expect(() => new Typeahead({ timeout: Number.POSITIVE_INFINITY })).toThrow(/must be positive/);
	});

	it('serializes scalar and repeated values into native form entries', () => {
		expect(createFormEntries('ready', true)).toEqual([['ready', 'on']]);
		expect(createFormEntries('tag', ['a', 'b', false])).toEqual([
			['tag', 'a'],
			['tag', 'b']
		]);
		expect(createFormEntries('empty', null)).toEqual([]);
		expect(serializeFormValue(12n)).toBe('12');
		expect(() => serializeFormValue(Number.NaN)).toThrow(/must be finite/);
		expect(() => createFormEntries('', 'value')).toThrow(/must not be empty/);
	});

	it('owns one roving tab stop without coupling focus to selection', () => {
		const collection = new CollectionStore<{ disabled?: boolean; key: string }>();
		const focus = vi.fn();
		collection.register(() => ({ element: { focus } as unknown as HTMLElement, key: 'a' }));
		collection.register(() => ({ disabled: true, key: 'b' }));
		collection.register(() => ({ key: 'c' }));
		let current: string | undefined;
		const roving = new RovingFocus({
			collection,
			orientation: () => 'horizontal',
			read: () => current,
			write: (key) => (current = key)
		});
		expect(roving.tabIndex('a')).toBe(0);
		expect(roving.tabIndex('c')).toBe(-1);
		expect(roving.move('ArrowRight')).toBe('c');
		expect(current).toBe('c');
		expect(roving.set('b')).toBe(false);
		expect(roving.move('ArrowRight')).toBe('a');
		const preventDefault = vi.fn();
		expect(roving.handleKey({ key: 'End', preventDefault } as unknown as KeyboardEvent)).toBe('c');
		expect(preventDefault).toHaveBeenCalledOnce();
		expect(roving.handleKey({ key: 'PageDown', preventDefault } as unknown as KeyboardEvent)).toBe(
			undefined
		);
		expect(focus).toHaveBeenCalled();
	});
});
