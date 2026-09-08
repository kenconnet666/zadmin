export type CollectionMutationSource = 'action' | 'keyboard' | 'pointer';

export type CollectionMutationResult = 'accepted' | 'rejected' | 'cancelled' | 'stale' | 'error';

export function assertCollectionMutationSource(
	value: unknown,
	owner = 'Collection mutation source'
): asserts value is CollectionMutationSource {
	if (value !== 'action' && value !== 'keyboard' && value !== 'pointer')
		throw new TypeError(`${owner} must be action, keyboard or pointer.`);
}

export function assertCollectionMutationResult(
	value: unknown,
	owner = 'Collection mutation result'
): asserts value is CollectionMutationResult {
	if (
		value !== 'accepted' &&
		value !== 'rejected' &&
		value !== 'cancelled' &&
		value !== 'stale' &&
		value !== 'error'
	)
		throw new TypeError(`${owner} must be accepted, rejected, cancelled, stale or error.`);
}
