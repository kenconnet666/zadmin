import { assertSelectionKey, type SelectionKey } from './selection.js';

export type TransferDestination = 'source' | 'target';

export interface TransferItemInput<TKey extends SelectionKey = SelectionKey> {
	readonly disabled?: boolean;
	readonly key: TKey;
}

export interface TransferItemSnapshot<TKey extends SelectionKey = SelectionKey> {
	readonly disabled: boolean;
	readonly key: TKey;
}

export interface TransferMoveCandidateInput<TKey extends SelectionKey = SelectionKey> {
	readonly destination: TransferDestination;
	readonly items: readonly TransferItemInput<TKey>[];
	readonly movingKeys: readonly TKey[];
	readonly value: readonly TKey[];
}

export interface TransferMoveCandidate<TKey extends SelectionKey = SelectionKey> {
	readonly destination: TransferDestination;
	readonly items: readonly TransferItemSnapshot<TKey>[];
	readonly movingKeys: readonly TKey[];
	readonly nextValue: readonly TKey[];
	readonly value: readonly TKey[];
}

function destination(value: unknown): TransferDestination {
	if (value !== 'source' && value !== 'target')
		throw new TypeError('Transfer destination must be source or target.');
	return value;
}

function uniqueKeys<TKey extends SelectionKey>(
	value: readonly TKey[],
	owner: string
): readonly TKey[] {
	if (!Array.isArray(value)) throw new TypeError(`${owner} must be an array.`);
	const seen = new Set<SelectionKey>();
	const snapshot: TKey[] = [];
	for (const key of value) {
		const candidate: unknown = key;
		assertSelectionKey(candidate, owner);
		if (seen.has(candidate)) throw new TypeError(`${owner} keys must be unique.`);
		seen.add(candidate);
		snapshot.push(key);
	}
	return Object.freeze(snapshot);
}

function itemSnapshot<TKey extends SelectionKey>(
	value: readonly TransferItemInput<TKey>[],
	owner: string
): readonly TransferItemSnapshot<TKey>[] {
	if (!Array.isArray(value)) throw new TypeError(`${owner} must be an array.`);
	const seen = new Set<SelectionKey>();
	const snapshot: TransferItemSnapshot<TKey>[] = [];
	for (const item of value) {
		if (typeof item !== 'object' || item === null)
			throw new TypeError(`${owner} entries must be objects.`);
		const key = item.key;
		const disabled = item.disabled;
		const candidate: unknown = key;
		assertSelectionKey(candidate, owner);
		if (seen.has(candidate)) throw new TypeError(`${owner} keys must be unique.`);
		if (disabled !== undefined && typeof disabled !== 'boolean')
			throw new TypeError(`${owner} disabled values must be boolean or undefined.`);
		seen.add(candidate);
		snapshot.push(Object.freeze({ disabled: disabled ?? false, key }));
	}
	return Object.freeze(snapshot);
}

function sameKeys<TKey extends SelectionKey>(
	left: readonly TKey[],
	right: readonly TKey[]
): boolean {
	return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
}

function sameItems<TKey extends SelectionKey>(
	left: readonly TransferItemSnapshot<TKey>[],
	right: readonly TransferItemSnapshot<TKey>[]
): boolean {
	return (
		left.length === right.length &&
		left.every(
			(item, index) =>
				Object.is(item.key, right[index]?.key) && item.disabled === right[index]?.disabled
		)
	);
}

/** Creates a frozen Transfer membership candidate without taking ownership of canonical value. */
export function createTransferMoveCandidate<TKey extends SelectionKey>(
	input: TransferMoveCandidateInput<TKey>
): TransferMoveCandidate<TKey> {
	const resolvedDestination = destination(input.destination);
	const items = itemSnapshot(input.items, 'Transfer items');
	const value = uniqueKeys(input.value, 'Transfer value');
	const movingKeys = uniqueKeys(input.movingKeys, 'Transfer movingKeys');
	const moving = new Set<SelectionKey>(movingKeys);
	const nextMembership = new Set<SelectionKey>(value);
	for (const item of items) {
		if (!moving.has(item.key) || item.disabled) continue;
		if (resolvedDestination === 'target') nextMembership.add(item.key);
		else nextMembership.delete(item.key);
	}
	const loaded = items.flatMap((item) => (nextMembership.has(item.key) ? [item.key] : []));
	const loadedKeys = new Set<SelectionKey>(items.map((item) => item.key));
	const orphans = value.filter((key) => !loadedKeys.has(key) && nextMembership.has(key));
	const nextValue = Object.freeze([...loaded, ...orphans]);
	return Object.freeze({
		destination: resolvedDestination,
		items,
		movingKeys,
		nextValue,
		value
	});
}

/** Checks only the Transfer item and canonical value snapshots owned by a candidate. */
export function matchesTransferSnapshot<TKey extends SelectionKey>(
	currentItems: readonly TransferItemInput<TKey>[],
	currentValue: readonly TKey[],
	candidate: TransferMoveCandidate<TKey>
): boolean {
	const items = itemSnapshot(currentItems, 'Current transfer items');
	const value = uniqueKeys(currentValue, 'Current transfer value');
	return sameItems(items, candidate.items) && sameKeys(value, candidate.value);
}
