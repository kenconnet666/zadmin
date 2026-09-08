import type { ComponentProps, Snippet } from 'svelte';

import ZSortable, {
	type SortableItemContext,
	type SortableMoveEnd,
	type SortableMoveRequest,
	type SortableMoveResult,
	type ZSortableProps
} from '../src/components/compound/sortable/ZSortable.svelte';

type Key = 0 | '0' | 'tail';
interface Item {
	readonly key: Key;
	readonly label: string;
}

const items = [
	{ key: 0, label: 'Numeric zero' },
	{ key: '0', label: 'String zero' },
	{ key: 'tail', label: 'Tail' }
] as const satisfies readonly Item[];
const item = (() => undefined) as unknown as Snippet<
	[item: Item, context: SortableItemContext<Key>]
>;
const onMoveRequest = (request: SortableMoveRequest<Item, Key>): boolean | Promise<boolean> => {
	const key: Key = request.key;
	const snapshot: readonly Key[] = request.keys;
	const next: readonly Item[] = request.nextItems;
	const source: 'pointer' | 'keyboard' | 'action' = request.source;
	const signal: AbortSignal = request.signal;
	void [key, snapshot, next, source, signal, request.fromIndex, request.toIndex];
	return true;
};
const props = {
	items,
	itemKey: (entry: Item) => entry.key,
	itemLabel: (entry: Item) => entry.label,
	onMoveRequest,
	item
} satisfies ComponentProps<typeof ZSortable<Item, Key>> satisfies ZSortableProps<Item, Key>;
const everyResult = {
	accepted: true,
	rejected: true,
	cancelled: true,
	stale: true,
	error: true
} satisfies Record<SortableMoveResult, true>;

function consumeEnd(detail: SortableMoveEnd<Item, Key>): string {
	const result: SortableMoveResult = detail.result;
	return `${String(detail.request.key)}:${result}:${String(detail.error)}`;
}

const invalidKey = {
	items,
	// @ts-expect-error Sortable identity is a string or finite number, never a symbol.
	itemKey: () => Symbol('invalid'),
	itemLabel: (entry: Item) => entry.label,
	onMoveRequest
} satisfies ZSortableProps<Item, Key>;

const invalidRequestResult = {
	items,
	itemKey: (entry: Item) => entry.key,
	itemLabel: (entry: Item) => entry.label,
	// @ts-expect-error Move ownership must explicitly accept or reject with boolean.
	onMoveRequest: () => 'accepted'
} satisfies ZSortableProps<Item, Key>;

// @ts-expect-error onMoveRequest is required because ZSortable never mutates owner items itself.
const missingOwner: ZSortableProps<Item, Key> = {
	items,
	itemKey: (entry: Item) => entry.key,
	itemLabel: (entry: Item) => entry.label
};

void props;
void everyResult;
void consumeEnd;
void invalidKey;
void invalidRequestResult;
void missingOwner;
