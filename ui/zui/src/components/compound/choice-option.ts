import type { SelectionKey } from '../../runtime/collection/selection.js';
/* eslint-disable svelte/prefer-svelte-reactivity -- The Set is local validation scratch space. */

/** Shared data-source contract for flat choice collections. */
export interface ZCollectionOption {
	readonly disabled?: boolean;
	readonly group?: string;
	readonly label: string;
	readonly value: SelectionKey;
}

export function assertContiguousOptionGroups(
	options: readonly ZCollectionOption[],
	name: string
): void {
	const closed = new Set<string | undefined>();
	let current: string | undefined;
	let initialized = false;
	for (const option of options) {
		if (option.group !== undefined && option.group.trim().length === 0) {
			throw new TypeError(`${name} option groups must be non-empty strings.`);
		}
		if (initialized && option.group === current) continue;
		if (closed.has(option.group)) {
			throw new Error(
				`${name} option group "${option.group ?? '(ungrouped)'}" must be contiguous.`
			);
		}
		if (initialized) closed.add(current);
		current = option.group;
		initialized = true;
	}
}
