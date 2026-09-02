import { describe, expect, it, vi } from 'vitest';

import { ActiveDescendant } from '../src/runtime/collection/active-descendant.svelte.js';
import {
	CollectionNavigation,
	isKeyboardComposing
} from '../src/runtime/collection/collection-navigation.svelte.js';
import {
	LogicalCollection,
	type LogicalCollectionAdapter,
	type LogicalCollectionView
} from '../src/runtime/collection/logical-collection.js';
import { MountedElements } from '../src/runtime/collection/mounted-elements.svelte.js';
import { SelectionModel, type SelectionChange } from '../src/runtime/collection/selection-model.js';
import type {
	Selection,
	SelectionKey,
	SelectionMode
} from '../src/runtime/collection/selection.js';

interface Item {
	readonly disabled?: boolean;
	readonly group?: string;
	readonly key: SelectionKey;
	readonly label: string;
	readonly selectionDisabled?: boolean;
}

const adapter: LogicalCollectionAdapter<Item, SelectionKey> = {
	disabled: (item) => item.disabled ?? false,
	groupKey: (item) => item.group,
	key: (item) => item.key,
	selectionDisabled: (item) => item.selectionDisabled ?? false,
	textValue: (item) => item.label
};

function collection(items: readonly Item[]): LogicalCollection<SelectionKey, Item> {
	return new LogicalCollection(items, adapter, { name: 'Fixture collection' });
}

describe('logical collection', () => {
	it('keeps source order, typed keys, groups and ranked views independent from DOM', () => {
		const source = collection([
			{ group: 'Primary', key: 1, label: 'Numeric one' },
			{ group: 'Primary', key: '1', label: 'String one' },
			{ group: 'Secondary', key: 'three', label: 'Three' }
		]);
		expect(source.full.keys).toEqual([1, '1', 'three']);
		expect(source.full.groups.map(({ key }) => key)).toEqual(['Primary', 'Secondary']);
		expect(source.view({ keys: ['three', 1] }).keys).toEqual(['three', 1]);
		expect(source.view({ include: ({ key }) => key !== '1' }).keys).toEqual([1, 'three']);
		expect(source.get(1)?.textValue).toBe('Numeric one');
		expect(source.get('1')?.textValue).toBe('String one');
	});

	it('rejects invalid, duplicate, unknown and duplicate-view keys', () => {
		expect(() => collection([{ key: Number.NaN, label: 'NaN' }])).toThrow(/finite numbers/u);
		expect(() => collection([{ key: Number.POSITIVE_INFINITY, label: 'Infinity' }])).toThrow(
			/finite numbers/u
		);
		expect(() => collection([{ key: -0, label: 'Negative zero' }])).toThrow(/-0/u);
		expect(() =>
			collection([
				{ key: 'same', label: 'One' },
				{ key: 'same', label: 'Two' }
			])
		).toThrow(/Duplicate Fixture collection key/u);
		const source = collection([{ key: 'one', label: 'One' }]);
		expect(() => source.view({ keys: ['missing'] })).toThrow(/unknown key/u);
		expect(() => source.view({ keys: ['one', 'one'] })).toThrow(/duplicate key/u);
	});

	it('traverses enabled items without conflating selection-disabled items', () => {
		const view = collection([
			{ key: 'a', label: 'A' },
			{ disabled: true, key: 'b', label: 'B' },
			{ key: 'c', label: 'C', selectionDisabled: true },
			{ key: 'd', label: 'D' }
		]).full;
		expect(view.first()).toBe('a');
		expect(view.next('a')).toBe('c');
		expect(view.next('d')).toBe('d');
		expect(view.next('d', { loop: true })).toBe('a');
		expect(view.previous(undefined)).toBe('d');
		expect(view.range('d', 'a')).toEqual(['a', 'b', 'c', 'd']);
	});
});

describe('collection navigation and active descendant', () => {
	it('distinguishes an unset active key from the first candidate', () => {
		const source = collection([
			{ key: 'a', label: 'A' },
			{ key: 'b', label: 'B' }
		]);
		const navigation = new CollectionNavigation({ view: () => source.full });
		expect(navigation.currentKey).toBeUndefined();
		expect(navigation.move('next')).toBe('a');
		expect(navigation.currentKey).toBe('a');
		navigation.set(undefined, 'programmatic');
		expect(navigation.move('previous')).toBe('b');
	});

	it('reconciles a removed or disabled active key to successor then predecessor', () => {
		let view: LogicalCollectionView<SelectionKey, Item> = collection([
			{ key: 'a', label: 'A' },
			{ key: 'b', label: 'B' },
			{ key: 'c', label: 'C' },
			{ key: 'd', label: 'D' }
		]).full;
		let active: SelectionKey | undefined = 'b';
		const navigation = new CollectionNavigation({
			readActive: () => active,
			view: () => view,
			writeActive: (key) => (active = key)
		});
		expect(navigation.reconcile()).toBe('b');

		view = collection([
			{ key: 'a', label: 'A' },
			{ key: 'c', label: 'C' },
			{ key: 'd', label: 'D' }
		]).full;
		expect(navigation.reconcile()).toBe('c');
		expect(active).toBe('c');

		view = collection([
			{ key: 'a', label: 'A' },
			{ disabled: true, key: 'c', label: 'C' },
			{ key: 'd', label: 'D' }
		]).full;
		expect(navigation.reconcile()).toBe('d');
		expect(active).toBe('d');
	});

	it('restores removal focus from the stable pre-removal view after transient active churn', () => {
		const previous = collection([
			{ key: 'a', label: 'A' },
			{ key: 'b', label: 'B' },
			{ key: 'c', label: 'C' }
		]).full;
		const current = collection([
			{ key: 'a', label: 'A' },
			{ key: 'c', label: 'C' }
		]).full;
		let active: SelectionKey | undefined = 'a';
		const navigation = new CollectionNavigation({
			readActive: () => active,
			view: () => current,
			writeActive: (key) => (active = key)
		});
		expect(navigation.reconcileRemoved(previous, 'b')).toBe('c');
		expect(active).toBe('c');
	});

	it('does not intercept composition and gives number/string keys distinct DOM ids', () => {
		const source = collection([
			{ key: 1, label: 'Numeric' },
			{ key: '1', label: 'String' }
		]);
		const navigation = new CollectionNavigation({ view: () => source.full });
		const mounted = new MountedElements<SelectionKey>();
		let idBase = 'fixture';
		const active = new ActiveDescendant({ idBase: () => idBase, mounted, navigation });
		active.reconcile();
		expect(active.activeKey).toBe(1);
		const numericId = active.idFor(1);
		expect(numericId).not.toBe(active.idFor('1'));
		expect(active.activeId).toBeUndefined();
		const element = {
			addEventListener: vi.fn(),
			compareDocumentPosition: vi.fn(() => 0),
			focus: vi.fn(),
			isConnected: true,
			ownerDocument: {} as Document,
			removeEventListener: vi.fn()
		} as unknown as HTMLElement;
		const unmount = active.mount(1, element);
		expect(active.activeId).toBe(numericId);
		idBase = 'nested';
		expect(active.activeId).toBe('nested-option-1');
		unmount();
		expect(active.activeId).toBeUndefined();

		const preventDefault = vi.fn();
		const event = {
			isComposing: true,
			key: 'ArrowDown',
			keyCode: 0,
			preventDefault
		} as unknown as KeyboardEvent;
		expect(active.handleKey(event)).toBe(false);
		expect(preventDefault).not.toHaveBeenCalled();
		expect(active.activeKey).toBe(1);
		expect(isKeyboardComposing({ isComposing: false, keyCode: 229 })).toBe(true);
	});
});

describe('mounted elements', () => {
	it('keeps replacement registrations, focus requests and connected DOM order race-safe', async () => {
		let activeElement: HTMLElement | null = null;
		const ownerDocument = {
			get activeElement() {
				return activeElement;
			},
			defaultView: { queueMicrotask },
			body: {}
		} as unknown as Document;
		const createElement = (position: number, focus = vi.fn()) => {
			const listeners = new Map<string, Set<EventListener>>();
			const element = {
				addEventListener(type: string, listener: EventListener) {
					const bucket = listeners.get(type) ?? new Set<EventListener>();
					bucket.add(listener);
					listeners.set(type, bucket);
				},
				compareDocumentPosition: vi.fn(() => position),
				contains(target: EventTarget) {
					return target === element;
				},
				focus: vi.fn((options?: FocusOptions) => {
					focus(options);
					activeElement = element as unknown as HTMLElement;
					for (const listener of listeners.get('focus') ?? []) {
						listener.call(element, new Event('focus'));
					}
				}),
				isConnected: true,
				ownerDocument,
				removeEventListener(type: string, listener: EventListener) {
					listeners.get(type)?.delete(listener);
				}
			} as unknown as HTMLElement;
			return element;
		};
		const focus = vi.fn();
		const before = createElement(4, focus);
		const after = createElement(2);
		const replacement = createElement(0);
		const mounted = new MountedElements<SelectionKey>();
		const removeAfter = mounted.mount('after', after, 'after-id');
		const removeBefore = mounted.mount('before', before, 'before-id');
		expect(mounted.order(['after', 'before'])).toEqual(['before', 'after']);
		expect(mounted.focus('before')).toBe(true);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
		expect(mounted.ownsFocus('before')).toBe(true);
		activeElement = {} as HTMLElement;
		expect(mounted.ownsFocus('before')).toBe(false);
		expect(mounted.focus('before')).toBe(true);
		expect(mounted.scheduleFocus('after')).toBe(true);
		expect(mounted.focus('before')).toBe(true);
		await Promise.resolve();
		expect(activeElement).toBe(before);
		expect(mounted.scheduleFocus('after')).toBe(true);
		await Promise.resolve();
		expect(activeElement).toBe(after);

		const stale = mounted.mount('replace', before, 'old-id');
		const current = mounted.mount('replace', replacement, 'new-id');
		stale();
		expect(mounted.get('replace')?.element).toBe(replacement);
		current();
		expect(mounted.has('replace')).toBe(false);
		removeAfter();
		removeBefore();
		mounted.clear();
	});
});

describe('selection model', () => {
	function createModel(options: {
		complete?: boolean;
		disallowEmpty?: boolean;
		items?: readonly Item[];
		mode?: SelectionMode;
		orphanPolicy?: 'preserve' | 'prune-when-complete';
		scope?: 'full' | 'view';
		selection?: Selection<SelectionKey>;
		viewKeys?: readonly SelectionKey[];
	}) {
		const source = collection(
			options.items ?? [
				{ key: 'a', label: 'A' },
				{ disabled: true, key: 'b', label: 'B' },
				{ key: 'c', label: 'C', selectionDisabled: true },
				{ key: 'd', label: 'D' }
			]
		);
		let selection: Selection<SelectionKey> = options.selection ?? new Set();
		const changes: SelectionChange<SelectionKey>[] = [];
		const model = new SelectionModel({
			collection: () => source,
			collectionComplete: () => options.complete ?? false,
			disallowEmpty: () => options.disallowEmpty ?? false,
			mode: () => options.mode ?? 'multiple',
			orphanPolicy: () => options.orphanPolicy ?? 'preserve',
			read: () => selection,
			selectAllScope: () => options.scope ?? 'full',
			view: () =>
				options.viewKeys === undefined ? source.full : source.view({ keys: options.viewKeys }),
			write: (change) => {
				changes.push(change);
				selection = change.selection;
			}
		});
		return {
			changes,
			get selection() {
				return selection;
			},
			model
		};
	}

	it('centralizes disabled, range, all and empty-selection policy', () => {
		const state = createModel({});
		expect(state.model.replace('a')).toBe(true);
		expect(state.model.toggle('b')).toBe(false);
		expect(state.model.toggle('c')).toBe(false);
		expect(state.model.extend('d')).toBe(true);
		expect(state.selection).toEqual(new Set(['a', 'd']));
		expect(state.model.selectAll()).toBe(true);
		expect(state.selection).toBe('all');
		expect(state.model.isSelected('a')).toBe(true);
		expect(state.model.isSelected('b')).toBe(false);
		expect(state.model.isSelected('c')).toBe(false);
		expect(state.model.toggle('a')).toBe(true);
		expect(state.selection).toEqual(new Set(['d']));
		const explicitDisabled = createModel({ selection: new Set(['b', 'c']) });
		expect(explicitDisabled.model.isSelected('b')).toBe(true);
		expect(explicitDisabled.model.isSelected('c')).toBe(true);

		const required = createModel({ disallowEmpty: true, selection: new Set(['a']) });
		expect(required.model.toggle('a')).toBe(false);
		expect(required.model.clear()).toBe(false);
	});

	it('supports view-scoped select-all and only prunes orphans when completeness is explicit', () => {
		const scoped = createModel({ scope: 'view', viewKeys: ['a', 'd'] });
		expect(scoped.model.selectAll()).toBe(true);
		expect(scoped.selection).toEqual(new Set(['a', 'd']));

		const preserved = createModel({ selection: new Set(['missing', 'a']) });
		expect(preserved.model.reconcile()).toBe(false);
		expect(preserved.selection).toEqual(new Set(['missing', 'a']));

		const pruned = createModel({
			complete: true,
			orphanPolicy: 'prune-when-complete',
			selection: new Set(['missing', 'a'])
		});
		expect(pruned.model.reconcile()).toBe(true);
		expect(pruned.selection).toEqual(new Set(['a']));
		expect(pruned.changes.at(-1)?.reason).toBe('reconcile');
	});
});
