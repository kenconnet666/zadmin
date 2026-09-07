import type { SelectionKey } from '../src/runtime/collection/selection.js';
import {
	applyReorderRequest,
	createReorderRequest,
	type ReorderRequest,
	type ReorderSource
} from '../src/runtime/collection/reorder.js';

const keys = [0, '0', 'tail'] as const satisfies readonly SelectionKey[];
const request = createReorderRequest(keys, '0', 0, 'keyboard');
if (request) {
	const key: 0 | '0' | 'tail' = request.key;
	const source: ReorderSource = request.source;
	const result: readonly (0 | '0' | 'tail')[] = applyReorderRequest(keys, request);
	void [key, source, result];
}

const explicit: ReorderRequest<'a' | 'b'> = {
	fromIndex: 0,
	key: 'a',
	keys: ['a', 'b'],
	source: 'action',
	toIndex: 1
};
// @ts-expect-error Indices cannot stand in for stable SelectionKey identity.
const missingKey: ReorderRequest<string> = {
	fromIndex: 0,
	keys: ['a', 'b'],
	source: 'pointer',
	toIndex: 1
};
// @ts-expect-error Reorder sources are a finite interaction-origin union.
const invalidSource: ReorderSource = 'programmatic';

void [explicit, missingKey, invalidSource];
