import type { SortableMoveResult } from '../src/runtime/drag-drop/types.js';
import type { ReorderSource } from '../src/runtime/collection/reorder.js';
import type {
	CollectionMutationResult,
	CollectionMutationSource
} from '../src/runtime/collection/mutation.js';
import {
	createTransferMoveCandidate,
	type TransferDestination,
	type TransferMoveCandidate,
	type TransferMoveCandidateInput
} from '../src/runtime/collection/transfer.js';

type Key = 0 | '0' | 'tail';

const input = {
	destination: 'target',
	items: [{ key: 0 }, { key: '0' }, { key: 'tail', disabled: true }],
	movingKeys: ['0'],
	value: [0]
} as const satisfies TransferMoveCandidateInput<Key>;
const candidate = createTransferMoveCandidate<Key>(input);
const typed: TransferMoveCandidate<Key> = candidate;
const key: Key = candidate.nextValue[0]!;
const destination: TransferDestination = candidate.destination;
const source: CollectionMutationSource = 'keyboard';
const reorderSource: ReorderSource = source;
const result: CollectionMutationResult = 'stale';
const sortableResult: SortableMoveResult = result;

const invalidKey: TransferMoveCandidateInput<Key> = {
	...input,
	// @ts-expect-error Transfer keys retain the declared key union.
	movingKeys: [1]
};
const invalidDestination: TransferMoveCandidateInput<Key> = {
	...input,
	// @ts-expect-error Transfer destinations are logical source/target names.
	destination: 'left'
};

void [typed, key, destination, reorderSource, sortableResult, invalidKey, invalidDestination];
