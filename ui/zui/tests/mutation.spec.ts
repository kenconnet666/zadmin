import { describe, expect, it } from 'vitest';

import {
	assertCollectionMutationResult,
	assertCollectionMutationSource
} from '../src/runtime/collection/mutation.js';

describe('collection mutation vocabulary', () => {
	it.each(['action', 'keyboard', 'pointer'] as const)('accepts the %s source', (source) => {
		expect(() => assertCollectionMutationSource(source)).not.toThrow();
	});

	it.each(['accepted', 'rejected', 'cancelled', 'stale', 'error'] as const)(
		'accepts the %s result',
		(result) => {
			expect(() => assertCollectionMutationResult(result)).not.toThrow();
		}
	);

	it('rejects values outside the shared vocabulary with the caller owner', () => {
		expect(() => assertCollectionMutationSource('drop', 'Transfer source')).toThrow(
			/Transfer source.*action, keyboard or pointer/u
		);
		expect(() => assertCollectionMutationResult('pending', 'Transfer result')).toThrow(
			/Transfer result.*accepted.*error/u
		);
	});
});
