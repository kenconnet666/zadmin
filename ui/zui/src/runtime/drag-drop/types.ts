import type { ReorderRequest } from '../collection/reorder.js';
import type { SelectionKey } from '../collection/selection.js';

export interface SortableMoveRequest<
	T,
	TKey extends SelectionKey = SelectionKey
> extends ReorderRequest<TKey> {
	readonly nextItems: readonly T[];
	readonly signal: AbortSignal;
}

export type SortableMoveResult = 'accepted' | 'rejected' | 'cancelled' | 'stale' | 'error';

export interface SortableMoveEnd<T, TKey extends SelectionKey = SelectionKey> {
	readonly request: SortableMoveRequest<T, TKey>;
	readonly result: SortableMoveResult;
	readonly error?: unknown;
}

export interface SortableItemContext<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly index: number;
	readonly count: number;
	readonly dragging: boolean;
	readonly targeted: boolean;
	readonly pending: boolean;
	readonly disabled: boolean;
	readonly readonly: boolean;
	moveTo(index: number): Promise<boolean>;
}
