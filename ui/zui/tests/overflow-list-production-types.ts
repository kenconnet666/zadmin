import type { ComponentProps } from 'svelte';

import {
	default as ZOverflowList,
	type OverflowListState,
	type ZOverflowListProps
} from '../src/components/layout/ZOverflowList.svelte';

type Entry = Readonly<{ key: number | string; label: string }>;

const props = {
	item: ((entry: Entry) => entry.label) as never,
	itemKey: (entry: Entry) => entry.key,
	items: [
		{ key: 1, label: 'One' },
		{ key: '1', label: 'String one' }
	] as const,
	overflow: ((state: OverflowListState<Entry>) => {
		void state;
		return undefined;
	}) as never,
	pinnedKeys: [1, '1'] as const
} satisfies ComponentProps<
	typeof ZOverflowList<Entry, number | string>
> satisfies ZOverflowListProps<Entry, number | string>;
void props;

const invalidKey = {
	item: ((entry: Entry) => entry.label) as never,
	// @ts-expect-error Item identities are string or finite numeric SelectionKey values.
	itemKey: (entry: Entry) => {
		void entry;
		return Symbol('invalid');
	},
	items: [] as readonly Entry[],
	overflow: ((state: OverflowListState<Entry>) => {
		void state;
		return undefined;
	}) as never
} satisfies ZOverflowListProps<Entry>;
void invalidKey;

const invalidCount = {
	item: ((entry: Entry) => entry.label) as never,
	itemKey: (entry: Entry) => entry.key,
	items: [] as readonly Entry[],
	// @ts-expect-error maxVisibleItems is numeric, never a responsive or string count.
	maxVisibleItems: 'two',
	overflow: ((state: OverflowListState<Entry>) => {
		void state;
		return undefined;
	}) as never
} satisfies ZOverflowListProps<Entry>;
void invalidCount;
