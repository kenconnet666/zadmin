import { assertCollectionMutationSource, type CollectionMutationSource } from './mutation.js';
import { assertSelectionKey, type SelectionKey } from './selection.js';

export type ReorderSource = CollectionMutationSource;

export interface ReorderRequest<TKey extends SelectionKey = SelectionKey> {
	readonly fromIndex: number;
	readonly key: TKey;
	readonly keys: readonly TKey[];
	readonly source: ReorderSource;
	readonly toIndex: number;
}

function frozenUniqueKeys<TKey extends SelectionKey>(
	keys: readonly TKey[],
	owner: string
): readonly TKey[] {
	if (!Array.isArray(keys)) throw new TypeError(`${owner} keys must be an array.`);
	const seen = new Set<SelectionKey>();
	const copy: TKey[] = [];
	for (const key of keys) {
		const candidate: unknown = key;
		assertSelectionKey(candidate, owner);
		if (seen.has(candidate)) throw new TypeError(`${owner} keys must be unique.`);
		seen.add(candidate);
		copy.push(key);
	}
	return Object.freeze(copy);
}

function reorderIndex(value: unknown, length: number, name: string): number {
	if (typeof value !== 'number' || !Number.isInteger(value))
		throw new TypeError(`${name} must be an integer.`);
	if (value < 0 || value >= length)
		throw new RangeError(`${name} must be within the key snapshot.`);
	return value;
}

function reorderSource(value: unknown): ReorderSource {
	assertCollectionMutationSource(value, 'Reorder source');
	return value;
}

function sameSnapshot<TKey extends SelectionKey>(
	left: readonly TKey[],
	right: readonly TKey[]
): boolean {
	return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
}

/**
 * Creates an immutable move request from a pre-move key snapshot.
 *
 * `toIndex` is the final index after the move. Moving a key to its existing index is a no-op and
 * returns null, so consumers do not emit an owner request for unchanged order.
 */
export function createReorderRequest<TKey extends SelectionKey>(
	keys: readonly TKey[],
	key: TKey,
	toIndex: number,
	source: ReorderSource
): ReorderRequest<TKey> | null {
	const snapshot = frozenUniqueKeys(keys, 'Reorder');
	assertSelectionKey(key, 'Reorder');
	const fromIndex = snapshot.findIndex((candidate) => Object.is(candidate, key));
	if (fromIndex < 0) throw new RangeError('Reorder key must exist in the key snapshot.');
	const target = reorderIndex(toIndex, snapshot.length, 'Reorder toIndex');
	const resolvedSource = reorderSource(source);
	if (fromIndex === target) return null;
	return Object.freeze({
		fromIndex,
		key,
		keys: snapshot,
		source: resolvedSource,
		toIndex: target
	});
}

/** Applies a request only while the current key order still matches its pre-move snapshot. */
export function applyReorderRequest<TKey extends SelectionKey>(
	currentKeys: readonly TKey[],
	request: ReorderRequest<TKey>
): readonly TKey[] {
	const current = frozenUniqueKeys(currentKeys, 'Current reorder');
	const snapshot = frozenUniqueKeys(request.keys, 'Reorder request');
	assertSelectionKey(request.key, 'Reorder request');
	const fromIndex = reorderIndex(request.fromIndex, snapshot.length, 'Reorder fromIndex');
	const toIndex = reorderIndex(request.toIndex, snapshot.length, 'Reorder toIndex');
	reorderSource(request.source);
	if (!Object.is(snapshot[fromIndex], request.key))
		throw new RangeError('Reorder request key does not match its fromIndex.');
	if (fromIndex === toIndex) throw new RangeError('Reorder requests must describe an actual move.');
	if (!sameSnapshot(current, snapshot))
		throw new RangeError('Reorder request is stale because the current key snapshot changed.');
	const reordered = [...current];
	const [moved] = reordered.splice(fromIndex, 1);
	reordered.splice(toIndex, 0, moved!);
	return Object.freeze(reordered);
}
