import { assertSelectionKey, type SelectionKey } from '../collection/selection.js';

export type CheckboxGroupValue<TKey extends SelectionKey = SelectionKey> = readonly TKey[];

export interface CheckboxGroupSelectionState {
	readonly all: boolean;
	readonly empty: boolean;
	readonly mixed: boolean;
}

export function normalizeCheckboxGroupValue<TKey extends SelectionKey>(
	value: CheckboxGroupValue<TKey>,
	owner = 'ZCheckboxGroup'
): CheckboxGroupValue<TKey> {
	if (!Array.isArray(value as unknown)) throw new TypeError(`${owner} value must be an array.`);
	const seen = new Set<TKey>();
	const result: TKey[] = [];
	for (const key of value) {
		assertSelectionKey(key, owner);
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(key);
	}
	return Object.freeze(result);
}

export function orderCheckboxGroupValue<TKey extends SelectionKey>(
	value: CheckboxGroupValue<TKey>,
	collectionKeys: readonly TKey[],
	preserveUnknownValues: boolean
): CheckboxGroupValue<TKey> {
	const normalized = normalizeCheckboxGroupValue(value);
	const selected = new Set(normalized);
	const collection = new Set(collectionKeys);
	const result = collectionKeys.filter((key) => selected.has(key));
	if (preserveUnknownValues) {
		for (const key of normalized) if (!collection.has(key)) result.push(key);
	}
	return Object.freeze(result);
}

export function checkboxGroupSelectionState<TKey extends SelectionKey>(
	value: CheckboxGroupValue<TKey>,
	enabledKeys: readonly TKey[],
	maxSelected?: number
): CheckboxGroupSelectionState {
	const selected = new Set(value);
	const selectedCount = enabledKeys.filter((key) => selected.has(key)).length;
	const enabled = new Set(enabledKeys);
	const preservedCount = value.filter((key) => !enabled.has(key)).length;
	const targetCount = Math.min(
		enabledKeys.length,
		Math.max(0, (maxSelected ?? Number.POSITIVE_INFINITY) - preservedCount)
	);
	return Object.freeze({
		all: targetCount > 0 && selectedCount >= targetCount,
		empty: selectedCount === 0,
		mixed: selectedCount > 0 && selectedCount < enabledKeys.length
	});
}

export function toggleAllCheckboxGroupValues<TKey extends SelectionKey>(
	value: CheckboxGroupValue<TKey>,
	enabledKeys: readonly TKey[],
	minSelected: number,
	maxSelected: number | undefined
): CheckboxGroupValue<TKey> {
	const current = normalizeCheckboxGroupValue(value);
	const enabled = new Set(enabledKeys);
	const selected = new Set(current);
	const preserved = current.filter((key) => !enabled.has(key));
	const targetCount = Math.min(
		enabledKeys.length,
		Math.max(0, (maxSelected ?? Number.POSITIVE_INFINITY) - preserved.length)
	);
	const selectedEnabledCount = enabledKeys.filter((key) => selected.has(key)).length;
	if (targetCount > 0 && selectedEnabledCount >= targetCount) {
		const retained = enabledKeys.slice(0, Math.max(0, minSelected - preserved.length));
		return Object.freeze([...preserved, ...retained]);
	}
	const limit = maxSelected ?? Number.POSITIVE_INFINITY;
	for (const key of enabledKeys) {
		if (selected.size >= limit) break;
		selected.add(key);
	}
	return Object.freeze([...selected]);
}
