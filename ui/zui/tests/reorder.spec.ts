import { describe, expect, it } from 'vitest';

import {
	applyReorderRequest,
	createReorderRequest,
	type ReorderRequest
} from '../src/runtime/collection/reorder.js';

describe('collection reorder contract', () => {
	it('keeps numeric zero distinct from string zero and applies a final-index move immutably', () => {
		const keys = Object.freeze([0, '0', 'tail'] as const);
		const request = createReorderRequest(keys, 0, 2, 'pointer')!;
		expect(request).toEqual({
			fromIndex: 0,
			key: 0,
			keys: [0, '0', 'tail'],
			source: 'pointer',
			toIndex: 2
		});
		expect(Object.isFrozen(request)).toBe(true);
		expect(Object.isFrozen(request.keys)).toBe(true);
		expect(applyReorderRequest(keys, request)).toEqual(['0', 'tail', 0]);
		expect(keys).toEqual([0, '0', 'tail']);
	});

	it('returns null for a no-op and rejects duplicate, missing and invalid targets', () => {
		expect(createReorderRequest(['a', 'b'], 'a', 0, 'keyboard')).toBeNull();
		expect(() => createReorderRequest(['a', 'a'], 'a', 1, 'action')).toThrow(/unique/u);
		expect(() => createReorderRequest(['a', 'b'], 'missing', 1, 'action')).toThrow(/exist/u);
		expect(() => createReorderRequest(['a', 'b'], 'a', -1, 'action')).toThrow(/toIndex/u);
		expect(() => createReorderRequest(['a', 'b'], 'a', 2, 'action')).toThrow(/toIndex/u);
		expect(() => createReorderRequest(['a', 'b'], 'a', 1.5, 'action')).toThrow(/integer/u);
	});

	it('validates external requests and rejects removed or stale snapshots', () => {
		const request = createReorderRequest(['a', 'b', 'c'], 'b', 0, 'keyboard')!;
		expect(() => applyReorderRequest(['a', 'c'], request)).toThrow(/stale/u);
		expect(() => applyReorderRequest(['b', 'a', 'c'], request)).toThrow(/stale/u);
		expect(() =>
			applyReorderRequest(['a', 'b', 'c'], {
				...request,
				fromIndex: 0
			})
		).toThrow(/fromIndex/u);
		expect(() =>
			applyReorderRequest(['a', 'b', 'c'], {
				...request,
				toIndex: 3
			})
		).toThrow(/toIndex/u);
	});

	it('freezes the result and never aliases mutable input arrays', () => {
		const keys = ['a', 'b', 'c'];
		const request = createReorderRequest(keys, 'c', 0, 'action')!;
		keys[0] = 'changed';
		expect(request.keys).toEqual(['a', 'b', 'c']);
		const result = applyReorderRequest(['a', 'b', 'c'], request);
		expect(result).toEqual(['c', 'a', 'b']);
		expect(Object.isFrozen(result)).toBe(true);
	});

	it('rejects manually supplied no-op requests', () => {
		const request: ReorderRequest<string> = {
			fromIndex: 0,
			key: 'a',
			keys: ['a'],
			source: 'action',
			toIndex: 0
		};
		expect(() => applyReorderRequest(['a'], request)).toThrow(/actual move/u);
	});
});
