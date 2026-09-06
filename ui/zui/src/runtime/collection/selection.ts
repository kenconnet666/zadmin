export type SelectionKey = number | string;

export function assertSelectionKey(key: unknown, owner = 'Selection'): asserts key is SelectionKey {
	if (
		typeof key !== 'string' &&
		(typeof key !== 'number' || !Number.isFinite(key) || Object.is(key, -0))
	) {
		throw new TypeError(`${owner} keys must be strings or finite numbers other than -0.`);
	}
}
export type SelectionMode = 'multiple' | 'none' | 'single';
export type Selection<TKey extends SelectionKey = SelectionKey> = 'all' | ReadonlySet<TKey>;

export function emptySelection<TKey extends SelectionKey>(): ReadonlySet<TKey> {
	return new Set<TKey>();
}

export function singleSelection<TKey extends SelectionKey>(key?: TKey): ReadonlySet<TKey> {
	return key === undefined ? emptySelection() : new Set([key]);
}

export function isSelected<TKey extends SelectionKey>(
	selection: Selection<TKey>,
	key: TKey
): boolean {
	return selection === 'all' || selection.has(key);
}

export function toggleSelection<TKey extends SelectionKey>(
	selection: Selection<TKey>,
	key: TKey,
	mode: SelectionMode,
	availableKeys: readonly TKey[] = []
): ReadonlySet<TKey> {
	if (mode === 'none') return emptySelection();
	if (mode === 'single') return isSelected(selection, key) ? emptySelection() : new Set([key]);
	const next = new Set(selection === 'all' ? availableKeys : selection);
	if (next.has(key)) next.delete(key);
	else next.add(key);
	return next;
}

export function selectAll<TKey extends SelectionKey>(mode: SelectionMode): Selection<TKey> {
	return mode === 'multiple' ? 'all' : emptySelection();
}

export function selectRange<TKey extends SelectionKey>(
	selection: Selection<TKey>,
	orderedKeys: readonly TKey[],
	anchor: TKey,
	target: TKey
): ReadonlySet<TKey> {
	const anchorIndex = orderedKeys.indexOf(anchor);
	const targetIndex = orderedKeys.indexOf(target);
	if (anchorIndex < 0 || targetIndex < 0)
		return selection === 'all' ? new Set(orderedKeys) : new Set(selection);
	const start = Math.min(anchorIndex, targetIndex);
	const end = Math.max(anchorIndex, targetIndex);
	const next = new Set(selection === 'all' ? orderedKeys : selection);
	for (let index = start; index <= end; index += 1) next.add(orderedKeys[index]!);
	return next;
}
